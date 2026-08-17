# FUNCIONALIDADES — IMUNOPET BRASIL

## AUTENTICAÇÃO

- [x] Login de usuários
- [x] Validação de senha com bcrypt
- [x] Controle básico por perfil
- [x] Persistência de sessão via cookie httpOnly (token JWT) + proteção CSRF por double-submit token
- [x] Logout global padronizado (`POST /logout` autenticado, limpa os cookies de sessão no backend e o perfil salvo no frontend)
- [x] Recuperação de senha por token de uso único enviado por e-mail (`/solicitar-redefinicao-senha`, `/confirmar-redefinicao-senha`)
- [x] Troca de senha pelo próprio usuário logado (`POST /alterar-senha`, exige a senha atual)
- [x] Expiração de sessão (token JWT expira em `JWT_EXPIRES_IN`)
- [x] Autenticação JWT

---

## CONFIGURAÇÕES E ACESSIBILIDADE

- [x] Tela de configurações (`/configuracoes`) com seções de Conta, Segurança, Aparência, Acessibilidade e Notificações
- [x] Alterar senha pela própria tela de configurações
- [x] Tema claro/escuro e tamanho de fonte configuráveis
- [x] Alto contraste (aplicado globalmente via filtro de contraste, além do ajuste de cores nas telas que já o implementam)
- [x] Redução de animações e efeitos de movimento (aplicada globalmente a todas as páginas autenticadas)
- [x] Espaçamento de texto ampliado, para leitura facilitada (aplicado globalmente)
- [x] Destaque de foco de navegação por teclado (aplicado globalmente); itens do menu lateral agora são navegáveis via Tab/Enter
- [ ] Preferências de notificação por e-mail/WhatsApp — salvas, mas o envio automático ainda não está implementado

---

## PERFIS DE USUÁRIOS

- [x] Perfil ADMINISTRADOR
- [x] Perfil TUTOR
- [x] Perfil VETERINARIO
- [x] Perfil GESTOR_CLINICA
- [x] Gestor de clínica gerencia a equipe de veterinários da própria clínica (listar, cadastrar, editar, remover)
- [x] Perfil GOVERNO
- [x] Controle avançado de permissões (autorização por perfil, escopo de clínica para gestor/veterinário, verificação de posse para tutor)
- [x] Painéis específicos por perfil

---

## TUTORES

- [x] Cadastro de tutor
- [x] Consulta de tutor
- [x] Associação tutor-animal
- [x] Edição completa de tutor
- [x] Exclusão de tutor
- [x] Histórico completo do tutor

---

## ANIMAIS

- [x] Cadastro de pets
- [x] Busca de animais
- [x] Consulta de detalhes do animal
- [x] Edição de pet
- [x] Associação tutor-pet
- [x] Exclusão de animal
- [ ] Foto do animal
- [x] Histórico completo do pet

---

## VACINAS

- [x] Cadastro de vacinas
- [x] Registro vacinal
- [x] Histórico vacinal
- [x] Controle de status da vacina
- [x] Próxima dose
- [x] Atualização de vacina
- [x] Exclusão de vacina
- [x] Controle automático de vencimento
- [x] Alertas vacinais

---

## DASHBOARD

- [x] Dashboard do tutor
- [x] Dashboard do veterinário
- [x] Visualização de pets
- [x] Visualização de vacinas
- [x] Dashboard administrativo
- [x] Dashboard analítico
- [x] Dashboard governamental
- [x] Estatísticas em tempo real

---

## BUSCAS

- [x] Busca de animais
- [x] Busca por nome
- [x] Busca por CPF
- [x] Busca por tutor
- [x] Busca avançada
- [x] Filtros por vacinação
- [x] Busca por região
- [x] Busca institucional

---

## RELATÓRIOS

- [x] Relatório vacinal
- [x] Relatório por tutor
- [x] Relatório por animal
- [x] Relatório institucional
- [x] Cobertura vacinal
- [x] Relatórios epidemiológicos
- [x] Estatísticas vacinais

---

## SISTEMA VETERINÁRIO

- [x] Cadastro de tutores
- [x] Cadastro de pets
- [x] Registro de vacinação
- [x] Busca de animais
- [x] Cadastro de vacinas
- [x] Controle de consultas
- [x] Agenda veterinária
- [x] Histórico clínico

---

## SISTEMA GOVERNAMENTAL

- [x] Estrutura inicial de órgão governamental
- [x] Painel governamental
- [x] Controle regional
- [x] Estatísticas epidemiológicas
- [ ] Controle de campanhas vacinais
- [x] Cobertura vacinal

---

## FUNCIONALIDADES FUTURAS

- [ ] Sistema de notificações
- [ ] Calendário vacinal
- [ ] Alertas automáticos
- [ ] Integração entre clínicas
- [ ] Aplicação mobile
- [ ] Upload de documentos
- [ ] Histórico médico completo
- [ ] Inteligência analítica
