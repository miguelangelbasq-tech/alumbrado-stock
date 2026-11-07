import math, sys, textwrap
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT
W,H=1188,840
def wrap(t,n): return textwrap.wrap(t,n)
def pagina(n,total):
    h=Hoja(W,H,divisor=None)
    h.rect(22,22,W-44,62,"#28285E",K,0)
    h.txt(40,52,"CÓMO SE HACE · FUNDACIÓN DE COLUMNA PRFV",22,800,"#fff","start",INT)
    h.txt(40,74,"Plano AP-TC-003-A · columna 7 m (10 m entre paréntesis) · riesgo medio",13,500,"#dfe3f5","start",INT)
    h.txt(W-40,60,f"HOJA {n} DE {total}",15,800,"#fff","end",INT)
    h.ln(W/2,96,W/2,H-60,"#c9cde0",1)
    h.txt(40,H-34,"EMA · Alumbrado Público · Las medidas mandan en el plano AP-TC-003-A · (*) a confirmar",11,500,G,"start",INT)
    return h
def panel(h,x0,num,titulo,lineas,ojo=None,control=None):
    y0=104
    h.circ(x0+26,y0+26,22,"#28285E","#28285E",0); h.txt(x0+26,y0+34,str(num),22,800,"#fff","middle",INT)
    h.txt(x0+58,y0+20,f"PASO {num}",12,800,"#7C879D","start",INT); h.txt(x0+58,y0+42,titulo,21,800,"#0D1424","start",INT)
    h.rect(x0,y0+60,330,300,"#f7f8fc","#d5d9e6",1)            # 3D
    h.rect(x0+338,y0+60,212,300,"#fff",K,.8)                 # plano
    h.txt(x0+346,y0+76,"PLANO",10,700,K); h.txt(x0+8,y0+76,"3D",10,700,"#7C879D","start",INT)
    y=y0+392
    for l in lineas:
        for i,w in enumerate(wrap(l,62)):
            h.txt(x0+(4 if i==0 else 20),y,("• " if i==0 else "")+w,15,500,"#0D1424","start",INT); y+=21
        y+=4
    if ojo:
        ws=wrap(ojo,58); hh=16+len(ws)*19
        h.rect(x0,y,550,hh,"#fff4e0","#FF9F0A",1.2,'rx="10"')
        for i,w in enumerate(ws): h.txt(x0+12,y+20+i*19,("⚠ " if i==0 else "")+w,14,700,"#5c3a00","start",INT)
        y+=hh+10
    if control:
        ws=wrap(control,58); hh=16+len(ws)*19
        h.rect(x0,y,550,hh,"#eefaf1","#34C759",1.2,'rx="10"')
        for i,w in enumerate(ws): h.txt(x0+12,y+20+i*19,("✓ " if i==0 else "")+w,14,700,"#14632b","start",INT)
    return y0+60
# ---------- escena 3D: terreno con el pozo, cortado a un cuarto
L=1200; A0,A1=300,900; c0=600; Pz=1200; Pt=1500
def escena(h,ox,oy,s,etapa):
    h.iso(s,ox,oy)
    soil=("url(#grass)","url(#soil3)","url(#soil3)")
    h.BOX(0,L,0,A0,-Pt,0,*soil)
    h.BOX(0,A0,A0,L,-Pt,0,*soil)
    if etapa>=2:
        h.BOX(A0,A1,A0,c0,-Pt,-Pz,"url(#soil3)","url(#soil3)","url(#soil3)")
        h.BOX(A0,c0,c0,A1,-Pt,-Pz,"url(#soil3)","url(#soil3)","url(#soil3)")
    else:
        h.BOX(A0,A1,A0,c0,-Pt,0,*soil); h.BOX(A0,c0,c0,A1,-Pt,0,*soil)
    return
def frente(h):
    soil=("url(#grass)","url(#soil3)","url(#soil3)")
    h.BOX(A1,L,A0,c0,-Pt,0,*soil); h.BOX(A0,c0,A1,L,-Pt,0,*soil)
def relleno_h(h,zf,lineas=False):
    for b in ((A0,c0,A0,c0),(c0,A1,A0,c0),(A0,c0,c0,A1)):
        h.BOX(b[0],b[1],b[2],b[3],-Pz,zf,"url(#conc3)","url(#conc3)","url(#conc3)")
    if lineas:
        for z in range(-1000,zf,250):
            for pa,pb in (((c0,c0,z),(A1,c0,z)),((c0,c0,z),(c0,A1,z))):
                a1=h.P(*pa); b1=h.P(*pb); h.ln(*a1,*b1,"#6b7077",.7,h.OCULTA)
def molde(h,z0=-1000,z1=120):
    h.tuboZ(z0,z1,c0,c0,123.5,123.5,"url(#pvc)","#666")
def telgopor(h,z0=-650,z1=0):
    h.BOX(c0+123,A1,c0-75,c0+75,z0,z1,"url(#foam3)","url(#foam3)","url(#foam3)","#999",.6)
def desague(h): h.tuboZ(-Pz,-1000,c0,c0,13,13,"url(#pvc)","#666")
def g(h,n,p,tx,ty,t):
    x,y=h.P(*p); h.ln(x,y,tx-4,ty-4,NV,.8); h.circ(x,y,2.4,NV,NV,0); h.txt(tx,ty,t,11.5,700,NV,"start",INT)
# ======== HOJA 1: antes de empezar + paso 1
h=pagina(1,4)
x0=40
h.txt(x0,128,"ANTES DE EMPEZAR",18,800,"#28285E","start",INT)
filas=[("🦺 EPP","Casco, guantes, calzado de seguridad, anteojos."),("🚧 Autorización","Traza liberada y servicios verificados antes de excavar."),("🛠 Herramientas","Pala, barreta, hormigonera, nivel, cinta, varilla para apisonar."),("📦 Materiales","Hormigón H-13 · molde PVC Ø250 (Ø base + 50) · telgopor · caño PVC Ø25,4 de desagüe.")]
y=160
for t1,t2 in filas:
    h.rect(x0,y-22,550,66,"#f7f8fc","#d5d9e6",1,'rx="12"'); h.txt(x0+14,y,t1,15,800,"#0D1424","start",INT)
    for i,w in enumerate(wrap(t2,64)): h.txt(x0+14,y+22+i*18,w,14,500,"#4B5670","start",INT)
    y+=74
h.txt(x0,y+10,"MEDIDAS DEL POZO",18,800,"#28285E","start",INT)
h.tabla(x0,y+26,[(140,"c",False),(140,"c",True),(130,"c",True),(140,"c",True)],[("COLUMNA","POZO","PROFUNDIDAD","MOLDE PVC"),("7 m","0,60 × 0,60","1,20 m","Ø247 → Ø250"),("10 m","0,80 × 0,80","1,30 m","Ø403 → Ø400/450")],rowh=26)
h.txt(x0,y+128,"Hormigón por pozo: 7 m = 0,403 m³ · 10 m = 0,728 m³.",14,600,"#4B5670","start",INT)
# paso 1
X=W/2+18
py=panel(h,X,1,"Marcá y balizá",["Marcá el centro de la columna según el plano de la plaza.","Marcá el cuadrado del pozo: 0,60 × 0,60 m (10 m: 0,80 × 0,80) con el centro en el medio.","Balizá: el pozo nunca queda abierto sin vallar."],ojo="Antes de excavar, verificá que no haya caños ni cables enterrados (traza liberada).",control="Centro marcado y medido desde 2 referencias fijas.")
escena(h,X+165,py+24,.1,1); frente(h)
# marcas en el piso: cuadrado y centro, estacas y cinta
pts=[h.P(A0,A0,0),h.P(A1,A0,0),h.P(A1,A1,0),h.P(A0,A1,0)]
h.a('<polygon points="'+" ".join(f"{p[0]:.1f},{p[1]:.1f}" for p in pts)+'" fill="none" stroke="#fff" stroke-width="2.4" stroke-dasharray="6 3"/>')
cx,cy=h.P(c0,c0,0); h.ln(cx-7,cy,cx+7,cy,"#e11d48",2); h.ln(cx,cy-4,cx,cy+4,"#e11d48",2)
for (x,y) in ((150,150),(1050,150),(1050,1050),(150,1050)):
    a1=h.P(x,y,0); b1=h.P(x,y,420); h.ln(*a1,*b1,"#8a5a2b",3)
for (pa,pb) in (((150,150,360),(1050,150,360)),((1050,150,360),(1050,1050,360)),((1050,1050,360),(150,1050,360)),((150,1050,360),(150,150,360))):
    a1=h.P(*pa); b1=h.P(*pb); h.ln(*a1,*b1,"#e11d48",3,'stroke-dasharray="8 8"'); h.ln(*a1,*b1,"#fff",3,'stroke-dasharray="8 8" stroke-dashoffset="8"')
g(h,1,(c0,c0,0),X+200,py+40,"centro de la columna")
g(h,2,(1050,1050,360),X+200,py+270,"baliza (cinta y estacas)")
# plano: planta con centro y cotas
px,py2=X+338+106,py+150; k=0.22
h.rect(px-300*k,py2-300*k,600*k,600*k,"none",K,1.2,'stroke-dasharray="6 3"')
h.ln(px-90,py2,px+90,py2,K,.5,h.EJE); h.ln(px,py2-90,px,py2+90,K,.5,h.EJE)
h.dimH(py2+300*k+20,px-300*k,px+300*k,"600"); h.dimV(px-300*k-18,py2-300*k,py2+300*k,"600")
h.txt(px,py2+120,"PLANTA · CENTRO = EJE",10,700,K,"middle")
h.guardar("p1.svg")
# ======== HOJA 2: pasos 2 y 3
h=pagina(2,4)
X=40
py=panel(h,X,2,"Excavá a la medida",["7 m: 0,60 × 0,60 m y 1,20 m de profundidad.","10 m: 0,80 × 0,80 m y 1,30 m de profundidad.","Fondo plano y paredes derechas; la tierra a un costado, lejos del borde."],ojo="Pozo abierto siempre balizado. Si la tierra se desmorona, apuntalá antes de bajar.",control="Medí ancho y profundidad con la cinta en 2 lados (foto con la cinta).")
escena(h,X+165,py+24,.1,2); frente(h)
a1=h.P(A0+40,c0,0); b1=h.P(A0+40,c0,-Pz); h.ln(a1[0],a1[1],b1[0],b1[1],"#f2c230",4); h.txt(b1[0]-6,(a1[1]+b1[1])/2,"1,20",12,800,"#5c3a00","end",INT)
g(h,1,(c0,c0,-Pz),X+215,py+275,"fondo plano a 1,20 m")
g(h,2,(A1,c0,-600),X+215,py+40,"paredes derechas")
px,py2=X+338+106,py+40; k=0.15
h.rect(px-300*k,py2+10,600*k,1200*k,"#fff",K,1.4); h.rect(px-300*k-40,py2+10,40,1200*k+8,"url(#EARTH)",K,0); h.rect(px+300*k,py2+10,40,1200*k+8,"url(#EARTH)",K,0)
h.dimH(py2+4,px-300*k,px+300*k,"600"); h.dimV(px+300*k+52,py2+10,py2+10+1200*k,"1200",ext=px+300*k+2)
h.txt(px,py2+1200*k+40,"CORTE DEL POZO (7 m)",10,700,K,"middle")
X=W/2+18
py=panel(h,X,3,"Molde, telgopor y desagüe",["Molde de PVC Ø250 centrado y a plomo: el fondo del molde queda a 1,00 m (deja 0,20 m de hormigón abajo).","Caño PVC Ø25,4 de desagüe, del fondo del molde al fondo del pozo.","Bloque de telgopor contra el molde, del lado de la zanja, con su borde de abajo a 350 mm del fondo del molde: es el paso del cable a la «C»."],ojo="(*) Cómo se sostiene el molde a 0,20 m del fondo y la medida del telgopor: a confirmar con el plano.",control="Molde centrado (medí a las 4 paredes) y vertical (nivel).")
escena(h,X+165,py+24,.1,2)
desague(h); molde(h); telgopor(h)
frente(h)
g(h,1,(c0,c0,120),X+200,py+30,"molde PVC Ø250")
g(h,2,(c0+250,c0,-200),X+200,py+80,"telgopor (lado zanja)")
g(h,3,(c0,c0,-1100),X+200,py+285,"desagüe Ø25,4")
px,py2=X+338+106,py+40; k=0.16
h.rect(px-300*k,py2+10,600*k,1200*k,"#fff",K,1.2); h.rect(px-123*k,py2+10,247*k,1000*k,"#fff",K,1.2)
h.rect(px+123*k,py2+10,(300-123)*k,650*k,"url(#FOAM)",K,.8); h.rect(px-2,py2+10+1000*k,4,200*k,"#fff",K,.8)
h.dimV(px+300*k+16,py2+10+650*k,py2+10+1000*k,"350",ext=px+123*k); h.dimV(px-300*k-14,py2+10+1000*k,py2+10+1200*k,"200")
h.dimH(py2+4,px-123*k,px+123*k,"Ø247")
h.txt(px,py2+1200*k+40,"CORTE: MOLDE Y TELGOPOR",10,700,K,"middle")
h.guardar("p2.svg")
# ======== HOJA 3: pasos 4 y 5
h=pagina(3,4)
X=40
py=panel(h,X,4,"Prepará el hormigón H-13",["Dosaje 1 : 2,5 : 4 (cemento : arena : piedra).","Para un pozo de 7 m (0,403 m³): 2,1 bolsas de cemento, 0,22 m³ de arena gruesa, 0,32 m³ de piedra 6-20 y 69 L de agua.","Mezclá en seco y después agregá el agua de a poco."],ojo="No le agregues agua después de hecho el pastón: pierde resistencia.",control="Pastón parejo, sin grumos, que no chorree.")
# materiales dibujados: bolsas, arena, piedra, agua
bx,by=X+20,py+10
for i in range(3):
    w=60 if i<2 else 18
    h.rect(bx+i*64,by+150,w,80,"#cfc8b8","#8c8473",1.2,'rx="6"'); h.txt(bx+i*64+w/2,by+195,"50kg" if i<2 else "",11,800,"#5a5446","middle",INT)
h.txt(bx+68,by+250,"2,1 bolsas cemento",12,700,"#0D1424","middle",INT)
h.path(f"M{bx+180},{by+230} q50,-90 100,0 z","url(#sand3)","#a8873a",1); h.txt(bx+230,by+250,"0,22 m³ arena",12,700,"#0D1424","middle",INT)
h.path(f"M{bx+40},{by+120} q55,-100 110,0 z","url(#conc3)","#6b7077",1); h.txt(bx+95,by+138,"0,32 m³ piedra 6-20",12,700,"#0D1424","middle",INT)
h.rect(bx+210,by+50,60,70,"#bfe3f7","#2b6c99",1.4,'rx="6"'); h.txt(bx+240,by+90,"69 L",13,800,"#1b4f72","middle",INT); h.txt(bx+240,by+138,"agua",12,700,"#0D1424","middle",INT)
h.tabla(X+346,py+90,[(90,"l",False),(52,"c",True),(60,"c",True)],[("POR","1 m³","POZO 7 m"),("CEMENTO","5,2 b.","2,1 b."),("ARENA","0,55","0,22"),("PIEDRA","0,80","0,32"),("AGUA","170 L","69 L")],rowh=24)
h.txt(X+346,py+235,"m³ salvo que diga otra",9.5,500,G)
X=W/2+18
py=panel(h,X,5,"Hormigoná en capas",["Llená en capas y apisoná cada una con la varilla para sacar el aire.","Que el molde quede centrado y a plomo mientras llenás.","Hasta el nivel del piso; el molde y el telgopor quedan adentro."],ojo="No golpees el molde ni el telgopor: si se corren, la columna no entra o el cable no pasa.",control="Hormigón al ras del piso, molde a plomo, telgopor en su lugar.")
escena(h,X+165,py+24,.1,2)
desague(h); relleno_h(h,-350,True); molde(h); telgopor(h,-650,0)
frente(h)
a1=h.P(A0+60,A0+60,-200); b1=h.P(A0+60,A0+60,500); h.ln(*a1,*b1,"#555",3)
g(h,1,(A0+60,A0+60,300),X+200,py+30,"varilla para apisonar")
g(h,2,(c0+150,A0+100,-350),X+200,py+285,"hormigón en capas")
px,py2=X+338+106,py+40; k=0.16
h.rect(px-300*k,py2+10,600*k,1200*k,"url(#CONC)",K,1.2); h.rect(px-123*k,py2+10,247*k,1000*k,"#fff",K,1.2); h.rect(px+123*k,py2+10,(300-123)*k,650*k,"url(#FOAM)",K,.8)
for i in range(1,5): h.ln(px-300*k,py2+10+i*240*k,px-123*k,py2+10+i*240*k,K,.5,h.OCULTA)
h.txt(px,py2+1200*k+40,"CAPAS APISONADAS",10,700,K,"middle")
h.guardar("p3.svg")
# ======== HOJA 4: paso 6 + así queda
h=pagina(4,4)
X=40
py=panel(h,X,6,"Fraguado 72 h, sacá molde y telgopor",["Esperá mínimo 72 horas antes de montar la columna.","Sacá el molde (se vuelve a usar) y rompé el bloque de telgopor: queda el canal por donde pasa el cable de la zanja a la «C».","Tapá el pozo del molde para que no entre agua ni tierra."],ojo="Antes de las 72 h no se monta: el hormigón todavía no aguanta.",control="Hueco limpio, canal abierto hasta la zanja, desagüe destapado. Foto «Columna» con su N°.")
escena(h,X+165,py+24,.1,2)
relleno_h(h,0)
# hueco del molde y canal abiertos (dibujados encima de la tapa)
pts=[h.P(*p) for p in h.circZ(1,c0,c0,123.5)]
h.a('<polygon points="'+" ".join(f"{x:.1f},{y:.1f}" for x,y in pts)+'" fill="#3b3b3b" stroke="#222" stroke-width=".8"/>')
h.F3([(c0+123,c0-75,1),(A1,c0-75,1),(A1,c0+75,1),(c0+123,c0+75,1)],"#4a4a4a","#222",.8)
frente(h)
g(h,1,(c0,c0,0),X+200,py+30,"hueco del poste (Ø247)")
g(h,2,(c0+250,c0,0),X+200,py+70,"canal del cable (sin telgopor)")
cx,cy=X+60,py+60; h.circ(cx,cy,26,"#fff","#28285E",2.4); h.ln(cx,cy,cx,cy-16,"#28285E",2.4); h.ln(cx,cy,cx+12,cy+6,"#28285E",2.4); h.txt(cx,cy+46,"72 h",15,800,"#28285E","middle",INT)
px,py2=X+338+106,py+150; k=0.22
h.rect(px-300*k,py2-300*k,600*k,600*k,"url(#CONC)",K,1.2); h.circ(px,py2,123.5*k,"#fff",K,1.2); h.rect(px+123*k,py2-75*k,(300-123)*k,150*k,"#fff",K,1)
h.ln(px+300*k+4,py2,px+300*k+30,py2,"#111",2.2); h.txt(px+300*k+4,py2+14,"ZANJA",9.5,700)
h.dimV(px+300*k+20,py2-75*k,py2+75*k,"150 (*)",c=OR)
h.txt(px,py2+120,"PLANTA: HUECO Y CANAL",10,700,K,"middle")
# así queda (columna montada) — referencia al plano completo
X=W/2+18
h.txt(X,128,"ASÍ QUEDA (DESPUÉS DEL MONTAJE)",18,800,"#28285E","start",INT)
h.rect(X,140,550,520,"#f7f8fc","#d5d9e6",1,'rx="12"')
try:
    h.a(f'<image href="ap_tc_003a_3d.png" x="{X+10}" y="150" width="530" height="500" preserveAspectRatio="xMidYMid meet"/>')
except Exception: pass
h.txt(X,686,"Ver el plano completo AP-TC-003-A (cortes, cómputo y materiales).",14,600,"#4B5670","start",INT)
h.txt(X,708,"Sigue: guía «Montaje de columna PRFV y luminaria».",14,600,"#4B5670","start",INT)
h.guardar("p4.svg")
print("ok")
