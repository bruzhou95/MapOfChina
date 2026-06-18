const fs = require('fs');

const input = fs.readFileSync('d:/Projects/MapOfChina/基础列表 1.csv', 'utf8');
const lines = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

const header = lines[0];
const dataLines = lines.slice(1).filter(l => l.trim() !== '');

let prevCols = ['', '', '', ''];
const outLines = [header + ',col7,col8,col9'];

for (const line of dataLines) {
    // Parse CSV (simple, no quotes needed here)
    const cols = line.split(',');

    // Forward-fill columns 1-4 (index 0-3)
    for (let i = 0; i < 4; i++) {
        if (cols[i] && cols[i].trim() !== '') {
            prevCols[i] = cols[i].trim();
        } else {
            cols[i] = prevCols[i];
        }
    }

    const c1 = cols[0]; // level 3 id
    const c2 = cols[1]; // level 3 name
    const c3 = cols[2]; // level 2 id
    const c4 = cols[3]; // level 2 name
    const c5 = (cols[4] || '').trim(); // level 1 id
    const c6 = (cols[5] || '').trim(); // level 1 name

    const col7 = `_${c1}_${c2}-3`;
    const col8 = `_${c3}_${c4}-2`;
    const col9 = `_${c5}_${c6}`;

    outLines.push([c1, c2, c3, c4, c5, c6, col7, col8, col9].join(','));
}

const output = outLines.join('\n');
fs.writeFileSync('d:/Projects/MapOfChina/基础列表 1_output.csv', output, 'utf8');
console.log('Done. Rows written:', outLines.length - 1);
console.log('Sample row 1:', outLines[1]);
console.log('Sample row 2:', outLines[2]);
