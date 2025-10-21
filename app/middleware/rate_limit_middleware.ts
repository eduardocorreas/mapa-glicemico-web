import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
  keyGenerator?: (ctx: HttpContext) => string
  skipSuccessfulRequests?: boolean
  message?: string
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

export default class RateLimitMiddleware {
  private static store = new Map<string, RateLimitEntry>()

  /**
   * Configurações padrão para diferentes tipos de rotas
   */
  private static readonly DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
    // Login: 5 tentativas por 15 minutos
    login: {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutos
      keyGenerator: (ctx) => `login:${ctx.request.ip()}`,
      message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    },

    // Cadastro: 3 tentativas por 1 hora
    register: {
      maxAttempts: 3,
      windowMs: 60 * 60 * 1000, // 1 hora
      keyGenerator: (ctx) => `register:${ctx.request.ip()}`,
      message: 'Muitas tentativas de cadastro. Tente novamente em 1 hora.',
    },

    // Recuperação de senha: 3 tentativas por 1 hora
    forgotPassword: {
      maxAttempts: 3,
      windowMs: 60 * 60 * 1000, // 1 hora
      keyGenerator: (ctx) => `forgot:${ctx.request.ip()}`,
      message: 'Muitas tentativas de recuperação de senha. Tente novamente em 1 hora.',
    },

    // Reset de senha: 5 tentativas por 1 hora
    resetPassword: {
      maxAttempts: 5,
      windowMs: 60 * 60 * 1000, // 1 hora
      keyGenerator: (ctx) => `reset:${ctx.request.ip()}`,
      message: 'Muitas tentativas de redefinição de senha. Tente novamente em 1 hora.',
    },
  }

  /**
   * Middleware principal
   */
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: { type: keyof typeof RateLimitMiddleware.DEFAULT_CONFIGS }
  ) {
    const config = RateLimitMiddleware.DEFAULT_CONFIGS[options.type]

    if (!config) {
      return next()
    }

    const key = config.keyGenerator!(ctx)
    const now = Date.now()

    // Limpa entradas expiradas
    this.cleanupExpiredEntries(now)

    // Verifica se existe uma entrada para esta chave
    let entry = RateLimitMiddleware.store.get(key)

    if (!entry) {
      // Primeira tentativa
      entry = {
        count: 1,
        resetTime: now + config.windowMs,
      }
      RateLimitMiddleware.store.set(key, entry)
    } else if (now < entry.resetTime) {
      // Dentro da janela de tempo
      if (entry.count >= config.maxAttempts) {
        // Limite excedido
        const remainingTime = Math.ceil((entry.resetTime - now) / 1000 / 60) // minutos

        return ctx.response.status(429).json({
          message: config.message,
          retryAfter: remainingTime,
          limit: config.maxAttempts,
          remaining: 0,
        })
      }

      // Incrementa contador
      entry.count++
    } else {
      // Janela de tempo expirou, reinicia
      entry = {
        count: 1,
        resetTime: now + config.windowMs,
      }
      RateLimitMiddleware.store.set(key, entry)
    }

    // Continua para o próximo middleware/controller
    await next()

    // Se a requisição foi bem-sucedida e configurado para pular sucessos
    if (config.skipSuccessfulRequests && ctx.response.getStatus() < 400) {
      // Remove a entrada em caso de sucesso
      RateLimitMiddleware.store.delete(key)
    }
  }

  /**
   * Remove entradas expiradas do store
   */
  private cleanupExpiredEntries(now: number) {
    for (const [key, entry] of RateLimitMiddleware.store.entries()) {
      if (now >= entry.resetTime) {
        RateLimitMiddleware.store.delete(key)
      }
    }
  }

  /**
   * Retorna estatísticas de rate limiting (para debugging)
   */
  static getStats() {
    const now = Date.now()
    const stats: Record<string, any> = {}

    for (const [key, entry] of RateLimitMiddleware.store.entries()) {
      if (now < entry.resetTime) {
        stats[key] = {
          count: entry.count,
          resetTime: new Date(entry.resetTime).toISOString(),
          remaining: Math.max(0, 5 - entry.count), // Assumindo limite padrão de 5
        }
      }
    }

    return stats
  }

  /**
   * Limpa todas as entradas (útil para testes)
   */
  static clearAll() {
    RateLimitMiddleware.store.clear()
  }
}
