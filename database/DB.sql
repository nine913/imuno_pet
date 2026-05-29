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
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE
) ENGINE = InnoDB;

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
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `imunopet`.`clinica` (
  `id_clinica` INT NOT NULL AUTO_INCREMENT,
  `nome_fantasia` VARCHAR(150) NOT NULL,
  `estado` VARCHAR(2) NOT NULL,
  `cidade` VARCHAR(100) NOT NULL,
  `bairro` VARCHAR(100) NOT NULL,
  `status` ENUM('ATIVA', 'INATIVA') NOT NULL DEFAULT 'ATIVA',
  PRIMARY KEY (`id_clinica`)
) ENGINE = InnoDB;

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
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

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
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

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
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `imunopet`.`vacina` (
  `id_vacina` INT NOT NULL AUTO_INCREMENT,
  `nome_vacina` VARCHAR(100) NOT NULL,
  `fabricante` VARCHAR(100) NULL,
  `doencas_prevenidas` TEXT NOT NULL,
  `intervalo_doses_dias` INT NULL,
  PRIMARY KEY (`id_vacina`)
) ENGINE = InnoDB;

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
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `imunopet`.`especie` (
  `id_especie` INT NOT NULL AUTO_INCREMENT,
  `nome_especie` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id_especie`),
  UNIQUE INDEX `nome_especie_UNIQUE` (`nome_especie` ASC) VISIBLE
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `imunopet`.`raca` (
  `id_raca` INT NOT NULL AUTO_INCREMENT,
  `id_especie` INT NOT NULL,
  `nome_raca` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_raca`),
  INDEX `fk_raca_especie_idx` (`id_especie` ASC) VISIBLE,
  CONSTRAINT `fk_raca_especie`
    FOREIGN KEY (`id_especie`)
    REFERENCES `imunopet`.`especie` (`id_especie`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `imunopet`.`aviso` (
  `id_aviso` INT NOT NULL AUTO_INCREMENT,
  `titulo` VARCHAR(100) NOT NULL,
  `mensagem` TEXT NOT NULL,
  `tipo` ENUM('INFO', 'ALERTA', 'URGENTE') NOT NULL DEFAULT 'INFO',
  `data_criacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('ATIVO', 'INATIVO') NOT NULL DEFAULT 'ATIVO',
  PRIMARY KEY (`id_aviso`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `imunopet`.`log_auditoria` (
  `id_log` INT NOT NULL AUTO_INCREMENT,
  `id_usuario` INT NOT NULL,
  `acao` VARCHAR(255) NOT NULL,
  `detalhes` TEXT,
  `data_hora` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_log`),
  CONSTRAINT `fk_log_usuario`
    FOREIGN KEY (`id_usuario`) 
    REFERENCES `imunopet`.`usuario` (`id_usuario`) 
    ON DELETE CASCADE
) ENGINE = InnoDB;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

INSERT INTO `imunopet`.`usuario` (`email`, `senha`, `perfil`) VALUES 
('admin@imunopet.com.br', '$2b$10$W5eC.H0D.Lw9iL1/t2B50e6VzQ4uQhP9J8sQ2m/fW3sFj7P9rR.kK', 'ADMINISTRADOR');

INSERT INTO `imunopet`.`especie` (`nome_especie`) VALUES 
('Cachorro'), 
('Gato');

INSERT INTO `imunopet`.`raca` (`id_especie`, `nome_raca`) VALUES 
(1, 'Sem Raça Definida (SRD)'),
(1, 'Poodle'),
(1, 'Golden Retriever'),
(1, 'Bulldog Francês'),
(1, 'Shih Tzu'),
(2, 'Sem Raça Definida (SRD)'),
(2, 'Siamês'),
(2, 'Persa'),
(2, 'Maine Coon'),
(2, 'Sphynx');

INSERT INTO `imunopet`.`aviso` (`titulo`, `mensagem`, `tipo`, `status`) VALUES 
('Bem-vindo ao ImunoPet', 'O sistema foi atualizado com sucesso. Navegue pelos novos módulos de auditoria e catálogo de vacinas.', 'INFO', 'ATIVO');
-- usuarios:
INSERT INTO clinica (nome_fantasia, estado, cidade, bairro) VALUES
('Clínica ImunoPet Central', 'PA', 'Belém', 'Centro');

INSERT INTO usuario (email, senha, perfil) VALUES
('andre@email.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjGsGGZOSm', 'ADMINISTRADOR'),
('gestor@email.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjGsGGZOSm', 'GESTOR_CLINICA'),
('veterinario@email.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjGsGGZOSm', 'VETERINARIO'),
('tutor@email.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjGsGGZOSm', 'TUTOR'),
('governo@email.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjGsGGZOSm', 'GOVERNO');

INSERT INTO gestor (id_usuario, id_clinica, nome_completo) VALUES
((SELECT id_usuario FROM usuario WHERE email = 'gestor@email.com'), 1, 'gestor');

INSERT INTO veterinario (id_usuario, id_clinica, nome_completo, crmv) VALUES
((SELECT id_usuario FROM usuario WHERE email = 'veterinario@email.com'), 1, 'veterinario', 'CRMV-12345');

INSERT INTO tutor (id_usuario, nome_completo, cpf, telefone, estado, cidade, bairro) VALUES
((SELECT id_usuario FROM usuario WHERE email = 'tutor@email.com'), 'tutor', '111.111.111-11', '11888888888', 'PA', 'Belém', 'Centro');

INSERT INTO orgao_governamental (id_usuario, nome_instituicao, esfera, estado_atuacao, cidade_atuacao) VALUES
((SELECT id_usuario FROM usuario WHERE email = 'governo@email.com'), 'Vigilância Sanitária', 'MUNICIPAL', 'PA', 'Belém');