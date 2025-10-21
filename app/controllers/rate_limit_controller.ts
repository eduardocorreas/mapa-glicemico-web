import type { HttpContext } from '@adonisjs/core/http'
import MultiLayerRateLimitMiddleware from '#middleware/multi_layer_rate_limit_middleware'

export default class RateLimitController {
  /**
   * Retorna estatísticas de rate limiting
   */
  async stats({ response }: HttpContext) {
    try {
      const stats = MultiLayerRateLimitMiddleware.getStats()

      return response.json({
        message: 'Estatísticas de rate limiting',
        stats,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao obter estatísticas',
        error: error.message,
      })
    }
  }

  /**
   * Limpa todas as entradas de rate limiting
   */
  async clearAll({ response }: HttpContext) {
    try {
      MultiLayerRateLimitMiddleware.clearAll()

      return response.json({
        message: 'Todas as entradas de rate limiting foram limpas',
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao limpar rate limiting',
        error: error.message,
      })
    }
  }

  /**
   * Limpa entradas para um IP específico
   */
  async clearForIp({ request, response }: HttpContext) {
    try {
      const { ip } = request.qs()

      if (!ip) {
        return response.status(400).json({
          message: 'IP é obrigatório',
        })
      }

      MultiLayerRateLimitMiddleware.clearForIp(ip)

      return response.json({
        message: `Rate limiting limpo para IP: ${ip}`,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao limpar rate limiting para IP',
        error: error.message,
      })
    }
  }

  /**
   * Limpa entradas para um email específico
   */
  async clearForEmail({ request, response }: HttpContext) {
    try {
      const { email } = request.qs()

      if (!email) {
        return response.status(400).json({
          message: 'Email é obrigatório',
        })
      }

      MultiLayerRateLimitMiddleware.clearForEmail(email)

      return response.json({
        message: `Rate limiting limpo para email: ${email}`,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao limpar rate limiting para email',
        error: error.message,
      })
    }
  }

  /**
   * Retorna informações sobre uma chave específica
   */
  async getKeyInfo({ request, response }: HttpContext) {
    try {
      const { key } = request.qs()

      if (!key) {
        return response.status(400).json({
          message: 'Chave é obrigatória',
        })
      }

      const info = MultiLayerRateLimitMiddleware.getKeyInfo(key)

      if (!info) {
        return response.status(404).json({
          message: 'Chave não encontrada ou expirada',
        })
      }

      return response.json({
        message: 'Informações da chave',
        key,
        info,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao obter informações da chave',
        error: error.message,
      })
    }
  }

  /**
   * Testa rate limiting para um IP específico
   */
  async testRateLimit({ request, response }: HttpContext) {
    try {
      const { ip, type = 'login', layer = 'ip' } = request.qs()

      if (!ip) {
        return response.status(400).json({
          message: 'IP é obrigatório',
        })
      }

      // Simula uma tentativa de rate limiting
      const testKey = `${type}:${layer}:${ip}`
      const info = MultiLayerRateLimitMiddleware.getKeyInfo(testKey)

      return response.json({
        message: 'Teste de rate limiting',
        ip,
        type,
        layer,
        key: testKey,
        info,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao testar rate limiting',
        error: error.message,
      })
    }
  }
}
