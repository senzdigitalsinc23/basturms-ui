const fs = require('fs');
const path = require('path');
const p = path.resolve(__dirname, '../src/components/student-management/student-form.tsx');
const s = fs.readFileSync(p, 'utf8');
const counts = {
  '{': (s.match(/\{/g) || []).length,
  '}': (s.match(/\}/g) || []).length,
  '(': (s.match(/\(/g) || []).length,
  ')': (s.match(/\)/g) || []).length,
  '[': (s.match(/\[/g) || []).length,
  ']': (s.match(/\]/g) || []).length,
  '`': (s.match(/`/g) || []).length,
  "lines": s.split(/\r?\n/).length
};
console.log(JSON.stringify(counts, null, 2));
// Also print nearby context of first too-many or too-few braces heuristic
if (counts['{'] !== counts['}']) {
  console.log('Brace mismatch: { vs }');
}
if (counts['('] !== counts[')']) {
  console.log('Paren mismatch: ( vs )');
}
if (counts['['] !== counts[']']) {
  console.log('Bracket mismatch: [ vs ]');
}
if (counts['`'] % 2 !== 0) {
  console.log('Odd number of backticks found');
}
