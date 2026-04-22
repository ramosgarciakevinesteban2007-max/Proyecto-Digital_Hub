const fs = require('fs');
const path = require('path');

const files = [
  'frontend_react/src/components/ConfirmModal.jsx',
  'frontend_react/src/components/Footer.jsx',
  'frontend_react/src/pages/aprendiz/MiDispositivo.jsx',
  'frontend_react/src/pages/aprendiz/ReportesAprendiz.jsx',
  'frontend_react/src/pages/Home.jsx',
  'frontend_react/src/pages/instructor/EquiposInstructor.jsx',
  'frontend_react/src/utils/apiFetch.js',
];

// Mojibake patterns -> correct UTF-8
const fixes = [
  ['Ã±', 'ñ'], ['Ã¡', 'á'], ['Ã©', 'é'], ['Ã³', 'ó'], ['Ãº', 'ú'], ['Ã­', 'í'],
  ['Ã\u0091', 'Ñ'], ['Ã\u0081', 'Á'], ['Ã\u0089', 'É'], ['Ã\u0093', 'Ó'],
  ['Â¿', '¿'], ['Â¡', '¡'], ['Â·', '·'], ['Â©', '©'],
  ['ï¿½', ''],  // replacement char - remove
];

let total = 0;
for (const file of files) {
  let text = fs.readFileSync(file, 'utf-8');
  let newText = text;
  for (const [bad, good] of fixes) {
    newText = newText.split(bad).join(good);
  }
  if (newText !== text) {
    fs.writeFileSync(file, newText, 'utf-8');
    console.log('Fixed:', file);
    total++;
  }
}
console.log('Total fixed:', total);
