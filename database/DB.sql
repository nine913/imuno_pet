SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

CREATE SCHEMA IF NOT EXISTS `imunopet` DEFAULT CHARACTER SET utf8 ;
USE `imunopet` ;

CREATE TABLE IF NOT EXISTS `imunopet`.`usuario` (
  `id_usuario` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(150) NOT NULL,
  `senha` VARCHAR(255) NOT NULL,
  `perfil` ENUM('TUTOR', 'VETERINARIO', 'GESTOR_CLINICA', 'GOVERNO', 'ADMINISTRADOR') NOT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `imunopet`.`tutor` (
  `id_tutor` INT NOT NULL AUTO_INCREMENT,
  `id_usuario` INT NOT NULL,
  `nome_completo` VARCHAR(100) NOT NULL,
  `cpf` VARCHAR(14) NOT NULL,
  `telefone` VARCHAR(20) NULL,
  `estado` VARCHAR(2) NOT NULL,
  `cidade` VARCHAR(100) NOT NULL,
  `bairro` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_tutor`),
  INDEX `fk_tutor_usuario_idx` (`id_usuario` ASC) VISIBLE,
  UNIQUE INDEX `usuario_id_usuario_UNIQUE` (`id_usuario` ASC) VISIBLE,
  UNIQUE INDEX `cpf_UNIQUE` (`cpf` ASC) VISIBLE,
  CONSTRAINT `fk_tutor_usuario`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `imunopet`.`usuario` (`id_usuario`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `imunopet`.`clinica` (
  `id_clinica` INT NOT NULL AUTO_INCREMENT,
  `nome_fantasia` VARCHAR(150) NOT NULL,
  `estado` VARCHAR(2) NOT NULL,
  `cidade` VARCHAR(100) NOT NULL,
  `bairro` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_clinica`))
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `imunopet`.`veterinario` (
  `id_veterinario` INT NOT NULL AUTO_INCREMENT,
  `id_usuario` INT NOT NULL,
  `id_clinica` INT NOT NULL,
  `nome_completo` VARCHAR(100) NOT NULL,
  `crmv` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id_veterinario`),
  INDEX `fk_veterinario_usuario1_idx` (`id_usuario` ASC) VISIBLE,
  INDEX `fk_veterinario_clinica1_idx` (`id_clinica` ASC) VISIBLE,
  UNIQUE INDEX `crmv_UNIQUE` (`crmv` ASC) VISIBLE,
  UNIQUE INDEX `id_usuario_UNIQUE` (`id_usuario` ASC) VISIBLE,
  CONSTRAINT `fk_veterinario_usuario1`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `imunopet`.`usuario` (`id_usuario`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_veterinario_clinica1`
    FOREIGN KEY (`id_clinica`)
    REFERENCES `imunopet`.`clinica` (`id_clinica`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `imunopet`.`orgao_governamental` (
  `id_orgao` INT NOT NULL AUTO_INCREMENT,
  `id_usuario` INT NOT NULL,
  `nome_instituicao` VARCHAR(150) NOT NULL,
  `esfera` ENUM('MUNICIPAL', 'ESTADUAL', 'FEDERAL') NOT NULL,
  `estado_atuacao` VARCHAR(2) NOT NULL,
  `cidade_atuacao` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_orgao`),
  INDEX `fk_orgao_governamental_usuario1_idx` (`id_usuario` ASC) VISIBLE,
  CONSTRAINT `fk_orgao_governamental_usuario1`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `imunopet`.`usuario` (`id_usuario`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `imunopet`.`animal` (
  `id_animal` INT NOT NULL AUTO_INCREMENT,
  `id_tutor` INT NOT NULL,
  `nome` VARCHAR(100) NOT NULL,
  `especie` VARCHAR(50) NOT NULL,
  `raca` VARCHAR(50) NULL,
  `data_nascimento` DATE NOT NULL,
  PRIMARY KEY (`id_animal`),
  INDEX `fk_animal_tutor1_idx` (`id_tutor` ASC) VISIBLE,
  CONSTRAINT `fk_animal_tutor1`
    FOREIGN KEY (`id_tutor`)
    REFERENCES `imunopet`.`tutor` (`id_tutor`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `imunopet`.`vacina` (
  `id_vacina` INT NOT NULL AUTO_INCREMENT,
  `nome_vacina` VARCHAR(100) NOT NULL,
  `fabricante` VARCHAR(100) NULL,
  `doencas_prevenidas` TEXT NOT NULL,
  `intervalo_doses_dias` INT NULL,
  PRIMARY KEY (`id_vacina`))
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `imunopet`.`gestor` (
  `id_gestor` INT NOT NULL AUTO_INCREMENT,
  `id_usuario` INT NOT NULL,
  `id_clinica` INT NOT NULL,
  `nome_completo` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_gestor`),
  INDEX `fk_gestor_usuario_idx` (`id_usuario` ASC) VISIBLE,
  INDEX `fk_gestor_clinica_idx` (`id_clinica` ASC) VISIBLE,
  CONSTRAINT `fk_gestor_usuario`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `imunopet`.`usuario` (`id_usuario`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_gestor_clinica`
    FOREIGN KEY (`id_clinica`)
    REFERENCES `imunopet`.`clinica` (`id_clinica`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `imunopet`.`registro_vacinacao` (
  `id_registro` INT NOT NULL AUTO_INCREMENT,
  `id_animal` INT NOT NULL,
  `id_vacina` INT NOT NULL,
  `id_clinica` INT NOT NULL,
  `id_veterinario` INT NULL,
  `data_aplicacao` DATE NULL,
  `data_proxima_dose` DATE NOT NULL,
  `status` ENUM('APLICADA', 'PENDENTE', 'ATRASADA', 'CANCELADA') NOT NULL DEFAULT 'PENDENTE',
  PRIMARY KEY (`id_registro`),
  INDEX `fk_registro_vacinacao_vacina1_idx` (`id_vacina` ASC) VISIBLE,
  INDEX `fk_registro_vacinacao_animal1_idx` (`id_animal` ASC) VISIBLE,
  INDEX `fk_registro_vacinacao_veterinario1_idx` (`id_veterinario` ASC) VISIBLE,
  INDEX `fk_registro_vacinacao_clinica_idx` (`id_clinica` ASC) VISIBLE,
  CONSTRAINT `fk_registro_vacinacao_vacina1`
    FOREIGN KEY (`id_vacina`)
    REFERENCES `imunopet`.`vacina` (`id_vacina`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_registro_vacinacao_animal1`
    FOREIGN KEY (`id_animal`)
    REFERENCES `imunopet`.`animal` (`id_animal`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_registro_vacinacao_veterinario1`
    FOREIGN KEY (`id_veterinario`)
    REFERENCES `imunopet`.`veterinario` (`id_veterinario`)
    ON DELETE SET NULL
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_registro_vacinacao_clinica`
    FOREIGN KEY (`id_clinica`)
    REFERENCES `imunopet`.`clinica` (`id_clinica`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

INSERT INTO usuario (email, senha, perfil) VALUES
('andre@email.com', '$2b$10$X7bH9asD82jK1lM2n3o4p5q6r7s8t9u0v1w2x3y4z5A6B7C8D9E01', 'GESTOR_CLINICA'),
('bianca@email.com', '$2b$10$X7bH9asD82jK1lM2n3o4p5q6r7s8t9u0v1w2x3y4z5A6B7C8D9E01', 'VETERINARIO'),
('davi@email.com', '$2b$10$X7bH9asD82jK1lM2n3o4p5q6r7s8t9u0v1w2x3y4z5A6B7C8D9E01', 'TUTOR'),
('eduardo@email.com', '$2b$10$X7bH9asD82jK1lM2n3o4p5q6r7s8t9u0v1w2x3y4z5A6B7C8D9E01', 'GOVERNO'),
('fernanda@email.com', '$2b$10$X7bH9asD82jK1lM2n3o4p5q6r7s8t9u0v1w2x3y4z5A6B7C8D9E01', 'VETERINARIO'),
('marco@email.com', '$2b$10$X7bH9asD82jK1lM2n3o4p5q6r7s8t9u0v1w2x3y4z5A6B7C8D9E01', 'TUTOR'),
('walace@email.com', '$2b$10$X7bH9asD82jK1lM2n3o4p5q6r7s8t9u0v1w2x3y4z5A6B7C8D9E01', 'TUTOR');

INSERT INTO clinica (nome_fantasia, estado, cidade, bairro) VALUES
('ImunoPet Matriz', 'PA', 'Ananindeua', 'Centro'),
('ImunoPet Filial', 'PA', 'Belém', 'Marco');

INSERT INTO gestor (id_usuario, id_clinica, nome_completo) VALUES
(1, 1, 'André Vitor Costa Figueira');

INSERT INTO veterinario (id_usuario, id_clinica, nome_completo, crmv) VALUES
(2, 1, 'Bianca da Silva Ramos', 'CRMV-PA 1111'),
(5, 2, 'Fernanda de Souza Miranda', 'CRMV-PA 2222');

INSERT INTO orgao_governamental (id_usuario, nome_instituicao, esfera, estado_atuacao, cidade_atuacao) VALUES
(4, 'Secretaria de Saúde - Eduardo Bezerra Portilho Magalhães', 'MUNICIPAL', 'PA', 'Ananindeua');

INSERT INTO tutor (id_usuario, nome_completo, cpf, telefone, estado, cidade, bairro) VALUES
(3, 'Davi Tiago de Souza Ribeiro', '111.111.111-11', '(91) 98888-8888', 'PA', 'Ananindeua', 'Cidade Nova'),
(6, 'Marco de Oliveira Vidal', '222.222.222-22', '(91) 97777-7777', 'PA', 'Belém', 'Nazaré'),
(7, 'Walace Alves Pinheiro da Silva', '333.333.333-33', '(91) 96666-6666', 'PA', 'Ananindeua', 'Guanabara');

INSERT INTO animal (id_tutor, nome, especie, raca, data_nascimento) VALUES
(1, 'Thor', 'Cachorro', 'Golden Retriever', '2022-01-15'),
(2, 'Luna', 'Gato', 'Siamês', '2023-04-20'),
(3, 'Bob', 'Cachorro', 'Pug', '2021-10-05');

INSERT INTO vacina (nome_vacina, fabricante, doencas_prevenidas, intervalo_doses_dias) VALUES
('Antirrábica', 'Zoetis', 'Raiva', 365),
('V10', 'Vanguard', 'Cinomose, Parvovirose', 365);

INSERT INTO registro_vacinacao (id_animal, id_vacina, id_clinica, id_veterinario, data_aplicacao, data_proxima_dose, status) VALUES
(1, 1, 1, 1, '2025-05-10', '2026-05-10', 'APLICADA'),
(2, 2, 2, 2, NULL, '2026-11-20', 'PENDENTE'),
(3, 1, 1, 1, '2024-01-10', '2025-01-10', 'ATRASADA');