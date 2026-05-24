# ImunoPet Brasil

## Visão geral

ImunoPet Brasil é um sistema de gestão de vacinação animal que integra:

- backend Node.js + Express
- banco de dados MySQL
- frontend em HTML/JavaScript com telas específicas por perfil

O sistema atende três perfis principais:

- Tutor
- Veterinário
- Gestor / Governo

## Estrutura do repositório

- `backend/`: API em Express e conexão MySQL
- `frontend/`: páginas web com lógica de navegação e consumo da API
  - `app.js`
  - `dashboard.html`
  - `index.html`
  - `administrador/` (placeholder vazio)
  - `governo/`
    - `governo-dashboard.html`
    - `governo-dashboard.js`
    - `governo-relatorios.html`
    - `governo-relatorios.js`
  - `gestor/`
    - `gestor-dashboard.html`
    - `gestor-dashboard.js`
    - `gestor-relatorios.html`
    - `gestor-relatorios.js`
  - `tutor/`
    - `tutor-animais.html`
    - `tutor-animais.js`
    - `tutor-historico.html`
    - `tutor-historico.js`
  - `usuario/`
  - `veterinario/`
    - `vet-buscar.html`
    - `vet-buscar.js`
    - `vet-cadastrar-pet.html`
    - `vet-cadastrar-pet.js`
    - `vet-cadastrar-tutor.html`
    - `vet-cadastrar-tutor.js`
    - `vet-cadastrar-vacina.html`
    - `vet-cadastrar-vacina.js`
    - `vet-editar.html`
    - `vet-editar.js`
- `database/`: modelo de dados e script SQL de criação/seed
- `Docs/`: documentação técnica, regras de negócio, arquitetura e roadmap

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
   ```

4. Inicie o backend:

   ```bash
   npm start
   ```

5. Abra os arquivos HTML do frontend diretamente no navegador ou use um servidor local estático.

> O backend roda por padrão em `http://localhost:3000`.

## Backend

- API principal: `backend/index.js`
- Conexão MySQL: `backend/db.js`
- Dependências principais: `express`, `mysql2`, `cors`, `bcrypt`, `dotenv`

## Frontend

- Login e dashboard geral: `frontend/index.html`, `frontend/app.js`, `frontend/dashboard.html`
- Tutor: `frontend/tutor/`
- Veterinário: `frontend/veterinario/`
- Gestor: `frontend/gestor/`
- Governo: `frontend/governo/`

O frontend usa `localStorage` para manter dados do usuário e `http://localhost:3000` como host da API.

## Principais endpoints

### Autenticação

- `POST /login`
- `POST /cadastro`

### Tutor

- `GET /tutor/animais/:id_usuario`
- `GET /tutor/alertas/:id_usuario`
- `GET /historico-pet/:id_animal`

### Veterinário

- `GET /buscar-animais`
- `GET /detalhes-animal/:id_animal`
- `PUT /editar-pet-tutor/:id_animal`
- `DELETE /deletar-animal/:id_animal`
- `GET /tutores`
- `GET /listar-tutores`
- `PUT /editar-tutor-dados/:id_tutor`
- `DELETE /deletar-tutor/:id_tutor`
- `GET /vacinas`
- `POST /cadastrar-vacina`
- `PUT /editar-vacina/:id_vacina`
- `DELETE /deletar-vacina/:id_vacina`
- `POST /cadastrar-pet`
- `POST /cadastrar-tutor-pet`
- `POST /registrar-vacina`

### Gestão e análise

- `GET /gestor/dados-dashboard`
- `GET /gestor/relatorios-avancados`
- `GET /governo/dados-epidemiologicos`
- `GET /governo/relatorios-avancados`

### Outras rotas úteis

- `GET /animais-atrasados`
- `GET /relatorio-vacinas`
- `DELETE /deletar-registro-vacina/:id_registro`
- `PUT /editar-registro-vacina/:id_registro`

## Observações

- A aplicação não usa autenticação com token JWT no frontend.
- O login é feito por e-mail/senha e o perfil é usado para exibir a interface correta.
- O banco pode ser criado e populado usando `database/script.sql`.
