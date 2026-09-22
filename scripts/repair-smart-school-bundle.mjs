import fs from 'node:fs';

const file = new URL('../smart-school.html', import.meta.url);
let source = fs.readFileSync(file, 'utf8');
const broken = '\n<script src="./assets/js/vf-analytics.js" defer></script>';
const repaired = '\\n<script src=\\"./assets/js/vf-analytics.js\\" defer><\\u002Fscript>';

const occurrences = source.split(broken).length - 1;
if (occurrences === 1) {
  source = source.replace(broken, repaired);
} else if (occurrences !== 0 || !source.includes(repaired)) {
  throw new Error(`Expected one malformed or repaired analytics tag, found ${occurrences}.`);
}

const routes = new Map([
  ['Vlad Filon.dc.html#cta', 'index.html#cta'],
  ['Vlad Filon.dc.html', 'index.html'],
  ['art.dc.html', 'art.html'],
  ['blog.dc.html', 'index.html'],
  ['mocktail-finder.dc.html', 'mocktail-finder.html'],
]);

for (const [oldRoute, newRoute] of routes) {
  source = source.replaceAll(oldRoute, newRoute);
}

fs.writeFileSync(file, source);
console.log('Smart School bundle and internal routes are valid.');
