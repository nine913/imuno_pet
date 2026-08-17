# governoService - Matriz de Testes

## Legenda

- [ ] Não implementado  
- [x] Implementado e aprovado  

---

## dadosEpidemiologicos()

## Objetivo 1

Validar a geração completa dos indicadores epidemiológicos com filtros opcionais e agregações.

- [x] TEST-GOV-001 - dadosEpidemiologicos() query vazia  
  - [x] Retornar estrutura completa (riscoRegiao, coberturaEspecie, evolucaoTemporal, topVacinas)  
  - [x] Executar 4 queries no banco  
  - [x] Usar valores padrão de data  

- [x] TEST-GOV-002 - dadosEpidemiologicos() filtro por espécie  
  - [x] Aplicar filtro `a.especie` corretamente  
  - [x] Propagar filtro para risco e cobertura  
  - [x] Manter estrutura completa de retorno  

- [x] TEST-GOV-003 - dadosEpidemiologicos() filtro por localidade  
  - [x] Aplicar LIKE em cidade e bairro  
  - [x] Usar `%localidade%` corretamente  
  - [x] Filtrar riscoRegiao e demais consultas  

- [x] TEST-GOV-004 - dadosEpidemiologicos() filtros combinados  
  - [x] Combinar espécie + localidade  
  - [x] Garantir não sobrescrita de condições SQL  
  - [x] Manter consistência do resultado  

- [x] TEST-GOV-005 - dadosEpidemiologicos() filtro de datas  
  - [x] Aplicar `inicio` e `fim` corretamente  
  - [x] Usar BETWEEN em data_aplicacao e data_proxima_dose  
  - [x] Afetar todas as queries  

- [x] TEST-GOV-006 - dadosEpidemiologicos() agrupamento por região  
  - [x] Agrupar por cidade e bairro  
  - [x] Somar status de vacinação corretamente  
  - [x] Ordenar por total_atrasadas DESC  

- [x] TEST-GOV-007 - dadosEpidemiologicos() top vacinas  
  - [x] Retornar apenas 5 registros  
  - [x] Ordenar por quantidade DESC  
  - [x] Aplicar LIMIT 5 corretamente  

- [x] TEST-GOV-008 - dadosEpidemiologicos() evolução temporal mensal  
  - [x] Agrupar por mês (YYYY-MM)  
  - [x] Ordenar por mês ASC  
  - [x] Usar DATE_FORMAT corretamente  

- [x] TEST-GOV-009 - dadosEpidemiologicos() cobertura por espécie  
  - [x] Agrupar por espécie  
  - [x] Filtrar status APLICADA  
  - [x] Retornar totais corretos  

---

## relatoriosAvancados()

## Objetivo 2

Validar geração de relatórios dinâmicos com filtros opcionais e múltiplas combinações.

- [x] TEST-GOV-010 - relatoriosAvancados() sem filtros  
  - [x] Retornar relatório completo  
  - [x] Aplicar apenas intervalo de datas  
  - [x] Executar 1 query apenas  

- [x] TEST-GOV-011 - relatoriosAvancados() filtro por vacina  
  - [x] Aplicar filtro `rv.id_vacina`  
  - [x] Manter intervalo de datas  
  - [x] Não quebrar query base  

- [x] TEST-GOV-012 - relatoriosAvancados() filtro por espécie  
  - [x] Aplicar filtro `a.especie`  
  - [x] Manter demais filtros intactos  
  - [x] Retornar resultado consistente  

- [x] TEST-GOV-013 - relatoriosAvancados() filtro por bairro  
  - [x] Aplicar LIKE em bairro  
  - [x] Usar `%valor%` corretamente  
  - [x] Não interferir em outros filtros  

- [x] TEST-GOV-014 - relatoriosAvancados() filtro por status  
  - [x] Aplicar filtro `rv.status`  
  - [x] Restringir corretamente resultados  
  - [x] Manter base de datas  

- [x] TEST-GOV-015 - relatoriosAvancados() múltiplos filtros combinados  
  - [x] Combinar vacina + espécie + bairro + status + datas  
  - [x] Garantir construção dinâmica correta do SQL  
  - [x] Não sobrescrever condições  

---

## Progresso Geral

## Cobertura dos Casos de Teste

- [x] TEST-GOV-001  
- [x] TEST-GOV-002  
- [x] TEST-GOV-003  
- [x] TEST-GOV-004  
- [x] TEST-GOV-005  
- [x] TEST-GOV-006  
- [x] TEST-GOV-007  
- [x] TEST-GOV-008  
- [x] TEST-GOV-009  
- [x] TEST-GOV-010  
- [x] TEST-GOV-011  
- [x] TEST-GOV-012  
- [x] TEST-GOV-013  
- [x] TEST-GOV-014  
- [x] TEST-GOV-015  

---

## Resumo

- [x] 15/15 testes planejados  
- [x] Indicadores epidemiológicos totalmente cobertos  
- [x] Relatórios dinâmicos validados  
- [x] Filtros SQL dinâmicos testados  
- [x] Agregações e rankings validados  
- [x] Evolução temporal coberta  
- [x] Módulo governoService concluído (`backend/tests/setup/service/governoService.test.js`, parte da suíte de 170 testes do backend)  
