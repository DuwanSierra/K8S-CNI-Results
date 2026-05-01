const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..', '..');
const sourcePath = path.join(rootDir, 'docs', 'datos_consolidados.js');
const publicDir = path.join(__dirname, '..', 'public');
const targetPath = path.join(publicDir, 'cni-data.json');

if (!fs.existsSync(sourcePath)) {
  throw new Error(
    `No existe ${sourcePath}. Ejecuta primero: node docs/procesador.js`,
  );
}

const source = fs.readFileSync(sourcePath, 'utf8');
const match = source.match(/const\s+CNI_DATA\s*=\s*([\s\S]*?);?\s*$/);

if (!match) {
  throw new Error('No se pudo extraer CNI_DATA desde datos_consolidados.js');
}

const cnis = Function(`"use strict"; return (${match[1]});`)();

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(
  targetPath,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      source: 'docs/procesador.js',
      model: 'MCDA dynamic benchmark input',
      cnis,
    },
    null,
    2,
  )}\n`,
);

console.log(`SPA data exported: ${targetPath}`);
