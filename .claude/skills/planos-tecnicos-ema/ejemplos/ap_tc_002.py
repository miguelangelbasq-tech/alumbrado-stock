import math, sys
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT
h = Hoja()
# ============ CORTE A-A (transversal bajo calzada) · esc 1:10 · k=0.36
k=0.36; X0=190; Y0=150; A=500; P=1000
L,R=X0,X0+A*k; yF=Y0+P*k
h.titulo(40,62,"CORTE A-A (BAJO CALZADA)","ESC. 1:10 - COTAS EN mm - CALLE DE HORMIGON")
# calzada existente a los lados (losa H° 200) y suelo
h.rect(40,Y0,L-40,200*k,"url(#CONC)",K,0); h.rect(R,Y0,440-R,200*k,"url(#CONC)",K,0)
h.rect(40,Y0+200*k,L-40,P*k-200*k+24,"url(#EARTH)",K,0); h.rect(R,Y0+200*k,440-R,P*k-200*k+24,"url(#EARTH)",K,0); h.rect(L,yF,A*k,24,"url(#EARTH)",K,0)
# relleno de la zanja
yHP=yF-150*k; yRep=Y0+200*k
h.rect(L,yHP,A*k,150*k,"url(#CONCP)",K,0)
h.rect(L,yRep,A*k,yHP-yRep,"url(#ANSI37)",K,0)
for z in range(1,int((yHP-yRep)/(200*k))+1):
    y=yRep+z*200*k
    if y<yHP-2: h.ln(L,y,R,y,K,.4,h.OCULTA)
h.rect(L,Y0,A*k,200*k,"url(#CONC)",K,0)
h.ln(L,Y0+200*k,R,Y0+200*k,K,.8)
# caños Ø110 (pared ~3,2 mm dibujada más gruesa para que se lea), c/c 250
cy=yF-75*k; cxs=[(L+R)/2-125*k,(L+R)/2+125*k]
for i,cx in enumerate(cxs):
    h.cano(cx,cy,55*k,49*k)
h.circ(cxs[0],cy,4,"#7b3f1d","#000",.5)   # cable en el de trabajo
h.circ(cxs[1]+6,cy+8,2.2,"#e8d4a0","#7a5a1a",.6)  # cordón guía en el de reserva
# contorno
h.path(f"M40,{Y0} H{L} V{yF} H{R} V{Y0} H440","none",K,1.8); h.ln(40,Y0+200*k,L,Y0+200*k,K,.6); h.ln(R,Y0+200*k,440,Y0+200*k,K,.6)
h.nivel(L-70,Y0,"±0,00 CALZADA")
h.dimV(L-22,Y0,yF,"1000",ext=L-2); h.dimV(L-44,Y0,Y0+200*k,"200",ext=L-24); h.dimV(R+22,yHP,yF,"150",ext=R+2)
h.dimH(Y0-22,L,R,"500",ext=Y0-2); h.dimH(yF+40,cxs[0],cxs[1],"250 (*)",c=OR,ext=cy+20)
gx=410
h.globo("1",R-10,Y0+30,gx,Y0+30); h.globo("2",R-10,yRep+40,gx,yRep+40); h.globo("3",R-8,yHP+12,gx,yHP+6)
h.globo("4",cxs[0],cy-55*k,gx-40,yHP-40); h.globo("5",cxs[1]+40*k*.7,cy-40*k*.7,gx,yHP-12)
# ============ D1 · CÁMARA DE PASO 40x40 (planta y corte)
h.titulo(470,62,"DETALLE D1 - CAMARA DE PASO","S/E - UNA A CADA LADO DEL CRUCE, EN LA VEREDA")
k3=0.3; px,py=500,130
h.rect(px,py,400*k3+30,400*k3+30,"url(#CONC)",K,1); h.rect(px+15,py+15,400*k3,400*k3,"#fff",K,1)
h.rect(px+15+6,py+15+6,400*k3-12,400*k3-12,"none",K,.6,'stroke-dasharray="3 2"')
h.txt(px+15+200*k3,py+15+200*k3+4,"A.P.",13,700,K,"middle")
h.dimH(py-10,px+15,px+15+400*k3,"400"); h.dimV(px-12,py+15,py+15+400*k3,"400")
h.txt(px,py+400*k3+52,"PLANTA: MARCO Y TAPA",10.5); h.txt(px,py+400*k3+67,"DE BRONCE «A.P.»",10.5)
cx0,cy0=690,130
h.rect(cx0,cy0,400*k3+30,520*k3,"url(#CONC)",K,0); h.rect(cx0+15,cy0+10,400*k3,480*k3,"#fff",K,1)
h.rect(cx0+10,cy0,400*k3+10,10,"#c9a64a",K,.8)
h.cano(cx0+15,cy0+400*k3,55*k3,49*k3); h.cano(cx0+15+400*k3,cy0+400*k3,55*k3,49*k3)
h.dimV(cx0+400*k3+48,cy0+10,cy0+10+480*k3,"≤500"); h.txt(cx0,cy0+520*k3+22,"CORTE: ALTURA MAX. 500",10.5); h.txt(cx0,cy0+520*k3+37,"PROF. MAX. 600",10.5)
# ============ CORTE B-B (a lo largo del cruce) · esc 1:50 con corte de calle
h.titulo(40,610,"CORTE B-B (A LO LARGO DEL CRUCE)","ESC. 1:50 - ANCHO DE CALLE VARIABLE")
k2=0.1; y0=680
xv1,xc1,xc2,xv2=70,70+170,70+170+430,70+170+430+170
# superficie: vereda / calzada / vereda
h.rect(xv1,y0-6,xc1-xv1,6,"url(#CONC)",K,.6); h.rect(xc2,y0-6,xv2-xc2,6,"url(#CONC)",K,.6)
h.rect(xc1,y0+4,xc2-xc1,200*k2*1.6,"url(#CONC)",K,.6)
h.rect(xc1-8,y0-10,8,24,"#ddd",K,.8); h.rect(xc2,y0-10,8,24,"#ddd",K,.8)   # cordones
h.rect(xv1,y0,xv2-xv1,1000*k2*1.6+60,"url(#EARTH)",K,0)
h.rect(xc1,y0+4,xc2-xc1,200*k2*1.6,"url(#CONC)",K,.6)
# cámaras
for xx in (xc1-90,xc2+50):
    h.rect(xx,y0-6,40,600*k2*1.6+6,"#fff",K,1.2); h.rect(xx-3,y0-8,46,4,"#c9a64a",K,.6)
# caños: de cámara a cámara, bajan a 1000 bajo la calzada
yv=y0+500*k2*1.6; yc=y0+1000*k2*1.6
for off in (0,5):
    h.path(f"M{xc1-50},{yv+off} L{xc1+20},{yc+off} L{xc2-20},{yc+off} L{xc2+50},{yv+off}","none",K,2.2 if off==0 else 1.2)
# corte de calle (línea de rotura)
mx=(xc1+xc2)/2; h.path(f"M{mx-6},{y0-20} l6,10 l-6,8 l6,10","none",K,.8)
h.dimV(xc1+50,y0,yc,"1000",ext=xc1+20); h.dimV(xc1-120,y0,yv,"500",ext=xc1-90)
h.txt(xv1,y0-16,"VEREDA",10.5,700); h.txt(mx,y0-16,"CALZADA (ANCHO VARIABLE)",10.5,700,K,"middle"); h.txt(xv2,y0-16,"VEREDA",10.5,700,K,"end")
h.txt(xc1-110,y0+600*k2*1.6+30,"CAMARA 40x40",10,400,K,"middle"); h.txt(xc2+70,y0+600*k2*1.6+30,"CAMARA 40x40",10,400,K,"middle")
# ============ cómputo por metro de cruce
h.tabla(470,372,[(150,"l",False),(85,"c",True),(130,"l",False)],
 [("CONCEPTO","CANT./m","CALCULO"),("EXCAVACION","0,500 m³","0,50x1,00"),("REPOSICION H-21","0,100 m³","0,50x0,20"),("RELLENO","0,325 m³","0,50x0,65"),("HORMIGON POBRE","~0,056 m³","0,50x0,15 - caños"),("CAÑO PVC Ø110","2 m","2 caños"),("CAMARAS 40x40","2 u","por cruce")],titulo="COMPUTO POR METRO DE CRUCE")
h.rayados(470,560,[("CONC","HORMIGON H-21"),("ANSI37","RELLENO COMPACTADO"),("CONCP","HORMIGON POBRE"),("EARTH","TERRENO NATURAL"),("ANSI31","PARED DE CAÑO")])
h.notas(40,960,["COTAS EN mm. MANDA LA COTA, NO LA MEDIDA SOBRE EL DIBUJO.",
"2 CAÑOS PVC REFORZADO Ø110 (Ø100 INT.): UNO DE TRABAJO, SELLADO A AMBOS LADOS, Y UNO DE RESERVA CON CORDON GUIA Y TAPA.",
"RELLENO COMPACTADO POR CAPAS DE 200 Y REPOSICION DE LA CALZADA CON H-21 DE 200.",
"SI PASA EL CABLE DE PAT: CONDUCTO PVC Ø50 EXCLUSIVO.",
"(*) EL ITEM 21 DEL ANEXO I DICE «1 CAÑO PVC 160»: NO COINCIDE CON EL PLANO. CERRAR CON LA INSPECCION.",
"(*) SEPARACION 250 ENTRE CAÑOS Y SU ALTURA DENTRO DEL HORMIGON POBRE: CONFIRMAR CON EL PLANO."])
# ============ 3D
h.titulo(890,62,"VISTA 3D EN CORTE - 1 m DE CRUCE","LA CALZADA CORTADA EN ESCALONES PARA VER CADA CAPA")
h.iso(.25,1140,175)
Lz,Az,Pz=1000,500,1000
h.BOX(0,Lz,-420,0,-Pz-90,0,"url(#conc3)","url(#soil3)","url(#soil3)")
h.BOX(0,Lz,-420,0,-200,0,"url(#conc3)","url(#conc3)","url(#conc3)")
h.BOX(0,Lz,0,Az,-Pz-90,-Pz,"#b8946a","url(#soil3)","url(#soil3)")
# caños a lo largo, salen hasta x=Lz
for yy in (Az/2-125,Az/2+125):
    h.tuboX(0,Lz,yy,-Pz+75,55,"url(#pvc)","#555")
    h.poly3(h.circX(Lz,yy,-Pz+75,55),"#d6d9dd","#555",.8); h.poly3(h.circX(Lz,yy,-Pz+75,49),"#2b2b2b","#555",.5)
h.poly3(h.circX(Lz+2,Az/2-125,-Pz+75,14,16),"#7b3f1d","#000",.5)
h.poly3(h.circX(Lz+2,Az/2+125+20,-Pz+60,7,12),"#e8d4a0","#7a5a1a",.5)
h.BOX(0,820,0,Az,-Pz,-Pz+150,"url(#concP3)","url(#concP3)","url(#concP3)")
h.BOX(0,650,0,Az,-Pz+150,-200,"#e9dcc6","#d9c6a6","#d2bd9b")
for z in (-650,-450):
    for pa,pb in (((0,Az,z),(650,Az,z)),((650,0,z),(650,Az,z))):
        a1=h.P(*pa); b1=h.P(*pb); h.ln(*a1,*b1,"#9b8466",.7,h.OCULTA)
h.BOX(0,480,0,Az,-200,0,"url(#conc3)","url(#conc3)","url(#conc3)")
for pa,pb in (((0,0,0),(Lz,0,0)),((0,Az,0),(Lz,Az,0))):
    a1=h.P(*pa); b1=h.P(*pb); h.ln(*a1,*b1,NV,1.4)
GX=1500
h.g3("1",(400,Az*.6,0),GX,230,"REPOSICION H-21")
h.g3("2",(620,Az*.6,-300),GX,300,"RELLENO POR CAPAS")
h.g3("3",(800,Az*.7,-Pz+150),GX,370,"HORMIGON POBRE")
h.g3("4",(Lz,Az/2-125,-Pz+75+40),GX,440,"CAÑO DE TRABAJO")
h.g3("5",(Lz,Az/2+125,-Pz+75+40),GX,510,"CAÑO DE RESERVA")
h.txt(890,712,"Los 2 caños quedan a la vista en la punta: el de trabajo con el cable y el de reserva con el cordón guía.",11.5,400,G,"start",INT)
# lista de materiales
h.tabla(890,760,[(40,"c",False),(460,"l",False),(110,"c",True),(140,"c",False)],
 [("POS.","DESCRIPCION","CANT.","CODIGO"),("1","REPOSICION DE CALZADA H-21, e = 200","0,100 m³/m","A VINCULAR"),("2","RELLENO CON TIERRA DEL LUGAR, POR CAPAS DE 200","0,325 m³/m","-"),("3","HORMIGON POBRE DE ENVOLTURA, e = 150 (DEC. 247D/92)","~0,056 m³/m","A VINCULAR"),("4","CAÑO PVC REFORZADO Ø110 - TRABAJO, SELLADO","1 m/m","A VINCULAR"),("5","CAÑO PVC REFORZADO Ø110 - RESERVA, CORDON GUIA Y TAPA","1 m/m","A VINCULAR"),("6","CAMARA DE PASO 40x40 CON MARCO DE BRONCE «A.P.»","2 u/cruce","A VINCULAR")],
 rowh=22,titulo="LISTA DE MATERIALES",colores=lambda i,j,t: OR if t=="A VINCULAR" else K)
h.rotulo(890,h.H-150,750,"AP-TC-002","CRUCE DE CALZADA","SUBTERRANEO","CAÑOS, CAMARAS, CORTES Y VISTA 3D - CALLE DE HORMIGON","1:10 / 1:50","D1, 3D S/E",fecha="07/11/2026")
h.guardar("ap_tc_002.svg"); print("ok")
