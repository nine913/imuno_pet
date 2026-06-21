# AUDITORIA — IMUNOPET BRASIL

## OBJETIVO

Este documento define as regras obrigatórias para auditoria e atualização da documentação do projeto.

O código-fonte é a fonte principal da verdade.

Toda documentação deve refletir exatamente o estado atual da implementação.

---

## PRINCÍPIOS GERAIS

## 1. Não inventar funcionalidades

Nunca adicionar informações sem evidência no código.

Toda informação adicionada deve possuir correspondência em pelo menos um dos seguintes locais:

* Controllers
* Services
* Models
* Entities
* Repositories
* Rotas
* Componentes
* Hooks
* Middlewares
* Banco de Dados
* Configurações
* Variáveis de Ambiente
* Integrações

---

## 2. Preservar Estrutura

Durante qualquer atualização:

* Não alterar títulos principais.
* Não reorganizar seções existentes.
* Não remover conteúdo sem justificativa.
* Não alterar o padrão visual adotado.

A estrutura original dos documentos deve ser mantida.

---

## 3. Código é a Fonte da Verdade

Em caso de conflito entre documentação e implementação:

A implementação prevalece.

A documentação deve ser corrigida para refletir o comportamento real do sistema.

---

## PROCESSO DE AUDITORIA

## Etapa 1 - Leitura do Documento

Identificar:

* funcionalidades
* requisitos
* regras de negócio
* fluxos
* checklists
* tarefas
* observações

---

## Etapa 2 - Inspeção da Implementação

Analisar:

### Backend

* controllers
* services
* entities
* repositories
* DTOs
* validações
* middlewares
* segurança
* autenticação
* autorização

### Frontend

* páginas
* componentes
* hooks
* contextos
* formulários
* rotas

### Banco de Dados

* tabelas
* relacionamentos
* constraints
* índices
* migrations

### Infraestrutura

* Docker
* Variáveis de ambiente
* Configurações
* Integrações externas

---

## Etapa 3 - Classificação

Cada item encontrado deve ser classificado como:

### IMPLEMENTADO

Existe evidência completa no código.

### PARCIALMENTE IMPLEMENTADO

Existe implementação incompleta ou limitada.

### PENDENTE

Não existe implementação.

### IMPLEMENTADO MAS NÃO DOCUMENTADO

Existe no código mas não aparece na documentação.

---

## ATUALIZAÇÃO DE CHECKLIST

Utilizar exclusivamente:

* [x] Concluído
* [ ] Pendente

Somente marcar como concluído quando houver evidência clara da implementação.

Se houver dúvida:

Manter como pendente.

---

## FUNCIONALIDADES NÃO DOCUMENTADAS

Toda funcionalidade encontrada no código e ausente no documento deve ser adicionada na seção mais adequada.

Não criar seções desnecessárias.

Priorizar a organização já existente.

---

## EVIDÊNCIAS OBRIGATÓRIAS

Ao revisar qualquer documento, apresentar:

## Funcionalidades encontradas

Lista das funcionalidades identificadas.

## Divergências encontradas

Lista das inconsistências.

## Funcionalidades não documentadas

Lista das funcionalidades existentes no código.

## Itens documentados sem implementação

Lista dos itens sem evidência.

---

## RESULTADO ESPERADO

Após cada auditoria:

1. Documento atualizado.
2. Checklists corrigidos.
3. Funcionalidades faltantes adicionadas.
4. Informações desatualizadas corrigidas.
5. Estrutura original preservada.

---

## REGRA FINAL

Antes de alterar qualquer item da documentação:

Localizar evidência concreta no código.

Sem evidência, não modificar.
