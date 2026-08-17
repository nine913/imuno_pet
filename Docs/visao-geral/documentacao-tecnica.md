# DOCUMENTAÇÃO TÉCNICA — IMUNOPET BRASIL

## VISÃO GERAL DO PROJETO

- [x] Plataforma de gestão vacinal veterinária
- [x] Sistema acadêmico em evolução estrutural
- [x] Arquitetura baseada em frontend + backend + banco de dados
- [x] Controle de vacinação animal
- [x] Controle por perfis de usuários
- [x] Histórico vacinal integrado
- [x] Estrutura institucional inicial

---

## OBJETIVO DO SISTEMA

- [x] Centralizar informações vacinais
- [x] Facilitar acompanhamento de vacinação animal
- [x] Permitir controle por clínicas veterinárias
- [x] Permitir acesso para tutores
- [x] Permitir expansão institucional futura
- [x] Estruturar histórico vacinal digital

---

## PROBLEMA RESOLVIDO

- [x] Falta de centralização vacinal
- [x] Dificuldade no controle de vacinação animal
- [x] Ausência de histórico vacinal digital unificado
- [x] Necessidade de rastreabilidade vacinal
- [x] Necessidade de controle institucional futuro

---

## STACK TECNOLÓGICA

- [x] Node.js
- [x] Express
- [x] MySQL
- [x] Next.js (frontend, App Router)
- [x] React
- [x] HTML5
- [x] CSS3
- [x] JavaScript Vanilla (backend)
- [x] bcrypt
- [x] dotenv
- [x] cors
- [x] nodemon

---

## ARQUITETURA DO SISTEMA

- [x] Frontend em Next.js (App Router/React)
- [x] Backend Node.js + Express
- [x] Banco de Dados MySQL
- [x] Comunicação via API REST
- [x] Estrutura monolítica inicial (backend evoluiu para rotas/controllers/services/middlewares; frontend evoluiu de HTML/CSS/JS puro para Next.js)
- [ ] Arquitetura modular futura
- [ ] Estrutura escalável futura

---

## ESTRUTURA DO REPOSITÓRIO

- [x] Pasta backend
- [x] Pasta frontend
- [x] Pasta database
- [x] Uso de .env
- [x] package.json configurado
- [x] Organização inicial do GitHub
- [ ] Modularização estrutural
- [ ] Organização avançada de diretórios

---

## BANCO DE DADOS

- [x] Modelagem relacional
- [x] Tabela usuario
- [x] Tabela tutor
- [x] Tabela veterinario
- [x] Tabela clinica
- [x] Tabela orgao_governamental
- [x] Tabela animal
- [x] Tabela vacina
- [x] Tabela registro_vacinacao
- [x] Tabela especie
- [x] Tabela raca
- [x] Tabela aviso
- [x] Tabela log_auditoria
- [x] Seed de dados em `database/INSERT IMUNOPET BRASIL.sql` (schema em `database/DB.sql`; migrações pontuais em `database/migrations/`, ex.: `001_add_reset_senha.sql`)
- [ ] Constraints avançadas
- [ ] Índices de performance (faltam índices dedicados, ex.: `registro_vacinacao.status` e `registro_vacinacao.data_proxima_dose`; hoje só há índices de suporte a FK e `UNIQUE`)
- [ ] Revisão completa de integridade relacional (`animal.especie`/`animal.raca` são `VARCHAR` livres, sem FK para as tabelas `especie`/`raca`)

---

## PERFIS DO SISTEMA

- [x] ADMINISTRADOR
- [x] TUTOR
- [x] VETERINARIO
- [x] GESTOR_CLINICA
- [x] GOVERNO
- [x] Controle avançado de permissões (autorização por perfil + escopo de clínica para gestor/veterinário + verificação de posse para tutor — ver seção SEGURANÇA)
- [x] Painéis específicos por perfil

---

## FUNCIONALIDADES IMPLEMENTADAS

- [x] Login de usuários
- [x] Cadastro de tutor
- [x] Cadastro de pets
- [x] Cadastro de vacinas
- [x] Registro vacinal
- [x] Histórico vacinal
- [x] Busca de animais
- [x] Dashboard do tutor
- [x] Dashboard do veterinário
- [x] Persistência de sessão
- [x] Dashboard administrativo
- [x] Dashboard governamental
- [x] Relatórios avançados

---

## FLUXO DO SISTEMA

- [x] Login → Dashboard
- [x] Tutor → Pets → Vacinas
- [x] Veterinário → Cadastro → Vacinação
- [x] Backend → Banco → JSON → Frontend
- [x] Fluxo protegido por JWT
- [x] Controle completo de sessão

---

## BACKEND

- [x] Express configurado
- [x] Pool de conexão MySQL
- [x] Rotas principais implementadas
- [x] SQL parametrizado
- [x] bcrypt implementado
- [x] Variáveis de ambiente carregadas com dotenv
- [x] Separação de rotas
- [x] Controllers
- [x] Services
- [x] Middlewares (`backend/middleware/auth.js`, `backend/middleware/errorHandler.js`)
- [ ] Validação de entrada centralizada
- [x] Estrutura modular (rotas/controllers/services/middlewares/utils separados)

## DESCRIÇÃO DO BACKEND

- [x] API REST modular: `backend/index.js` apenas inicializa o servidor; `backend/app.js` compõe middlewares e rotas (`backend/routes/*.js` → `controllers/*.js` → `services/*.js`)
- [x] Conexão MySQL com `mysql2` e `createPool` em `backend/db.js`
- [x] Autenticação por e-mail e senha com hash `bcrypt`
- [x] Rotas para CRUD de tutores, pets, vacinas e registros de vacinação
- [x] Relatórios para gestor, governo, alertas e vacinas atrasadas
- [x] `express.json()` configurado para JSON
- [x] Middleware global de tratamento de erros e rota 404 padronizada (`backend/middleware/errorHandler.js`)

## PONTOS DE MELHORIA BACKEND

- [x] Separação de rotas
- [x] Controllers e services implementados
- [x] Middleware de autenticação e autorização (`backend/middleware/auth.js`)
- [ ] Padronização de respostas JSON (cada controller monta `res.json()` manualmente; sem helper de resposta compartilhado)
- [ ] Validação centralizada de dados de entrada
- [x] Estrutura modular

---

## FRONTEND

- [x] Páginas Next.js (App Router) independentes por rota, em `frontend/app/**/page.js` (27 rotas ao todo; nenhum arquivo `.html`/`app.js` vanilla restante)
- [x] JavaScript/JSX separado por página
- [x] Dashboard funcional
- [x] Integração com API via `fetch` (encapsulado em `apiFetch`, `frontend/app/lib/api.js`)
- [x] Login em `frontend/app/page.js`
- [x] Dashboard em `frontend/app/dashboard/page.js`
- [x] Painéis exibidos conforme `perfil` do usuário
- [x] Tutor com páginas em `frontend/app/tutor/`
- [x] Tutor usa endpoints `GET /tutor/animais/:id_usuario`, `GET /tutor/alertas/:id_usuario` e `GET /historico-pet/:id_animal`
- [x] Busca de pets filtrada localmente no frontend
- [x] Veterinário com páginas em `frontend/app/veterinario/`
- [x] Veterinário usa endpoints `GET /buscar-animais`, `GET /vacinas`, `GET /veterinarios`, `GET /listar-tutores`, `GET /detalhes-animal/:id_animal`, `POST /registrar-vacina`, `PUT /editar-pet-tutor/:id_animal`, `DELETE /deletar-animal/:id_animal`, `PUT /editar-vacina/:id_vacina`, `DELETE /deletar-vacina/:id_vacina`, `PUT /editar-tutor-dados/:id_tutor`, `DELETE /deletar-tutor/:id_tutor`, `POST /cadastrar-pet`, `POST /cadastrar-tutor`, `POST /cadastrar-vacina`
- [x] Veterinário pode cadastrar pets, tutores e vacinas
- [x] Gestor com páginas em `frontend/app/gestor/`
- [x] Gestor usa endpoints `GET /gestor/dados-dashboard`, `GET /gestor/relatorios-avancados`, `GET /vacinas`, `GET /gestor/veterinarios-lista`, `POST /gestor/cadastrar-vet`, `PUT /gestor/editar-vet/:id_veterinario` e `DELETE /gestor/deletar-vet/:id_veterinario`
- [x] Governo com páginas em `frontend/app/governo/`
- [x] Governo usa endpoints `GET /governo/dados-epidemiologicos`, `GET /governo/relatorios-avancados` e `GET /vacinas`
- [x] Perfil do usuário e preferências de UI (tema, fonte, acessibilidade) salvos em `localStorage` (`usuarioImunoPet`, config de configurações); a autenticação em si não usa `localStorage` — ver seção SEGURANÇA
- [x] URL base da API configurável via `NEXT_PUBLIC_API_URL`, com fallback padrão `http://localhost:3000` para desenvolvimento (`frontend/app/lib/api.js`)
- [x] Uso de Chart.js em dashboards do gestor e governo
- [ ] Separação completa de CSS (predominância de estilo inline; só `globals.css` e o `page.module.css` padrão do `create-next-app` existem)
- [x] Reutilização de componentes (`LayoutPainel.js` compartilhado por todas as páginas autenticadas)
- [x] Organização modular (rotas agrupadas por perfil em `frontend/app/{admin,gestor,governo,tutor,veterinario}`)
- [ ] Camada de serviços frontend
- [x] Configuração central de URL da API (`frontend/app/lib/api.js`)
- [x] Autenticação via cookie httpOnly (JWT) + cabeçalho `X-CSRF-Token` em toda chamada mutável (`apiFetch` injeta o CSRF, não `Authorization: Bearer` — ver seção SEGURANÇA)

---

## SEGURANÇA

- [x] Hash de senha com bcrypt
- [x] SQL parametrizado
- [x] Variáveis de ambiente
- [x] Controle básico de sessão
- [x] JWT (`backend/utils/jwt.js`)
- [x] Middleware de autenticação (`backend/middleware/auth.js`)
- [x] Proteção de rotas (todas as rotas exigem token e perfil autorizado, exceto login/cadastro/avisos/redefinição de senha)
- [x] Expiração de sessão (token expira em `JWT_EXPIRES_IN`)
- [x] Controle avançado de permissões (autorização por perfil + escopo de clínica para gestor/veterinário + verificação de posse para tutor)
- [x] CORS restrito por allowlist (`CORS_ORIGIN`)
- [x] Rate limiting em login, cadastro e redefinição de senha
- [x] Redefinição de senha por token de uso único com expiração de 1h, enviado por e-mail (nunca por e-mail + senha nova direto)
- [x] Troca de senha pelo próprio usuário logado (`POST /alterar-senha`, exige a senha atual)
- [x] Sessão via cookie httpOnly (JWT) + proteção CSRF por double-submit token, com fallback a `Authorization: Bearer` para uso programático
- [x] Autorização de `/admin/especies`, `/admin/racas` e `/admin/vacinas` (GET) revisada para permitir leitura/gestão pelos perfis que legitimamente usam esses catálogos compartilhados (veterinário, gestor de clínica e, para leitura, governo) — o bloqueio anterior (`ADMINISTRADOR` exclusivo em todo o namespace `/admin`) quebrava silenciosamente formulários de cadastro de pet/vacina e filtros de relatório desses perfis; `GET /admin/clinicas/:id` segue restrito ao administrador ou ao gestor da própria clínica (`exigirPropriaClinica`)
- [x] Middleware global de tratamento de erros (`backend/middleware/errorHandler.js`) evita vazamento de detalhes internos em respostas de erro não tratado (mensagem genérica salvo quando o erro é explicitamente marcado como seguro para exposição) e registra tecnicamente cada falha (rota, método, stack) via `console.error`

---

## API E ENDPOINTS

- [x] POST /login
- [x] POST /cadastro
- [x] GET /tutor/animais/:id_usuario
- [x] GET /buscar-animais
- [x] GET /detalhes-animal/:id_animal
- [x] PUT /editar-pet-tutor/:id_animal
- [x] POST /cadastrar-pet
- [x] POST /cadastrar-tutor
- [x] POST /cadastrar-vacina
- [x] POST /registrar-vacina
- [x] GET /vacinas
- [x] GET /tutores
- [x] GET /listar-tutores
- [x] PUT /editar-tutor-dados/:id_tutor
- [x] DELETE /deletar-tutor/:id_tutor
- [x] DELETE /deletar-animal/:id_animal
- [x] GET /historico-pet/:id_animal
- [x] DELETE /deletar-registro-vacina/:id_registro
- [x] GET /relatorio-vacinas
- [x] PUT /editar-registro-vacina/:id_registro
- [x] GET /animais-atrasados
- [x] GET /tutor/alertas/:id_usuario
- [x] GET /veterinarios
- [x] GET /gestor/dados-dashboard
- [x] GET /gestor/relatorios-avancados
- [x] GET /governo/dados-epidemiologicos
- [x] GET /governo/relatorios-avancados
- [x] POST /logout
- [x] POST /alterar-senha
- [x] POST /solicitar-redefinicao-senha
- [x] POST /confirmar-redefinicao-senha
- [x] POST /cadastrar-animal
- [x] GET /animais
- [x] PUT /editar-animal/:id
- [x] GET /avisos-ativos, GET /avisos (públicas, sem autenticação — exibidas inclusive na tela de login)
- [x] GET /gestor/veterinarios-lista
- [x] POST /gestor/cadastrar-vet
- [x] PUT /gestor/editar-vet/:id_veterinario
- [x] DELETE /gestor/deletar-vet/:id_veterinario
- [x] GET /admin/especies, POST /admin/cadastrar-especie, DELETE /admin/deletar-especie/:id
- [x] GET /admin/racas, POST /admin/cadastrar-raca, DELETE /admin/deletar-raca/:id
- [x] GET /admin/vacinas, POST /admin/cadastrar-vacina, PUT /admin/editar-vacina/:id, DELETE /admin/deletar-vacina/:id
- [x] GET /admin/clinicas, GET /admin/clinicas/:id, POST /admin/cadastrar-clinica, PUT /admin/editar-clinica/:id, DELETE /admin/deletar-clinica/:id
- [x] GET /admin/gestores, POST /admin/cadastrar-gestor, PUT /admin/editar-gestor/:id, DELETE /admin/deletar-gestor/:id
- [x] GET /admin/orgaos, POST /admin/cadastrar-orgao, PUT /admin/editar-orgao/:id, DELETE /admin/deletar-orgao/:id
- [x] GET /admin/estatisticas
- [x] GET /admin/avisos, POST /admin/cadastrar-aviso, PUT /admin/editar-aviso/:id, DELETE /admin/deletar-aviso/:id
- [x] GET /admin/logs
- [ ] Padronização completa de respostas da API

---

## REGRAS DE NEGÓCIO

- [x] Usuário possui perfil obrigatório
- [x] Tutor possui CPF único
- [x] Animal deve possuir tutor
- [x] Vacina deve possuir nome
- [x] Registro vacinal deve possuir status
- [x] Tutor visualiza apenas seus pets
- [x] Veterinário pode registrar vacinas
- [ ] Validações avançadas
- [ ] Controle completo de permissões

---

## ROADMAP DO PROJETO

- [x] Estrutura inicial concluída
- [x] MVP funcional concluído
- [x] Fluxo tutor concluído
- [x] Fluxo veterinário concluído
- [x] Organização GitHub iniciada
- [x] Documentação iniciada
- [ ] Refatoração estrutural
- [x] Segurança avançada (JWT, autorização por perfil/clínica, rate limiting, redefinição de senha por token)
- [ ] Escalabilidade
- [ ] Expansão institucional

---

## PROBLEMAS TÉCNICOS IDENTIFICADOS

- [ ] Backend monolítico (resolvido: rotas/controllers/services/middlewares separados)
- [ ] Rotas concentradas no index.js (resolvido: `backend/index.js` só inicializa o servidor; rotas vivem em `backend/routes/`)
- [ ] Frontend acoplado (resolvido: Next.js App Router organizado por perfil, com `LayoutPainel` compartilhado)
- [x] CSS dentro das páginas (ainda vigente: estilo majoritariamente inline em vez de arquivos `.css`)
- [ ] URLs hardcoded (mitigado: URL da API configurável via `NEXT_PUBLIC_API_URL`, com valor padrão `http://localhost:3000` apenas para desenvolvimento)
- [ ] Falta de modularização (resolvido no backend; parcial no frontend — falta camada de serviços JS e separação de CSS)
- [ ] Ausência de JWT
- [ ] Ausência de middleware
- [ ] Ausência de arquitetura escalável

---

## MELHORIAS FUTURAS

- [x] Dashboard analítico
- [x] Estatísticas vacinais
- [x] Cobertura vacinal
- [ ] Notificações automáticas
- [ ] Calendário vacinal
- [ ] Integração entre clínicas
- [x] Painel governamental
- [x] Relatórios epidemiológicos
- [ ] Aplicação mobile
- [ ] Inteligência analítica futura

---

## ESTADO ATUAL DO PROJETO

- [x] MVP funcional
- [x] Sistema operacional
- [x] Backend funcional
- [x] Frontend funcional
- [x] Banco estruturado
- [x] Fluxo vacinal implementado
- [x] Estrutura documental criada
- [ ] Arquitetura consolidada
- [x] Segurança avançada (JWT, autorização por perfil/clínica, rate limiting, redefinição de senha por token)
- [ ] Escalabilidade concluída

---

## CONSIDERAÇÕES FINAIS

- [x] Projeto em fase de consolidação arquitetural
- [x] Sistema preparado para evolução gradual
- [x] Estrutura adequada para continuidade acadêmica
- [x] Base funcional sólida
- [x] Potencial de expansão institucional
- [x] Documentação técnica consolidada
