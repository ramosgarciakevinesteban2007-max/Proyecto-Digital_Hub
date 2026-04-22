const fs = require('fs');

const files = [
  'frontend_react/src/pages/instructor/PapeleraInstructor.jsx',
  'frontend_react/src/pages/instructor/HistorialInstructor.jsx',
  'frontend_react/src/pages/instructor/FichasInstructor.jsx',
  'frontend_react/src/pages/instructor/EquiposInstructor.jsx',
  'frontend_react/src/pages/admin/PapeleraAdmin.jsx',
  'frontend_react/src/pages/admin/FichasAdmin.jsx',
  'frontend_react/src/pages/Home.jsx',
];

const fixes = [
  ["danado:'#f87171'", "'dañado':'#f87171'"],
  ["danado: '#f87171'", "'dañado': '#f87171'"],
  ["=== 'danado'", "=== 'dañado'"],
  ["==='danado'", "==='dañado'"],
  ["!== 'danado'", "!== 'dañado'"],
  ["!=='danado'", "!=='dañado'"],
  ['value="danado"', 'value="dañado"'],
  ["equipos danados", "equipos dañados"],
  ["danados,", "dañados,"],
  ["'danado'||", "'dañado'||"],
  ["'danado' ||", "'dañado' ||"],
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
