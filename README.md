# Gestor de Prácticas Académicas

Prototipo MVC de gestión de prácticas académicas para el proyecto integrador de quinto semestre.

## Requisitos

- Node.js 20 o superior y npm.
- MySQL 8.0 en ejecución para persistencia SQL.

## Instalación

1. Ejecuta `database/schema.sql` en tu cliente MySQL.
2. Copia `.env.example` como `.env` y completa los datos locales de conexión.
3. Ejecuta `npm install`.
4. Ejecuta `npm run dev` y abre http://localhost:3000.

Si no hay API disponible, el cliente usa datos demostrativos en el navegador (localStorage). Para probar CRUD persistente necesitas MySQL y la API configurados.

## Módulos Node.js demostrados

El endpoint `GET /api/services?demo=1` usa `node:fs/promises`, `node:path`, `node:os`, `node:crypto` y `node:url`. La interfaz incluye un control para ejecutar la demostración.

## API REST

CRUD de `/api/students`, `/api/institutions`, `/api/practices` y `/api/hours`; indicadores en `/api/practices/summary`; estado en `/api/health`.

## Prueba de integración

Con MySQL configurado y el servidor iniciado, ejecuta `npm test`. La prueba automatizada crea datos temporales para verificar CREATE, READ, UPDATE y DELETE en las cuatro entidades y elimina los registros creados.

## Entregables

- Documento de segunda entrega: `docs/entrega-segundo-avance.md`.
- Guía para instalación, pruebas y publicación: `docs/GUIA_ENTREGA.md`.
- UML y modelo de datos: `docs/uml/` y `docs/modelo-relacional.md`.
- Esquema y datos iniciales: `database/schema.sql`.

Los registros de demostración son ficticios. No publicar `.env` ni datos personales reales.
