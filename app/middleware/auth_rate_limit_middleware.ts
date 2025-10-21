import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

interface AuthRateLimitConfig {
  maxAttempts: number
  windowMs: number
  message: string
  skipSuccessfulRequests?: boolean
}

export default class AuthRateLimitMiddleware {
  private static store = new Map<string, { count: number; resetTime: number }>()

  /**
   * Configurações específicas para diferentes tipos de autenticação
   */
  private static readonly CONFIGS: Record<string, AuthRateLimitConfig> = {
    login: {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutos
      message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
      skipSuccessfulRequests: true,
    },
    register: {
      maxAttempts: 3,
      windowMs: 60 * 60 * 1000, // 1 hora
      message: 'Muitas tentativas de cadastro. Tente novamente em 1 hora.',
    },
    forgotPassword: {
      maxAttempts: 3,
      windowMs: 60 * 60 * 1000, // 1 hora
      message: 'Muitas tentativas de recuperação de senha. Tente novamente em 1 hora.',
    },
    resetPassword: {
      maxAttempts: 5,
      windowMs: 60 * 60 * 1000, // 1 hora
      message: 'Muitas tentativas de redefinição de senha. Tente novamente em 1 hora.',
    },
  }

  /**
   * Middleware principal
   */
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: { type: keyof typeof AuthRateLimitMiddleware.CONFIGS }
  ) {
    const config = AuthRateLimitMiddleware.CONFIGS[options.type]

    if (!config) {
      return next()
    }

    // Gera chave baseada em IP e email (se disponível)
    const key = this.generateKey(ctx, options.type)
    const now = Date.now()

    // Limpa entradas expiradas
    this.cleanupExpiredEntries(now)

    // Verifica rate limit
    const entry = AuthRateLimitMiddleware.store.get(key)

    if (entry && now < entry.resetTime) {
      if (entry.count >= config.maxAttempts) {
        const remainingTime = Math.ceil((entry.resetTime - now) / 1000 / 60)

        return ctx.response.status(429).json({
          message: config.message,
          retryAfter: remainingTime,
          limit: config.maxAttempts,
          remaining: 0,
          type: options.type,
        })
      }

      entry.count++
    } else {
      // Nova entrada ou janela expirada
      AuthRateLimitMiddleware.store.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      })
    }

    // Continua para o próximo middleware/controller
    await next()

    // Se configurado para pular sucessos e a resposta foi bem-sucedida
    if (config.skipSuccessfulRequests && ctx.response.getStatus() < 400) {
      AuthRateLimitMiddleware.store.delete(key)
    }
  }

  /**
   * Gera chave única para rate limiting
   */
  private generateKey(ctx: HttpContext, type: string): string {
    const ip = ctx.request.ip()
    let key = `${type}:${ip}`

    // Para login e cadastro, também considera o email se disponível
    if (type === 'login' || type === 'register') {
      try {
        const body = ctx.request.body()
        if (body && body.email) {
          key += `:${body.email.toLowerCase()}`
        }
      } catch (error) {
        // Se não conseguir ler o body, usa apenas IP
      }
    }

    return key
  }

  /**
   * Remove entradas expiradas
   */
  private cleanupExpiredEntries(now: number) {
    for (const [key, entry] of AuthRateLimitMiddleware.store.entries()) {
      if (now >= entry.resetTime) {
        AuthRateLimitMiddleware.store.delete(key)
      }
    }
  }

  /**
   * Retorna estatísticas de rate limiting
   */
  static getStats() {
    const now = Date.now()
    const stats: Record<string, any> = {}

    for (const [key, entry] of AuthRateLimitMiddleware.store.entries()) {
      if (now < entry.resetTime) {
        const [type, ...rest] = key.split(':')
        const identifier = rest.join(':')

        if (!stats[type]) {
          stats[type] = []
        }

        stats[type].push({
          identifier,
          count: entry.count,
          resetTime: new Date(entry.resetTime).toISOString(),
          remaining: Math.max(0, 5 - entry.count),
        })
      }
    }

    return stats
  }

  /**
   * Limpa todas as entradas
   */
  static clearAll() {
    AuthRateLimitMiddleware.store.clear()
  }

  /**
   * Limpa entradas para um IP específico
   */
  static clearForIp(ip: string) {
    for (const [key] of AuthRateLimitMiddleware.store.entries()) {
      if (key.includes(ip)) {
        AuthRateLimitMiddleware.store.delete(key)
      }
    }
  }

  /**
   * Limpa entradas para um email específico
   */
  static clearForEmail(email: string) {
    for (const [key] of AuthRateLimitMiddleware.store.entries()) {
      if (key.includes(email.toLowerCase())) {
        AuthRateLimitMiddleware.store.delete(key)
      }
    }
  }
}
