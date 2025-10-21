import { BaseMail } from '@adonisjs/mail'
import type { User } from '#models/user'

export default class PasswordResetMail extends BaseMail {
  from = 'noreply@mapaglicemico.com'
  subject = 'Redefinição de Senha - Mapa Glicêmico'

  constructor(
    private user: User,
    private resetToken: string,
    private resetUrl: string
  ) {
    super()
  }

  prepare() {
    this.message.to(this.user.email).htmlView('emails/password_reset', {
      user: this.user,
      resetToken: this.resetToken,
      resetUrl: this.resetUrl,
    })
  }
}
