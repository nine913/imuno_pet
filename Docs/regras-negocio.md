# REGRAS DE NEGÓCIO — IMUNOPET BRASIL

## AUTENTICAÇÃO

- [x] Todo usuário deve possuir e-mail único
- [x] Toda senha deve ser armazenada com hash bcrypt
- [x] Usuários devem possuir perfil definido
- [x] Apenas usuários autenticados podem acessar o dashboard
- [ ] Sessões devem possuir expiração
- [ ] Rotas protegidas devem validar autenticação
- [ ] JWT deve ser obrigatório futuramente

---

## PERFIS DE USUÁRIO

- [x] Cada usuário possui apenas um perfil principal
- [x] O perfil define permissões do sistema
- [x] Tutores podem visualizar apenas seus próprios pets
- [x] Veterinários podem registrar vacinas
- [x] Veterinários podem cadastrar animais e tutores
- [ ] Administradores terão acesso total
- [ ] Governo terá acesso apenas a dados institucionais
- [ ] Gestores terão acesso apenas à sua clínica

---

## TUTORES

- [x] Todo tutor deve possuir CPF único
- [x] Todo tutor deve estar vinculado a um usuário
- [x] Um tutor pode possuir múltiplos animais
- [ ] Tutor não pode ser removido caso possua pets vinculados
- [ ] CPF deve possuir validação futura
- [ ] Telefone deve seguir padrão nacional

---

## ANIMAIS

- [x] Todo animal deve possuir tutor vinculado
- [x] Todo animal deve possuir nome
- [x] Todo animal deve possuir espécie cadastrada
- [x] Animal pode possuir múltiplos registros vacinais
- [ ] Data de nascimento não pode ser futura
- [ ] Animal não pode existir sem tutor válido
- [ ] Exclusão de animal deve validar histórico vacinal

---

## VACINAS

- [x] Toda vacina deve possuir nome
- [x] Toda vacina deve possuir fabricante
- [x] Vacinas possuem intervalo de doses
- [x] Registro vacinal deve possuir status
- [x] Registro vacinal pode possuir próxima dose
- [ ] Vacinas duplicadas devem ser evitadas
- [ ] Intervalo vacinal deve ser validado automaticamente
- [ ] Sistema deve alertar vacinas pendentes

---

## REGISTRO VACINAL

- [x] Registro vacinal deve estar vinculado a um animal
- [x] Registro vacinal deve estar vinculado a uma vacina
- [x] Registro vacinal pode estar vinculado a veterinário
- [x] Status permitido atualmente:
  - APLICADA
  - PENDENTE
  - ATRASADA
- [ ] Data da aplicação não pode ser futura
- [ ] Próxima dose deve respeitar intervalo da vacina
- [ ] Histórico vacinal não deve ser perdido

---

## DASHBOARD

- [x] Dashboard deve variar conforme perfil
- [x] Tutor visualiza seus pets
- [x] Tutor visualiza histórico vacinal
- [x] Veterinário visualiza painel operacional
- [ ] Administrador possuirá painel completo
- [ ] Governo possuirá painel analítico

---

## BUSCAS

- [x] Sistema permite busca por nome do animal
- [x] Sistema permite busca por CPF
- [x] Sistema permite busca por nome do tutor
- [ ] Busca deverá possuir filtros avançados
- [ ] Busca deverá possuir paginação futura

---

## BANCO DE DADOS

- [x] Sistema utiliza modelagem relacional
- [x] Entidades devem possuir chave primária
- [x] Relacionamentos devem ser mantidos
- [x] Tabelas `clinica` e `orgao_governamental` previstas no modelo
- [x] Dados iniciais de seed em `database/script.sql`
- [ ] Foreign keys devem ser revisadas
- [ ] Integridade relacional deve ser fortalecida
- [ ] Constraints devem ser implementadas

---

## SEGURANÇA

- [x] Consultas SQL devem ser parametrizadas
- [x] Variáveis sensíveis devem permanecer no .env
- [x] Senhas não devem ser armazenadas em texto puro
- [ ] Rotas deverão possuir middleware de autenticação
- [ ] Sistema deverá possuir autorização por perfil
- [ ] Sessões deverão ser protegidas

---

## ESCALABILIDADE

- [ ] Sistema deverá suportar múltiplas clínicas
- [ ] Sistema deverá suportar expansão institucional
- [ ] Estrutura deverá permitir dashboards analíticos
- [ ] Sistema deverá permitir integração futura mobile
- [ ] Arquitetura deverá suportar novas funcionalidades sem reescrita total

---

## REGRAS FUTURAS

- [ ] Sistema enviará notificações vacinais
- [ ] Sistema possuirá calendário vacinal
- [ ] Sistema permitirá relatórios epidemiológicos
- [ ] Sistema permitirá cobertura vacinal regional
- [ ] Sistema permitirá integração entre clínicas
