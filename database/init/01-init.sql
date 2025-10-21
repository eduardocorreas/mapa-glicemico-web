-- Script de inicialização do banco de dados
-- Este arquivo será executado automaticamente quando o container PostgreSQL for criado

-- Criar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Configurar timezone
SET timezone = 'America/Sao_Paulo';

-- Comentário para documentar o banco
COMMENT ON DATABASE mapa_glicemico IS 'Banco de dados para o sistema de mapa glicêmico';

-- Criar usuário específico para a aplicação (opcional)
-- CREATE USER app_user WITH PASSWORD 'app_password';
-- GRANT ALL PRIVILEGES ON DATABASE mapa_glicemico TO app_user;
