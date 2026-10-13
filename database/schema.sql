CREATE DATABASE IF NOT EXISTS gestor_practicas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gestor_practicas;

CREATE TABLE IF NOT EXISTS students (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  semester TINYINT UNSIGNED NOT NULL DEFAULT 5,
  status ENUM('En práctica','Pendiente','Finalizada') NOT NULL DEFAULT 'Pendiente',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS institutions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(140) NOT NULL,
  city VARCHAR(80) NOT NULL,
  contact_name VARCHAR(120) NOT NULL,
  contact_email VARCHAR(160) NOT NULL,
  agreement_status ENUM('Vigente','En trámite','Vencido') NOT NULL DEFAULT 'En trámite',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS practices (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id INT UNSIGNED NOT NULL,
  institution_id INT UNSIGNED NOT NULL,
  advisor_name VARCHAR(120) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  status ENUM('En curso','Pendiente','Completada','En revisión') NOT NULL DEFAULT 'Pendiente',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_practice_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_practice_institution FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS practice_hours (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  practice_id INT UNSIGNED NOT NULL,
  activity_date DATE NOT NULL,
  hours DECIMAL(4,1) NOT NULL,
  activity VARCHAR(240) NOT NULL,
  evidence_url VARCHAR(500) NULL,
  review_status ENUM('Pendiente','Aprobada','Rechazada') NOT NULL DEFAULT 'Pendiente',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_hours_practice FOREIGN KEY (practice_id) REFERENCES practices(id) ON DELETE CASCADE
);

INSERT IGNORE INTO students (code, full_name, email, semester, status) VALUES
('20261024', 'Valentina Rojas', 'valentina.rojas@estudiante.edu.co', 5, 'En práctica'),
('20261038', 'Mateo Herrera', 'mateo.herrera@estudiante.edu.co', 5, 'En práctica'),
('20261057', 'Sofía Martínez', 'sofia.martinez@estudiante.edu.co', 5, 'Pendiente');
INSERT INTO institutions (name, city, contact_name, contact_email, agreement_status)
SELECT 'Institución Educativa Los Pinos', 'Bucaramanga', 'Laura Gómez', 'practicas@lospinos.edu.co', 'Vigente'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE name = 'Institución Educativa Los Pinos');
INSERT INTO institutions (name, city, contact_name, contact_email, agreement_status)
SELECT 'Colegio Nuevo Horizonte', 'Floridablanca', 'Andrés Silva', 'convenios@nuevohorizonte.edu.co', 'Vigente'
WHERE NOT EXISTS (SELECT 1 FROM institutions WHERE name = 'Colegio Nuevo Horizonte');
INSERT INTO practices (student_id, institution_id, advisor_name, start_date, status)
SELECT s.id, i.id, 'Diana Pardo', '2026-08-10', 'En curso' FROM students s JOIN institutions i ON i.name = 'Institución Educativa Los Pinos' WHERE s.code = '20261024' AND NOT EXISTS (SELECT 1 FROM practices p WHERE p.student_id = s.id);
INSERT INTO practices (student_id, institution_id, advisor_name, start_date, status)
SELECT s.id, i.id, 'Carlos Rincón', '2026-08-17', 'En curso' FROM students s JOIN institutions i ON i.name = 'Colegio Nuevo Horizonte' WHERE s.code = '20261038' AND NOT EXISTS (SELECT 1 FROM practices p WHERE p.student_id = s.id);
INSERT INTO practice_hours (practice_id, activity_date, hours, activity, review_status)
SELECT p.id, '2026-09-16', 6, 'Observación y planeación de clase', 'Aprobada' FROM practices p JOIN students s ON s.id = p.student_id WHERE s.code = '20261024' AND NOT EXISTS (SELECT 1 FROM practice_hours h WHERE h.practice_id = p.id);
INSERT INTO practice_hours (practice_id, activity_date, hours, activity, review_status)
SELECT p.id, '2026-09-17', 5, 'Apoyo en actividad de lectura', 'Pendiente' FROM practices p JOIN students s ON s.id = p.student_id WHERE s.code = '20261038' AND NOT EXISTS (SELECT 1 FROM practice_hours h WHERE h.practice_id = p.id);
