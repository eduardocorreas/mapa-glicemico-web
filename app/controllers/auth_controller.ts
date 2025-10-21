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
        password: await hash.make(password),
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
        return response.json({
          message: 'Se o email existir, você receberá instruções para redefinir sua senha',
        })
      }

      const resetToken = randomBytes(32).toString('hex')

      console.log(`Token de recuperação para ${email}: ${resetToken}`)

      return response.json({
        message: 'Se o email existir, você receberá instruções para redefinir sua senha',
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
      const { token } = await request.validateUsing(resetPasswordValidator)

      // TODO: Implementar verificação do token no banco de dados
      // Por enquanto, vamos simular a validação
      if (token.length < 10) {
        return response.status(400).json({
          message: 'Token inválido ou expirado',
        })
      }

      // TODO: Buscar usuário pelo token e verificar se não expirou
      // const user = await User.findBy('resetToken', token)
      // if (!user || user.resetTokenExpiry < new Date()) {
      //   return response.status(400).json({
      //     message: 'Token inválido ou expirado'
      //   })
      // }

      // TODO: Atualizar senha e limpar token
      // user.password = await hash.make(password)
      // user.resetToken = null
      // user.resetTokenExpiry = null
      // await user.save()

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
