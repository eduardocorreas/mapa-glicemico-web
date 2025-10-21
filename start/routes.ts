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

// Rotas de autenticação (páginas)
router.get('/auth/login', ({ view }) => view.render('auth/login'))
router.get('/auth/register', ({ view }) => view.render('auth/register'))
router.get('/auth/forgot-password', ({ view }) => view.render('auth/forgot-password'))
router.get('/auth/reset-password', ({ view, request }) => {
  const token = request.input('token')
  return view.render('auth/reset-password', { token })
})

router
  .group(() => {
    router
      .post('/login', '#controllers/auth_controller.login')
      .use(middleware.multiLayerRateLimit({ type: 'login', layer: 'ip' }))
      .use(middleware.multiLayerRateLimit({ type: 'login', layer: 'email' }))

    router
      .post('/register', '#controllers/auth_controller.register')
      .use(middleware.multiLayerRateLimit({ type: 'register', layer: 'ip' }))
      .use(middleware.multiLayerRateLimit({ type: 'register', layer: 'email' }))

    router
      .post('/forgot-password', '#controllers/auth_controller.forgotPassword')
      .use(middleware.multiLayerRateLimit({ type: 'forgotPassword', layer: 'ip' }))
      .use(middleware.multiLayerRateLimit({ type: 'forgotPassword', layer: 'email' }))

    router
      .post('/reset-password', '#controllers/auth_controller.resetPassword')
      .use(middleware.multiLayerRateLimit({ type: 'resetPassword', layer: 'ip' }))
      .use(middleware.multiLayerRateLimit({ type: 'resetPassword', layer: 'token' }))
  })
  .prefix('/api/auth')

router
  .group(() => {
    router.post('/logout', '#controllers/auth_controller.logout')
    router.get('/me', '#controllers/auth_controller.me')
  })
  .prefix('/api/auth')
  .use(middleware.auth())

// Rotas de administração de rate limiting (protegidas)
router
  .group(() => {
    router.get('/stats', '#controllers/rate_limit_controller.stats')
    router.post('/clear-all', '#controllers/rate_limit_controller.clearAll')
    router.post('/clear-ip', '#controllers/rate_limit_controller.clearForIp')
    router.post('/clear-email', '#controllers/rate_limit_controller.clearForEmail')
    router.get('/key-info', '#controllers/rate_limit_controller.getKeyInfo')
    router.get('/test', '#controllers/rate_limit_controller.testRateLimit')
  })
  .prefix('/api/admin/rate-limit')
  .use(middleware.auth())
