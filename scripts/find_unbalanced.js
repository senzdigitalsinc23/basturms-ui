const fs = require('fs');
const path = require('path');
const p = path.resolve(__dirname, '../src/components/student-management/student-form.tsx');
const s = fs.readFileSync(p, 'utf8');
const lines = s.split(/\r?\n/);
let brace = 0, paren = 0;
let maxBrace = {val: 0, line: 0}, maxParen={val:0,line:0};
for (let i=0;i<lines.length;i++){
  const l = lines[i];
  for (let ch of l){
    if (ch==='{') brace++;
    else if (ch==='}') brace--;
    if (ch==='(') paren++;
    else if (ch===')') paren--;
  }
  if (brace>maxBrace.val){ maxBrace = {val: brace, line: i+1}; }
  if (paren>maxParen.val){ maxParen = {val: paren, line: i+1}; }
}
console.log('max unmatched { at line', maxBrace.line, 'count', maxBrace.val);
console.log('max unmatched ( at line', maxParen.line, 'count', maxParen.val);
console.log('Total lines', lines.length);
// print context around those lines
const ctx = (ln)=>{
  const start = Math.max(0, ln-5-1);
  const end = Math.min(lines.length, ln+5);
  console.log('\n--- Context around line',ln,'---');
  for (let i=start;i<end;i++){
    const mark = (i+1===ln)? '>>' : '  ';
    console.log(`${mark} ${i+1}: ${lines[i]}`);
  }
};
ctx(maxBrace.line);
ctx(maxParen.line);
