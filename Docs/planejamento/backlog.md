# BACKLOG — IMUNOPET BRASIL

## BACKEND

- [x] Separar rotas do index.js
- [x] Criar controllers
- [x] Criar services
- [x] Criar middlewares (`backend/middleware/auth.js`: autenticação/autorização; `backend/middleware/errorHandler.js`: tratamento de erro global e rota 404)
- [x] Organizar estrutura do backend
- [x] Corrigir rota aninhada de vacinas
- [ ] Padronizar respostas da API (cada controller monta `res.json()` manualmente; formato de sucesso varia, sem helper compartilhado)
- [x] Melhorar tratamento de erros (middleware global `backend/middleware/errorHandler.js` captura exceções não tratadas e devolve JSON padronizado; controllers continuam com tratamento próprio ad hoc por rota)
- [x] Criar middleware de autenticação
- [x] Implementar JWT
- [ ] Validar dados recebidos da API (validação manual dentro de cada controller; sem `joi`/`zod`/`express-validator`)
- [x] Criar logs de erros (log técnico básico via `console.error` com timestamp e rota no middleware global de erro; distinto do log de auditoria de negócio em `log_auditoria`)

---

## FRONTEND

- [x] Organizar páginas por módulos (Next.js App Router: `frontend/app/admin`, `/gestor`, `/governo`, `/tutor`, `/veterinario`, cada um com suas próprias rotas)
- [ ] Separar CSS do HTML (1281 ocorrências de `style={{...}}` inline nas páginas; só existem 2 arquivos `.css` reais, `globals.css` e o `page.module.css` padrão do `create-next-app`)
- [x] Criar arquivo global de configuração API (`frontend/app/lib/api.js`, URL base via `NEXT_PUBLIC_API_URL`)
- [x] Padronizar chamadas fetch (todas as páginas usam `apiFetch()`; único `fetch()` bruto do app é o interno ao próprio wrapper em `api.js`)
- [ ] Criar camada de serviços JS (não existe um serviço por domínio, ex. `tutorService.js`; cada página chama `apiFetch` diretamente)
- [x] Melhorar organização visual
- [x] Melhorar dashboard
- [x] Criar mensagens padronizadas
- [ ] Melhorar responsividade (parcial: várias telas já usam grid responsivo (`repeat(auto-fit, minmax(...))`), mas o menu lateral em `LayoutPainel.js` tem largura fixa em pixels, sem breakpoint para telas pequenas, e quase não há `@media query` própria do projeto)
- [x] Criar sistema de navegação mais organizado

---

## BANCO DE DADOS

- [ ] Validar foreign keys (`animal.especie` e `animal.raca` ainda são `VARCHAR` livres, sem FK para as tabelas `especie`/`raca` já existentes e mantidas via `/admin/especies` e `/admin/racas`; demais relacionamentos possuem FK)
- [x] Criar constraints
- [ ] Criar índices de busca (existem apenas índices de suporte a FK e `UNIQUE`; faltam índices dedicados a performance, ex.: `registro_vacinacao.status` e `registro_vacinacao.data_proxima_dose`, usados nos relatórios e no cálculo de atrasados)
- [ ] Revisar integridade relacional (mesmo ponto de `animal.especie`/`animal.raca` acima)
- [ ] Padronizar nomes de colunas
- [ ] Melhorar estrutura SQL
- [ ] Revisar relacionamentos entre entidades

---

## AUTENTICAÇÃO E SEGURANÇA

- [x] Implementar JWT
- [x] Criar proteção de rotas
- [x] Implementar autorização por perfil
- [x] Melhorar persistência de sessão (token JWT migrado de localStorage para cookie httpOnly + proteção CSRF por double-submit token)
- [x] Implementar expiração de sessão
- [x] Validar permissões de usuários (autorização por perfil + escopo de clínica + posse)
- [x] Melhorar segurança da API (CORS com allowlist, rate limiting, redefinição de senha por token)

---

## FUNCIONALIDADES

- [x] Cadastro de tutor
- [x] Cadastro de pet
- [x] Cadastro de vacina
- [x] Login de usuários
- [x] Histórico vacinal
- [x] Dashboard inicial
- [x] Busca de animais
- [x] Relatórios vacinais
- [x] Dashboard analítico
- [x] Cobertura vacinal
- [x] Estatísticas vacinais
- [ ] Notificações de vacinação
- [ ] Calendário vacinal
- [x] Gestão institucional

---

## ORGANIZAÇÃO DO SISTEMA

- [x] Criar roadmap
- [x] Criar documentação técnica
- [x] Criar labels do GitHub
- [x] Organizar GitHub Projects
- [x] Criar documentação de funcionalidades
- [x] Criar regras de negócio
- [ ] Criar padronização de commits
- [ ] Criar fluxo de versionamento
- [x] Melhorar organização do repositório

---

## TESTES

- [ ] Testar endpoints da API (cobertura via HTTP/supertest existe para autenticação e para uma parte do `/admin/*`, `/tutor/*` e `/vacinas`; rotas de pet, vacina, gestor e governo são testadas só no nível de service, com banco mockado, não via requisição HTTP real)
- [x] Testar autenticação (`backend/tests/setup/middleware/auth.test.js` e `service/auth-rotas.test.js`: JWT, cookie httpOnly, CSRF, login/logout, alterar senha, redefinição de senha)
- [x] Testar cadastro de pets
- [x] Testar cadastro de vacinas
- [x] Testar fluxo de vacinação (`vacinaService.test.js`: registrar, histórico, atrasados, editar/deletar registro)
- [x] Testar dashboard (`gestorService.test.js` e `governoService.test.js` cobrem `dadosDashboard()` e `dadosEpidemiologicos()` no nível de service; sem teste de HTTP end-to-end da rota do dashboard)
- [x] Validar tratamento de erros (cenários de erro embutidos em cada suíte de teste, ex. 400/401/403/404; `error-handler.test.js` cobre especificamente o middleware global de erro e a rota 404)
- [x] Criar testes automatizados futuros
- [x] `npm run lint` no frontend limpo (0 erros) — corrigidos 59 erros reais de `react-hooks` (funções usadas antes de declaradas, reordenadas; leitura de sessão em `useEffect` documentada com justificativa, é o padrão seguro para SSR do Next.js). O workflow de CI (`frontend-build.yml`) volta a passar.
- [x] Suíte de testes do backend: 170 testes em 12 suítes passando (`npm test` em `backend/`)

---

## MELHORIAS FUTURAS

- [x] Dashboard administrativo
- [ ] Sistema de notificações
- [ ] Integração entre clínicas
- [x] Relatórios epidemiológicos
- [ ] Controle de campanhas vacinais
- [x] Painel governamental
- [x] Estatísticas regionais
- [ ] Integração mobile futura
