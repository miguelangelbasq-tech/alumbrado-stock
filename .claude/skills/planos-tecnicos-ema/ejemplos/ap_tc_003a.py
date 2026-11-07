import math, sys
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT
h = Hoja()
# ======== CORTE A-A (vertical por el eje) · esc 1:20 · k=0.3
k=0.30; cx=250; Y0=200           # Y0 = nivel de piso
B=600; P=1200; E=1000; DM=247; DB=197; DT=187
L,R=cx-B/2*k,cx+B/2*k; yF=Y0+P*k; yE=Y0+E*k
h.titulo(40,62,"CORTE A-A (POR EL EJE)","ESC. 1:20 - COTAS EN mm - POSTE PRFV 7 m")
# terreno + zanja del troncal llegando por la derecha
h.rect(40,Y0,L-40,P*k+30,"url(#EARTH)",K,0); h.rect(R,Y0,460-R,P*k+30,"url(#EARTH)",K,0); h.rect(L,yF,B*k,30,"url(#EARTH)",K,0)
zz=Y0+750*k; h.rect(R,Y0,60*k*0+0,0,"none")
h.rect(R+1,Y0,200*k,750*k,"url(#ANSI37)",K,.6)   # zanja (200 de ancho, 750)
h.rect(R+1,zz-150*k,200*k,150*k,"url(#SAND)",K,.6)
# hormigón
h.path(f"M{L},{Y0} V{yF} H{R} V{Y0} Z","url(#CONC)",K,1.6)
# molde (hueco) Ø247 hasta -1000
mL,mR=cx-DM/2*k,cx+DM/2*k
h.rect(mL,Y0,DM*k,E*k,"#fff",K,1.2)
# poste cónico: Ø197 en la base (-1000), Ø187 en el piso
pL0,pR0=cx-DB/2*k,cx+DB/2*k; pL1,pR1=cx-DT/2*k,cx+DT/2*k
h.path(f"M{pL0},{yE} L{pL1},{Y0-70} L{pR1},{Y0-70} L{pR0},{yE} Z","#fff",K,1.2)
h.path(f"M{pL1-6},{Y0-64} l10,-6 l8,8 l10,-6 l8,8 l10,-6 l8,6","none",K,.8)
h.ln(cx,Y0-90,cx,yF+20,K,.5,h.EJE)
# arena entre poste y molde (hasta -50) y sello (último 50)
for xa,xb_top,xb_bot in ((mL,pL1,pL0),(pR1,mR,mR)):
    pass
h.path(f"M{mL},{Y0+50*k} L{mL},{yE} L{pL0},{yE} L{pL1+(pL0-pL1)*(50/1000)},{Y0+50*k} Z","url(#SAND)",K,.5)
h.path(f"M{mR},{Y0+50*k} L{mR},{yE} L{pR0},{yE} L{pR1+(pR0-pR1)*(50/1000)},{Y0+50*k} Z","url(#SAND)",K,.5)
h.rect(mL,Y0,pL1-mL,50*k,"url(#CONCP)",K,.5); h.rect(pR1,Y0,mR-pR1,50*k,"url(#CONCP)",K,.5)
# telgopor del lado de la zanja: borde de abajo a 350 del fondo del hueco (= -650)
tg=55*k; yT=yE-350*k
h.rect(mR,Y0,tg,yT-Y0,"url(#FOAM)",K,.8)
# entrada «C» del poste a 350 de su base y cable que llega de la zanja
h.rect(pR0-2,yT-14,5,14,"#111",K,.4)
h.path(f"M{R+200*k*0.5},{zz-75*k} C{R-10},{zz-75*k} {mR+tg+10},{yT-10} {pR0},{yT-7}","none","#7b3f1d",2.2)
# desagüe Ø25,4 en el fondo
h.rect(cx-12.7*k*1.6,yE,25.4*k*1.6,P*k-E*k+30,"#fff",K,.8)
h.path(f"M{L},{Y0} H40 M{R},{Y0} H460","none",K,1.8)
h.nivel(60,Y0,"±0,00 NPT")
h.dimV(L-24,Y0,yF,"1200",ext=L-2); h.dimV(L-48,Y0,yE,"1000 EMP.",ext=L-26)
h.dimV(mL+6,yE,yF,"200",ext=None)
h.dimV(pR0+42,yT,yE,"350",ext=pR0+4); h.dimV(R+90,Y0,zz,"750 (ZANJA)",ext=R+64)
h.dimH(yF+24,L,R,"600",ext=yF+2); h.dimH(Y0-24,mL,mR,"Ø247",ext=Y0-2)
h.dimH(yE+34,pL0,pR0,"Ø197",ext=yE+2,dy=14)
gx=420
h.globo("1",L+12,Y0+260*k,gx,170); h.globo("2",mL+6,Y0+420*k,gx,215,K); h.globo("3",pL1+8,Y0+300*k,gx,255)
h.globo("4",mR+tg/2,Y0+250*k,gx,295); h.globo("5",pL1+3,Y0+8*k,gx,135); h.globo("6",cx,yF-10,gx,yF-20); h.globo("7",pR0+1,yT-7,gx,yT-10)
# ======== PLANTA
h.titulo(500,62,"PLANTA","ESC. 1:20")
pcx,pcy=650,230; s=0.3
h.rect(pcx-B/2*s,pcy-B/2*s,B*s,B*s,"url(#CONC)",K,1.4)
h.circ(pcx,pcy,DM/2*s,"url(#SAND)",K,1); h.circ(pcx,pcy,DT/2*s,"#fff",K,1.2)
h.circ(pcx,pcy,DT/2*s-3,"none",K,.4)
h.rect(pcx+DM/2*s,pcy-60*s,tg,120*s,"url(#FOAM)",K,.8)
h.ln(pcx-B/2*s-15,pcy,pcx+B/2*s+15,pcy,K,.5,h.EJE); h.ln(pcx,pcy-B/2*s-15,pcx,pcy+B/2*s+15,K,.5,h.EJE)
h.txt(pcx+B/2*s+8,pcy+22,"ZANJA →",10.5,700)
for xx,lbl in ((pcx-B/2*s-40,"A"),(pcx+B/2*s+60,"A")):
    h.txt(xx,pcy-14,lbl,13,700,K,"middle")
h.ln(pcx-B/2*s-40,pcy-8,pcx-B/2*s-40,pcy+8,K,1.6); h.ln(pcx+B/2*s+60,pcy-8,pcx+B/2*s+60,pcy+8,K,1.6)
h.dimH(pcy+B/2*s+20,pcx-B/2*s,pcx+B/2*s,"600"); h.dimV(pcx-B/2*s-46,pcy-B/2*s,pcy+B/2*s,"600")
# ======== cuadro de fundaciones + cómputo
h.tabla(500,360,[(60,"c",False),(95,"c",True),(60,"c",True),(60,"c",True),(70,"c",True),(55,"c",True)],
 [("POSTE","BASE","PROF.","EMP.","VOL. H°","MOLDE"),("7 m","0,60x0,60","1,20","1,00","0,403","Ø247"),("10 m","0,80x0,80","1,30","1,10","0,728","Ø403")],titulo="CUADRO DE FUNDACIONES (AP-TC-003-A)")
h.txt(500,460,"VOL. = 0,60² x 1,20 - π/12 x 1,00 x (0,197² + 0,197x0,187 + 0,187²) = 0,403 m³",10.5,400,G)
h.tabla(500,490,[(150,"l",False),(90,"c",True),(115,"l",False)],
 [("HORMIGON H-13 (7 m)","CANT.","POR m³"),("HORMIGON","0,403 m³","-"),("CEMENTO","2,1 bolsas","5,2 bolsas"),("ARENA","0,22 m³","0,55 m³"),("PIEDRA","0,32 m³","0,80 m³"),("AGUA","69 L","170 L")],titulo="COMPUTO POR FUNDACION")
h.rayados(500,690,[("CONC","HORMIGON H-13"),("SAND","ARENA FINA SECA"),("CONCP","SELLO (*)"),("FOAM","TELGOPOR"),("EARTH","TERRENO"),("ANSI37","RELLENO ZANJA")])
# ======== notas
h.notas(40,880,["COTAS EN mm. DOSIFICACION H-13 1:2,5:4 (5,2 BOLSAS, 0,55 m³ ARENA, 0,80 m³ PIEDRA, 170 L AGUA POR m³).",
"EL POSTE ES CONICO (10 mm/m): Ø197 EN LA BASE, ~Ø187 AL NIVEL DEL PISO. EN PRFV NO VA TORTA, SOLO SELLADO DE BASE.",
"TELGOPOR CONTRA EL MOLDE, DEL LADO DE LA ZANJA, CON SU BORDE DE ABAJO A 350 DEL FONDO DEL HUECO: PASO DEL CABLE A LA ENTRADA «C».",
"ARENA FINA SECA COMPACTADA EN CAPAS HASTA 50 BAJO EL PISO; LOS ULTIMOS 50, SELLO. FRAGUADO 72 h ANTES DEL IZAJE.",
"(*) EL DIBUJO DICE «MORTERO» Y LA NOTA «SELLO DE HORMIGON»: CONFIRMAR CUAL. CLAUDE.md DICE 0,4057 m³: VALE 0,403 (VERIFICADO).",
"(*) ESPESOR Y ANCHO DEL TELGOPOR: NO ESTAN ACOTADOS EN LA FICHA, CONFIRMAR CON EL PLANO."])
# ======== 3D
h.titulo(890,62,"VISTA 3D EN CORTE - FUNDACION PRFV 7 m","CORTADA A UN CUARTO PARA VER EL MOLDE, EL POSTE, LA ARENA Y EL TELGOPOR")
h.iso(.27,1190,290)
Bz,Pz,Ez=600,1200,1000; c0=300; rm=DM/2; rp0=DB/2; rp1=DT/2
# piso alrededor (atrás)
h.BOX(0,Bz,-260,0,-80,0,"url(#grass)","url(#soil3)","url(#soil3)")
h.BOX(-260,0,0,Bz,-80,0,"url(#grass)","url(#soil3)","url(#soil3)")
# bloque con un cuarto quitado (x>300, y>300)
h.BOX(0,Bz,0,c0,-Pz,0,"url(#conc3)","url(#conc3)","url(#conc3)")
h.BOX(0,c0,c0,Bz,-Pz,0,"url(#conc3)","url(#conc3)","url(#conc3)")
# en las caras de corte: hueco del molde con arena, sello y poste
def cara_y(x0,x1,z0,z1,fill):   # sobre la cara y=c0
    h.F3([(x0,c0,z0),(x1,c0,z0),(x1,c0,z1),(x0,c0,z1)],fill,"#333",.6)
def cara_x(y0,y1,z0,z1,fill):   # sobre la cara x=c0
    h.F3([(c0,y0,z0),(c0,y1,z0),(c0,y1,z1),(c0,y0,z1)],fill,"#333",.6)
cara_y(c0,Bz,-Pz,0,"#dfe2e5"); cara_x(c0,Bz,-Pz,0,"#dfe2e5")
for zh in range(-1150,0,60):
    a1=h.P(c0,c0,zh); b1=h.P(Bz,c0,zh+60); h.ln(*a1,*b1,"#a9adb2",.4); a1=h.P(c0,c0,zh); b1=h.P(c0,Bz,zh+60); h.ln(*a1,*b1,"#a9adb2",.4)
cara_y(c0,c0+rm,-Ez,0,"url(#sand3)"); cara_x(c0,c0+rm,-Ez,0,"url(#sand3)")
cara_y(c0,c0+rm,-50,0,"url(#concP3)"); cara_x(c0,c0+rm,-50,0,"url(#concP3)")
# telgopor del lado de la zanja (+x), borde de abajo a -650
cara_y(c0+rm,c0+rm+60,-650,0,"#f4f4f4")
for z in range(-620,0,40):
    a1=h.P(c0+rm,c0,z); b1=h.P(c0+rm+60,c0,z); h.ln(*a1,*b1,"#bbb",.5)
# canal del cable al borde exterior (+x) a la altura de la entrada «C»
cara_y(c0+rm+60,Bz,-700,-650,"#7b5a3a")
# desagüe
cara_y(c0,c0+13,-Pz,-Ez,"#fff"); cara_x(c0,c0+13,-Pz,-Ez,"#fff")
# poste (cono) entero arriba y su mitad en el corte
h.tuboZ(-Ez,500,c0,c0,rp0,rp1-6)
GX=1500
h.g3("1",(Bz*.6,0,-600),GX,230,"HORMIGON H-13")
h.g3("2",(c0,c0+rm*.9,-600),GX,300,"MOLDE PVC Ø247")
h.g3("3",(c0,c0+rm*.75,-400),GX,370,"ARENA FINA SECA")
h.g3("4",(c0+rm+30,c0,-300),GX,440,"TELGOPOR (PASO CABLE)")
h.g3("5",(c0+rm*.8,c0,-25),GX,510,"SELLO (*)")
h.g3("6",(c0+6,c0,-Pz+100),GX,580,"DESAGUE PVC Ø25,4")
h.g3("7",(c0,c0,420),GX,160,"POSTE PRFV 7 m (SIGUE)")
# lista de materiales
h.tabla(890,780,[(40,"c",False),(460,"l",False),(110,"c",True),(140,"c",False)],
 [("POS.","DESCRIPCION","CANT.","CODIGO"),("1","HORMIGON H-13 (1:2,5:4)","0,403 m³","-"),("2","MOLDE CAÑO PVC Ø250 COMERCIAL (Ø base + 50 = 247)","1 m","A VINCULAR"),("3","ARENA FINA SECA, COMPACTADA EN CAPAS","~0,018 m³","A VINCULAR"),("4","TELGOPOR, DEL LADO DE LA ZANJA (*)","1 u","A VINCULAR"),("5","SELLO DE BASE, 50 mm (*)","-","A VINCULAR"),("6","CAÑO PVC Ø25,4 DE DESAGUE","0,2 m","A VINCULAR"),("7","POSTE PRFV 7 m (AP-C-033-A)","1 u","SEGUN PAÑOL")],
 rowh=22,titulo="LISTA DE MATERIALES (1 FUNDACION)",colores=lambda i,j,t: OR if t=="A VINCULAR" else K)
h.rotulo(890,h.H-150,750,"AP-TC-003-A","FUNDACION DE HORMIGON","PARA POSTE PRFV 7 m","CORTE, PLANTA, CUADRO, COMPUTO Y VISTA 3D","1:20","3D S/E",fecha="07/11/2026")
h.guardar("ap_tc_003a.svg"); print("ok")
