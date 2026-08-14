-- Adiciona suporte a redefinição de senha por token (fluxo seguro em 2 passos).
-- O token em si nunca é armazenado — apenas o hash SHA-256 dele — para que um vazamento
-- do banco não permita a um atacante redefinir senhas usando os tokens diretamente.
USE imunopet;

ALTER TABLE usuario
  ADD COLUMN reset_token_hash VARCHAR(64) NULL,
  ADD COLUMN reset_token_expira DATETIME NULL;
