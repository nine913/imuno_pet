# REGRAS DE NEGÓCIO — IMUNOPET BRASIL

## AUTENTICAÇÃO

- [x] Todo usuário deve possuir e-mail único
- [x] Toda senha deve ser armazenada com hash bcrypt
- [x] Usuários devem possuir perfil definido
- [x] Apenas usuários autenticados podem acessar o dashboard
- [x] Sessões devem possuir expiração (JWT expira em `JWT_EXPIRES_IN`)
- [x] Rotas protegidas devem validar autenticação
- [x] JWT é obrigatório em todas as rotas exceto login/cadastro/avisos/redefinição de senha

---

## PERFIS DE USUÁRIO

- [x] Cada usuário possui apenas um perfil principal
- [x] O perfil define permissões do sistema
- [x] Tutores podem visualizar apenas seus próprios pets
- [x] Veterinários podem registrar vacinas
- [x] Veterinários podem cadastrar animais e tutores
- [x] Administradores terão acesso total
- [x] Governo terá acesso apenas a dados institucionais
- [x] Gestores terão acesso apenas à sua clínica

---

## TUTORES

- [x] Todo tutor deve possuir CPF único
- [x] Todo tutor deve estar vinculado a um usuário
- [x] Um tutor pode possuir múltiplos animais
- [x] Tutor não pode ser removido caso possua pets vinculados
- [x] CPF deve possuir validação futura (apenas unicidade/constraint no momento)
- [x] Telefone deve seguir padrão nacional

---

## ANIMAIS

- [x] Todo animal deve possuir tutor vinculado
- [x] Todo animal deve possuir nome
- [x] Todo animal deve possuir espécie cadastrada
- [x] Animal pode possuir múltiplos registros vacinais
- [x] Data de nascimento não pode ser futura
- [x] Animal não pode existir sem tutor válido (FK no banco)
- [x] Exclusão de animal deve validar histórico vacinal

---

## VACINAS

- [x] Toda vacina deve possuir nome
- [x] Toda vacina deve possuir fabricante
- [x] Vacinas possuem intervalo de doses
- [x] Registro vacinal deve possuir status
- [x] Registro vacinal pode possuir próxima dose
- [x] Vacinas duplicadas devem ser evitadas
- [x] Intervalo vacinal deve ser validado automaticamente
- [x] Sistema deve alertar vacinas pendentes

---

## REGISTRO VACINAL

- [x] Registro vacinal deve estar vinculado a um animal
- [x] Registro vacinal deve estar vinculado a uma vacina
- [x] Registro vacinal pode estar vinculado a veterinário
- [x] Status permitido atualmente:
  - APLICADA
  - PENDENTE
  - ATRASADA
  - CANCELADA
- [x] Data da aplicação não pode ser futura
- [x] Próxima dose deve respeitar intervalo da vacina
- [x] Histórico vacinal não deve ser perdido

---

## DASHBOARD

- [x] Dashboard deve variar conforme perfil
- [x] Tutor visualiza seus pets
- [x] Tutor visualiza histórico vacinal
- [x] Veterinário visualiza painel operacional
- [x] Administrador possuirá painel completo
- [x] Governo possuirá painel analítico

---

## BUSCAS

- [x] Sistema permite busca por nome do animal
- [x] Sistema permite busca por CPF
- [x] Sistema permite busca por nome do tutor
- [x] Busca deverá possuir filtros avançados
- [x] Busca deverá possuir paginação futura

---

## BANCO DE DADOS

- [x] Sistema utiliza modelagem relacional
- [x] Entidades devem possuir chave primária
- [x] Relacionamentos devem ser mantidos
- [x] Tabelas `clinica` e `orgao_governamental` previstas no modelo
- [x] Dados iniciais de seed em `database/INSERT IMUNOPET BRASIL.sql` (schema em `database/DB.sql`)
- [ ] Foreign keys devem ser revisadas (`animal.especie`/`animal.raca` são `VARCHAR` livres, sem FK para as tabelas `especie`/`raca` já existentes)
- [ ] Integridade relacional deve ser fortalecida
- [x] Constraints devem ser implementadas

---

## SEGURANÇA

- [x] Consultas SQL devem ser parametrizadas
- [x] Variáveis sensíveis devem permanecer no .env
- [x] Senhas não devem ser armazenadas em texto puro
- [x] Rotas deverão possuir middleware de autenticação
- [x] Sistema deverá possuir autorização por perfil
- [x] Sessões deverão ser protegidas (token JWT em cookie httpOnly, inacessível a JavaScript/XSS, com proteção CSRF por double-submit token nas requisições que alteram estado)

---

## ESCALABILIDADE

- [x] Sistema deverá suportar múltiplas clínicas
- [ ] Sistema deverá suportar expansão institucional
- [x] Estrutura deverá permitir dashboards analíticos
- [ ] Sistema deverá permitir integração futura mobile
- [x] Arquitetura deverá suportar novas funcionalidades sem reescrita total

---

## REGRAS FUTURAS

- [ ] Sistema enviará notificações vacinais
- [ ] Sistema possuirá calendário vacinal
- [x] Sistema permitirá relatórios epidemiológicos
- [ ] Sistema permitirá cobertura vacinal regional
- [ ] Sistema permitirá integração entre clínicas
