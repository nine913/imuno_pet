# tutorService - Matriz de Testes

## Legenda

- [ ] Não implementado
- [x] Implementado e aprovado

---

## deletarTutor()

### Objetivo 1

Validar as regras de exclusão de tutores.

- [x] TEST-TUT-001 - Impedir exclusão de tutor com animais vinculados (#88)
  - [x] Consultar quantidade de animais vinculados
  - [x] Retornar erro quando houver animais associados
  - [x] Impedir execução das exclusões

- [x] TEST-TUT-002 - Retornar erro para tutor inexistente (#89)
  - [x] Validar tutor não encontrado
  - [x] Retornar erro 404
  - [x] Interromper fluxo de exclusão

- [x] TEST-TUT-003 - Excluir tutor com sucesso (#90)
  - [x] Excluir registro do tutor
  - [x] Excluir usuário associado
  - [x] Validar quantidade de queries executadas
  - [x] Validar execução das queries na ordem correta

---

## cadastrarTutorPet()

### Objetivo 2

Validar o fluxo completo de cadastro de tutor e animal.

- [x] TEST-TUT-004 - Impedir cadastro com e-mail já existente (#91)
  - [x] Consultar e-mail informado
  - [x] Retornar erro de e-mail duplicado
  - [x] Impedir criação do usuário

- [x] TEST-TUT-005 - Impedir cadastro com CPF já existente (#92)
  - [x] Consultar CPF informado
  - [x] Retornar erro de CPF duplicado
  - [x] Impedir criação do tutor

- [x] TEST-TUT-006 - Cadastrar tutor e animal com sucesso (#93)
  - [x] Validar e-mail inexistente
  - [x] Validar CPF inexistente
  - [x] Gerar hash da senha
  - [x] Inserir usuário
  - [x] Inserir tutor
  - [x] Inserir animal
  - [x] Validar parâmetros enviados
  - [x] Validar quantidade de queries executadas

---

## getTutorAnimais()

### Objetivo 3

Validar a consulta de animais vinculados ao tutor.

- [x] TEST-TUT-007 - Retornar erro quando tutor não existir (#94)
  - [x] Buscar tutor pelo id_usuario
  - [x] Retornar erro 404
  - [x] Interromper consulta dos animais

- [x] TEST-TUT-009 - Retornar animais do tutor (#107)
  - [x] Buscar tutor pelo id_usuario
  - [x] Buscar animais pelo id_tutor
  - [x] Retornar lista de animais
  - [x] Validar parâmetros da consulta

---

## getTutorAlertas()

### Objetivo 4

Validar a geração e consulta de alertas vacinais.

- [x] TEST-TUT-008 - Retornar erro quando tutor não existir (#95)
  - [x] Buscar tutor pelo id_usuario
  - [x] Retornar erro 404
  - [x] Interromper processamento dos alertas

- [x] TEST-TUT-010 - Retornar lista vazia quando não houver alertas (#109)
  - [x] Buscar tutor pelo id_usuario
  - [x] Executar atualização de vacinas atrasadas
  - [x] Retornar lista vazia

- [x] TEST-TUT-011 - Retornar alertas do tutor (#110)
  - [x] Buscar tutor pelo id_usuario
  - [x] Executar atualização de vacinas atrasadas
  - [x] Retornar alertas pendentes
  - [x] Retornar alertas atrasados
  - [x] Validar execução da query de atualização
  - [x] Validar quantidade de queries executadas

---

## Progresso Geral

### Cobertura dos Casos de Teste

- [x] TEST-TUT-001
- [x] TEST-TUT-002
- [x] TEST-TUT-003
- [x] TEST-TUT-004
- [x] TEST-TUT-005
- [x] TEST-TUT-006
- [x] TEST-TUT-007
- [x] TEST-TUT-008
- [x] TEST-TUT-009
- [x] TEST-TUT-010
- [x] TEST-TUT-011

### Resumo

- [x] 11/11 testes implementados
- [x] Todos os cenários planejados concluídos
- [x] Todos os fluxos de erro cobertos
- [x] Todos os fluxos de sucesso cobertos
- [x] Regras de negócio principais validadas
- [x] Principais queries validadas
- [x] Módulo tutorService concluído
