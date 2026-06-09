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

1. Abra um terminal em `backend/`
2. Instale dependências:

   ```bash
   npm install
   ```

3. Crie um arquivo `.env` com as variáveis de banco:

   ```env
   DB_HOST=localhost
   DB_USER=seu_usuario
   DB_PASSWORD=sua_senha
   DB_NAME=imunopet
   PORT=3000
   ```

4. Inicie o backend:

   ```bash
   npm start
   ```

5. Inicie o frontend (usando o fluxo compatível com a estrutura que você pretende executar).

> Observação: o backend roda por padrão em `http://localhost:3000`.

## Backend

- API: `backend/index.js` (montagem das rotas e autenticação/cadastro)
- Conexão MySQL: `backend/db.js`

Dependências principais: `express`, `mysql2`, `cors`, `bcrypt`, `dotenv`

## Frontend

- Persistência/estado no navegador via `localStorage` (utilizado para navegação por perfil)
- Consumo da API em `http://localhost:3000`

## Principais endpoints (evidência no backend)

### Autenticação e usuários

- `POST /login`
- `POST /cadastro` (cadastro de tutor)
- `PUT /redefinir-senha`

### Tutor

- `GET /tutor/animais/:id_usuario`
- `GET /tutor/alertas/:id_usuario`

### Pets (animais)

- `POST /cadastrar-tutor-pet` (cria tutor+pet no mesmo fluxo)
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
- [x] Persistência de sessão com localStorage
- [x] Recuperação de senha (redefinir-senha)
- [ ] Logout global padronizado
- [ ] Expiração de sessão
- [ ] Autenticação JWT

---

### Perfis de usuários

- [x] Perfil ADMINISTRADOR (ver UI/módulos específicos)
- [x] Perfil TUTOR
- [x] Perfil VETERINARIO
- [x] Perfil GESTOR_CLINICA
- [x] Perfil GOVERNO
- [ ] Controle avançado de permissões
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

- [x] Cadastro de pets (via `/cadastrar-tutor-pet` e rotas associadas)
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
- [ ] Dashboard administrativo
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

- Não há evidência de JWT no backend/fluxo descrito na base atual.
- O login é por e-mail/senha e o perfil determina quais dados/rotas são acessados.
- O banco pode ser criado e populado usando `database/DB.sql`.
