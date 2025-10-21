import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

interface RateLimitEntry {
  count: number
  resetTime: number
  lastAttempt: number
}

export default class MultiLayerRateLimitMiddleware {
  private static store = new Map<string, RateLimitEntry>()
  private static lastCleanup = Date.now()

  /**
   * Configurações de rate limiting
   */
  private static readonly CONFIGS = {
    login: {
      ip: {
        maxAttempts: 5,
        windowMs: 15 * 60 * 1000,
        message: 'Muitas tentativas de login deste IP. Tente novamente em 15 minutos.',
      },
      email: {
        maxAttempts: 3,
        windowMs: 60 * 60 * 1000,
        message: 'Muitas tentativas de login para este email. Tente novamente em 1 hora.',
      },
    },
    register: {
      ip: {
        maxAttempts: 3,
        windowMs: 60 * 60 * 1000,
        message: 'Muitas tentativas de cadastro deste IP. Tente novamente em 1 hora.',
      },
      email: {
        maxAttempts: 1,
        windowMs: 24 * 60 * 60 * 1000,
        message:
          'Já existe uma tentativa de cadastro para este email. Tente novamente em 24 horas.',
      },
    },
    forgotPassword: {
      ip: {
        maxAttempts: 3,
        windowMs: 60 * 60 * 1000,
        message: 'Muitas tentativas de recuperação de senha deste IP. Tente novamente em 1 hora.',
      },
      email: {
        maxAttempts: 2,
        windowMs: 24 * 60 * 60 * 1000,
        message: 'Muitas tentativas de recuperação para este email. Tente novamente em 24 horas.',
      },
    },
    resetPassword: {
      ip: {
        maxAttempts: 5,
        windowMs: 60 * 60 * 1000,
        message: 'Muitas tentativas de redefinição de senha deste IP. Tente novamente em 1 hora.',
      },
      token: {
        maxAttempts: 3,
        windowMs: 60 * 60 * 1000,
        message: 'Muitas tentativas de redefinição com este token. Tente novamente em 1 hora.',
      },
    },
  }

  /**
   * Middleware principal
   */
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      type: 'login' | 'register' | 'forgotPassword' | 'resetPassword'
      layer?: 'ip' | 'email' | 'token'
    }
  ) {
    const { type, layer = 'ip' } = options
    const config = MultiLayerRateLimitMiddleware.CONFIGS[type]

    if (!config) {
      return next()
    }

    const layerConfig = config[layer as keyof typeof config]
    if (!layerConfig) {
      return next()
    }

    // Limpa entradas expiradas periodicamente
    this.cleanupIfNeeded()

    // Gera chave baseada no tipo e camada
    const key = this.generateKey(ctx, type, layer)
    const now = Date.now()

    // Verifica rate limit
    const entry = MultiLayerRateLimitMiddleware.store.get(key)

    if (entry && now < entry.resetTime) {
      if (entry.count >= layerConfig.maxAttempts) {
        const remainingTime = Math.ceil((entry.resetTime - now) / 1000)

        // Log da tentativa bloqueada
        console.warn(`Rate limit exceeded for ${type}:${layer} - Key: ${key}`)

        return ctx.response.status(429).json({
          message: layerConfig.message,
          retryAfter: remainingTime,
          limit: layerConfig.maxAttempts,
          remaining: 0,
          type,
          layer,
          resetTime: new Date(entry.resetTime).toISOString(),
        })
      }

      entry.count++
      entry.lastAttempt = now
    } else {
      // Nova entrada ou janela expirada
      MultiLayerRateLimitMiddleware.store.set(key, {
        count: 1,
        resetTime: now + layerConfig.windowMs,
        lastAttempt: now,
      })
    }

    // Adiciona headers de rate limit
    const currentEntry = entry || MultiLayerRateLimitMiddleware.store.get(key)!
    this.addRateLimitHeaders(ctx, layerConfig, currentEntry)

    // Continua para o próximo middleware/controller
    await next()
  }

  /**
   * Gera chave única para rate limiting
   */
  private generateKey(ctx: HttpContext, type: string, layer: string): string {
    const ip = ctx.request.ip()
    let key = `${type}:${layer}:${ip}`

    try {
      const body = ctx.request.body()

      if (layer === 'email' && body?.email) {
        key += `:${body.email.toLowerCase()}`
      } else if (layer === 'token' && body?.token) {
        key += `:${body.token}`
      }
    } catch (error) {
      // Se não conseguir ler o body, usa apenas IP
    }

    return key
  }

  /**
   * Adiciona headers de rate limit à resposta
   */
  private addRateLimitHeaders(ctx: HttpContext, config: any, entry: RateLimitEntry) {
    const remaining = Math.max(0, config.maxAttempts - entry.count)
    const resetTime = Math.ceil(entry.resetTime / 1000)

    ctx.response.header('X-RateLimit-Limit', config.maxAttempts.toString())
    ctx.response.header('X-RateLimit-Remaining', remaining.toString())
    ctx.response.header('X-RateLimit-Reset', resetTime.toString())
  }

  /**
   * Limpa entradas expiradas se necessário
   */
  private cleanupIfNeeded() {
    const now = Date.now()
    const cleanupInterval = 5 * 60 * 1000 // 5 minutos
    const maxStoreSize = 10000

    if (now - MultiLayerRateLimitMiddleware.lastCleanup < cleanupInterval) {
      return
    }

    MultiLayerRateLimitMiddleware.lastCleanup = now

    for (const [key, entry] of MultiLayerRateLimitMiddleware.store.entries()) {
      if (now >= entry.resetTime) {
        MultiLayerRateLimitMiddleware.store.delete(key)
      }
    }

    // Limita o tamanho do store
    if (MultiLayerRateLimitMiddleware.store.size > maxStoreSize) {
      const entries = Array.from(MultiLayerRateLimitMiddleware.store.entries())
      entries.sort((a, b) => a[1].lastAttempt - b[1].lastAttempt)

      const toDelete = entries.slice(0, entries.length - maxStoreSize)
      for (const [key] of toDelete) {
        MultiLayerRateLimitMiddleware.store.delete(key)
      }
    }
  }

  /**
   * Retorna estatísticas de rate limiting
   */
  static getStats() {
    const now = Date.now()
    const stats: Record<string, any> = {}

    for (const [key, entry] of MultiLayerRateLimitMiddleware.store.entries()) {
      if (now < entry.resetTime) {
        const [type, layer, ...rest] = key.split(':')
        const identifier = rest.join(':')

        if (!stats[type]) {
          stats[type] = {}
        }

        if (!stats[type][layer]) {
          stats[type][layer] = []
        }

        stats[type][layer].push({
          identifier,
          count: entry.count,
          resetTime: new Date(entry.resetTime).toISOString(),
          lastAttempt: new Date(entry.lastAttempt).toISOString(),
        })
      }
    }

    return stats
  }

  /**
   * Limpa todas as entradas
   */
  static clearAll() {
    MultiLayerRateLimitMiddleware.store.clear()
  }

  /**
   * Limpa entradas para um IP específico
   */
  static clearForIp(ip: string) {
    for (const [key] of MultiLayerRateLimitMiddleware.store.entries()) {
      if (key.includes(ip)) {
        MultiLayerRateLimitMiddleware.store.delete(key)
      }
    }
  }

  /**
   * Limpa entradas para um email específico
   */
  static clearForEmail(email: string) {
    for (const [key] of MultiLayerRateLimitMiddleware.store.entries()) {
      if (key.includes(email.toLowerCase())) {
        MultiLayerRateLimitMiddleware.store.delete(key)
      }
    }
  }

  /**
   * Retorna informações sobre uma chave específica
   */
  static getKeyInfo(key: string) {
    const entry = MultiLayerRateLimitMiddleware.store.get(key)
    if (!entry) return null

    const now = Date.now()
    return {
      count: entry.count,
      resetTime: new Date(entry.resetTime).toISOString(),
      lastAttempt: new Date(entry.lastAttempt).toISOString(),
      isExpired: now >= entry.resetTime,
      remaining: Math.max(0, 5 - entry.count), // Assumindo limite padrão
    }
  }
}
