import math, sys
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT
h = Hoja()
# Datos: CRUCE_TUNELERA (mecha 220, caño 110, 2 caños, pozos 2,00 x 1,50 x 1,50, 2 pozos) = ficha AP-TC-022
#        CRUCE_AP_TC_002 (cámaras 40x40 h<=50 prof<=60, tapada calzada 1,00) · calculadora (cómputo del cruce con tunelera)
MECHA,CA,PL,PA,PP=220,110,2000,1500,1500
TAP=1000; ZAX=1200          # tapada de AP-TC-002 / eje de la perforación (*)
def pipe(d,w,st=K): h.path(d,"none",st,w+2.2,'stroke-linejoin="round"'); h.path(d,"none","#fff",w,'stroke-linejoin="round"')
def rotura(x,y0,y1): h.path(f"M{x},{y0} V{(y0+y1)/2-8} l-6,5 l12,6 l-6,5 V{y1}","none",K,.8)
# ============ CORTE A-A (a lo largo del cruce, estado final) · 1:50
k=0.075; X0=60; Y0=165
VE,CZ=600,4000              # vereda dibujada y calzada dibujada (ancho real variable)
xs=[0,VE,VE+PL,VE+PL+CZ,VE+2*PL+CZ,2*VE+2*PL+CZ]
X=lambda mm: X0+mm*k; Z=lambda mm: Y0+mm*k
h.titulo(40,62,"CORTE A-A (A LO LARGO DEL CRUCE, TERMINADO)","ESC. 1:50 - COTAS EN mm - LA CALZADA NO SE ROMPE; ANCHO DE CALLE VARIABLE")
h.rect(X(0),Y0,X(xs[5])-X(0),1900*k,"url(#EARTH)",K,0)
for a,b in ((xs[1],xs[2]),(xs[3],xs[4])): h.rect(X(a),Y0+100*k,(b-a)*k,(PP-100)*k,"url(#ANSI37)",K,0)
h.rect(X(xs[2]),Y0,(xs[3]-xs[2])*k,200*k,"url(#CONC)",K,.8)
for a,b in ((xs[0],xs[2]),(xs[3],xs[5])): h.rect(X(a),Y0-100*k,(b-a)*k,100*k,"url(#CONCP)",K,.8)
for a,b in ((xs[1],xs[2]),(xs[3],xs[4])): h.rect(X(a),Y0-100*k,(b-a)*k,PP*k,"none",K,.8,h.OCULTA)
for xc in (xs[2],xs[3]): h.rect(X(xc)-(6 if xc==xs[2] else 0),Y0-14,6,24,"#ddd",K,.8)
# perforación Ø220 bajo la calzada
yh0,yh1=Z(ZAX-MECHA/2),Z(ZAX+MECHA/2)
h.rect(X(xs[2]),yh0,(xs[3]-xs[2])*k,MECHA*k,"#fff",K,1)
# cámaras 40x40 (AP-TC-002) a cada lado y caños de cámara a cámara
cams=[xs[1]+400,xs[4]-400]
for xc in cams:
    h.rect(X(xc)-200*k,Y0-100*k,400*k,600*k,"#fff",K,1.2); h.rect(X(xc)-200*k-2,Y0-100*k-3,400*k+4,3,"#c9a64a",K,.6)
yc=Z(ZAX); yb=Z(500)
d=f"M{X(cams[0])+200*k},{yb-4*k*0+0} C{X(cams[0])+900*k},{yb} {X(xs[2])-500*k},{yc} {X(xs[2])},{yc} H{X(xs[3])} C{X(xs[3])+500*k},{yc} {X(cams[1])-900*k},{yb} {X(cams[1])-200*k},{yb}"
pipe(d,CA*k+1.2)
h.path(d,"none",K,1.3)                          # cable en el caño de trabajo
h.path(f"M{X(cams[0])+200*k},{yb} H{X(cams[0])} V{Z(650)} H{X(0)}","none",K,1.3)   # el cable sigue a la zanja del troncal
h.path(f"M{X(cams[1])-200*k},{yb} H{X(cams[1])} V{Z(650)} H{X(xs[5])}","none",K,1.3)
# malla de advertencia en los pozos (*)
for a,b in ((xs[1],xs[2]),(xs[3],xs[4])): h.ln(X(a)+4,Z(800),X(b)-4,Z(800),K,1.4,h.MALLA)
mx=X((xs[2]+xs[3])/2); rotura(mx,Y0-24,Y0+1920*k)
h.txt(X(VE/2),Y0-20,"VEREDA",10,700,K,"middle"); h.txt(X(xs[5]-VE/2),Y0-20,"VEREDA",10,700,K,"middle")
h.txt(mx-20,Y0-20,"CALZADA (SIN ROMPER)",10,700,K,"end")
h.txt(X(0)+2,Z(650)-4,"ZANJA",9,700); h.txt(X(xs[5])-2,Z(650)-4,"ZANJA",9,700,K,"end")
h.nivel(X(xs[2])+40,Y0,"±0,00")
h.dimV(X(xs[2])+22,Y0,yh0,"1000 MIN.",ext=None); h.dimV(X(xs[3])-24,Y0,yc,"1200 (*)",c=OR)
h.dimV(X(xs[4])+14,Y0-100*k,Y0+(PP-100)*k,"1500",ext=X(xs[4])+2)
h.dimH(Y0+1900*k+18,X(xs[1]),X(xs[2]),"2000 POZO",ext=Y0+(PP-100)*k+2,dy=14); h.dimH(Y0+1900*k+18,X(xs[3]),X(xs[4]),"2000 POZO",ext=Y0+(PP-100)*k+2,dy=14)
h.dimH(Y0+1900*k+18,X(xs[2]),X(xs[3]),"L = ANCHO DE CALLE (VARIABLE)",dy=14)
h.dimV(X(cams[0])-26,Y0-100*k,Y0+500*k,"≤600",ext=X(cams[0])-200*k-2)
gy=Y0-48
h.globo("11",X(cams[0]),Y0-100*k,X(cams[0])-40,gy); h.globo("2",X(xs[2])+60,yc,X(xs[2])+60+0,Y0+1900*k+46)
h.globo("10",X(xs[1])+300*k,Z(800),X(xs[1])+10,Y0+1900*k+46); h.globo("9",X(xs[3])+700*k,Z(300),X(xs[3])+130,gy)
h.globo("12",X(cams[1])+120*k,Y0-100*k-2,X(cams[1])+40,gy); h.globo("1",X(xs[3])-120,yh1,X(xs[3])-100,Y0+1900*k+46)
h.globo("13",X(xs[4])+300*k,Y0-60*k,X(xs[4])+80,gy)
# ============ PLANTA
k2=0.075; py=490
h.titulo(40,392,"PLANTA","ESC. 1:50")
CW=2000     # ancho de faja dibujado
yT,yB=py-CW/2*k2,py+CW/2*k2
h.rect(X(xs[2]),yT,(xs[3]-xs[2])*k2,yB-yT,"#f4f4f4",K,0)
h.ln(X(xs[2]),yT,X(xs[2]),yB,K,1.4); h.ln(X(xs[3]),yT,X(xs[3]),yB,K,1.4)
for a,b in ((xs[1],xs[2]),(xs[3],xs[4])): h.rect(X(a),py-PA/2*k2,PL*k2,PA*k2,"url(#ANSI37)",K,1.1,h.OCULTA)
# perforación y caños
h.rect(X(xs[2]),py-MECHA/2*k2,(xs[3]-xs[2])*k2,MECHA*k2,"none",K,.8,h.OCULTA)
for dy in (-CA/2,CA/2): h.ln(X(cams[0]),py+dy*k2,X(cams[1]),py+dy*k2,K,1.6)
for xc in cams: h.rect(X(xc)-200*k2,py-200*k2,400*k2,400*k2,"#fff",K,1.2); h.rect(X(xc)-170*k2,py-170*k2,340*k2,340*k2,"none",K,.5)
h.ln(X(0),py-CA/2*k2,X(cams[0])-200*k2,py-CA/2*k2,K,1.4,h.OCULTA); h.ln(X(cams[1])+200*k2,py-CA/2*k2,X(xs[5]),py-CA/2*k2,K,1.4,h.OCULTA)
h.txt(X(0)+2,py-14,"ZANJA",9,700); h.txt(X(xs[5])-2,py-14,"ZANJA",9,700,K,"end")
rotura(mx,yT-10,yB+10)
xa1,xa2=X(0)-10,X(xs[5])+12
h.ln(xa1,py-8,xa1,py+8,K,1.8); h.ln(xa2,py-8,xa2,py+8,K,1.8); h.txt(xa1-10,py+5,"A",13,700,K,"end"); h.txt(xa2+10,py+5,"A",13,700)
h.ln(xa1,py,X(0),py,K,.6,h.EJE); h.ln(X(xs[5]),py,xa2,py,K,.6,h.EJE)
xbb=X(xs[2])+700*k2
h.ln(xbb,yT-8,xbb,yB+8,K,1,h.EJE)
for yy in (yT-8,yB+8): h.ln(xbb-7,yy,xbb+7,yy,K,1.8)
h.txt(xbb+6,yT-8,"B",13,700); h.txt(xbb+6,yB+18,"B",13,700)
h.dimV(X(xs[1])-14,py-PA/2*k2,py+PA/2*k2,"1500",ext=X(xs[1])-2); h.dimH(py-PA/2*k2-10,X(xs[3]),X(xs[4]),"2000")
h.txt(X(xs[2])+8,yT+14,"CORDON",9); h.txt(mx+14,yT+14,"CALZADA",9,700); h.txt(X(xs[1])+6,yB-6,"POZO DE ATAQUE",9,700); h.txt(X(xs[4])-6,yB-6,"POZO DE ATAQUE",9,700,K,"end")
# ============ CORTE B-B (bajo la calzada) · 1:25
kb=0.12; bx=170; by=650
h.titulo(40,590,"CORTE B-B (BAJO LA CALZADA)","ESC. 1:25")
h.rect(50,by,250,1450*kb,"url(#EARTH)",K,0); h.rect(50,by,250,200*kb,"url(#CONC)",K,.8); h.ln(50,by,300,by,K,1.8)
bcy=by+ZAX*kb
h.circ(bx,bcy,MECHA/2*kb,"#fff",K,1)
for dx in (-CA/2,CA/2): h.cano(bx+dx*kb,bcy,CA/2*kb,(CA/2-3.2)*kb*.9,"#fff")
h.circ(bx-CA/2*kb,bcy,3.2,K,K,0); h.circ(bx+CA/2*kb+2,bcy+3,1.2,K,K,0)
h.dimV(bx+70,by,bcy-MECHA/2*kb,"1000 MIN.",ext=bx+4); h.dimV(bx+96,by,bcy,"1200 (*)",ext=bx+40,c=OR); h.dimV(66,by,by+200*kb,"200 (*)",c=OR)
h.globo("2",bx-CA/2*kb-2,bcy,bx-90,bcy-30); h.globo("3",bx+CA/2*kb+2,bcy,bx+40,bcy+26)
h.txt(bx+104,by-6,"CALZADA EXISTENTE",9,400,G)
# ============ D1 · mecha Ø220
h.titulo(330,590,"D1 - MECHA","S/E - TUNELERA EN SECO, DESDE EL POZO")
mx0,my0,ml=350,715,190; mr=MECHA/2*.45
h.rect(mx0+ml,my0-6,60,12,"url(#cyl)",K,.6)
h.ln(mx0,my0,mx0+ml,my0,K,1.6)
n=9
for i in range(n):
    x=mx0+i*ml/n
    h.path(f"M{x},{my0-mr} C{x+ml/n*.6},{my0-mr*.3} {x+ml/n*.4},{my0+mr*.3} {x+ml/n},{my0+mr}","none",K,1.1)
    h.ln(x+ml/n,my0+mr,x+ml/n,my0-mr,K,.3)
h.path(f"M{mx0},{my0-12} L{mx0-14},{my0} L{mx0},{my0+12}","none",K,1.2)
h.dimV(mx0+ml+76,my0-mr,my0+mr,"Ø220",ext=mx0+ml-4)
h.txt(mx0+ml+60,my0+22,"← TUNELERA",9.5,700,K,"end")
h.globo("1",mx0+60,my0-mr,mx0+30,my0-mr-22)
h.txt(330,my0+mr+26,"PERFORA DE UN POZO AL OTRO SIN ROMPER",9.5); h.txt(330,my0+mr+40,"LA CALZADA; DESPUES SE PASAN LOS CAÑOS.",9.5)
# ============ D2 · el hueco Ø220 con los 2 caños
h.titulo(600,590,"D2 - HUECO Y CAÑOS","ESC. 1:5 - TRABAJO + RESERVA")
dk=0.62; dcx,dcy=700,728
h.circ(dcx,dcy,MECHA/2*dk,"url(#EARTH)",K,0); h.circ(dcx,dcy,MECHA/2*dk,"#fff",K,1.3)
for dx in (-CA/2,CA/2): h.cano(dcx+dx*dk,dcy,CA/2*dk,(CA/2-3.2)*dk,"#fff")
h.cable(dcx-CA/2*dk,dcy+6,17,True,True)
h.circ(dcx+CA/2*dk+8,dcy+22,4,"#e8d4a0","#7a5a1a",.8)
h.dimH(dcy-MECHA/2*dk-14,dcx-MECHA/2*dk,dcx+MECHA/2*dk,"Ø220 (MECHA)",dy=-4)
h.dimH(dcy+MECHA/2*dk+14,dcx-CA*dk,dcx,"110",dy=12); h.dimH(dcy+MECHA/2*dk+14,dcx,dcx+CA*dk,"110",dy=12)
h.globo("2",dcx-CA/2*dk-30,dcy-20,dcx-115,dcy-40); h.globo("4",dcx-CA/2*dk,dcy+6,dcx-115,dcy+24)
h.globo("3",dcx+CA/2*dk+28,dcy-20,dcx+115,dcy-40); h.globo("5",dcx+CA/2*dk+8,dcy+22,dcx+115,dcy+24)
h.txt(dcx,dcy+MECHA/2*dk+40,"2 x 110 = 220: SIN HUELGO (*)",10,700,OR,"middle")
# ============ CÓMPUTO
h.tabla(40,846,[(190,"l",False),(90,"c",True),(215,"l",False)],
 [("CONCEPTO","CANT.","CALCULO (EJ. L = 8,00 m (*))"),("PERFORACION Ø220","8,00 m","L"),("CAÑO PVC Ø110","16,00 m","2 x L"),
  ("EXCAVACION POZOS","9,00 m³","2 x 2,00 x 1,50 x 1,50"),("RELLENO POR CAPAS DE 200","9,00 m³","= excavación"),
  ("CORDON GUIA (RESERVA)","8,00 m","L"),("TAPA Ø110 / MASILLA","2 + 2 u","2 bocas c/u"),("CAMARA 40x40 + MARCO","2 + 2 u","1 por lado"),
  ("MALLA DE ADVERTENCIA","4,20 m","2,00 x 2 x 1,05"),("REPOSICION VEREDA","6,00 m²","2,00 x 1,50 x 2")],rowh=18,titulo="COMPUTO POR CRUCE")
h.rayados(560,862,[("CONC","CALZADA (*)"),("CONCP","VEREDA"),("ANSI37","RELLENO POZO"),("EARTH","TERRENO"),("ANSI31","PARED DE CAÑO")],dx=140,malla=True)
# ============ NOTAS
h.notas(40,1060-14,["COTAS EN mm. POZOS DE ATAQUE 2,00 x 1,50 x 1,50 A CADA LADO; RELLENO POR CAPAS DE 200 Y VEREDA EN 48 h.",
"2 CAÑOS PVC Ø110: TRABAJO (CON EL CABLE, BOCAS SELLADAS) Y RESERVA (CORDON GUIA Y TAPA). CAMARAS 40x40 COMO AP-TC-002.",
"(*) ITEM 21 (TUNELERA) DICE «1 CAÑO PVC Ø160» Y LOS POZOS NO LOS NOMBRA: CERRAR CON LA INSPECCION.",
"(*) MECHA Ø220 Y 2 CAÑOS Ø110: ENTRAN JUSTOS (220). ¿VA ASI O 1 Ø160? EJE A 1200, CALZADA 200 Y MALLA: A CONFIRMAR.",
"(*) SI CRUZA EL CABLE DE PAT: CONDUCTO PVC Ø50 EXCLUSIVO (5009), NO DIBUJADO."])
# ============ 3D
h.titulo(890,62,"VISTA 3D EN CORTE - CRUCE CON TUNELERA","UN POZO TAPADO CON SU CAMARA, LA CALLE SIN ROMPER Y EL OTRO POZO ABIERTO CON LOS CAÑOS")
h.iso(.060,950,175)
Y1=-1700; YC=200; ZB=-1900
x0,x1,x2,x3=0,2000,5000,7000
# pozo izquierdo (tapado) + vereda
h.BOX(x0,x1,Y1,YC,ZB,-100,"url(#soil3)","url(#soil3)","url(#soil3)")
h.BOX(x0,x1,Y1,YC,-100,0,"url(#concP3)","url(#concP3)","url(#concP3)")
# calzada
h.BOX(x1,x2,Y1,YC,ZB,-200,"url(#soil3)","url(#soil3)","url(#soil3)")
h.BOX(x1,x2,Y1,YC,-200,0,"url(#asph3)","url(#asph3)","url(#asph3)")
# perforación (oculta) sobre la cara de corte de la calle
for z in (-ZAX+110,-ZAX-110): a1=h.P(x1,YC,z); b1=h.P(x2,YC,z); h.ln(*a1,*b1,"#2b1d10",1,h.OCULTA)
# pozo derecho abierto: fondo y pared del fondo
h.BOX(x2,x3,-750,YC,ZB,-PP,"#b08f66","url(#soil3)","url(#soil3)")
h.BOX(x2,x3,Y1,-750,ZB,-100,"url(#soil3)","url(#soil3)","url(#soil3)")
h.BOX(x2,x3,Y1,-750,-100,0,"url(#concP3)","url(#concP3)","url(#concP3)")
# boca de la perforación en la pared del pozo (x = x2) y los 2 caños asomando
h.poly3(h.circX(x2,0,-ZAX,MECHA/2),"#3b2a18","#000",.6)
for yy,f in ((-55,"url(#pvc)"),(55,"url(#pvc)")):
    h.tuboX(x2,x2+450,yy,-ZAX,CA/2,f,"#555"); h.poly3(h.circX(x2+450,yy,-ZAX,CA/2),"#d6d9dd","#555",.6)
h.poly3(h.circX(x2+452,-55,-ZAX,CA/2-6),"#2b2b2b","#555",.4); h.poly3(h.circX(x2+452,55,-ZAX,CA/2-6),"#2b2b2b","#555",.4)
h.tuboX(x2+450,x2+1100,-55,-ZAX,22,"#1c1c1c","#000")          # cable que sigue
h.poly3(h.circX(x2+454,55,-ZAX+10,8,10),"#e8d4a0","#7a5a1a",.4)   # cordón guía en la reserva
h.poly3(h.circX(x2+456,55,-ZAX-25,30),"#f2f2f2","#555",.5)       # tapa de la reserva
# cámara 40x40 con marco de bronce en el pozo tapado
h.BOX(1400,1800,-200,YC,-600,0,"#fff","#efefef","#efefef","#555",.6)
h.F3([(1380,-220,2),(1820,-220,2),(1820,YC,2),(1380,YC,2)],"url(#bronce)","#6b4a12",.8)
h.F3([(1420,-180,4),(1780,-180,4),(1780,YC-20,4),(1420,YC-20,4)],"url(#bronce)","#6b4a12",.5)
GX=1430
h.g3("13",(500,YC,-50),GX,130,"VEREDA REPUESTA")
h.g3("12",(1600,0,4),GX,175,"MARCO Y TAPA «A.P.»")
h.g3("11",(1600,YC,-400),GX,220,"CAMARA 40x40")
h.g3("9",(1000,YC,-1000),GX,265,"POZO RELLENO POR CAPAS")
h.g3("1",(3500,YC,-ZAX),GX,310,"PERFORACION Ø220 (OCULTA)")
h.g3("2",(x2+300,-55,-ZAX+40),GX,355,"CAÑO Ø110 DE TRABAJO")
h.g3("3",(x2+400,55,-ZAX+40),GX,400,"CAÑO Ø110 DE RESERVA")
h.g3("4",(x2+900,-55,-ZAX+20),GX,445,"CABLE (SIGUE A LA ZANJA)")
h.g3("8",(6200,-700,-1200),GX,490,"POZO DE ATAQUE ABIERTO")
h.txt(890,548,"Calzada de asfalto solo de ejemplo: el cruce es igual con hormigón.",10.5,400,G,"start",INT)
# ============ LISTA
L=[("POS.","DESCRIPCION","CANT. (L=8 m)","CODIGO"),
("1","PERFORACION CON TUNELERA EN SECO, MECHA Ø220","8,00 m","-"),
("2","CAÑO PVC REFORZADO Ø110 (Ø100 INT.) - TRABAJO","8,00 m","5007"),
("3","CAÑO PVC REFORZADO Ø110 (Ø100 INT.) - RESERVA","8,00 m","5007"),
("4","CABLE DEL TRONCAL (POR EL CAÑO DE TRABAJO)","S/ CALCULO","SEGUN CALCULO"),
("5","CORDON GUIA DE NYLON Ø10 (EN LA RESERVA)","8,00 m","5014"),
("6","TAPA DE CIERRE Ø110 (2 BOCAS DE LA RESERVA)","2 u","5030"),
("7","MASILLA / ESPUMA DE OBTURACION (2 BOCAS DE TRABAJO)","2 u","5017"),
("8","EXCAVACION DE 2 POZOS DE ATAQUE 2,00x1,50x1,50","9,00 m³","-"),
("9","RELLENO Y COMPACTACION POR CAPAS DE 200","9,00 m³","-"),
("10","MALLA DE ADVERTENCIA SOBRE EL TENDIDO EN LOS POZOS","4,20 m","8017"),
("11","CAMARA DE PASO PVC 40x40 (UNA POR LADO)","2 u","5003"),
("12","MARCO DE BRONCE CON TAPA «A.P.»","2 u","5016"),
("13","REPOSICION DE VEREDA EN LOS POZOS (48 h)","6,00 m²","8004"),
("14","CONDUCTO PVC Ø50 EXCLUSIVO PAT (SOLO SI CRUZA)","8,00 m","5009")]
h.tabla(890,590,[(40,"c",False),(470,"l",False),(110,"c",True),(130,"c",False)],L,rowh=21,titulo="LISTA DE MATERIALES (1 CRUCE, EJEMPLO L = 8,00 m)")
h.rotulo(890,h.H-150,750,"AP-TC-022","CRUCE DE CALZADA","CON TUNELERA EN SECO","POZOS DE ATAQUE, MECHA Ø220, 2 CAÑOS Ø110 - ITEM 21","1:50 / 1:25","D2 1:5, 3D S/E",fecha="07/11/2026")
h.guardar("ap_tc_022.svg"); print("ok")
