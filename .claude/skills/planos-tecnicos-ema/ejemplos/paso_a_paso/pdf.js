const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1188, height: 840 }, deviceScaleFactor: 1.5 });
const pages = process.argv.slice(3);
for (const n of pages) { await p.goto('file://' + __dirname + '/' + n + '.svg'); await p.screenshot({ path: __dirname + '/' + n + '.png' }); }
const html = '<html><head><style>@page{size:297mm 210mm;margin:0}body{margin:0}img{width:297mm;height:210mm;display:block;page-break-after:always}</style></head><body>' + pages.map(n => `<img src="file://${__dirname}/${n}.png">`).join('') + '</body></html>';
fs.writeFileSync(__dirname + '/_pdf.html', html); await p.goto('file://' + __dirname + '/_pdf.html'); await p.waitForTimeout(500);
await p.pdf({ path: __dirname + '/' + process.argv[2], width: '297mm', height: '210mm', printBackground: true }); await b.close(); })();
