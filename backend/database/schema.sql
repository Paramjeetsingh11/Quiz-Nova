CREATE DATABASE IF NOT EXISTS quiznova
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE quiznova;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL,
  email VARCHAR(160) NOT NULL,
  password VARCHAR(255) NOT NULL,
  xp INT UNSIGNED NOT NULL DEFAULT 0,
  level INT UNSIGNED NOT NULL DEFAULT 1,
  streak INT UNSIGNED NOT NULL DEFAULT 0,
  avatar VARCHAR(500) NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  last_quiz_date DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_xp (xp DESC),
  KEY idx_users_created_at (created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS quizzes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  topic VARCHAR(120) NOT NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_quizzes_topic_created_at (topic, created_at),
  KEY idx_quizzes_created_by (created_by),
  CONSTRAINT fk_quizzes_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS questions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  quiz_id BIGINT UNSIGNED NOT NULL,
  question TEXT NOT NULL,
  option_a VARCHAR(500) NOT NULL,
  option_b VARCHAR(500) NOT NULL,
  option_c VARCHAR(500) NOT NULL,
  option_d VARCHAR(500) NOT NULL,
  correct_answer ENUM('A', 'B', 'C', 'D') NOT NULL,
  explanation TEXT NULL,
  PRIMARY KEY (id),
  KEY idx_questions_quiz_id (quiz_id),
  CONSTRAINT fk_questions_quiz_id
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS results (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  quiz_id BIGINT UNSIGNED NOT NULL,
  score INT UNSIGNED NOT NULL,
  total_questions INT UNSIGNED NOT NULL DEFAULT 0,
  accuracy DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_results_user_created_at (user_id, created_at),
  KEY idx_results_quiz_id (quiz_id),
  CONSTRAINT fk_results_user_id
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_results_quiz_id
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS battles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  room_id VARCHAR(120) NOT NULL,
  user1 BIGINT UNSIGNED NOT NULL,
  user2 BIGINT UNSIGNED NOT NULL,
  winner BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_battles_room_id (room_id),
  KEY idx_battles_user1 (user1),
  KEY idx_battles_user2 (user2),
  KEY idx_battles_winner (winner),
  CONSTRAINT fk_battles_user1
    FOREIGN KEY (user1) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_battles_user2
    FOREIGN KEY (user2) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_battles_winner
    FOREIGN KEY (winner) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;
