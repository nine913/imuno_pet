# vacinaService - Matriz de Testes

## Legenda

- [ ] Não implementado
- [x] Implementado e aprovado

---

## registrarVacina()

### Objetivo 1

Validar o registro de vacinas e a vinculação automática do veterinário responsável.

- [x] TEST-VAC-001 - Registrar vacina aplicada com veterinário encontrado
  - [x] Consultar veterinário pelo id_usuario
  - [x] Preencher id_veterinario no registro
  - [x] Executar INSERT corretamente

- [x] TEST-VAC-002 - Registrar vacina sem veterinário
  - [x] Não consultar veterinário
  - [x] Manter id_veterinario nulo
  - [x] Executar INSERT corretamente

---

## cadastrarVacina()

### Objetivo 2

Validar o cadastro de novas vacinas.

- [x] TEST-VAC-003 - Cadastrar vacina
  - [x] Executar INSERT
  - [x] Validar parâmetros enviados

---

## buscarVacinas()

### Objetivo 3

Validar consultas de vacinas com e sem filtros.

- [x] TEST-VAC-004 - Buscar vacinas com termo
  - [x] Aplicar filtro LIKE
  - [x] Retornar resultados filtrados

- [x] TEST-VAC-005 - Buscar vacinas sem termo
  - [x] Utilizar "%" como filtro padrão
  - [x] Retornar lista completa

---

## editarVacina()

### Objetivo 4

Validar atualização de vacinas.

- [x] TEST-VAC-006 - Editar vacina
  - [x] Executar UPDATE
  - [x] Validar parâmetros enviados

---

## deletarVacina()

### Objetivo 5

Validar exclusão de vacinas e registros associados.

- [x] TEST-VAC-007 - Excluir registros e vacina
  - [x] Excluir registros de vacinação
  - [x] Excluir vacina
  - [x] Executar queries na ordem correta

---

## historicoPet()

### Objetivo 6

Validar consulta do histórico vacinal dos animais.

- [x] TEST-VAC-008 - Histórico sem filtros
  - [x] Retornar histórico completo
  - [x] Utilizar parâmetros padrão

- [x] TEST-VAC-009 - Histórico filtrado por status e clínica
  - [x] Aplicar filtro de status
  - [x] Aplicar filtro de clínica
  - [x] Validar parâmetros dinâmicos

---

## deletarRegistroVacina()

### Objetivo 7

Validar exclusão de registros vacinais.

- [x] TEST-VAC-010 - Excluir registro vacinal
  - [x] Executar DELETE
  - [x] Validar id_registro informado

---

## relatorioVacinas()

### Objetivo 8

Validar geração de relatórios vacinais.

- [x] TEST-VAC-011 - Relatório sem filtros
  - [x] Utilizar datas padrão
  - [x] Retornar relatório completo

- [x] TEST-VAC-012 - Relatório com filtros
  - [x] Aplicar filtro de status
  - [x] Aplicar filtro de espécie
  - [x] Aplicar filtro de clínica
  - [x] Validar parâmetros da consulta

---

## editarRegistroVacina()

### Objetivo 9

Validar atualização de registros vacinais.

- [x] TEST-VAC-013 - Editar registro sem veterinário
  - [x] Não consultar veterinário
  - [x] Atualizar com id_veterinario nulo

- [x] TEST-VAC-014 - Editar registro com veterinário
  - [x] Consultar veterinário
  - [x] Atualizar com id_veterinario preenchido

---

## animaisAtrasados()

### Objetivo 10

Validar atualização automática e consulta de vacinas atrasadas.

- [x] TEST-VAC-015 - Buscar atrasados sem clínica
  - [x] Atualizar registros pendentes para atrasados
  - [x] Retornar lista de atrasados

- [x] TEST-VAC-016 - Buscar atrasados com clínica
  - [x] Atualizar registros pendentes para atrasados
  - [x] Aplicar filtro de clínica
  - [x] Retornar lista filtrada

---

## Progresso Geral

## Cobertura dos Casos de Teste

- [x] TEST-VAC-001
- [x] TEST-VAC-002
- [x] TEST-VAC-003
- [x] TEST-VAC-004
- [x] TEST-VAC-005
- [x] TEST-VAC-006
- [x] TEST-VAC-007
- [x] TEST-VAC-008
- [x] TEST-VAC-009
- [x] TEST-VAC-010
- [x] TEST-VAC-011
- [x] TEST-VAC-012
- [x] TEST-VAC-013
- [x] TEST-VAC-014
- [x] TEST-VAC-015
- [x] TEST-VAC-016

## Resumo

- [x] 16/16 testes implementados
- [x] Todas as funções cobertas
- [x] Todos os fluxos condicionais cobertos
- [x] Todas as queries validadas
- [x] Módulo vacinaService concluído
