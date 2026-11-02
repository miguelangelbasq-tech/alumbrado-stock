# Control independiente (Python) de los cálculos de Proyectista v092: fotometría, iluminancia, radio útil y caída de tensión.
import json, math, cmath, sys
import numpy as np
from pyproj import Geod
from shapely.geometry import Point, Polygon
from scipy import integrate
D = json.load(open('casos.json')); R = math.pi/180; G = Geod(ellps='WGS84')
def cos90(g): return max(0.0, math.cos(g*R*0.9))
F = {
 'rot': lambda c,g: 300*math.cos(g*R)+80*math.sin(2*g*R) if g<90 else 0,
 'c0': lambda c,g: (250+150*math.cos(c*R)*math.sin(g*R))*cos90(g) if g<95 else 0,
 'c90': lambda c,g: (250+150*math.sin(c*R)*math.sin(g*R))*cos90(g) if g<95 else 0,
 'quad': lambda c,g: (250+120*math.cos(2*c*R)*math.sin(g*R))*cos90(g) if g<95 else 0,
 'full': lambda c,g: (250+100*math.cos(c*R)*math.sin(g*R)+60*math.sin(c*R)*math.sin(g*R))*cos90(g) if g<95 else 0,
}
mal = 0; tot = 0
def chk(ok, txt):
    global mal, tot
    tot += 1
    if not ok: mal += 1; print('  ✗', txt)
# 1) fotometría
for f in D['foto']:
    fn = F[f['k']]
    if f['fmt'] == 'LDT': esp = lambda c,g: fn(c,g)*100/85
    else:
        lm = integrate.dblquad(lambda g,c: fn(c*180/math.pi, g*180/math.pi)*10*math.sin(g), 0, 2*math.pi, 0, 95*R, epsabs=1e-3)[0]
        esp = lambda c,g,lm=lm: fn(c,g)*10*1000/lm
        chk(abs(f['lm']-lm)/lm < 0.01, f"IES {f['k']}: flujo integrado {f['lm']} vs {lm:.0f}")
    err = max(abs(v-esp(c,g))/max(esp(c,g),30) for c,g,v in f['muestras'])
    chk(err < 0.02, f"{f['fmt']} {f['k']}: error máx {err*100:.2f} %")
    print(f"  {f['fmt']} {f['k']:5s} error máx {err*100:.2f} %  lm={f['lm']} W={f['W']}")
    if f['fmt']=='LDT': chk(f['lm']==8500 and abs(f['W']-98.5)<1e-6, 'LDT: flujo de luminaria = lámpara × LORL y potencia')
# 2) iluminancia punto por punto con la fórmula (no con la tabla)
L = D['luz']; f0 = F['c0']
def E(x,y,arts):
    s=0
    for a in arts:
        dx,dy=x-a['x'],y-a['y']; r=math.hypot(dx,dy); g=math.degrees(math.atan2(r,a['h']))
        th=math.degrees(math.atan2(dx,dy)); C=(a['az']+90-th)%360
        I=f0(C,g)*100/85*a['lm']/1000; cg=a['h']/math.sqrt(r*r+a['h']**2)
        s+=I*cg**3/a['h']**2
    return s*0.8
err = max(abs(e-E(x,y,L['arts']))/max(E(x,y,L['arts']),1) for x,y,e in L['ptsE'])
print(f"  iluminancia: error máx {err*100:.2f} % en 60 puntos al azar"); chk(err<0.03,'iluminancia contra la fórmula')
# promedio y mínimo dentro del borde, recalculados
pol = Polygon([(q['x'],q['y']) for q in L['zona']]); nx,ny=L['nx'],L['ny']; Es=[]
for j in range(ny):
    for i in range(nx):
        x=L['x0']+(i+.5)*L['paso']; y=L['y1']-(j+.5)*L['paso']; k=j*nx+i
        den = pol.contains(Point(x,y))
        chk(den == bool(L['dentro'][k]) or pol.exterior.distance(Point(x,y))<1e-6, f'celda {i},{j} dentro/fuera')
        if den: Es.append(L['E'][k])
em=sum(Es)/len(Es); chk(abs(em-L['em'])<1e-3 and abs(min(Es)-L['emin'])<1e-3, f"Em {L['em']:.3f} vs {em:.3f}")
print(f"  Em {em:.2f} lx · Emin {min(Es):.2f} · Uo {min(Es)/em:.2f} · {len(Es)} puntos")
# promedio con grilla fina (0,25 m) contra la del cálculo: la grilla de 1 m alcanza
bx0,by0,bx1,by1 = pol.bounds; fx = np.arange(bx0+0.25, bx1, 0.5); fy = np.arange(by0+0.25, by1, 0.5)
fina = [E(x,y,L['arts']) for x in fx for y in fy if pol.contains(Point(x,y))]
print(f"  Em con grilla fina {np.mean(fina):.2f} lx (diferencia {abs(np.mean(fina)-em)/em*100:.1f} %)"); chk(abs(np.mean(fina)-em)/em<0.03,'Em no depende de la grilla')
# 3) radio útil
thr=1.5
for cid, rr in L['radios'].items():
    arts=[a for a,(p) in zip(L['arts'],[0]*len(L['arts']))]
    mios=[a for a in L['arts'] if abs(a['x']-rr['x'])<1 and abs(a['y']-rr['y'])<1]
    for k in (0,9,18,27):
        th=k*10*R; ult=0
        for d in np.arange(0,80.0001,0.25):
            if E(rr['x']+d*math.sin(th), rr['y']+d*math.cos(th), mios)>=thr: ult=d
        chk(abs(ult-rr['rs'][k])<=0.5, f"radio {cid} rumbo {k*10}: {rr['rs'][k]} vs {ult}")
print(f"  radios: {len(L['radios'])} columnas controladas (4 rumbos c/u)")
# 4) red eléctrica
peorDif=0
for caso in D['red']:
    ps={p['id']:p for p in caso['ps']}; cfg=caso['cfg']; cc=caso['circ']
    # IEC 60228: cobre clase 2 y clase 5 (flexible), aluminio clase 2
    R20={'Cu':{1.5:12.1,4:4.61,6:3.08,10:1.83,16:1.15},'Cu5':{1.5:13.3,4:4.95,6:3.30,10:1.91,16:1.21},'Al':{16:1.91}}
    if cc['sec'] not in R20[cc['mat']]: cc={**cc,'mat':'Cu','sec':4}
    al={'Cu':0.00393,'Al':0.00403}[cc['mat']]; tab='Cu5' if (cc['mat']=='Cu' and cfg['cond']==5) else cc['mat']
    r=R20[tab][cc['sec']]*(1+al*(70-20))/1000; x=0.08/1000; Z=complex(r,x)
    r15=R20['Cu5' if cfg['cond']==5 else 'Cu'][1.5]*(1+0.00393*50)/1000
    U=cfg['vll']/math.sqrt(3); ang={'R':0,'S':-120,'T':120}
    padre={i:p for i,p,m in caso['padres']}; largo={}
    for i,p,m in caso['padres']:
        a,b=ps[p],ps[i]; d=G.inv(a['lng'],a['lat'],b['lng'],b['lat'])[2]
        esp = b['el']['m'] if b['el'].get('m') else d*1.05+3.5+(3.5 if a['tipo']!='tab' else 0)
        chk(abs(esp-m)<1e-3, f'largo {i}: {m:.3f} vs {esp:.3f}'); largo[i]=esp
    W={l['id']:l for l in caso['lums']}
    tri = cc['tipo']!='1F'
    def caidas(arts):
        I={i:{'R':0j,'S':0j,'T':0j} for i in padre}
        for a in arts: I[a['id']][a['f']]+=cmath.rect(a['I'],math.radians(ang[a['f']])-math.acos(W[ps[a['id']]['el']['lum']]['cos']))
        orden=[i for i,p,m in caso['padres']]
        tot={i:dict(I[i]) for i in orden}
        for i in reversed(orden):
            if padre[i]!='T':
                for f in 'RST': tot[padre[i]][f]+=tot[i][f]
        dv={'T':{'R':0j,'S':0j,'T':0j}}
        for i in orden:
            IN=sum(tot[i].values()); dv[i]={f: dv[padre[i]][f]+Z*largo[i]*(tot[i][f]+(IN if tri else tot[i][f])) for f in 'RST'}
        pct=[]
        for a in arts:
            V0=cmath.rect(U,math.radians(ang[a['f']])); pct.append((U-abs(V0-dv[a['id']][a['f']])+2*r15*7*a['I'])/U*100)
        cab={f:sum(tot[i][f] for i in orden if padre[i]=='T') for f in 'RST'}
        return max(pct), cab
    for a in caso['arts']:
        l=W[ps[a['id']]['el']['lum']]; chk(abs(a['I']-l['W']/(U*l['cos']))<1e-9,'corriente de la luminaria')
    pm,cab=caidas(caso['arts'])
    peorDif=max(peorDif,abs(pm-caso['dvMax']))
    chk(abs(pm-caso['dvMax'])<1e-6, f"caída máx {caso['dvMax']:.5f} vs {pm:.5f}")
    chk(all(abs(abs(cab[f])-caso['Ia'][f])<1e-6 for f in 'RST'), 'corrientes de cabecera')
    chk(abs(abs(sum(cab.values()))-caso['IN'])<1e-6, 'corriente de neutro')
    # el reparto automático no es peor que el «R, S, T rotando»
    rot=[]; k=0
    for a in caso['arts']:
        fija=ps[a['id']]['el'].get('fase')
        f = fija if (fija and tri) else ('RST'[k%3] if tri else cc['fase']); 
        if tri and not fija: k+=1
        rot.append({**a,'f':f})
    pr,_=caidas(rot)
    chk(pm<=pr+1e-9, f'automático {pm:.4f} ≤ rotando {pr:.4f}')
    # fijas respetadas
    for a in caso['arts']:
        fija=ps[a['id']]['el'].get('fase')
        if fija and tri: chk(a['f']==fija,'fase fija respetada')
        if not tri: chk(a['f']==cc['fase'],'monofásico en su fase')
    ib=max(abs(v) for v in cab.values()); req=max(1.25*ib,10); In=next(s for s in [6,10,16,20,25,32,40,50,63,80,100,125] if s>=req-1e-9)
    chk(In==caso['In'], f"protección {caso['In']} vs {In}")
cat=D['catalogo']; chk(abs(cat[0]-5.92)<0.01 and abs(cat[1]-3.95)<0.01 and abs(cat[2]-2.29)<0.01, f'cobre flexible a 70 °C = catálogo Prysmian: {cat}')
print(f'  cobre flexible a 70 °C: 4 mm² {cat[0]:.3f} · 6 mm² {cat[1]:.3f} · 10 mm² {cat[2]:.3f} Ω/km (catálogo: 5,92 · 3,95 · 2,29)')
print(f"  red: {len(D['red'])} circuitos al azar · diferencia máx de caída {peorDif:.2e} %")
print(f'RESULTADO control numérico: {tot-mal}/{tot} OK')
sys.exit(1 if mal else 0)
