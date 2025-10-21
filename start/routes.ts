/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

router.on('/').render('pages/home')

router
  .group(() => {
    router.post('/login', '#controllers/auth_controller.login')
    router.post('/register', '#controllers/auth_controller.register')
    router.post('/forgot-password', '#controllers/auth_controller.forgotPassword')
    router.post('/reset-password', '#controllers/auth_controller.resetPassword')
  })
  .prefix('/api/auth')

router
  .group(() => {
    router.post('/logout', '#controllers/auth_controller.logout')
    router.get('/me', '#controllers/auth_controller.me')
  })
  .prefix('/api/auth')
  .use(middleware.auth())
