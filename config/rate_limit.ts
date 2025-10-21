export default {
  /**
   * Configurações de rate limiting para diferentes tipos de rotas
   */
  limits: {
    // Login: 5 tentativas por 15 minutos por IP
    // 3 tentativas por 1 hora por email
    login: {
      ip: {
        maxAttempts: 5,
        windowMs: 15 * 60 * 1000, // 15 minutos
        message: 'Muitas tentativas de login deste IP. Tente novamente em 15 minutos.',
      },
      email: {
        maxAttempts: 3,
        windowMs: 60 * 60 * 1000, // 1 hora
        message: 'Muitas tentativas de login para este email. Tente novamente em 1 hora.',
      },
    },

    // Cadastro: 3 tentativas por 1 hora por IP
    // 1 tentativa por 24 horas por email
    register: {
      ip: {
        maxAttempts: 3,
        windowMs: 60 * 60 * 1000, // 1 hora
        message: 'Muitas tentativas de cadastro deste IP. Tente novamente em 1 hora.',
      },
      email: {
        maxAttempts: 1,
        windowMs: 24 * 60 * 60 * 1000, // 24 horas
        message:
          'Já existe uma tentativa de cadastro para este email. Tente novamente em 24 horas.',
      },
    },

    // Recuperação de senha: 3 tentativas por 1 hora por IP
    // 2 tentativas por 24 horas por email
    forgotPassword: {
      ip: {
        maxAttempts: 3,
        windowMs: 60 * 60 * 1000, // 1 hora
        message: 'Muitas tentativas de recuperação de senha deste IP. Tente novamente em 1 hora.',
      },
      email: {
        maxAttempts: 2,
        windowMs: 24 * 60 * 60 * 1000, // 24 horas
        message: 'Muitas tentativas de recuperação para este email. Tente novamente em 24 horas.',
      },
    },

    // Reset de senha: 5 tentativas por 1 hora por IP
    // 3 tentativas por 1 hora por token
    resetPassword: {
      ip: {
        maxAttempts: 5,
        windowMs: 60 * 60 * 1000, // 1 hora
        message: 'Muitas tentativas de redefinição de senha deste IP. Tente novamente em 1 hora.',
      },
      token: {
        maxAttempts: 3,
        windowMs: 60 * 60 * 1000, // 1 hora
        message: 'Muitas tentativas de redefinição com este token. Tente novamente em 1 hora.',
      },
    },
  },

  /**
   * Configurações gerais
   */
  general: {
    // Limpa entradas expiradas a cada 5 minutos
    cleanupInterval: 5 * 60 * 1000,

    // Tamanho máximo do store (para evitar vazamentos de memória)
    maxStoreSize: 10000,

    // Headers de resposta
    headers: {
      'X-RateLimit-Limit': true,
      'X-RateLimit-Remaining': true,
      'X-RateLimit-Reset': true,
      'Retry-After': true,
    },
  },

  /**
   * Configurações de bypass (IPs que não são limitados)
   */
  bypass: {
    // IPs de desenvolvimento
    development: ['127.0.0.1', '::1', 'localhost'],

    // IPs de produção (se necessário)
    production: [],

    // Ranges de IP (CIDR)
    ranges: [],
  },

  /**
   * Configurações de logging
   */
  logging: {
    enabled: true,
    level: 'warn', // 'debug', 'info', 'warn', 'error'
    logBlockedRequests: true,
    logSuccessfulRequests: false,
  },
}
