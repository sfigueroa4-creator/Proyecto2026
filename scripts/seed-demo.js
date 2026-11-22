import 'dotenv/config';
import { closeDatabase, connectDatabase, getDatabase } from '../src/config/database.js';
import { createMongoRecordsRepository } from '../src/infrastructure/persistence/mongo-records.repository.js';

const demo = {
  students: [
    { _id: 1, code: '20261024', full_name: 'Valentina Rojas', email: 'valentina.rojas@example.edu', semester: 5, status: 'En práctica', demo: true },
    { _id: 2, code: '20261038', full_name: 'Mateo Herrera', email: 'mateo.herrera@example.edu', semester: 5, status: 'En práctica', demo: true },
    { _id: 3, code: '20261057', full_name: 'Sofía Martínez', email: 'sofia.martinez@example.edu', semester: 5, status: 'Pendiente', demo: true }
  ],
  institutions: [
    { _id: 1, name: 'Institución Educativa Los Pinos', city: 'Bucaramanga', contact_name: 'Contacto demostrativo', contact_email: 'contacto1@example.edu', agreement_status: 'Vigente', demo: true },
    { _id: 2, name: 'Colegio Nuevo Horizonte', city: 'Floridablanca', contact_name: 'Contacto demostrativo', contact_email: 'contacto2@example.edu', agreement_status: 'Vigente', demo: true }
  ],
  practices: [
    { _id: 1, student_id: 1, institution_id: 1, advisor_name: 'Docente asesor de demostración', start_date: '2026-08-10', status: 'En curso', demo: true },
    { _id: 2, student_id: 2, institution_id: 2, advisor_name: 'Docente asesor de demostración', start_date: '2026-08-17', status: 'En curso', demo: true }
  ],
  hours: [
    { _id: 1, practice_id: 1, activity_date: '2026-09-16', hours: 6, activity: 'Observación y planeación de clase', review_status: 'Aprobada', demo: true },
    { _id: 2, practice_id: 2, activity_date: '2026-09-17', hours: 5, activity: 'Apoyo en actividad de lectura', review_status: 'Pendiente', demo: true }
  ]
};

try {
  await connectDatabase();
  const repository = createMongoRecordsRepository(getDatabase());
  for (const [name, records] of Object.entries(demo)) {
    for (const record of records) {
      await repository.insertIfMissing(name, { ...record, created_at: new Date(), updated_at: new Date() });
    }
    await repository.ensureSequence(name, Math.max(...records.map((record) => record._id)));
  }
  console.log('Datos ficticios de demostración insertados o conservados sin sobrescribir cambios.');
} catch (error) {
  console.error('No se pudieron cargar los datos de demostración:', error);
  process.exitCode = 1;
} finally {
  await closeDatabase();
}
