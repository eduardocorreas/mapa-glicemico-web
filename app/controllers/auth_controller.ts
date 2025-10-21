import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import {
  loginValidator,
  registerValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from '#validators/auth_validator'
import hash from '@adonisjs/core/services/hash'
import { randomBytes } from 'node:crypto'
import EmailService from '#services/email_service'
import { DateTime } from 'luxon'

export default class AuthController {
  async login({ request, auth, response }: HttpContext) {
    try {
      const { email, password } = await request.validateUsing(loginValidator)

      const user = await User.findBy('email', email)
      if (!user) {
        return response.status(401).json({
          message: 'Credenciais inválidas',
        })
      }

      console.log(user.password)
      console.log(password)

      const isPasswordValid = await hash.verify(user.password, password)
      if (!isPasswordValid) {
        return response.status(401).json({
          message: 'Credenciais inválidas',
        })
      }

      await auth.use('web').login(user)

      return response.json({
        message: 'Login realizado com sucesso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })
    } catch (error) {
      return response.status(400).json({
        message: 'Erro ao realizar login',
        error: error.messages || error.message,
      })
    }
  }

  async register({ request, response }: HttpContext) {
    try {
      const { name, email, password } = await request.validateUsing(registerValidator)

      const existingUser = await User.findBy('email', email)
      if (existingUser) {
        return response.status(409).json({
          message: 'Usuário já existe com este email',
        })
      }

      const user = await User.create({
        name,
        email,
        password,
      })

      return response.status(201).json({
        message: 'Usuário criado com sucesso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })
    } catch (error) {
      return response.status(400).json({
        message: 'Erro ao criar usuário',
        error: error.messages || error.message,
      })
    }
  }

  async logout({ auth, response }: HttpContext) {
    try {
      await auth.use('web').logout()

      return response.json({
        message: 'Logout realizado com sucesso',
      })
    } catch (error) {
      return response.status(400).json({
        message: 'Erro ao realizar logout',
        error: error.message,
      })
    }
  }

  async me({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()

      return response.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      })
    } catch (error) {
      return response.status(401).json({
        message: 'Usuário não autenticado',
      })
    }
  }

  async forgotPassword({ request, response }: HttpContext) {
    try {
      const { email } = await request.validateUsing(forgotPasswordValidator)

      const user = await User.findBy('email', email)
      if (!user) {
        // Por segurança, não revelamos se o email existe ou não
        return response.json({
          message: 'Se o email existir, você receberá instruções para redefinir sua senha',
        })
      }

      // Gera um token de recuperação
      const resetToken = randomBytes(32).toString('hex')
      const resetTokenExpiry = DateTime.now().plus({ hours: 1 }) // 1 hora

      // Salva o token no banco de dados
      user.resetToken = resetToken
      user.resetTokenExpiry = resetTokenExpiry
      await user.save()

      // Envia o email de recuperação
      const emailResult = await EmailService.sendPasswordResetEmail(user, resetToken)

      if (!emailResult.success) {
        console.error('Erro ao enviar email:', emailResult.error)
        // Em caso de erro no envio do email, ainda retornamos sucesso por segurança
      }

      return response.json({
        message: 'Se o email existir, você receberá instruções para redefinir sua senha',
        // Em desenvolvimento, retorna o token para facilitar testes
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
      })
    } catch (error) {
      return response.status(400).json({
        message: 'Erro ao solicitar recuperação de senha',
        error: error.messages || error.message,
      })
    }
  }

  async resetPassword({ request, response }: HttpContext) {
    try {
      const { token, password } = await request.validateUsing(resetPasswordValidator)

      // Busca o usuário pelo token
      const user = await User.findBy('resetToken', token)
      if (!user) {
        return response.status(400).json({
          message: 'Token inválido ou expirado',
        })
      }

      // Verifica se o token não expirou
      if (!user.resetTokenExpiry || user.resetTokenExpiry < DateTime.now()) {
        return response.status(400).json({
          message: 'Token inválido ou expirado',
        })
      }

      // Atualiza a senha e limpa o token
      user.password = await hash.make(password)
      user.resetToken = null
      user.resetTokenExpiry = null
      await user.save()

      return response.json({
        message: 'Senha redefinida com sucesso',
      })
    } catch (error) {
      return response.status(400).json({
        message: 'Erro ao redefinir senha',
        error: error.messages || error.message,
      })
    }
  }
}
