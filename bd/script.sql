INSERT INTO usuario (email, senha, perfil) VALUES
('andre@email.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'ADMINISTRADOR'),
('bianca@email.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'TUTOR'),
('davi@email.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'VETERINARIO'),
('eduardo@email.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'GESTOR_CLINICA'),
('fernanda@email.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'GOVERNO'),
('marco@email.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'TUTOR'),
('walace@email.com', '$2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa', 'VETERINARIO');

INSERT INTO clinica (nome_fantasia, estado, cidade, bairro) VALUES
('Clínica Veterinária Pet Feliz', 'PA', 'Belém', 'Umarizal'),
('Hospital Veterinário Cuidado Animal', 'PA', 'Belém', 'Marco');

INSERT INTO tutor (id_usuario, nome_completo, cpf, telefone, estado, cidade, bairro) VALUES
(2, 'Bianca da Silva Ramos', '11122233344', '91988887777', 'PA', 'Belém', 'Guamá'),
(6, 'Marco de Oliveira Vidal', '55566677788', '91999998888', 'PA', 'Belém', 'Nazaré');

INSERT INTO veterinario (id_usuario, id_clinica, nome_completo, crmv) VALUES
(3, 1, 'Davi Tiago de Souza Ribeiro', 'CRMV-PA 1234'),
(7, 2, 'Walace Alves Pinheiro da Silva', 'CRMV-PA 5678');

INSERT INTO orgao_governamental (id_usuario, nome_instituicao, esfera, estado_atuacao, cidade_atuacao) VALUES
(5, 'Centro de Controle de Zoonoses de Belém', 'MUNICIPAL', 'PA', 'Belém');

INSERT INTO animal (id_tutor, nome, especie, raca, data_nascimento) VALUES
(1, 'Rex', 'Cachorro', 'Golden Retriever', '2020-05-15'),
(2, 'Mimi', 'Gato', 'Siamês', '2022-08-10');

INSERT INTO vacina (nome_vacina, fabricante, doencas_prevenidas, intervalo_doses_dias) VALUES
('Antirrábica', 'Zoetis', 'Raiva', 365),
('V10', 'Boehringer Ingelheim', 'Cinomose, Parvovirose, Coronavirose, etc', 365);

INSERT INTO registro_vacinacao (id_animal, id_vacina, id_veterinario, data_aplicacao, data_proxima_dose, status) VALUES
(1, 1, 1, '2025-10-10', '2026-10-10', 'APLICADA'),
(2, 2, 2, NULL, '2026-06-01', 'PENDENTE');