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
- [x] Seed de dados em `database/INSERT IMUNOPET BRASIL.sql` (schema em `database/DB.sql`; migrações pontuais em `database/migrations/`)

---

## FASE 2 — Estrutura do Backend

- [x] Modularizar rotas
- [x] Criar controllers
- [x] Criar services
- [x] Criar middlewares (`backend/middleware/auth.js`: autenticação JWT, autorização por perfil, escopo de clínica; `backend/middleware/errorHandler.js`: erro global e rota 404)
- [x] Separar conexão do banco
- [ ] Criar pasta config
- [ ] Organizar scripts auxiliares
- [ ] Padronizar respostas da API (cada controller formata `res.json()` manualmente; não há helper de resposta compartilhado)

---

## FASE 3 — Estrutura do Frontend

- [x] Organizar páginas por módulos (Next.js App Router: `frontend/app/admin`, `/gestor`, `/governo`, `/tutor`, `/veterinario`)
- [ ] Separar CSS do HTML (predominância de estilo inline; só `globals.css` e o `page.module.css` padrão do `create-next-app` existem)
- [x] Criar configuração global da API (`frontend/app/lib/api.js`)
- [ ] Criar camada de serviços JS
- [x] Padronizar chamadas fetch (`apiFetch()` usado em todas as páginas que consomem a API)
- [ ] Melhorar reutilização de código
- [ ] Organizar assets do sistema

---

## FASE 4 — Estrutura do Banco de Dados

- [x] Modelagem relacional inicial
- [x] Relacionamento entre entidades
- [x] Tabelas `clinica` e `orgao_governamental` previstas no modelo
- [ ] Validar foreign keys (`animal.especie`/`animal.raca` ainda são `VARCHAR` livres, sem FK para as tabelas `especie`/`raca`)
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
- [x] Melhorar tratamento de erros (middleware global `backend/middleware/errorHandler.js`)
- [ ] Criar padronização de respostas (sem helper de resposta compartilhado entre controllers)

---

## FASE 6 — Segurança Arquitetural

- [x] Hash de senha com bcrypt
- [x] SQL parametrizado
- [x] Uso de variáveis de ambiente
- [x] Implementar JWT (`backend/utils/jwt.js`)
- [x] Middleware de autenticação (`autenticar` em `backend/middleware/auth.js`)
- [x] Controle de autorização por perfil (`autorizar`, aplicado em todas as rotas)
- [x] Proteção de rotas (todas as rotas exigem token, exceto login/cadastro/avisos/redefinição de senha)
- [x] Expiração de sessão (token JWT expira em `JWT_EXPIRES_IN`, padrão 8h)
- [x] Redefinição de senha por token de uso único enviado por e-mail (`/solicitar-redefinicao-senha`, `/confirmar-redefinicao-senha`)
- [x] Troca de senha pelo próprio usuário logado (`POST /alterar-senha`, exige a senha atual)
- [x] Sessão migrada de JWT em `localStorage` para cookie httpOnly, com proteção CSRF por double-submit token e fallback a `Authorization: Bearer` para uso programático
- [x] CORS restrito por allowlist (`CORS_ORIGIN`) e rate limiting em login, cadastro, redefinição e troca de senha

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
