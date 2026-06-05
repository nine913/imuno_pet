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
- [x] HTML5
- [x] CSS3
- [x] JavaScript Vanilla
- [x] bcrypt
- [x] dotenv
- [x] cors
- [x] nodemon

---

## ARQUITETURA DO SISTEMA

- [x] Frontend HTML/CSS/JS
- [x] Backend Node.js + Express
- [x] Banco de Dados MySQL
- [x] Comunicação via API REST
- [x] Estrutura monolítica inicial
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
- [x] Seed de dados em `database/script.sql`
- [ ] Constraints avançadas
- [ ] Índices de performance
- [ ] Revisão completa de integridade relacional

---

## PERFIS DO SISTEMA

- [X] ADMINISTRADOR
- [x] TUTOR
- [x] VETERINARIO
- [x] GESTOR_CLINICA
- [x] GOVERNO
- [ ] Controle avançado de permissões
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
- [ ] Fluxo protegido por JWT
- [ ] Controle completo de sessão

---

## BACKEND

- [x] Express configurado
- [x] Pool de conexão MySQL
- [x] Rotas principais implementadas
- [x] SQL parametrizado
- [x] bcrypt implementado
- [x] Variáveis de ambiente carregadas com dotenv
- [ ] Separação de rotas
- [ ] Controllers
- [ ] Services
- [ ] Middlewares
- [ ] Validação de entrada centralizada
- [ ] Estrutura modular

## DESCRIÇÃO DO BACKEND

- [x] API REST monolítica em `backend/index.js`
- [x] Conexão MySQL com `mysql2` e `createPool` em `backend/db.js`
- [x] Autenticação por e-mail e senha com hash `bcrypt`
- [x] Rotas para CRUD de tutores, pets, vacinas e registros de vacinação
- [x] Relatórios para gestor, governo, alertas e vacinas atrasadas
- [x] `express.json()` configurado para JSON

## PONTOS DE MELHORIA BACKEND

- [x] Separação de rotas
- [x] Controllers e services implementados
- [ ] Middleware de autenticação e autorização
- [x] Padronização de respostas JSON
- [ ] Validação centralizada de dados de entrada
- [ ] Estrutura modular

---

## FRONTEND

- [x] Páginas HTML independentes
- [x] JavaScript separado por páginas
- [x] Dashboard funcional
- [x] Integração com API via `fetch`
- [x] Login em `frontend/index.html` + `frontend/app.js`
- [x] Dashboard em `frontend/dashboard.html`
- [x] Painéis exibidos conforme `perfil` do usuário
- [x] Tutor com páginas em `frontend/tutor/`
- [x] Tutor usa endpoints `GET /tutor/animais/:id_usuario`, `GET /tutor/alertas/:id_usuario` e `GET /historico-pet/:id_animal`
- [x] Busca de pets filtrada localmente no frontend
- [x] Veterinário com páginas em `frontend/veterinario/`
- [x] Veterinário usa endpoints `GET /buscar-animais`, `GET /vacinas`, `GET /veterinarios`, `GET /listar-tutores`, `GET /detalhes-animal/:id_animal`, `POST /registrar-vacina`, `PUT /editar-pet-tutor/:id_animal`, `DELETE /deletar-animal/:id_animal`, `PUT /editar-vacina/:id_vacina`, `DELETE /deletar-vacina/:id_vacina`, `PUT /editar-tutor-dados/:id_tutor`, `DELETE /deletar-tutor/:id_tutor`, `POST /cadastrar-pet`, `POST /cadastrar-tutor-pet`, `POST /cadastrar-vacina`
- [x] Veterinário pode cadastrar pets, tutores e vacinas
- [x] Gestor com páginas em `frontend/gestor/`
- [x] Gestor usa endpoints `GET /gestor/dados-dashboard`, `GET /gestor/relatorios-avancados` e `GET /vacinas`
- [x] Governo com páginas em `frontend/governo/`
- [x] Governo usa endpoints `GET /governo/dados-epidemiologicos`, `GET /governo/relatorios-avancados` e `GET /vacinas`
- [x] Autenticação por `localStorage`
- [x] API hardcoded em `http://localhost:3000`
- [x] Uso de Chart.js em dashboards do gestor e governo
- [ ] Separação completa de CSS
- [ ] Reutilização de componentes
- [ ] Organização modular
- [ ] Camada de serviços frontend
- [ ] Configuração central de URL da API
- [ ] Autenticação via token e headers

---

## SEGURANÇA

- [x] Hash de senha com bcrypt
- [x] SQL parametrizado
- [x] Variáveis de ambiente
- [x] Controle básico de sessão
- [ ] JWT
- [ ] Middleware de autenticação
- [ ] Proteção de rotas
- [ ] Expiração de sessão
- [ ] Controle avançado de permissões

---

## API E ENDPOINTS

- [x] POST /login
- [x] POST /cadastro
- [x] GET /tutor/animais/:id_usuario
- [x] GET /buscar-animais
- [x] GET /detalhes-animal/:id_animal
- [x] PUT /editar-pet-tutor/:id_animal
- [x] POST /cadastrar-pet
- [x] POST /cadastrar-tutor-pet
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
- [ ] Segurança avançada
- [ ] Escalabilidade
- [ ] Expansão institucional

---

## PROBLEMAS TÉCNICOS IDENTIFICADOS

- [x] Backend monolítico
- [x] Rotas concentradas no index.js
- [x] Frontend acoplado
- [x] CSS dentro das páginas
- [x] URLs hardcoded
- [x] Falta de modularização
- [ ] Ausência de JWT
- [ ] Ausência de middleware
- [ ] Ausência de arquitetura escalável

---

## MELHORIAS FUTURAS

- [x] Dashboard analítico
- [ ] Estatísticas vacinais
- [ ] Cobertura vacinal
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
- [ ] Segurança avançada
- [ ] Escalabilidade concluída

---

## CONSIDERAÇÕES FINAIS

- [x] Projeto em fase de consolidação arquitetural
- [x] Sistema preparado para evolução gradual
- [x] Estrutura adequada para continuidade acadêmica
- [x] Base funcional sólida
- [x] Potencial de expansão institucional
- [x] Documentação técnica consolidada
