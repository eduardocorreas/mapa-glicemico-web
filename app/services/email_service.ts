import mail from '@adonisjs/mail/services/main'
import PasswordResetMail from '#mails/password_reset_mail'
import type { User } from '#models/user'
import env from '#start/env'

export default class EmailService {
  /**
   * Envia email de recuperação de senha
   */
  static async sendPasswordResetEmail(user: User, resetToken: string) {
    try {
      // Constroi a URL de reset (você pode ajustar conforme sua configuração)
      const baseUrl = env.get('APP_URL', 'http://localhost:3333')
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

      await mail.send(new PasswordResetMail(user, resetToken, resetUrl))

      return { success: true }
    } catch (error) {
      console.error('Erro ao enviar email de recuperação de senha:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Envia email de boas-vindas (opcional)
   */
  static async sendWelcomeEmail(user: User) {
    try {
      // Implementar email de boas-vindas se necessário
      console.log(`Email de boas-vindas enviado para: ${user.email}`)
      return { success: true }
    } catch (error) {
      console.error('Erro ao enviar email de boas-vindas:', error)
      return { success: false, error: error.message }
    }
  }
}
