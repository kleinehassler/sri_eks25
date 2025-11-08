const fs = require('fs');
const path = require('path');

const original = fs.readFileSync(path.join(__dirname, '../docum/AT-012025.xml'), 'utf-8');
const generated = fs.readFileSync(path.join(__dirname, 'test-ats-output.xml'), 'utf-8');

console.log('='.repeat(80));
console.log('COMPARACIÓN DE XMLs');
console.log('='.repeat(80));
console.log('');
console.log('Longitud original:', original.length);
console.log('Longitud generado:', generated.length);
console.log('');

if (original === generated) {
  console.log('✅ Los XMLs son IDÉNTICOS');
} else {
  console.log('⚠️  Los XMLs tienen diferencias');
  console.log('');

  // Buscar la primera diferencia
  let primerasDiferencias = [];
  for (let i = 0; i < Math.min(original.length, generated.length); i++) {
    if (original[i] !== generated[i]) {
      primerasDiferencias.push({
        posicion: i,
        original: original.substring(Math.max(0, i-20), i+20),
        generado: generated.substring(Math.max(0, i-20), i+20)
      });
      if (primerasDiferencias.length >= 3) break;
    }
  }

  if (primerasDiferencias.length > 0) {
    console.log('Primeras diferencias encontradas:');
    primerasDiferencias.forEach((diff, idx) => {
      console.log(`\n${idx + 1}. Posición ${diff.posicion}:`);
      console.log('   Original: "' + diff.original + '"');
      console.log('   Generado: "' + diff.generado + '"');
    });
  }
}

console.log('');
console.log('='.repeat(80));
