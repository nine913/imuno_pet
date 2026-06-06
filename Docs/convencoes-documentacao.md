# CONVENÇÕES_DOCUMENTAÇÃO — IMUNOPET BRASIL

## OBJETIVO

Padronizar toda a documentação do projeto.

Todos os documentos devem seguir estas convenções para garantir consistência, legibilidade e facilidade de manutenção.

---

## ESTRUTURA GERAL

Sempre preservar a estrutura existente do documento.

Caso seja necessário adicionar informações:

* Utilizar a seção mais adequada já existente.
* Evitar criar novas seções sem necessidade.
* Não reorganizar títulos principais.

---

## LINGUAGEM

Utilizar linguagem:

* Técnica
* Objetiva
* Clara
* Direta

Evitar:

* Opiniões pessoais
* Suposições
* Texto excessivamente informal
* Conteúdo sem evidência

---

## STATUS DE IMPLEMENTAÇÃO

Utilizar apenas os seguintes estados:

## Implementado

Funcionalidade concluída e presente no código.

## Parcial

Funcionalidade existe, mas não cobre todos os requisitos.

## Pendente

Funcionalidade ainda não implementada.

## Não Documentado

Funcionalidade encontrada no código mas ausente na documentação.

---

## CHECKLIST

Utilizar exclusivamente:

```markdown
- [x] Item concluído
- [ ] Item pendente
```

Regras:

* Não utilizar emojis.
* Não utilizar porcentagens.
* Não utilizar marcadores alternativos.
* Não marcar como concluído sem evidência no código.

---

## FUNCIONALIDADES

Ao documentar funcionalidades utilizar o padrão:

```markdown
### Nome da Funcionalidade

Descrição resumida da funcionalidade.

#### Comportamento

Descrição do funcionamento.

#### Regras

- Regra 1
- Regra 2
- Regra 3
```

---

## REGRAS DE NEGÓCIO

Sempre documentar no formato:

```markdown
### RN-001 - Nome da Regra

Descrição da regra.

#### Condições

- Condição 1
- Condição 2

#### Resultado

Resultado esperado.
```

Numeração sequencial obrigatória.

---

## APIs

Sempre documentar endpoints no formato:

```markdown
### GET /usuarios

Descrição do endpoint.

#### Permissão

Administrador

#### Parâmetros

| Campo | Tipo | Obrigatório |
|---------|---------|---------|
| id | Long | Sim |

#### Resposta

Descrição resumida.
```

---

## BANCO DE DADOS

Sempre documentar tabelas no formato:

```markdown
### usuario

| Campo | Tipo | Obrigatório |
|---------|---------|---------|
| id | BIGINT | Sim |
| nome | VARCHAR | Sim |
| email | VARCHAR | Sim |
```

Documentar apenas tabelas relevantes para o contexto do documento.

---

## TELAS

Ao documentar interfaces utilizar:

```markdown
### Tela de Login

#### Objetivo

Permitir autenticação do usuário.

#### Componentes

- Campo E-mail
- Campo Senha
- Botão Entrar

#### Regras

- E-mail obrigatório.
- Senha obrigatória.
```

---

## PERMISSÕES

Sempre utilizar:

```markdown
### Perfil Administrador

Permissões:

- Criar
- Editar
- Excluir
- Visualizar
```

---

## EVIDÊNCIAS

Sempre que possível relacionar a documentação com:

* Controller
* Service
* Componente
* Página
* Entidade
* Migration

Exemplo:

```markdown
Implementação localizada em:

- UsuarioController
- UsuarioService
- UsuarioRepository
```

---

## ATUALIZAÇÕES

Ao atualizar um documento:

1. Preservar a estrutura.
2. Corrigir inconsistências.
3. Atualizar checklists.
4. Adicionar funcionalidades ausentes.
5. Remover apenas conteúdo comprovadamente incorreto.

---

## REGRA FINAL

A documentação deve refletir exatamente o comportamento atual do sistema.

Quando houver divergência entre documentação e código:

O código prevalece.
