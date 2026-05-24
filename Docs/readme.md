# IMUNOPET BRASIL

## VISÃO GERAL

- [x] Plataforma de gestão vacinal veterinária
- [x] Sistema acadêmico em desenvolvimento
- [x] Controle de vacinação animal
- [x] Histórico vacinal digital
- [x] Estrutura baseada em frontend + backend + banco de dados
- [x] Sistema preparado para expansão futura

---

## OBJETIVO DO SISTEMA

- [x] Centralizar informações vacinais de animais
- [x] Facilitar controle de vacinação
- [x] Auxiliar clínicas veterinárias
- [x] Permitir acompanhamento por tutores
- [x] Estruturar histórico vacinal digital
- [x] Criar base para expansão institucional

---

## TECNOLOGIAS UTILIZADAS

### BACKEND

- [x] Node.js
- [x] Express
- [x] MySQL2
- [x] bcrypt
- [x] dotenv
- [x] cors

### FRONTEND

- [x] HTML5
- [x] CSS3
- [x] JavaScript Vanilla

### BANCO DE DADOS

- [x] MySQL

---

## ESTRUTURA DO REPOSITÓRIO

```txt
IMUNOPET-BRASIL/
│
├── backend/
│   ├── node_modules/
│   ├── .env
│   ├── arrumar-senha.js
│   ├── db.js
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
│
├── database/
│   ├── modelo_imunopet.mwb
│   └── script.sql
│
├── frontend/
│   ├── app.js
│   ├── dashboard.html
│   ├── index.html
│   ├── administrador/
│   ├── governo/
│   │   ├── governo-dashboard.html
│   │   ├── governo-dashboard.js
│   │   ├── governo-relatorios.html
│   │   └── governo-relatorios.js
│   ├── gestor/
│   │   ├── gestor-dashboard.html
│   │   ├── gestor-dashboard.js
│   │   ├── gestor-relatorios.html
│   │   └── gestor-relatorios.js
│   ├── tutor/
│   │   ├── tutor-animais.html
│   │   ├── tutor-animais.js
│   │   ├── tutor-historico.html
│   │   └── tutor-historico.js
│   ├── usuario/
│   └── veterinario/
│       ├── vet-buscar.html
│       ├── vet-buscar.js
│       ├── vet-cadastrar-pet.html
│       ├── vet-cadastrar-pet.js
│       ├── vet-cadastrar-tutor.html
│       ├── vet-cadastrar-tutor.js
│       ├── vet-cadastrar-vacina.html
│       ├── vet-cadastrar-vacina.js
│       ├── vet-editar.html
│       └── vet-editar.js
│
│
├── docs/
│   ├── roadmap.md
│   ├── backlog.md
│   ├── arquitetura.md
│   ├── funcionalidades.md
│   ├── regras-negocio.md
│   └── documentacao-tecnica.md
│
├── .gitignore
├── README.md

```

- Nota: o diretório `frontend/administrador/` existe como placeholder, mas não contém páginas implementadas.

---

## FUNCIONALIDADES IMPLEMENTADAS

- [x] Login de usuários
- [x] Cadastro de tutores
- [x] Cadastro de pets
- [x] Cadastro de vacinas
- [x] Registro vacinal
- [x] Histórico vacinal
- [x] Busca de animais
- [x] Dashboard do tutor
- [x] Dashboard do veterinário
- [x] Dashboard do gestor
- [x] Dashboard do governo
- [x] Relatórios gerenciais
- [x] Persistência de sessão

---

## PERFIS DO SISTEMA

- [ ] ADMINISTRADOR (em planejamento)
- [x] TUTOR
- [x] VETERINARIO
- [x] GESTOR_CLINICA
- [x] GOVERNO

---

## CONFIGURAÇÃO DO BACKEND

### Instalar dependências

```bash
cd backend
npm install
```

---

### Arrumar as senhas

```bash
node arrumar-senha.js
```

---

### Configurar arquivo .env

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=imunopet
PORT=3000
```

---

### Iniciar servidor

```bash
npm run dev
```

ou

```bash
npm start
```

---

## CONFIGURAÇÃO DO BANCO DE DADOS

- [x] Criar banco MySQL
- [x] Executar script.sql
- [x] Importar modelagem .mwb opcionalmente
- [x] Configurar variáveis .env

---

## ENDPOINTS PRINCIPAIS

### AUTENTICAÇÃO

- [x] POST /login
- [x] POST /cadastro

### TUTOR

- [x] GET /tutor/animais/:id_usuario
- [x] GET /tutor/alertas/:id_usuario
- [x] POST /cadastrar-tutor-pet

### PETS

- [x] POST /cadastrar-pet
- [x] GET /buscar-animais
- [x] GET /detalhes-animal/:id_animal
- [x] PUT /editar-pet-tutor/:id_animal
- [x] DELETE /deletar-animal/:id_animal

### VACINAS E REGISTROS

- [x] GET /vacinas
- [x] POST /cadastrar-vacina
- [x] PUT /editar-vacina/:id_vacina
- [x] DELETE /deletar-vacina/:id_vacina
- [x] POST /registrar-vacina
- [x] GET /historico-pet/:id_animal
- [x] DELETE /deletar-registro-vacina/:id_registro
- [x] PUT /editar-registro-vacina/:id_registro
- [x] GET /animais-atrasados

### TUTORES E USUÁRIOS

- [x] GET /tutores
- [x] GET /listar-tutores
- [x] PUT /editar-tutor-dados/:id_tutor
- [x] DELETE /deletar-tutor/:id_tutor

### RELATÓRIOS E DASHBOARDS

- [x] GET /relatorio-vacinas
- [x] GET /veterinarios
- [x] GET /gestor/dados-dashboard
- [x] GET /gestor/relatorios-avancados
- [x] GET /governo/dados-epidemiologicos
- [x] GET /governo/relatorios-avancados

---

## SEGURANÇA

- [x] Senhas criptografadas com bcrypt
- [x] SQL parametrizado
- [x] Variáveis sensíveis no .env
- [ ] JWT
- [ ] Middleware de autenticação
- [ ] Controle avançado de permissões

---

## DOCUMENTAÇÃO

- [x] roadmap.md
- [x] backlog.md
- [x] arquitetura.md
- [x] funcionalidades.md
- [x] regras-negocio.md
- [x] documentacao-tecnica.md

---

## ROADMAP FUTURO

- [ ] Modularização do backend
- [ ] Modularização do frontend
- [ ] JWT
- [x] Dashboard analítico
- [x] Relatórios vacinais
- [ ] Cobertura vacinal
- [ ] Notificações automáticas
- [ ] Calendário vacinal
- [x] Painel governamental
- [ ] Aplicação mobile

---

## ESTADO ATUAL DO PROJETO

- [x] MVP funcional
- [x] Backend operacional
- [x] Frontend operacional
- [x] Banco estruturado
- [x] Fluxo vacinal funcionando
- [x] Documentação consolidada
- [ ] Refatoração estrutural
- [ ] Escalabilidade avançada

---

## CONSIDERAÇÕES FINAIS

- [x] Projeto acadêmico em evolução
- [x] Estrutura preparada para expansão
- [x] Base sólida para continuidade
- [x] Sistema funcional para demonstração acadêmica
- [x] Arquitetura pronta para futuras melhorias
