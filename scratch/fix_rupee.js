const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(fullPath));
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            results.push(fullPath);
        }
    });
    return results;
}

const frontendSrc = path.join('d:/PAIN_AWAY_1', 'frontend', 'src');
const files = walkDir(frontendSrc);

let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('₹{')) {
        content = content.replace(/₹\{/g, '₹ {');
        fs.writeFileSync(file, content);
        changedFiles++;
        console.log('Fixed', file);
    }
});

console.log('Total files fixed:', changedFiles);
