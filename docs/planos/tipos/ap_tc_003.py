import math, sys
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT
h = Hoja()
# Datos: FUNDACIONES.Metálica[7] (a 0,60 · prof 0,90 · emp 0,70 · 0,297 m³) = ficha AP-TC-003
#        COLUMNA_MET[7] (tipo C, Ht 7,70, Ø pie 114) = ficha AP-C-005
#        FICHAS_TEC columna_metalica: ventana 150x76, centro >= 300 bajo piso, caño PVC Ø75 (6004) hasta la zanja
#        ZANJA / AP-TC-001: ancho 200, excavación 750, paquete de arena 150
B=600; P=900; E=700; DC=114; DH=220   # DH: hueco deducido del volumen del cuadro (*)
VW,VH,VC=76,150,300; DCA=75
# ======== CORTE A-A (por el eje y la acometida) · 1:20 · k=0.3
k=0.30; cx=230; Y0=215
L,R=cx-B/2*k,cx+B/2*k; yF=Y0+P*k; yE=Y0+E*k
h.titulo(40,62,"CORTE A-A (POR EL EJE Y LA ACOMETIDA)","ESC. 1:20 - COTAS EN mm - COLUMNA METALICA 7 m (TIPO C)")
ZW=200*k; zz=Y0+750*k
h.rect(40,Y0,L-40,P*k+30,"url(#EARTH)",K,0); h.rect(R+ZW,Y0,470-R-ZW,P*k+30,"url(#EARTH)",K,0)
h.rect(L,yF,B*k,30,"url(#EARTH)",K,0); h.rect(R,zz,ZW,yF+30-zz,"url(#EARTH)",K,0)
# zanja del troncal (AP-TC-001): relleno + paquete de arena 150
h.rect(R,Y0,ZW,750*k-150*k,"url(#ANSI37)",K,.6); h.rect(R,zz-150*k,ZW,150*k,"url(#SAND)",K,.6)
h.rect(R,Y0,ZW,750*k,"none",K,1.2)
# hormigón
h.path(f"M{L},{Y0} V{yF} H{R} V{Y0} Z","url(#CONC)",K,1.6)
# hueco Ø220 (*) con arena hasta el piso
hL,hR=cx-DH/2*k,cx+DH/2*k
h.rect(hL,Y0,DH*k,E*k,"url(#SAND)",OR,1.1)
# escotadura y caño PVC Ø75 de la ventana a la zanja (centro a -300)
yv=Y0+VC*k; cL,cR=cx-DC/2*k,cx+DC/2*k
h.rect(cR,yv-DCA/2*k,R-cR+ZW*.55,DCA*k,"#fff",K,1.1)
h.ln(cR,yv-DCA/2*k+2,R+ZW*.55,yv-DCA/2*k+2,K,.4)
# cable del troncal: entra por la ventana, sale por el caño y baja al fondo de la zanja
h.path(f"M{cx-4},{Y0-40} L{cx-4},{yv} Q{cx+2},{yv+1} {cR+6},{yv} L{R+ZW*.45},{yv} Q{R+ZW*.6},{yv} {R+ZW*.6},{yv+14} L{R+ZW*.6},{zz-60*k}","none",K,2.2)
h.ln(R+ZW*.6-14,zz-60*k,R+ZW*.6+14,zz-60*k,K,2.2)
# columna Ø114 (pared 3,6) hasta el fondo del empotramiento, con la ventana
h.path(f"M{cL},{yE} V{Y0-95} M{cR},{yE} V{yv+VH/2*k} M{cR},{yv-VH/2*k} V{Y0-95}","none",K,1.4)
h.path(f"M{cL+1.1},{yE} V{Y0-95} M{cR-1.1},{yE} V{yv+VH/2*k} M{cR-1.1},{yv-VH/2*k} V{Y0-95}","none",K,.5)
h.ln(cL,yE,cR,yE,K,1.2)
h.path(f"M{cL-5},{Y0-90} l9,-6 l8,8 l9,-6 l8,8 l9,-6","none",K,.8)
h.ln(cx,Y0-110,cx,yF+20,K,.5,h.EJE)
# torta redonda de mortero (*)
h.rect(cx-200*k,Y0-80*k,400*k,80*k,"url(#CONCP)",OR,1)
# línea B-B entre el hueco y la zanja, por el medio del caño
xb=(hR+R)/2
h.ln(xb,Y0-40,xb,yF+12,K,1,h.EJE)
for yy in (Y0-40,yF+12): h.ln(xb-8,yy,xb+8,yy,K,1.8)
h.txt(xb+6,Y0-44,"B",13,700); h.txt(xb+10,yF+16,"B",13,700)
h.path(f"M{L},{Y0} H40 M{R+ZW},{Y0} H470","none",K,1.8)
h.nivel(60,Y0,"±0,00 NPT")
h.dimV(L-24,Y0,yF,"900",ext=L-2); h.dimV(L-48,Y0,yE,"700 EMP.",ext=L-26)
h.dimV(cL-12,yE,yF,"200")
h.dimV(R-12,Y0,yv,"300",ext=None)
h.dimV(R+ZW+46,Y0,zz,"750 (ZANJA)",ext=R+ZW+2)
h.dimH(yF+26,L,R,"600",ext=yF+2); h.dimH(yE+40,hL,hR,"Ø220 (*)",ext=yE+2,c=OR,dy=14)
h.dimH(Y0-60,cL,cR,"Ø114",ext=Y0-34)
h.dimH(yF+56,R,R+ZW,"200",ext=zz+4)
gx=455
h.globo("3",cR,Y0-62,gx,148); h.globo("6",cx+50*k,Y0-12,gx,188,OR)
h.globo("4",hR-3,Y0+90*k,gx,232); h.globo("9",cR-1,yv-VH/2*k+5,gx,272)
h.globo("5",R+12,yv,gx,320); h.globo("1",R-6,Y0+550*k,gx,385); h.globo("2",hR,Y0+620*k,gx,505,OR)
# ======== PLANTA
h.titulo(510,62,"PLANTA","ESC. 1:20 - SIN LA TORTA")
pcx,pcy=640,215; s=0.3
h.rect(pcx-B/2*s,pcy-B/2*s,B*s,B*s,"url(#CONC)",K,1.4)
h.circ(pcx,pcy,DH/2*s,"url(#SAND)",OR,1); h.circ(pcx,pcy,DC/2*s,"#fff",K,1.2); h.circ(pcx,pcy,DC/2*s-1.3,"none",K,.4)
h.rect(pcx+DC/2*s,pcy-DCA/2*s,B/2*s-DC/2*s+ZW*.55,DCA*s,"#fff",K,1)
h.rect(pcx+B/2*s,pcy-B/2*s-30,ZW,B*s+60,"url(#ANSI37)",K,.8)
h.rect(pcx+DC/2*s,pcy-DCA/2*s,B/2*s-DC/2*s+ZW*.55,DCA*s,"#fff",K,1)
h.path(f"M{pcx},{pcy} H{pcx+B/2*s+ZW*.5} Q{pcx+B/2*s+ZW*.6},{pcy} {pcx+B/2*s+ZW*.6},{pcy+8} V{pcy+B/2*s+30}","none",K,2)
h.txt(pcx+B/2*s+ZW+6,pcy+B/2*s+26,"CABLE",9.5,700)
h.txt(pcx+B/2*s+ZW/2,pcy-B/2*s-36,"ZANJA",10,700,K,"middle")
xbp=pcx+(DH/2+B/2)/2*s
h.ln(xbp,pcy-B/2*s-22,xbp,pcy+B/2*s+22,K,1,h.EJE)
for yy in (pcy-B/2*s-22,pcy+B/2*s+22): h.ln(xbp-7,yy,xbp+7,yy,K,1.8)
h.txt(xbp-14,pcy-B/2*s-18,"B",13,700); h.txt(xbp-14,pcy+B/2*s+32,"B",13,700)
h.ln(pcx,pcy-B/2*s-15,pcx,pcy+B/2*s+15,K,.5,h.EJE)
xa1,xa2=pcx-B/2*s-30,pcx+B/2*s+ZW+22
h.ln(xa1,pcy,xa2,pcy,K,.8,h.EJE)
for xx in (xa1,xa2): h.ln(xx,pcy-8,xx,pcy+8,K,1.8); h.txt(xx,pcy-13,"A",13,700,K,"middle")
h.dimH(pcy+B/2*s+24,pcx-B/2*s,pcx+B/2*s,"600",dy=14); h.dimV(pcx-B/2*s-50,pcy-B/2*s,pcy+B/2*s,"600")
h.dimH(pcy+B/2*s+46,pcx+B/2*s,pcx+B/2*s+ZW,"200",dy=14)
# ======== D1 · ventana de entrada
h.titulo(510,395,"D1 - VENTANA","ESC. 1:10 - VISTA DE FRENTE")
kd=0.48; dx,dy0=575,440
cw=DC*kd
h.rect(dx-cw/2,dy0,cw,400*kd,"#fff",K,1.3)
h.ln(dx-cw/2-30,dy0+20,dx+cw/2+30,dy0+20,K,1.4); h.txt(dx+cw/2+33,dy0+24,"NPT",9.5)
yvc=dy0+20+VC*kd
h.rect(dx-VW/2*kd,yvc-VH/2*kd,VW*kd,VH*kd,"#f2f2f2",K,1.1)
h.cano(dx,yvc,DCA/2*kd,DCA/2*kd-3,"#fff"); h.cable(dx,yvc,11,True,False)
h.ln(dx,dy0-8,dx,dy0+400*kd+8,K,.4,h.EJE)
h.dimV(dx-cw/2-14,dy0+20,yvc,"≥300",ext=dx-cw/2-2)
h.dimV(dx+cw/2+16,yvc-VH/2*kd,yvc+VH/2*kd,"150",ext=dx+VW/2*kd+2)
h.dimH(yvc+VH/2*kd+18,dx-VW/2*kd,dx+VW/2*kd,"76",dy=12)
h.globo("9",dx-VW/2*kd,yvc-VH/2*kd+6,dx-70,yvc-34); h.globo("5",dx+DCA/2*kd-2,yvc+6,dx+82,yvc+40)
# ======== D2 · cable en el caño
h.titulo(690,395,"D2 - CABLE","S/E - EN EL CAÑO Ø75")
h.cano(760,520,46,42,"#fff"); h.cable(756,527,30,True,True)
for i,(col,t) in enumerate([("#7b3f1d","L1 MARRON"),("#1a1a1a","L2 NEGRO"),("#c62828","L3 ROJO"),("#4fa3d9","N CELESTE")]):
    h.rect(700+(i%2)*78,590+(i//2)*16,10,10,col,K,.5); h.txt(714+(i%2)*78,599+(i//2)*16,t,9.5)
h.txt(700,640,"SECCION: S/ PROYECTO",9.5,400,G)
# ======== CUADRO DE FUNDACIONES (AP-TC-003)
rows=[("7","C","114","0,60","0,90","0,70","0,297"),("8","D","140","0,60","1,00","0,80","0,330"),("9","E","140","0,60","1,10","0,90","0,358 (*)"),
      ("10","F","140","0,60","1,20","1,00","0,394"),("11","G","168","0,70","1,30","1,10","0,595"),("12","H","168","0,70","1,40","1,20","0,640"),("14","K","168","0,80","1,60","1,40","0,971")]
h.tabla(505,680,[(46,"c",True),(38,"c",False),(44,"c",True),(48,"c",True),(48,"c",True),(48,"c",True),(70,"c",True)],
 [("ALT. m","TIPO","Ø PIE","BASE a","PROF.","EMP.","VOL. H°")]+rows,rowh=20,titulo="CUADRO DE FUNDACIONES H-13 (AP-TC-003)",
 colores=lambda i,j,t: OR if "(*)" in t else K)
h.txt(505,868,"TIPO Y Ø PIE: AP-C-005. 4, 6, 6,5 Y 13 m NO ESTAN EN EL CUADRO.",9.5,400,G)
# ======== CORTE B-B
h.titulo(40,592,"CORTE B-B (POR LA ACOMETIDA)","ESC. 1:20 - MIRANDO HACIA LA COLUMNA")
kb=0.20; bx=200; by=680
bl,br=bx-B/2*kb,bx+B/2*kb; byF=by+P*kb
h.rect(60,by,bl-60,P*kb+14,"url(#EARTH)",K,0); h.rect(br,by,380-br,P*kb+14,"url(#EARTH)",K,0); h.rect(bl,byF,B*kb,14,"url(#EARTH)",K,0)
h.path(f"M{bl},{by} V{byF} H{br} V{by} Z","url(#CONC)",K,1.6)
# detrás del plano de corte: hueco y columna (ocultos)
h.rect(bx-DH/2*kb,by,DH*kb,E*kb,"none",K,.6,h.OCULTA); h.rect(bx-DC/2*kb,by-30,DC*kb,E*kb+30,"none",K,.6,h.OCULTA)
ysb=by+VC*kb
h.cano(bx,ysb,DCA/2*kb+2.5,DCA/2*kb,"#fff"); h.cable(bx,ysb,6.5,True,False)
h.rect(bx-200*kb,by-80*kb,400*kb,80*kb,"url(#CONCP)",OR,1)
h.path(f"M{bl},{by} H60 M{br},{by} H380","none",K,1.6)
h.dimH(by-30,bl,br,"600",ext=by-22); h.dimH(by-42,bx-200*kb,bx+200*kb,"Ø400 (*)",c=OR)
h.dimV(br+20,by,ysb,"300",ext=br+2); h.dimV(br+44,by,byF,"900",ext=br+22); h.dimV(bl-18,by,by+E*kb,"700",ext=bl-2)
h.globo("5",bx+DCA/2*kb,ysb-2,410,ysb-26); h.txt(424,ysb-22,"CAÑO PVC Ø75",10.5)
h.globo("1",br-8,by+140,410,by+140); h.txt(424,by+144,"H° H-13",10.5)
h.globo("6",bx+30,by-6,410,by-10,OR); h.txt(424,by-6,"TORTA (*)",10.5,400,OR)
# ======== cómputo + rayados
h.tabla(40,893,[(150,"l",False),(88,"c",True),(170,"l",False)],
 [("CONCEPTO (7 m)","CANT.","CALCULO"),("HORMIGON H-13","0,297 m³","0,60²x0,90 - π/4x0,22²x0,70"),("CEMENTO","1,54 bolsas","0,297 x 5,2"),("ARENA","0,163 m³","0,297 x 0,55"),("PIEDRA 6-20","0,238 m³","0,297 x 0,80"),("AGUA","51 L","0,297 x 170")],
 rowh=20,titulo="COMPUTO POR FUNDACION (7 m)")
h.rayados(510,905,[("CONC","HORMIGON H-13"),("SAND","ARENA FINA SECA"),("CONCP","TORTA MORTERO (*)"),("ANSI37","RELLENO ZANJA"),("EARTH","TERRENO")],dx=165)
# ======== notas
h.notas(40,1040,["COTAS EN mm. DOSAJE H-13 1:2,5:4 (5,2 BOLSAS, 0,55 m³ ARENA, 0,80 m³ PIEDRA, 170 L AGUA POR m³). VA DENTRO DEL ITEM DE COLUMNA.",
"VENTANA 150x76 CON EL CENTRO A 300 O MAS BAJO EL PISO; CAÑO PVC Ø75 DE LA VENTANA A LA ZANJA (FICHA TECNICA, ETG CORDOBA).",
"(*) HUECO Ø220 NO ACOTADO: SALE DEL CUADRO (a² x PROF - π/4 x 0,22² x EMP DA 7-8-10-11-12-14 m). LA CALCULADORA DICE MOLDE Ø114.",
"(*) 9 m: CON ESA FORMULA DA 0,362 m³; EL CUADRO DICE 0,358. CONFIRMAR CON EL PLANO OFICIAL.",
"(*) TORTA Ø400x80 DIBUJADA POR LOS ~0,01 m³ DE LA CALCULADORA (ITEM 12.05). AP-TC-005 DICE QUE LA COLUMNA NUEVA NO LLEVA BLOQUETE.",
"(*) CAÑO DE PAT Ø25,4 (2 m, AP-TC-005) E HIERRO Ø4,2 (3 m): LA CALCULADORA LOS PONE, LA FICHA NO DICE DONDE VAN. NO SE DIBUJAN."])
# ======== 3D
h.titulo(890,62,"VISTA 3D EN CORTE - FUNDACION COLUMNA METALICA 7 m","CORTADA A UN CUARTO PARA VER EL HUECO, LA ARENA, LA VENTANA Y EL CAÑO A LA ZANJA")
h.iso(.265,1150,270)
c0=300; rh=DH/2; rc=DC/2
h.BOX(0,B,-300,0,-80,0,"url(#grass)","url(#soil3)","url(#soil3)")
h.BOX(-300,0,0,B,-80,0,"url(#grass)","url(#soil3)","url(#soil3)")
# zanja a la derecha (+x), cortada a lo largo: fondo de arena
h.BOX(B,B+200,-300,-240,-760,0,"url(#grass)","url(#soil3)","url(#soil3)")
h.BOX(B,B+200,-240,c0,-750,-600,"url(#sand3)","url(#sand3)","url(#sand3)")
h.BOX(0,B,0,c0,-P,0,"url(#conc3)","url(#conc3)","url(#conc3)")
h.BOX(0,c0,c0,B,-P,0,"url(#conc3)","url(#conc3)","url(#conc3)")
def cara_y(x0,x1,z0,z1,fill): h.F3([(x0,c0,z0),(x1,c0,z0),(x1,c0,z1),(x0,c0,z1)],fill,"#333",.6)
def cara_x(y0,y1,z0,z1,fill): h.F3([(c0,y0,z0),(c0,y1,z0),(c0,y1,z1),(c0,y0,z1)],fill,"#333",.6)
cara_y(c0,B,-P,0,"#dfe2e5"); cara_x(c0,B,-P,0,"#dfe2e5")
for zh in range(-860,0,60):
    a1=h.P(c0,c0,zh); b1=h.P(B,c0,zh+60); h.ln(*a1,*b1,"#a9adb2",.4); a1=h.P(c0,c0,zh); b1=h.P(c0,B,zh+60); h.ln(*a1,*b1,"#a9adb2",.4)
cara_y(c0,c0+rh,-E,0,"url(#sand3)"); cara_x(c0,c0+rh,-E,0,"url(#sand3)")
# caño Ø75 a la zanja a -300 (sobre la cara de corte y = c0)
h.tuboX(c0+rc,B+90,c0,-VC,DCA/2,"url(#pvc)","#555")
h.poly3(h.circX(B+90,c0,-VC,DCA/2),"#d6d9dd","#555",.7)
# cable del troncal: sube del fondo de la zanja, pasa por el caño y entra por la ventana
h.tuboZ(-640,-VC,B+130,c0,11,11,"#1c1c1c","#000")
h.tuboX(c0+rc,B+130,c0,-VC,11,"#1c1c1c","#000")
# columna metálica (acero galvanizado) y torta
h.F3(h.circZ(0,c0,c0,200),"#cfcabf","#8a8577",.8); h.F3(h.circZ(80,c0,c0,200),"url(#concP3)","#8a8577",.8)
h.tuboZ(-E,620,c0,c0,rc,rc,"url(#galv)")
# ventana en la cara +x de la columna
vx=[h.P(c0+rc*.7,c0+rc*.7,z) for z in (-VC-VH/2,-VC+VH/2)]
h.a(f'<rect x="{vx[0][0]-6:.1f}" y="{vx[1][1]:.1f}" width="12" height="{vx[0][1]-vx[1][1]:.1f}" fill="#222" stroke="#000" stroke-width=".5"/>')
GX=1450
h.g3("3",(c0,c0,500),GX,150,"COLUMNA METALICA 7 m")
h.g3("6",(c0+150,c0,80),GX,215,"TORTA DE MORTERO (*)",OR)
h.g3("1",(B*.6,0,-500),GX,280,"HORMIGON H-13")
h.g3("4",(c0,c0+rh*.7,-450),GX,345,"ARENA FINA SECA")
h.g3("2",(c0+rh,c0,-600),GX,410,"HUECO Ø220 / MOLDE (*)",OR)
h.g3("9",(c0+rc*.8,c0+rc*.8,-VC-40),GX,475,"CABLE: ENTRA POR LA VENTANA")
h.g3("5",(B+40,c0,-VC+30),GX,540,"CAÑO PVC Ø75 A LA ZANJA")
h.g3("7",(B+150,0,-650),GX,605,"ZANJA (AP-TC-001)")
# lista de materiales
h.tabla(890,722,[(40,"c",False),(470,"l",False),(110,"c",True),(130,"c",False)],
 [("POS.","DESCRIPCION","CANT.","CODIGO"),("1","HORMIGON H-13 (1:2,5:4)","0,297 m³","8013"),("1.1","  CEMENTO PORTLAND CPN 40/50","1,54 bolsas","8008"),("1.2","  ARENA","0,163 m³","8003"),("1.3","  PIEDRA PARTIDA 6-20","0,238 m³","8022"),
  ("2","MOLDE PVC CENTRAL, SE RETIRA Y SE REUSA (Ø A CONFIRMAR) (*)","1 u","A VINCULAR"),("3","COLUMNA METALICA 7 m, AP-C-005 TIPO C (Ht 7,70 - Ø114)","1 u","6006"),
  ("4","ARENA FINA SECA DE RELLENO, COMPACTADA EN CAPAS","~0,02 m³","8003"),("5","CAÑO PVC Ø75, DE LA VENTANA A LA ZANJA","1 m","6004"),
  ("6","TORTA REDONDA DE MORTERO CEMENTICIO (*)","1 u","A VINCULAR"),("7","CAÑO PVC Ø25,4 (1\") CONDUCTO DE PAT (AP-TC-005) (*)","2 m","5011"),("8","HIERRO LISO Ø4,2 (*)","3 m","8011"),("9","CABLE DEL TRONCAL: ZANJA - CAÑO Ø75 - VENTANA 150x76","S/ CALCULO","SEGUN CALCULO")],
 rowh=22,titulo="LISTA DE MATERIALES (1 FUNDACION 7 m)",colores=lambda i,j,t: OR if (t=="A VINCULAR" or "(*)" in t) else K)
h.rotulo(890,h.H-150,750,"AP-TC-003","FUNDACION DE HORMIGON","PARA COLUMNA METALICA","CORTES, PLANTA, DETALLES, CUADRO 7 A 14 m Y VISTA 3D","1:20 / 1:10","D2, 3D S/E",fecha="07/11/2026")
h.guardar("ap_tc_003.svg"); print("ok")
