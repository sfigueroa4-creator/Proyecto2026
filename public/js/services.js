const serviceGrid = document.querySelector('#service-grid');
const serviceOutput = document.querySelector('#service-output');
const serviceNames = [
  ['node:fs/promises', 'Archivos del prototipo'],
  ['node:path', 'Rutas seguras'],
  ['node:os', 'Plataforma del servidor'],
  ['node:crypto', 'Identificador aleatorio'],
  ['node:url', 'Análisis de solicitud']
];

export function renderServiceCards() {
  serviceGrid.innerHTML = serviceNames.map(([name, description], index) => `
    <article class="service-card"><span class="service-number">0${index + 1}</span><code>${name}</code><p>${description}</p></article>`).join('');
}

export async function runServiceDemo() {
  serviceOutput.textContent = 'Consultando API…';
  try {
    const response = await fetch('/api/services?demo=1');
    if (!response.ok) throw new Error('Inicia el servidor Express para ejecutar los ejemplos Node.js.');
    const data = await response.json();
    serviceOutput.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    serviceOutput.textContent = `${error.message}\n\nLa API usa cinco módulos nativos: node:fs/promises, node:path, node:os, node:crypto y node:url.`;
  }
}
