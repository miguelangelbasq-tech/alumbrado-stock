// v145 · busca en todo el CSS de la app los fondos navy (var(--navy), #28285E, #3D3F8A, navy-2…). Uso: APP=index.html node buscar_navy.js > navy.txt ; después python3 acciones.py navy.txt gradAccion.css
const { abrir } = require(process.env.H || './h');
(async () => {
  const { browser, page } = await abrir({ sesion: 'admin', espera: 4000, v145: true });
  const r = await page.evaluate(() => {
    const b = document.createElement('button'); b.className = 'btn-primary'; b.textContent = 'x'; document.body.appendChild(b);
    const cs = getComputedStyle(b), out = { btn: cs.backgroundImage + ' | ' + cs.backgroundColor, rules: [] };
    const RE = /var\(--navy(-2|-dark)?\)|#28285e|#3d3f8a|#2e2e6b|#1c1c45|rgb\(40, 40, 94\)|rgb\(61, 63, 138\)|#33357a/i;
    const walk = (rules, owner, media) => { for (const r of rules) { if (r.cssRules && r.type !== 1) { walk(r.cssRules, owner, (r.conditionText || r.media && r.media.mediaText || '')); continue; } if (r.type !== 1) continue; const bg = r.style.getPropertyValue('background') + ' ' + r.style.getPropertyValue('background-color') + ' ' + r.style.getPropertyValue('background-image'); if (RE.test(bg)) out.rules.push([owner, media, r.selectorText, bg.trim().slice(0, 120), r.style.getPropertyPriority('background') || r.style.getPropertyPriority('background-color')]); } };
    for (const s of document.styleSheets) { let rl; try { rl = s.cssRules; } catch (e) { continue; } walk(rl, (s.ownerNode && s.ownerNode.id) || '?', ''); }
    return out;
  });
  console.log(r.btn); r.rules.forEach((x) => console.log(x.join(' ¦ ')));
  console.log('N', r.rules.length);
  await browser.close();
})();
