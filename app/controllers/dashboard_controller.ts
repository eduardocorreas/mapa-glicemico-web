// import type { HttpContext } from '@adonisjs/core/http'
import type { HttpContext } from '@adonisjs/core/http'

export default class DashboardController {
  async index({ view }: HttpContext) {
    return view.render('dashboard/home')
  }

  async measurements({ view }: HttpContext) {
    return view.render('dashboard/measurements')
  }

  async payments({ view }: HttpContext) {
    return view.render('dashboard/payments')
  }

  async subscriptions({ view }: HttpContext) {
    return view.render('dashboard/subscriptions')
  }

  async profile({ view }: HttpContext) {
    return view.render('dashboard/profile')
  }

  async settings({ view }: HttpContext) {
    return view.render('dashboard/settings')
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/login')
  }
}
