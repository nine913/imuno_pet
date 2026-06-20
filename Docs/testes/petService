# petService - Matriz de Testes

## Legenda

- [ ] Não implementado
- [x] Implementado e aprovado

---

## getTutorIdByUsuario()

### Objetivo 1

Validar a recuperação do tutor associado a um usuário.

- [x] TEST-PET-001 - Buscar tutor por usuário
  - [x] Consultar tutor pelo id_usuario
  - [x] Retornar id_tutor quando encontrado
  - [x] Retornar null quando não encontrado

---

## criarPet()

### Objetivo 2

Validar o cadastro de animais vinculados a tutores existentes.

- [x] TEST-PET-002 - Criar pet
  - [x] Buscar tutor pelo id_usuario
  - [x] Inserir animal quando tutor existir
  - [x] Lançar erro 404 quando tutor não existir

---

## cadastrarAnimalVet()

### Objetivo 3

Validar o cadastro de animais realizado por veterinários.

- [x] TEST-PET-003 - Cadastrar animal via veterinário
  - [x] Inserir animal com raça informada
  - [x] Inserir animal com raça nula
  - [x] Validar parâmetros enviados

---

## cadastrarTutorEPet()

### Objetivo 4

Validar o fluxo completo de cadastro de tutor e animal.

- [x] TEST-PET-004 - Cadastrar tutor e pet
  - [x] Validar e-mail inexistente
  - [x] Validar CPF inexistente
  - [x] Gerar hash da senha
  - [x] Inserir usuário
  - [x] Inserir tutor
  - [x] Inserir animal

---

## buscarAnimais()

### Objetivo 5

Validar consultas de animais com filtros dinâmicos.

- [x] TEST-PET-005 - Buscar animais
  - [x] Buscar sem filtros
  - [x] Aplicar filtro de clínica
  - [x] Aplicar filtro de vacina
  - [x] Aplicar filtro de status
  - [x] Combinar filtros dinamicamente

---

## detalhesAnimal()

### Objetivo 6

Validar consulta detalhada de informações do animal.

- [x] TEST-PET-006 - Consultar detalhes do animal
  - [x] Retornar dados do animal quando encontrado
  - [x] Retornar null quando não encontrado

---

## editarPetTutor()

### Objetivo 7

Validar atualização simultânea dos dados do tutor e do animal.

- [x] TEST-PET-007 - Atualizar pet e tutor
  - [x] Atualizar dados do animal
  - [x] Atualizar dados do tutor
  - [x] Priorizar campo city sobre cidade
  - [x] Utilizar cidade como fallback

---

## editarAnimalSimples()

### Objetivo 8

Validar atualização simplificada de animais.

- [x] TEST-PET-008 - Atualizar animal
  - [x] Executar UPDATE
  - [x] Validar parâmetros enviados

---

## deletarAnimal()

### Objetivo 9

Validar exclusão de animais e seus registros associados.

- [x] TEST-PET-009 - Excluir animal
  - [x] Excluir registros de vacinação
  - [x] Excluir animal
  - [x] Executar queries na ordem correta

---

## relatorioVacinasVet()

### Objetivo 10

Validar geração de relatórios vacinais para veterinários.

- [x] TEST-PET-010 - Gerar relatório vacinal
  - [x] Retornar vazio sem clínica
  - [x] Utilizar filtros padrão
  - [x] Aplicar filtro de espécie
  - [x] Aplicar filtro de status
  - [x] Combinar filtros dinamicamente

---

## Progresso Geral

### Cobertura dos Casos de Teste

- [x] TEST-PET-001
- [x] TEST-PET-002
- [x] TEST-PET-003
- [x] TEST-PET-004
- [x] TEST-PET-005
- [x] TEST-PET-006
- [x] TEST-PET-007
- [x] TEST-PET-008
- [x] TEST-PET-009
- [x] TEST-PET-010

### Resumo

- [x] 10/10 testes implementados
- [x] Todas as funções cobertas
- [x] Todos os fluxos condicionais cobertos
- [x] Todas as queries principais validadas
- [x] Módulo petService concluído
