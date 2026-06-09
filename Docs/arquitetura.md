# ARQUITETURA — IMUNOPET BRASIL

## FASE 1 — Arquitetura Atual

- [x] Estrutura frontend em HTML/CSS/JS
- [x] Backend em Node.js + Express
- [x] Banco de dados MySQL
- [x] API REST básica
- [x] Integração frontend/backend
- [x] Dashboards de gestor e governo com gráficos
- [x] Sistema de autenticação inicial
- [x] Pool de conexão MySQL
- [x] Conexão de banco separada em `backend/db.js`
- [x] Uso de variáveis de ambiente (.env)
- [x] Seed de dados em `database/script.sql`

---

## FASE 2 — Estrutura do Backend

- [x] Modularizar rotas
- [x] Criar controllers
- [x] Criar services
- [ ] Criar middlewares
- [x] Separar conexão do banco
- [ ] Criar pasta config
- [ ] Organizar scripts auxiliares
- [x] Padronizar respostas da API

---

## FASE 3 — Estrutura do Frontend

- [ ] Organizar páginas por módulos
- [ ] Separar CSS do HTML
- [ ] Criar configuração global da API
- [ ] Criar camada de serviços JS
- [ ] Padronizar chamadas fetch
- [ ] Melhorar reutilização de código
- [ ] Organizar assets do sistema

---

## FASE 4 — Estrutura do Banco de Dados

- [x] Modelagem relacional inicial
- [x] Relacionamento entre entidades
- [x] Tabelas `clinica` e `orgao_governamental` previstas no modelo
- [ ] Validar foreign keys
- [x] Criar constraints
- [ ] Criar índices de busca
- [ ] Padronizar nomenclaturas SQL
- [ ] Revisar integridade relacional

---

## FASE 5 — Fluxo de Comunicação

- [x] Comunicação frontend → backend
- [x] Comunicação backend → banco
- [x] Retorno JSON da API
- [x] Centralizar URLs da API
- [x] Melhorar tratamento de erros
- [x] Criar padronização de respostas

---

## FASE 6 — Segurança Arquitetural

- [x] Hash de senha com bcrypt
- [x] SQL parametrizado
- [x] Uso de variáveis de ambiente
- [ ] Implementar JWT
- [ ] Middleware de autenticação
- [ ] Controle de autorização por perfil
- [ ] Proteção de rotas
- [ ] Expiração de sessão

---

## FASE 7 — Modularização e Escalabilidade

- [ ] Separação completa de responsabilidades
- [ ] Redução de acoplamento
- [ ] Estrutura preparada para crescimento
- [ ] Criação de utilitários reutilizáveis
- [ ] Estrutura para dashboards analíticos
- [ ] Estrutura para notificações futuras
- [ ] Estrutura para relatórios avançados

---

## FASE 8 — Arquitetura Futura Planejada

- [ ] Backend totalmente modular
- [ ] Frontend modularizado
- [ ] APIs padronizadas
- [ ] Estrutura escalável
- [ ] Melhor organização de diretórios
- [ ] Melhor separação de camadas
- [ ] Arquitetura preparada para expansão institucional
