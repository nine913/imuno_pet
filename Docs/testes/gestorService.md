# gestorService - Matriz de Testes

## Legenda

- [ ] Não implementado  
- [x] Implementado e aprovado  

---

## dadosDashboard()

### Objetivo 1

Validar a geração completa dos indicadores do dashboard da clínica.

- [x] TEST-GES-001 - dadosDashboard() sem clínica  
  - [x] Retornar estrutura vazia quando id_clinica não for informado  
  - [x] Não executar queries no banco  

- [x] TEST-GES-002 - dadosDashboard() com dados  
  - [x] Retornar KPIs corretamente  
  - [x] Retornar vacinas aplicadas  
  - [x] Retornar evolução mensal  
  - [x] Retornar aplicações por veterinário  
  - [x] Retornar dados da clínica  
  - [x] Executar todas as queries esperadas  

---

## relatoriosAvancados()

### Objetivo 2

Validar geração de relatórios dinâmicos com filtros opcionais.

- [x] TEST-GES-003 - relatoriosAvancados() sem clínica  
  - [x] Retornar array vazio quando id_clinica não for informado  
  - [x] Não executar query no banco  

- [x] TEST-GES-004 - relatoriosAvancados() sem filtros  
  - [x] Usar datas padrão  
  - [x] Executar query base corretamente  
  - [x] Retornar relatório bruto  

- [x] TEST-GES-005 - relatoriosAvancados() com filtros  
  - [x] Aplicar filtro de vacina  
  - [x] Aplicar filtro de espécie  
  - [x] Aplicar filtro de bairro  
  - [x] Aplicar filtro de status  
  - [x] Aplicar filtro de aplicante  
  - [x] Combinar filtros dinamicamente  

---

## veterinariosLista()

### Objetivo 3

Validar listagem e busca de veterinários por clínica.

- [x] TEST-GES-006 - veterinariosLista() sem clínica  
  - [x] Retornar array vazio quando id_clinica não for informado  
  - [x] Não executar query no banco  

- [x] TEST-GES-007 - veterinariosLista() com termo de busca  
  - [x] Aplicar filtro LIKE em nome, CRMV e email  
  - [x] Utilizar termo informado corretamente  
  - [x] Retornar lista filtrada  

- [x] TEST-GES-008 - veterinariosLista() sem termo de busca  
  - [x] Utilizar wildcard "%" por padrão  
  - [x] Retornar todos os veterinários da clínica  

---

## cadastrarVet()

### Objetivo 4

Validar cadastro completo de veterinários com regras de integridade.

- [x] TEST-GES-009 - cadastrarVet() com sucesso  
  - [x] Validar e-mail inexistente  
  - [x] Validar CRMV inexistente  
  - [x] Gerar hash da senha  
  - [x] Inserir usuário com perfil VETERINARIO  
  - [x] Inserir veterinário com insertId  
  - [x] Executar fluxo completo com sucesso  

- [x] TEST-GES-010 - cadastrarVet() com e-mail já existente  
  - [x] Bloquear cadastro por e-mail duplicado  
  - [x] Lançar erro 400  
  - [x] Não executar INSERTs  

- [x] TEST-GES-011 - cadastrarVet() com CRMV já existente  
  - [x] Bloquear cadastro por CRMV duplicado  
  - [x] Lançar erro 400  
  - [x] Não executar INSERTs  

---

## editarVet()

### Objetivo 5

Validar atualização de dados do veterinário e usuário.

- [x] TEST-GES-012 - editarVet() atualização de dados  
  - [x] Atualizar dados do veterinário  
  - [x] Atualizar email do usuário  
  - [x] Executar ambas as queries corretamente  
  - [x] Validar parâmetros enviados  

---

## deletarVet()

### Objetivo 6

Validar remoção segura de veterinários com regras de integridade.

- [x] TEST-GES-013 - deletarVet() com sucesso  
  - [x] Verificar existência de vacinas  
  - [x] Buscar id_usuario  
  - [x] Deletar veterinário  
  - [x] Deletar usuário  
  - [x] Executar ordem correta das queries  

- [x] TEST-GES-014 - deletarVet() bloqueio por vacinas vinculadas  
  - [x] Bloquear exclusão quando houver vacinas  
  - [x] Lançar erro 400  
  - [x] Não executar DELETEs  

- [x] TEST-GES-015 - deletarVet() veterinário inexistente  
  - [x] Lançar erro 404 quando não encontrado  
  - [x] Executar apenas validação inicial  
  - [x] Não executar DELETEs  

---

## Progresso Geral

### Cobertura dos Casos de Teste

- [x] TEST-GES-001  
- [x] TEST-GES-002  
- [x] TEST-GES-003  
- [x] TEST-GES-004  
- [x] TEST-GES-005  
- [x] TEST-GES-006  
- [x] TEST-GES-007  
- [x] TEST-GES-008  
- [x] TEST-GES-009  
- [x] TEST-GES-010  
- [x] TEST-GES-011  
- [x] TEST-GES-012  
- [x] TEST-GES-013  
- [x] TEST-GES-014  
- [x] TEST-GES-015  

---

## Resumo

- [x] 15/15 testes planejados  
- [x] CRUD completo de veterinários coberto  
- [x] Relatórios dinâmicos validados  
- [x] Dashboard totalmente coberto  
- [x] Regras de integridade e bloqueios validadas  
- [x] Módulo gestorService estruturado e pronto para implementação
