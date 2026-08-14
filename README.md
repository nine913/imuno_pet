# README — IMUNOPET BRASIL

## Visão geral

ImunoPet Brasil é um sistema de gestão de vacinação animal que integra:

- backend Node.js + Express
- banco de dados MySQL
- frontend em Next.js (React) e páginas JS/HTML com telas específicas por perfil

O sistema atende os perfis:

- Tutor
- Veterinário
- Gestor / Governo
- Administrador (rotas e estrutura existem, mas UI pode estar incompleta dependendo do módulo)

## Estrutura do repositório

- `backend/`: API em Express e conexão MySQL
- `frontend/`: aplicação web (Next.js + telas/históricas por perfil)
- `database/`: script SQL de criação/seed (`database/DB.sql`)
- `Docs/`: documentação técnica e auditorias anteriores

## Como executar

### Opção A — Docker Compose (recomendado)

1. Copie `.env.example` para `.env` na raiz do projeto e ajuste `JWT_SECRET` (gere um valor único com
   `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`).
2. Rode:

   ```bash
   docker compose up --build
   ```

   Isso sobe MySQL (com o schema de `database/DB.sql` já aplicado), o backend em `http://localhost:3000`
   e o frontend Next.js em `http://localhost:3001`.

### Opção B — manual

1. Abra um terminal em `backend/`
2. Instale dependências:

   ```bash
   npm install
   ```

3. Copie `backend/.env.example` para `backend/.env` e ajuste as variáveis (banco, `JWT_SECRET`, `CORS_ORIGIN`, `FRONTEND_URL`). Sem `SMTP_HOST` configurado, o e-mail de redefinição de senha é apenas registrado no console do backend — suficiente para desenvolvimento.

4. Popule o banco com `database/DB.sql` (schema) e, opcionalmente, `database/INSERT IMUNOPET BRASIL.sql` (dados de exemplo).

5. Inicie o backend:

   ```bash
   npm start
   ```

6. Em outro terminal, em `frontend/`, copie `frontend/.env.example` para `frontend/.env.local` e rode:

   ```bash
   npm install
   npm run dev
   ```

> Observação: o backend roda por padrão em `http://localhost:3000`; o frontend Next.js, em `http://localhost:3001` (ou 3000 se a porta estiver livre).

## Backend

- API: `backend/app.js` (montagem das rotas) + `backend/index.js` (bootstrap do servidor)
- Autenticação: JWT (`backend/utils/jwt.js`) + middlewares de autorização (`backend/middleware/auth.js`)
- Conexão MySQL: `backend/db.js`

Dependências principais: `express`, `mysql2`, `cors`, `bcrypt`, `dotenv`, `jsonwebtoken`, `express-rate-limit`, `nodemailer`

## Frontend

- Persistência/estado no navegador via `localStorage` (token JWT + dados do usuário logado)
- Toda chamada à API passa por `frontend/app/lib/api.js` (`apiFetch`), que centraliza a URL base (`NEXT_PUBLIC_API_URL`) e injeta o header `Authorization: Bearer`

## Principais endpoints (evidência no backend)

Todas as rotas exigem um token JWT válido (`Authorization: Bearer <token>`) e o perfil correto, exceto as marcadas como **pública**.

### Autenticação e usuários

- `POST /login` — pública
- `POST /cadastro` (auto-cadastro de tutor) — pública
- `POST /logout` — requer token
- `POST /solicitar-redefinicao-senha` — pública (envia link com token de uso único por e-mail; sem SMTP configurado, o link é registrado no console do backend)
- `POST /confirmar-redefinicao-senha` — pública (recebe o token do link + nova senha)

### Tutor

- `GET /tutor/animais/:id_usuario`
- `GET /tutor/alertas/:id_usuario`

### Pets (animais)

- `POST /cadastrar-tutor` (cria tutor+pet no mesmo fluxo)
- `DELETE /deletar-animal/:id_animal`

### Vacinas e registros vacinais

- `GET /animais-atrasados`
- `GET /avisos-ativos`
- `GET /tutores`
- Rotas de vacina/registro são implementadas via `backend/routes/vacinaRoutes.js` e `backend/services/vacinaService.js`.

### Veterinário / Gestão / Governo

- Rotas por perfil existem via `backend/routes/*Routes.js` (ex.: `gestorRoutes`, `governoRoutes`, `tutorRoutes`, `vacinaRoutes`).

## Checklist de auditoria (estado atual)

Seguindo `Docs/auditoria.md`, os itens abaixo devem ser marcados como `[x]` apenas quando há evidência clara no código/banco.

### Autenticação

- [x] Login de usuários
- [x] Validação de senha com bcrypt
- [x] Controle básico por perfil
- [x] Persistência de sessão com localStorage (token JWT)
- [x] Recuperação de senha por token de uso único enviado por e-mail
- [x] Logout global padronizado (`POST /logout` autenticado)
- [x] Expiração de sessão (token JWT expira em `JWT_EXPIRES_IN`, padrão 8h)
- [x] Autenticação JWT

---

### Perfis de usuários

- [x] Perfil ADMINISTRADOR
- [x] Perfil TUTOR
- [x] Perfil VETERINARIO
- [x] Perfil GESTOR_CLINICA
- [x] Perfil GOVERNO
- [x] Controle avançado de permissões (autorização por perfil, escopo de clínica para gestor/veterinário, verificação de posse para tutor)
- [x] Painéis específicos por perfil

---

### TUTORES

- [x] Cadastro de tutor
- [x] Consulta/obtenção de tutores (`GET /tutores`)
- [x] Associação tutor-animal
- [x] Edição completa de tutor (confirmar rotas/serviços específicos)
- [x] Exclusão de tutor (confirmar rota/serviço específicos)
- [x] Histórico completo do tutor (confirmar rota/serviço específicos)

---

### ANIMAIS (PETs)

- [x] Cadastro de pets (via `/cadastrar-tutor` e rotas associadas)
- [x] Busca de animais (existe suporte no backend; confirmar rota exata)
- [x] Consulta de detalhes do animal (confirmar rota)
- [x] Edição de pet (confirmar rota)
- [x] Exclusão de animal (rotas existem)
- [ ] Foto do animal
- [x] Histórico completo do pet (confirmar rota exata)

---

### VACINAS

- [x] Cadastro de vacinas (rotas/serviços existem)
- [x] Registro vacinal (rotas/serviços existem)
- [x] Histórico vacinal (rotas/serviços existem)
- [x] Controle de status da vacina (inclui PENDENTE/ATRASADA/CANCELADA)
- [x] Próxima dose (via `data_proxima_dose` no banco)
- [x] Atualização de vacina/registro (rotas/serviços existem)
- [x] Exclusão de vacina/registro (rotas/serviços existem)
- [x] Controle automático de vencimento (atualiza para ATRASADA)
- [x] Alertas vacinais (ex.: `/tutor/alertas/:id_usuario`, `/animais-atrasados`)

---

### DASHBOARD e RELATÓRIOS

- [x] Dashboard do tutor
- [x] Dashboard do veterinário
- [x] Dashboard do gestor (confirmar fluxo completo)
- [x] Dashboard do governo (confirmar fluxo completo)
- [x] Dashboard analítico
- [x] Dashboard governamental
- [x] Relatórios vacinais
- [x] Relatórios epidemiológicos (páginas/consultas de relatórios existentes)
- [x] Dashboard administrativo
- [x] Estatísticas em tempo real

---

### BUSCAS

- [x] Busca de animais
- [x] Busca por nome
- [x] Busca por CPF
- [x] Busca por tutor
- [x] Busca avançada
- [x] Filtros por vacinação
- [x] Busca por região
- [x] Busca institucional

## Observações

- Autenticação via JWT (`Authorization: Bearer`); o perfil no token determina quais dados/rotas são acessados, com verificação de posse (tutor) e escopo de clínica (gestor/veterinário) no backend — nunca confiando em valores enviados pelo cliente.
- O banco pode ser criado e populado usando `database/DB.sql` (schema já inclui os campos de redefinição de senha) e, opcionalmente, `database/INSERT IMUNOPET BRASIL.sql` (dados de exemplo, senha padrão documentada no próprio arquivo).
- Bancos criados **antes** desta atualização precisam rodar a migration `database/migrations/001_add_reset_senha.sql` para ganhar suporte à redefinição de senha por token.
- O frontend antigo (`frontend-antigo/`) foi mantido por compatibilidade, mas não recebe mais manutenção ativa — o frontend em produção é o `frontend/` (Next.js).
