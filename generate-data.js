const fs = require('fs');

const lines = fs.readFileSync('./Untitled spreadsheet - 基础列表.csv', 'utf8').split('\n');
const dataLines = lines.slice(2).filter(l => l.trim());

function parseCsvLine(line) {
    const fields = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') { inQ = !inQ; }
        else if (c === ',' && !inQ) { fields.push(cur.trim()); cur = ''; }
        else { cur += c; }
    }
    fields.push(cur.trim());
    return fields;
}

let curProv = null, curCity = null;
const regions = {};

dataLines.forEach(line => {
    const f = parseCsvLine(line);
    const provName = f[1] ? f[1].trim() : null;
    const cityName = f[6] ? f[6].trim() : null;
    const countyName = f[11] ? f[11].trim() : null;

    if (provName) {
        curProv = provName;
        if (!regions[curProv]) {
            regions[curProv] = { name: curProv, type: 'province', cities: {} };
        }
    }
    if (cityName) {
        curCity = cityName;
        if (curProv && !regions[curProv].cities[curCity]) {
            regions[curProv].cities[curCity] = { name: curCity, type: 'city', counties: [] };
        }
    }
    if (countyName && curProv && curCity) {
        regions[curProv].cities[curCity].counties.push({ id: countyName, name: countyName });
    }
});

const provCount = Object.keys(regions).length;
const cityCount = Object.values(regions).reduce((s, p) => s + Object.keys(p.cities).length, 0);
const countyCount = Object.values(regions).reduce((s, p) => s + Object.values(p.cities).reduce((s2, c) => s2 + c.counties.length, 0), 0);
console.log(`Provinces: ${provCount}, Cities: ${cityCount}, Counties: ${countyCount}`);

const out = `// China Regions Data\n// Generated from: Untitled spreadsheet - 基础列表.csv\n// Generated at: ${new Date().toISOString()}\n\nwindow.chinaCities = ${JSON.stringify(regions, null, 4)};\n`;

fs.writeFileSync('./china-regions-data.js', out, 'utf8');
console.log('Written to china-regions-data.js');
