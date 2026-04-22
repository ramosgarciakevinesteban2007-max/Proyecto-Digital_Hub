const fs = require('fs');
const path = require('path');

const fixes = [
  ['Ã±', 'ñ'], ['Ã¡', 'á'], ['Ã©', 'é'], ['Ã³', 'ó'], ['Ãº', 'ú'], ['Ã­', 'í'],
  ['Â¿', '¿'], ['Â¡', '¡'], ['Â·', '·'],
  ['ÃÂ¡', 'á'], ['ÃÂ³', 'ó'], ['ÃÂº', 'ú'], ['ÃÂ©', 'é'], ['ÃÂ­', 'í'], ['ÃÂ±', 'ñ'],
  ['Ã¼', 'ü'], ['Ã\u0091', 'Ñ'], ['Ã\u0081', 'Á'], ['Ã\u0089', 'É'], ['Ã\u0093', 'Ó'],
  ['NÃº', 'Nú'], ['MaÃ±', 'Mañ'], ['formaciÃ³n', 'formación'], ['DescripciÃ³n', 'Descripción'],
  ['sesiÃ³n', 'sesión'], ['contraseÃ±a', 'contraseña'], ['ContraseÃ±a', 'Contraseña'],
  ['electrÃ³nico', 'electrónico'], ['PortÃ¡', 'Portá'], ['atenciÃ³n', 'atención'],
  ['revisiÃ³n', 'revisión'], ['GestiÃ³n', 'Gestión'], ['gestiÃ³n', 'gestión'],
  ['uniÃ³n', 'unión'], ['formaciÃ³n', 'formación'], ['daÃ±ado', 'dañado'], ['DaÃ±ado', 'Dañado'],
];

function walkDir(dir, exts) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory() && file !== 'node_modules') {
      results = results.concat(walkDir(full, exts));
    } else if (exts.some(e => file.endsWith(e))) {
      results.push(full);
    }
  }
  return results;
}

const files = walkDir('frontend_react/src', ['.jsx', '.js', '.css']);
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

console.log('\nTotal fixed:', total);
