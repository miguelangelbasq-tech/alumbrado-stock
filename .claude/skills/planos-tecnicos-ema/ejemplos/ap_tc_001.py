import math
W,H=1680,1188
K="#111"; G="#555"; OR="#c2410c"; NV="#1d2160"
CAD='font-family="Arial Narrow,Roboto Condensed,Arial,sans-serif"'; MONO='font-family="JetBrains Mono,monospace"'; INT='font-family="Inter,Arial"'
o=[]
def a(s): o.append(s)
def txt(x,y,s,sz=12,w=400,c=K,anc="start",fam=CAD,rot=None):
    tr=f' transform="rotate({rot} {x:.1f} {y:.1f})"' if rot is not None else ""
    a(f'<text x="{x:.1f}" y="{y:.1f}" font-size="{sz}" font-weight="{w}" fill="{c}" text-anchor="{anc}" {fam}{tr}>{s}</text>')
def ln(x1,y1,x2,y2,c=K,w=.8,d=""): a(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{c}" stroke-width="{w}" {d}/>')
def rect(x,y,w,h,fill="none",st=K,sw=.8,extra=""): a(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" fill="{fill}" stroke="{st}" stroke-width="{sw}" {extra}/>')
def tick(x,y): ln(x-4,y+4,x+4,y-4,K,1.2)
def dimV(x,y1,y2,t,ext=None,c=K):
    if ext is not None:
        for y in (y1,y2): ln(ext,y,x+5 if ext<x else x-5,y,K,.4)
    ln(x,y1-4,x,y2+4,K,.6); tick(x,y1); tick(x,y2); txt(x-4,(y1+y2)/2,t,11,400,c,"middle",CAD,-90)
def dimH(y,x1,x2,t,ext=None,c=K):
    if ext is not None:
        for x in (x1,x2): ln(x,ext,x,y-5 if ext>y else y+5,K,.4)
    ln(x1-4,y,x2+4,y,K,.6); tick(x1,y); tick(x2,y); txt((x1+x2)/2,y-4,t,11,400,c,"middle")
def globo(n,ax,ay,gx,gy,c=K,r=10):
    ln(ax,ay,gx,gy,c,.6); a(f'<circle cx="{ax:.1f}" cy="{ay:.1f}" r="1.8" fill="{c}"/><circle cx="{gx:.1f}" cy="{gy:.1f}" r="{r}" fill="#fff" stroke="{c}" stroke-width="1"/>'); txt(gx,gy+4,n,11,700,c,"middle")
def titulo(x,y,t,sub):
    txt(x,y,t,15,700,K); ln(x,y+4,x+len(t)*7.6,y+4,K,1.2); txt(x,y+19,sub,10.5,400,G)
CORES=[("#7b3f1d","L1"),("#1a1a1a","L2"),("#c62828","L3"),("#4fa3d9","N")]
def cableCAD(cx,cy,r,color=False,hilos=False):
    a(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{"#2a2a2a" if color else "#fff"}" stroke="{K}" stroke-width=".9"/>')
    a(f'<circle cx="{cx}" cy="{cy}" r="{r*.86}" fill="{"#c8c8c8" if color else "#fff"}" stroke="{K}" stroke-width=".4"/>')
    rc=r*.36; d=r*.42
    for i,(col,lbl) in enumerate(CORES):
        ang=math.radians(45+90*i); x=cx+d*math.cos(ang); y=cy-d*math.sin(ang)
        a(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{rc:.2f}" fill="{col if color else "#fff"}" stroke="{K}" stroke-width=".5"/>')
        rcu=rc*.66; a(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{rcu:.2f}" fill="{"#d08a3f" if color else "url(#cuH)"}" stroke="{K}" stroke-width=".3"/>')
        if hilos:
            rh=rcu/3
            for px,py in [(0,0)]+[(2*rh*math.cos(math.radians(60*j)),2*rh*math.sin(math.radians(60*j))) for j in range(6)]:
                a(f'<circle cx="{x+px:.2f}" cy="{y+py:.2f}" r="{rh*.95:.2f}" fill="#e7a35a" stroke="#7a4512" stroke-width=".35"/>')
a(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">')
a('''<defs>
<pattern id="EARTH" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#fff"/><path d="M1,3 H7 M1,5 H7 M1,7 H7 M10,9 V15 M12,9 V15 M14,9 V15" stroke="#111" stroke-width=".5"/></pattern>
<pattern id="SAND" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill="#fff"/><circle cx="2" cy="2" r=".55" fill="#111"/><circle cx="6.5" cy="4" r=".45" fill="#111"/><circle cx="3.5" cy="7.2" r=".5" fill="#111"/></pattern>
<pattern id="ANSI31" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#fff"/><line x1="0" y1="0" x2="0" y2="7" stroke="#111" stroke-width=".55"/></pattern>
<pattern id="ANSI37" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="9" height="9" fill="#fff"/><path d="M0,0 V9 M0,0 H9" stroke="#111" stroke-width=".35"/></pattern>
<pattern id="cuH" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="3" fill="#fff"/><line x1="0" y1="0" x2="0" y2="3" stroke="#111" stroke-width=".5"/></pattern>
<pattern id="mesh" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#f97316" fill-opacity=".25"/><path d="M0,0 L10,10 M10,0 L0,10" stroke="#ea580c" stroke-width="1.2"/></pattern>
<pattern id="grass" width="10" height="6" patternUnits="userSpaceOnUse"><rect width="10" height="6" fill="#86b95c"/><path d="M2,6 L3,1 M6,6 L7,2" stroke="#4d7c2b" stroke-width=".8"/></pattern>
<pattern id="soil3" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#c9a77c"/><circle cx="3" cy="4" r="1.1" fill="#9c7a52"/><circle cx="10" cy="9" r="1.4" fill="#a8865c"/><circle cx="6" cy="12" r=".8" fill="#8a6a43"/></pattern>
<pattern id="sand3" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#f2dc97"/><circle cx="2" cy="2" r=".8" fill="#c9a654"/><circle cx="6" cy="5" r=".7" fill="#b8954a"/></pattern>
<linearGradient id="cyl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#555"/><stop offset=".35" stop-color="#2a2a2a"/><stop offset="1" stop-color="#0d0d0d"/></linearGradient>
</defs>''')
a(f'<rect width="{W}" height="{H}" fill="#fff"/>')
rect(14,14,W-28,H-28,"none",K,1.8); rect(22,22,W-44,H-44,"none",K,.5)
# zona izquierda (CAD) | derecha (3D)
ln(860,22,860,H-22,K,.5)
# ===================== CORTE A-A  (1:10 → 0,52 px/mm)
k=0.52; X0=170; Y0=150; A=200; P=750
L,R=X0,X0+A*k; yF=Y0+P*k
titulo(40,62,"CORTE A-A","ESC. 1:10 - COTAS EN mm")
a(f'<rect x="40" y="{Y0}" width="{L-40}" height="{P*k+24}" fill="url(#EARTH)"/><rect x="{R}" y="{Y0}" width="{430-R}" height="{P*k+24}" fill="url(#EARTH)"/><rect x="{L}" y="{yF}" width="{A*k}" height="24" fill="url(#EARTH)"/>')
yC=yF-(50+25)*k; yA2=yF-150*k; bw,bh=120,55; bx=(L+R)/2-bw*k/2; yL=yA2-bh*k; yM=Y0+300*k
a(f'<rect x="{L}" y="{yA2}" width="{A*k}" height="{150*k}" fill="url(#SAND)"/>')
a(f'<rect x="{L}" y="{Y0}" width="{A*k}" height="{yA2-Y0}" fill="url(#ANSI37)"/>')
rect(bx,yL,bw*k,bh*k,"url(#ANSI31)",K,1.2)
cableCAD((L+R)/2,yC,25*k)
ln(L+2,yM,R-2,yM,K,1.6,'stroke-dasharray="7 2 1.5 2"')
a(f'<path d="M40,{Y0} H{L} V{yF} H{R} V{Y0} H430" fill="none" stroke="{K}" stroke-width="1.8"/>')
# nivel
a(f'<path d="M{L-60},{Y0-2} l6,-9 h-12 z" fill="none" stroke="{K}" stroke-width=".8"/>'); txt(L-46,Y0-5,"±0,00 NT",10.5)
dimV(L-24,Y0,yF,"750",ext=L-2); dimV(L-46,Y0,yA2,"600 (TAPADA)",ext=L-26)
dimV(R+22,yA2,yF,"150",ext=R+2); dimV(R+44,yC,yF,"75",ext=R+24); dimV(R+22,Y0,yM,"300 (*)",ext=R+2,c=OR)
dimH(Y0-22,L,R,"200",ext=Y0-2); dimH(yL-8,bx,bx+bw*k,"120")
gx=400
globo("1",R-6,Y0+50,gx,Y0+50); globo("2",R-8,yM,gx,yM+16); globo("3",bx+bw*k-5,yL+bh*k/2,gx,yL+2); globo("4",L+8,yF-6,gx,yF+10); globo("5",(L+R)/2+8,yC-6,gx,yC-14)
a(f'<circle cx="{(L+R)/2}" cy="{yC}" r="{25*k+6}" fill="none" stroke="{K}" stroke-width=".7" stroke-dasharray="3 2"/>'); txt((L+R)/2-25*k-10,yC-10,"D1",10.5,700,K,"end")
# ===================== D1 cable
titulo(470,62,"DETALLE D1 - CABLE","S/E - Cu XLPE 4 CONDUCTORES (IRAM 2178-1)")
cx,cy,cr=580,210,86
a(f'<circle cx="{cx}" cy="{cy}" r="{cr+9}" fill="none" stroke="{K}" stroke-width=".7" stroke-dasharray="4 3"/>')
cableCAD(cx,cy,cr,True,True)
for i,(t,ax,ay) in enumerate([("CUBIERTA EXTERIOR PVC",cx+cr*.94,cy-cr*.3),("RELLENO",cx+cr*.8,cy+cr*.08),("AISLACION XLPE",cx+cr*.65,cy+cr*.5),("CONDUCTOR Cu - CUERDA",cx-cr*.3,cy-cr*.3)]):
    ty=128+i*24; ln(ax,ay,690,ty-4,K,.6); a(f'<circle cx="{ax:.1f}" cy="{ay:.1f}" r="1.8" fill="{K}"/>'); txt(694,ty,t,10.5)
txt(694,236,"FASES (AEA 90364):",10.5,700)
for i,(col,l) in enumerate(CORES):
    x=694+(i%2)*80; y=254+(i//2)*18; a(f'<circle cx="{x+5}" cy="{y-4}" r="5" fill="{col}" stroke="#000" stroke-width=".4"/>'); txt(x+14,y,{"L1":"L1 MARRON","L2":"L2 NEGRO","L3":"L3 ROJO","N":"N CELESTE"}[l],10)
txt(694,300,"SECCION: SEGUN CALCULO",10,400,G)
# ===================== D2 ladrillo (axonométrica simple)
titulo(470,352,"DETALLE D2 - LADRILLO","S/E - MACIZO COMUN (*)")
def isoP(x,y,z,ox=560,oy=470,s=.42): c=math.cos(math.radians(30)); return (ox+s*(x*c-y*c), oy+s*(.5*x+.5*y)-s*z)
def isoF(pts,fill,sw=.9): a('<polygon points="'+" ".join(f"{isoP(*p)[0]:.1f},{isoP(*p)[1]:.1f}" for p in pts)+f'" fill="{fill}" stroke="{K}" stroke-width="{sw}"/>')
bl,bwd,bht=250,120,55
isoF([(0,0,bht),(bl,0,bht),(bl,bwd,bht),(0,bwd,bht)],"#fff"); isoF([(0,bwd,0),(bl,bwd,0),(bl,bwd,bht),(0,bwd,bht)],"url(#ANSI31)"); isoF([(bl,0,0),(bl,bwd,0),(bl,bwd,bht),(bl,0,bht)],"#fff")
p1=isoP(0,bwd+30,0); p2=isoP(bl,bwd+30,0); ln(*p1,*p2,K,.6); txt((p1[0]+p2[0])/2-14,(p1[1]+p2[1])/2+16,"250",11,400,OR,"middle",CAD,30)
p1=isoP(bl+30,0,0); p2=isoP(bl+30,bwd,0); ln(*p1,*p2,K,.6); txt((p1[0]+p2[0])/2+14,(p1[1]+p2[1])/2+12,"120",11,400,OR,"middle",CAD,-30)
p1=isoP(bl,bwd+12,0); p2=isoP(bl,bwd+12,bht); ln(p1[0]-18,p1[1],p2[0]-18,p2[1],K,.6); txt(p1[0]-24,(p1[1]+p2[1])/2,"55",11,400,OR,"middle",CAD,-90)
txt(700,430,"VA A LO LARGO, SOBRE",10.5); txt(700,446,"LA ARENA, UNO DETRAS",10.5); txt(700,462,"DEL OTRO, SIN JUNTA.",10.5); txt(700,486,"1 m = 4 LADRILLOS",11,700,OR)
# ===================== CORTE B-B (1:20)
titulo(40,612,"CORTE B-B (1 m DE ZANJA)","ESC. 1:20 - COTAS EN mm")
k2=0.36; bx0=60; by0=668; Lm=1000*k2; ext=40
yF2=by0+P*k2; yA2b=yF2-150*k2; yLb=yA2b-55*k2
rect(bx0,by0,Lm+2*ext,yA2b-by0,"url(#ANSI37)",K,0); rect(bx0,yA2b,Lm+2*ext,150*k2,"url(#SAND)",K,0); rect(bx0,yF2,Lm+2*ext,14,"url(#EARTH)",K,0)
cyB=yF2-75*k2; rect(bx0,cyB-25*k2,Lm+2*ext,50*k2,"#fff",K,.8); ln(bx0,cyB,bx0+Lm+2*ext,cyB,K,.4,'stroke-dasharray="10 3 2 3"')
for i in range(-1,5):
    x=bx0+ext+i*250*k2; x1=max(bx0,x); x2=min(bx0+Lm+2*ext,x+250*k2)
    if x2-x1<=1: continue
    rect(x1,yLb,x2-x1,55*k2,"url(#ANSI31)",K,1)
    if 0<=i<4: txt(x+125*k2,yLb-5,str(i+1),10.5,700,OR,"middle")
ln(bx0,by0+300*k2,bx0+Lm+2*ext,by0+300*k2,K,1.6,'stroke-dasharray="7 2 1.5 2"')
ln(bx0,by0,bx0+Lm+2*ext,by0,K,1.8); ln(bx0,yF2,bx0+Lm+2*ext,yF2,K,1.8)
for x in (bx0,bx0+Lm+2*ext): ln(x,by0-10,x,yF2+20,K,.6,'stroke-dasharray="14 3 2 3"')
dimH(by0-20,bx0+ext,bx0+ext+Lm,"1000 = 4 x 250 (*)",ext=yLb-2,c=OR)
dimV(bx0+Lm+2*ext+24,by0,yF2,"750",ext=bx0+Lm+2*ext+2)
# ===================== cómputo (izq abajo)
cx0,cy0=548,640
txt(cx0,cy0,"COMPUTO POR METRO (1 CABLE)",13,700); ln(cx0,cy0+4,cx0+220,cy0+4,K,1)
fil=[("CONCEPTO","CANT./m","CALCULO"),("EXCAVACION","0,150 m³","0,20x0,75"),("ARENA","0,030 m³","0,20x0,15"),("LADRILLOS (*)","4 u","1000/250"),("MALLA","1 m","-"),("RELLENO","~0,114 m³","RESTO")]
for i,(c1,c2,c3) in enumerate(fil):
    y=cy0+14+i*21; rect(cx0,y,296,21,"#fff",K,.5); ln(cx0+112,y,cx0+112,y+21,K,.5); ln(cx0+202,y,cx0+202,y+21,K,.5)
    w=700 if i==0 else 400; col=OR if "(*)" in c1 else K
    txt(cx0+6,y+15,c1,11,w,col); txt(cx0+157,y+15,c2,11,w,K,"middle",MONO if i else CAD); txt(cx0+208,y+15,c3,10.5,w,G if i else K)
# leyenda
lg0=790
txt(cx0,lg0+40,"RAYADOS",13,700); ln(cx0,lg0+44,cx0+70,lg0+44,K,1)
for i,(pid,t) in enumerate([("EARTH","TERRENO NATURAL"),("ANSI37","RELLENO COMPACTADO"),("SAND","ARENA"),("ANSI31","LADRILLO (CORTE)")]):
    x=cx0+(i%2)*150; y=lg0+56+(i//2)*26; rect(x,y,30,18,f"url(#{pid})",K,.6); txt(x+38,y+13,t,10.5)
ln(cx0,lg0+120,cx0+30,lg0+120,K,1.6,'stroke-dasharray="7 2 1.5 2"'); txt(cx0+38,lg0+124,"MALLA DE ADVERTENCIA",10.5)
# ===================== notas (izq abajo)
ny=990
txt(40,ny,"NOTAS",13,700); ln(40,ny+4,92,ny+4,K,1)
for i,(n,c) in enumerate([("1. COTAS EN mm. MANDA LA COTA, NO LA MEDIDA SOBRE EL DIBUJO.",K),("2. TAPADA 600 + CAMA 150 (ARENA 50 + CABLE + ARENA 50) = EXCAVACION 750.",K),("3. EL LADRILLO VA SOLO CON CABLE ENTERRADO DIRECTO; EN CAÑO PEAD Ø50 NO LLEVA.",K),("4. COMPACTAR EL RELLENO POR CAPAS ANTES DE REPONER VEREDA O CONTRAPISO.",K),("5. (*) A CONFIRMAR: MEDIDA DEL LADRILLO Y SI LA MALLA SE MIDE DESDE EL NT O DESDE EL CABLE.",OR)]):
    txt(40,ny+22+i*19,n,11,400,c)
# ===================== 3D (derecha)
s3=.34; c3=math.cos(math.radians(30)); OX,OY=1110,185
def P3(x,y,z): return (OX+s3*(x*c3-y*c3), OY+s3*(.5*x+.5*y)-s3*z)
def F3(pts,fill,st="#3a2a1a",sw=.8,op=1,extra=""):
    a('<polygon points="'+" ".join(f"{P3(*p)[0]:.1f},{P3(*p)[1]:.1f}" for p in pts)+f'" fill="{fill}" fill-opacity="{op}" stroke="{st}" stroke-width="{sw}" stroke-linejoin="round" {extra}/>')
def BOX(x0,x1,y0,y1,z0,z1,top,side,end,st="#3a2a1a",sw=.8,op=1):
    F3([(x0,y0,z1),(x1,y0,z1),(x1,y1,z1),(x0,y1,z1)],top,st,sw,op)
    F3([(x0,y1,z0),(x1,y1,z0),(x1,y1,z1),(x0,y1,z1)],side,st,sw,op)
    F3([(x1,y0,z0),(x1,y1,z0),(x1,y1,z1),(x1,y0,z1)],end,st,sw,op)
titulo(890,62,"VISTA 3D EN CORTE - 1 m DE ZANJA","PARA ENTENDER EL ARMADO · LAS MEDIDAS MANDAN EN LOS CORTES")
Lz,Az,Pz=1000,200,750
# terreno del fondo (lado de atrás) y debajo
BOX(0,Lz,-300,0,-Pz-90,0,"url(#grass)","url(#soil3)","url(#soil3)")
BOX(0,Lz,0,Az,-Pz-90,-Pz,"#b8946a","url(#soil3)","url(#soil3)")
# arena inferior (todo el largo)
BOX(0,Lz,0,Az,-Pz,-Pz+50,"url(#sand3)","url(#sand3)","url(#sand3)")
# cable (cilindro a lo largo y = Az/2, z = -Pz+75, r = 25) — solo se ve donde no lo tapa la arena superior
yc,zc,rc=Az/2,-Pz+75,25
def circ3(x,yc,zc,r,n=36): return [(x,yc+r*math.cos(2*math.pi*i/n),zc+r*math.sin(2*math.pi*i/n)) for i in range(n)]
def poly3(pts,fill,st="#000",sw=.5): a('<polygon points="'+" ".join(f"{P3(*p)[0]:.1f},{P3(*p)[1]:.1f}" for p in pts)+f'" fill="{fill}" stroke="{st}" stroke-width="{sw}"/>')
# cuerpo del cable: silueta entre x=0 y x=Lz
top=[P3(x,yc,zc+rc) for x in (0,Lz)]; bot=[P3(x,yc+rc*.7,zc-rc*.7) for x in (Lz,0)]
a(f'<polygon points="{top[0][0]:.1f},{top[0][1]:.1f} {top[1][0]:.1f},{top[1][1]:.1f} {bot[0][0]:.1f},{bot[0][1]:.1f} {bot[1][0]:.1f},{bot[1][1]:.1f}" fill="url(#cyl)" stroke="#000" stroke-width=".6"/>')
# punta cortada en x=Lz: cubierta, relleno, 4 conductores con cobre y hilos
poly3(circ3(Lz,yc,zc,rc),"#222"); poly3(circ3(Lz,yc,zc,rc*.86),"#c8c8c8",sw=.3)
for i,(col,_) in enumerate(CORES):
    ang=math.radians(45+90*i); yy=yc+rc*.42*math.cos(ang); zz=zc+rc*.42*math.sin(ang)
    poly3(circ3(Lz+6,yy,zz,rc*.36,24),col,sw=.4); poly3(circ3(Lz+12,yy,zz,rc*.24,20),"#d08a3f",sw=.3)
    for j in range(6):
        aa=2*math.pi*j/6; poly3(circ3(Lz+14,yy+rc*.13*math.cos(aa),zz+rc*.13*math.sin(aa),rc*.07,10),"#f0b06a","#7a4512",.25)
# arena superior (hasta x=860)
BOX(0,860,0,Az,-Pz+50,-Pz+150,"url(#sand3)","url(#sand3)","url(#sand3)")
# ladrillos 1..3 (hasta 750), con color y textura
for i in range(3):
    x0=i*250+3; x1=(i+1)*250-3; y0=(Az-120)/2
    BOX(x0,x1,y0,y0+120,-Pz+150,-Pz+205,"#e58466","#c4593d","#a94b33","#5a2414",.9)
    tx,ty=P3((x0+x1)/2,y0+60,-Pz+205); txt(tx,ty+5,str(i+1),15,700,"#fff","middle",INT)
# relleno inferior (hasta 640), malla, relleno superior (hasta 520) con líneas de capas
BOX(0,640,0,Az,-Pz+205,-300,"#e9dcc6","#d9c6a6","#d2bd9b")
for z in (-460,-380):
    for (pa,pb) in (((0,Az,z),(640,Az,z)),((640,0,z),(640,Az,z))):
        A1=P3(*pa); B1=P3(*pb); ln(*A1,*B1,"#9b8466",.7,'stroke-dasharray="5 3"')
F3([(0,0,-300),(700,0,-300),(700,Az,-300),(0,Az,-300)],"url(#mesh)","#ea580c",1.2)
tx,ty=P3(660,Az/2,-300); a(f'<text x="{tx:.1f}" y="{ty+4:.1f}" font-size="9" font-weight="800" fill="#b91c1c" {INT} transform="rotate(30 {tx:.1f} {ty:.1f})" text-anchor="middle">PELIGRO</text>')
BOX(0,520,0,Az,-300,0,"#efe4d0","#e3d3b7","#dccaa9")
for z in (-200,-100):
    for (pa,pb) in (((0,Az,z),(520,Az,z)),((520,0,z),(520,Az,z))):
        A1=P3(*pa); B1=P3(*pb); ln(*A1,*B1,"#9b8466",.7,'stroke-dasharray="5 3"')
# borde de la zanja arriba
for (pa,pb) in (((0,0,0),(Lz,0,0)),((0,Az,0),(Lz,Az,0))):
    A1=P3(*pa); B1=P3(*pb); ln(*A1,*B1,NV,1.6)
# cota de profundidad sobre la cara del terreno y del largo
pa=P3(Lz,-300,0); pb=P3(Lz,-300,-Pz); a(f'<line x1="{pa[0]+16:.1f}" y1="{pa[1]:.1f}" x2="{pb[0]+16:.1f}" y2="{pb[1]:.1f}" stroke="{NV}" stroke-width=".8"/>'); txt(pa[0]+28,(pa[1]+pb[1])/2,"750",12,700,NV,"middle",MONO,-90)
# globos (mismos números que la lista)
GX=1505
def g3(n,p,gy,col=NV): x,y=P3(*p); globo(n,x,y,GX,gy,col,12)
g3("1",(520,Az*.7,-150),250); g3("2",(690,Az*.6,-300),330); g3("3",(700,Az*.6,-Pz+180),410); g3("4",(830,Az*.8,-Pz+100),490); g3("5",(Lz,yc,zc+10),570)
for n,t,y in (("1","RELLENO POR CAPAS",250),("2","MALLA (*)",330),("3","LADRILLOS (VER D2)",410),("4","ARENA",490),("5","CABLE (VER D1)",570)): txt(GX+18,y+4,t,11,700,NV)
txt(890,712,"El corte en escalones muestra cada capa: relleno, malla, ladrillos, arena y la punta del cable con sus 4 conductores.",11.5,400,G,"start",INT)
# ===================== lista de materiales (derecha)
lx,ly=890,760
txt(lx,ly,"LISTA DE MATERIALES",13,700); ln(lx,ly+4,lx+150,ly+4,K,1)
mat=[("POS.","DESCRIPCION","CANT./m","CODIGO"),("1","RELLENO CON TIERRA DEL LUGAR, COMPACTADO POR CAPAS","~0,114 m³","-"),("2","MALLA DE ADVERTENCIA «PELIGRO ELECTRICO»","1 m","A VINCULAR"),("3","LADRILLO COMUN MACIZO 250x120x55 (*)","4 u","A VINCULAR"),("4","ARENA FINA (CAMA 50 + 50)","0,030 m³","A VINCULAR"),("5","CABLE Cu XLPE 4 CONDUCTORES (IRAM 2178-1)","1 m","SEGUN CALCULO")]
for i,(p,d,c,cod) in enumerate(mat):
    y=ly+14+i*22; rect(lx,y,750,22,"#fff",K,.5)
    for xx in (lx+40,lx+500,lx+610): ln(xx,y,xx,y+22,K,.5)
    w=700 if i==0 else 400
    txt(lx+20,y+15,p,11,700,K,"middle"); txt(lx+48,y+15,d,11,w); txt(lx+555,y+15,c,11,w,K,"middle",MONO if i else CAD); txt(lx+680,y+15,cod,11,w,OR if cod=="A VINCULAR" else K,"middle")
# ===================== rótulo
rx,ry,rw,rh=890,H-150,750,120
rect(rx,ry,rw,rh,"#fff",K,1.6)
for xx in (rx+170,rx+520,rx+640): ln(xx,ry,xx,ry+rh,K,.8)
ln(rx,ry+60,rx+170,ry+60,K,.6); ln(rx+520,ry+60,rx+rw,ry+60,K,.6)
txt(rx+8,ry+16,"PLANO TIPO",9.5,400,G); txt(rx+85,ry+46,"AP-TC-001",20,700,K,"middle",MONO)
txt(rx+8,ry+76,"PROYECTO",9.5,400,G); txt(rx+8,ry+100,"ALUMBRADO DE PLAZAS",12,700)
txt(rx+180,ry+16,"TITULO",9.5,400,G); txt(rx+180,ry+52,"ZANJA PARA CABLE",22,700); txt(rx+180,ry+80,"SUBTERRANEO",22,700); txt(rx+180,ry+104,"CORTES, DETALLES Y VISTA 3D - 1 CABLE",11,400,G)
txt(rx+528,ry+16,"ESCALAS",9.5,400,G); txt(rx+528,ry+36,"1:10 / 1:20",12,700,K,"start",MONO); txt(rx+528,ry+52,"D1, D2, 3D S/E",10.5,400)
txt(rx+528,ry+76,"UNIDADES",9.5,400,G); txt(rx+528,ry+100,"mm",13,700,K,"start",MONO)
txt(rx+648,ry+16,"REV.",9.5,400,G); txt(rx+648,ry+40,"A",14,700,K,"start",MONO)
txt(rx+648,ry+76,"FECHA / HOJA",9.5,400,G); txt(rx+648,ry+96,"07/11/2026",11,700,K,"start",MONO); txt(rx+648,ry+112,"1 DE 1",11,700,K,"start",MONO)
a('</svg>'); open("ap_tc_001.svg","w").write("\n".join(o)); print("ok")
