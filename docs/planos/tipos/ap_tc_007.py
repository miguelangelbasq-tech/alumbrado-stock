import math, sys
sys.path.insert(0, ".")
from planokit import Hoja, K, G, OR, NV, CAD, MONO, INT
h = Hoja()
# Datos: TABLERO_NIVEL (calculadora) = ficha AP-TC-007:
#   A 0,900 x 0,400 · B 0,635 x 0,400 · alto 0,60 · pared 0,072 (cotas 900 ext / 755 int) · asiento 0,50 x 0,10
#   revoque ext. 0,01 · 2 hierros Ø6 cada 2 hiladas · hilada 0,075 · PEAD Ø50 salida · PVC Ø90 ingreso EPEC
#   4 Kwik Bolt 15 cm rosca 1/2" · gabinete AP-T-002 0,785 x 0,83 x 0,32
LA,LB,AN,HT,EP,HIL,BA,BE=900,635,400,600,72.5,75,500,100
LAD,LADH,JV=250,50,10          # ladrillo 25x12x5 (pañol 8016); junta vertical 10 (*)
GBL,GBP=785,320
NIV=[1,3,5,7]                  # juntas con hierro: sobre las hiladas 1, 3, 5 y 7 (cada 2 hiladas, 4 niveles)
def pipe(d, w, st=K):          # caño dibujado como trazo doble (silueta)
    h.path(d,"none",st,w+2.2,'stroke-linejoin="round"'); h.path(d,"none","#fff",w,'stroke-linejoin="round"')
def muro_corte(x0, ytop, k, w=EP, n=8):
    """muro cortado: hiladas de ladrillo rayado, juntas, 2 hierros Ø6 en las juntas de los niveles"""
    for r in range(n):
        yb = ytop + (HT - r * HIL) * k          # pie de la hilada r (de abajo hacia arriba)
        h.rect(x0, yb - LADH * k, w * k, LADH * k, "url(#ANSI31)", K, .5)
        h.rect(x0, yb - HIL * k, w * k, (HIL - LADH) * k, "#fff", K, .3)
        if r + 1 in NIV:
            for f in (.3, .7): h.circ(x0 + w * k * f, yb - (LADH + (HIL - LADH) / 2) * k, max(.9, 3 * k), K, K, 0)
def ladrillos_vista(x0, x1, ytop, k, n=8, hierros=True):
    """vista de un muro: ladrillos de a uno, trabados; hierros ocultos en las juntas"""
    for r in range(n):
        yb = ytop + (HT - r * HIL) * k
        off = 0 if r % 2 == 0 else -(LAD + JV) / 2
        x = x0 + off * k
        while x < x1:
            a, b = max(x, x0), min(x + LAD * k, x1)
            if b > a: h.rect(a, yb - LADH * k, b - a, LADH * k, "#fff", K, .6)
            x += (LAD + JV) * k
        if hierros and r + 1 in NIV:
            ym = yb - (LADH + (HIL - LADH) / 2) * k
            h.ln(x0, ym - 1.2, x1, ym - 1.2, K, .6, h.OCULTA); h.ln(x0, ym + 1.2, x1, ym + 1.2, K, .6, h.OCULTA)
# =================== CORTE A-A (longitudinal, tipo A) · 1:20
k=0.30; X0=130; Yt=160; Yb=Yt+HT*k; Ya=Yb+BE*k; Yn=Yt+100*k
h.titulo(40,62,"CORTE A-A (LONGITUDINAL - TIPO A)","ESC. 1:20 - COTAS EN mm - MIRANDO EL MURO DEL FONDO")
h.rect(40,Yn,X0-50*k-40,Ya-Yn+40,"url(#EARTH)",K,0); h.rect(X0+LA*k+50*k,Yn,470-X0-LA*k-50*k,Ya-Yn+40,"url(#EARTH)",K,0)
h.rect(X0-50*k,Ya,(LA+100)*k,40,"url(#EARTH)",K,0)
h.rect(X0-50*k,Yn,40*k,Yb-Yn,"url(#EARTH)",K,0); h.rect(X0+LA*k+10*k,Yn,40*k,Yb-Yn,"url(#EARTH)",K,0)
h.path(f"M40,{Yn} H{X0-10*k} M{X0+LA*k+10*k},{Yn} H470","none",K,1.8)
h.rect(X0-50*k,Yb,(LA+100)*k,BE*k,"url(#CONC)",K,1.3)
xi0,xi1=X0+EP*k,X0+(LA-EP)*k
h.rect(xi0,Yt,xi1-xi0,HT*k,"#fff",K,.6)
ladrillos_vista(xi0,xi1,Yt,k)
muro_corte(X0,Yt,k); muro_corte(X0+(LA-EP)*k,Yt,k)
h.rect(X0-10*k,Yt,10*k,HT*k,"url(#CONCP)",K,.5); h.rect(X0+LA*k,Yt,10*k,HT*k,"url(#CONCP)",K,.5)
h.rect(X0,Yt,LA*k,HT*k,"none",K,1.6)
# caños: PVC Ø90 (ingreso EPEC, llega de frente: codo hacia el que mira) y PEAD Ø50 (salen a la zanja, a la derecha)
xP=X0+250*k; yTop=Yb-100*k
pipe(f"M{xP},{yTop} V{Ya+14}",90*k); h.circ(xP,Ya+14+90*k/2,90*k/2+1,"#fff",K,1.1); h.circ(xP,Ya+14+90*k/2,90*k/2-2,"none",K,.4)
h.circ(xP,Ya+14+90*k/2,3.2,K,K,0)
h.path(f"M{xP},{Ya+14+90*k/2} V{Yt-50}","none",K,1.7)          # cable de EPEC: sube al gabinete
yPE=[]
for n,xs in enumerate((X0+560*k,X0+680*k)):
    yy=Ya+10+n*10; yPE.append(yy)
    pipe(f"M{xs},{yTop} V{yy-8} Q{xs},{yy} {xs+8},{yy} H{X0+LA*k+50*k+30}",50*k)
    h.path(f"M{xs},{Yt-50} V{yy-8} Q{xs},{yy} {xs+8},{yy} H{X0+LA*k+50*k+30}","none",K,1.3)
h.rect(44,Ya+33,104,14,"#fff",None,0); h.txt(46,Ya+44,"DE EPEC (DE FRENTE)",9.5,700)
h.rect(400,yPE[1]+6,68,14,"#fff",None,0); h.txt(466,yPE[1]+17,"A LA ZANJA →",9.5,700,K,"end")
# gabinete AP-T-002 (referencia), sellador y anclajes
gx0=X0+(LA-GBL)/2*k
h.rect(gx0,Yt-50,GBL*k,50,"none",K,.9,h.OCULTA); h.ln(gx0,Yt-1,gx0+GBL*k,Yt-1,K,2.2)
h.txt(X0+LA*k/2+30,Yt-30,"GABINETE AP-T-002",9.5,400,G,"middle")
for xa in (X0+(LA/2-GBL/2+40)*k,X0+(LA/2+GBL/2-40)*k):
    h.rect(xa-6.35*k-1,Yt,12.7*k+2,150*k,"#fff",K,.6,h.OCULTA); h.rect(xa-4,Yt-8,8,6,K,K,.4); h.rect(xa-5,Yt-3,10,2,"#888",K,.3)
h.nivel(52,Yn,"±0,00 NPT")
h.dimV(X0-26,Yt,Yb,"600",ext=X0-12); h.dimV(X0-26,Yb,Ya,"100",ext=X0-55*k)
h.dimV(X0+LA*k+26,Yt,Yn,"100 (*)",ext=X0+LA*k+4,c=OR)
h.dimV(xi1-10,Yb-HIL*k*2,Yb,"150",ext=None)
h.dimH(Yt-62,xi0,xi1,"755 INT.",ext=Yt-52); h.dimH(Ya+58,X0,X0+LA*k,"900",ext=Yb+2,dy=14)
h.dimH(Ya+80,X0-50*k,X0+LA*k+50*k,"1000 (*)",c=OR,dy=14)
h.dimH(Yt+HT*k*.18,X0,xi0,"72",dy=-4)
gx=455
h.globo("10",X0+(LA/2+GBL/2-40)*k,Yt-6,gx,118)
h.globo("1",xi1-30,Yt+40,gx,158); h.globo("2",xi1-50,Yt+HIL*k*3+3,gx,193)
h.globo("3",X0+(LA-EP)*k+EP*k*.7,Yt+(HT-HIL*5+12)*k,gx,228)
h.globo("4",X0+LA*k+1.5,Yt+150*k,gx,263)
h.globo("9",X0+680*k,yTop+6,gx,298); h.globo("7",X0+LA*k+20*k,Yb+BE*k*.5,gx,333)
h.globo("8",xP-14,Ya+27,62,Ya+10)
# =================== PLANTA (tipo A, sin el gabinete)
h.titulo(510,62,"PLANTA (TIPO A)","ESC. 1:20 - SIN EL GABINETE")
s=0.30; px0,py0=545,160; pw,ph=LA*s,AN*s
# recorridos de los caños bajo el asiento (ocultos) y cables
h.path(f"M{px0+250*s},{py0+ph/2} V{py0+ph+40}","none",K,1,h.OCULTA); h.path(f"M{px0+250*s-45*s},{py0+ph/2} V{py0+ph+40} M{px0+250*s+45*s},{py0+ph/2} V{py0+ph+40}","none",K,.6,h.OCULTA)
h.txt(px0+250*s-18,py0+ph+40,"DE EPEC",9.5,700,K,"end")
for n,xs in enumerate((560,680)):
    yy=py0+ph/2+(n*2-1)*9
    h.path(f"M{px0+xs*s},{py0+ph/2} Q{px0+xs*s},{yy} {px0+xs*s+12},{yy} H{px0+pw+90}","none",K,.9,h.OCULTA)
h.rect(px0-10*s,py0-10*s,pw+20*s,ph+20*s,"url(#CONCP)",K,.5)
h.rect(px0,py0,pw,ph,"url(#ANSI31)",K,1.4); h.rect(px0+EP*s,py0+EP*s,pw-2*EP*s,ph-2*EP*s,"#fff",K,1)
for xs in (560,680):
    yy=py0+ph/2
h.rect(px0+(LA-GBL)/2*s,py0+(AN-GBP)/2*s,GBL*s,GBP*s,"none",K,.8,h.OCULTA)
for xa in ((LA/2-GBL/2+40),(LA/2+GBL/2-40)):
    for ya in (EP/2,AN-EP/2): h.circ(px0+xa*s,py0+ya*s,3,"#fff",K,1); h.circ(px0+xa*s,py0+ya*s,1,K,K,0)
h.circ(px0+250*s,py0+AN/2*s,45*s,"#fff",K,1.1); h.circ(px0+250*s,py0+AN/2*s,42*s,"none",K,.4); h.circ(px0+250*s,py0+AN/2*s,3.5,K,K,0)
for xs in (560,680): h.circ(px0+xs*s,py0+AN/2*s,25*s,K,K,.8); h.circ(px0+xs*s,py0+AN/2*s,20*s,"#fff",K,.4); h.circ(px0+xs*s,py0+AN/2*s,2.2,K,K,0)
h.txt(px0+250*s,py0+AN/2*s-18,"Ø90",9.5,700,K,"middle"); h.txt(px0+620*s,py0+AN/2*s-18,"Ø50 x CIRCUITO",9.5,700,K,"middle")
h.txt(px0+pw+92,py0+ph/2+4,"ZANJA",9.5,700)
xa1,xa2=px0-30,px0+pw+76
h.ln(xa1,py0+ph/2,px0-2,py0+ph/2,K,.8,h.EJE); h.ln(px0+pw+2,py0+ph/2-24,xa2,py0+ph/2-24,K,.8,h.EJE)
h.ln(xa1,py0+ph/2-8,xa1,py0+ph/2+8,K,1.8); h.txt(xa1,py0+ph/2-13,"A",13,700,K,"middle")
h.ln(xa2,py0+ph/2-32,xa2,py0+ph/2-16,K,1.8); h.txt(xa2,py0+ph/2-37,"A",13,700,K,"middle")
xbb=px0+560*s
h.ln(xbb,py0-28,xbb,py0+ph+28,K,1,h.EJE)
for yy in (py0-28,py0+ph+28): h.ln(xbb-7,yy,xbb+7,yy,K,1.8)
h.txt(xbb+6,py0-26,"B",13,700); h.txt(xbb+6,py0+ph+38,"B",13,700)
h.dimH(py0-46,px0,px0+pw,"900 (TIPO A)",ext=py0-2)
h.dimH(py0+ph+56,px0+LB*s*0,px0+LB*s,"635 (TIPO B)",ext=py0+ph+2,dy=14)
h.ln(px0+LB*s,py0,px0+LB*s,py0+ph,K,.6,'stroke-dasharray="2 3"')
h.dimV(px0+pw+48,py0,py0+ph,"400",ext=px0+pw+4); h.dimV(px0+pw+26,py0+EP*s,py0+ph-EP*s,"255",ext=None)
h.dimH(py0+ph+86,px0+(LA-GBL)/2*s,px0+(LA+GBL)/2*s,"785 GABINETE",dy=14)
h.txt(px0+60,py0+ph+122,"4 KWIK BOLT 1/2\" - POSICION (*)",9.5,700,OR)
# =================== CORTE B-B (transversal, por un PEAD)
kb=0.22; bx=95; byt=578; byb=byt+HT*kb; bya=byb+BE*kb; byn=byt+100*kb
h.titulo(40,483,"CORTE B-B","ESC. 1:25 - POR UNA SALIDA PEAD")
bw=AN*kb; ao=(BA-AN)/2*kb
h.rect(40,byn,bx-ao-40,bya-byn+24,"url(#EARTH)",K,0); h.rect(bx+bw+ao,byn,250-bx-bw-ao,bya-byn+24,"url(#EARTH)",K,0)
h.rect(bx-ao,bya,BA*kb,24,"url(#EARTH)",K,0)
h.rect(bx-ao,byn,ao-10*kb,byb-byn,"url(#EARTH)",K,0); h.rect(bx+bw+10*kb,byn,ao-10*kb,byb-byn,"url(#EARTH)",K,0)
h.path(f"M40,{byn} H{bx-10*kb} M{bx+bw+10*kb},{byn} H250","none",K,1.8)
h.rect(bx-ao,byb,BA*kb,BE*kb,"url(#CONC)",K,1.3)
h.rect(bx+EP*kb,byt,(AN-2*EP)*kb,HT*kb,"#fff",K,.4)
muro_corte(bx,byt,kb); muro_corte(bx+(AN-EP)*kb,byt,kb)
h.rect(bx-10*kb,byt,10*kb,HT*kb,"url(#CONCP)",K,.5); h.rect(bx+bw,byt,10*kb,HT*kb,"url(#CONCP)",K,.5)
h.ln(bx+EP*kb+1,byt,bx+EP*kb+1,byb,OR,1.2); h.ln(bx+(AN-EP)*kb-1,byt,bx+(AN-EP)*kb-1,byb,OR,1.2)
h.rect(bx,byt,bw,HT*kb,"none",K,1.6)
xs=bx+bw/2; pipe(f"M{xs},{byb-100*kb} V{bya+8}",50*kb); h.circ(xs,bya+8+50*kb/2,50*kb/2+1,K,K,.8); h.circ(xs,bya+8+50*kb/2,50*kb/2-2,"#fff",K,.3)
h.circ(xs,bya+8+50*kb/2,2,K,K,0); h.ln(xs,bya+8+50*kb/2,xs,byt-45,K,1.3)
h.txt(xs+12,bya+18,"CODO A LA ZANJA",8.5,400,G)
h.rect(bx+(AN-GBP)/2*kb,byt-45,GBP*kb,45,"none",K,.9,h.OCULTA); h.ln(bx+(AN-GBP)/2*kb,byt-1,bx+(AN+GBP)/2*kb,byt-1,K,2.2)
for xa in (bx+EP/2*kb,bx+(AN-EP/2)*kb):
    h.rect(xa-2,byt,4,150*kb,"#fff",K,.6,h.OCULTA); h.rect(xa-4,byt-8,8,6,K,K,.4)
h.dimH(byt-56,bx,bx+bw,"400",ext=byt-48); h.dimH(bya+32,bx-ao,bx+bw+ao,"500",ext=byb+2,dy=14)
h.dimV(bx-26,byt,byb,"600",ext=bx-12); h.dimV(bx-26,byb,bya,"100",ext=bx-ao-2)
gb=262
h.globo("10",bx+(AN-EP/2)*kb,byt-6,gb,byt-30); h.globo("6",bx+(AN-EP)*kb-1,byt+60,gb,byt+10,OR)
h.globo("3",bx+(AN-EP*.3)*kb,byt+(HT-HIL*3+12)*kb,gb,byt+50); h.globo("4",bx+bw+1.5,byt+110*kb,gb,byt+90)
h.globo("9",xs+3,byb-60*kb,gb,byt+130)
# =================== D1 · ANCLAJE KWIK BOLT
h.titulo(300,483,"D1 - ANCLAJE","ESC. 1:2 - KWIK BOLT 1/2\" x 15 cm")
kd=0.85; dx=400; dyt=578
for r in range(2):
    yb=dyt+(HIL*(r+1))*kd
    h.rect(dx-EP/2*kd,yb-LADH*kd,EP*kd,LADH*kd,"url(#ANSI31)",K,.5); h.rect(dx-EP/2*kd,yb-HIL*kd,EP*kd,(HIL-LADH)*kd,"#fff",K,.3)
    if r==0:
        for f in (.25,.75): h.circ(dx-EP/2*kd+EP*kd*f,yb-(LADH+(HIL-LADH)/2)*kd,2.6,K,K,0)
h.rect(dx-EP/2*kd,dyt+150*kd,EP*kd,15*kd,"url(#ANSI31)",K,.5)
h.path(f"M{dx-EP/2*kd-9},{dyt+165*kd+4} l6,-6 l6,6 l6,-6 l6,6 l6,-6 l6,6 l6,-6 l6,6 l6,-6 l6,6 l6,-6","none",K,.6)
h.rect(dx-EP/2*kd-10*kd,dyt,10*kd,165*kd,"url(#CONCP)",K,.4)
h.rect(dx-70,dyt-5,140,5,"#bbb",OR,.8); h.txt(dx-72,dyt-40,"BASE DEL GABINETE (*)",9,400,OR)
h.rect(dx-EP/2*kd,dyt-1.5,EP*kd,1.5,K,K,0)
r12=12.7/2*kd; yb0=dyt+150*kd
h.rect(dx-r12,dyt-26,2*r12,yb0-dyt+26-14,"#fff",K,.8)
for yy in range(int(dyt-26),int(dyt+40),3): h.ln(dx-r12,yy,dx+r12,yy+1.5,K,.35)
h.path(f"M{dx-r12-1.5},{yb0-28} H{dx+r12+1.5} V{yb0-12} L{dx+r12+3},{yb0-8} V{yb0-4} H{dx-r12-3} V{yb0-8} L{dx-r12-1.5},{yb0-12} Z","#ddd",K,.8)
h.path(f"M{dx-r12},{yb0-14} L{dx-r12-3},{yb0} H{dx+r12+3} L{dx+r12},{yb0-14} Z","#999",K,.8)
h.rect(dx-11*kd-4,dyt-14,22*kd+8,9,K,K,.5); h.rect(dx-14*kd-4,dyt-5,28*kd+8,3,"#888",K,.4)
h.ln(dx,dyt-32,dx,yb0+8,K,.4,h.EJE)
h.dimV(dx+52,dyt,yb0,"150",ext=dx+r12+4); h.dimH(yb0+24,dx-r12,dx+r12,"Ø12,7 (1/2\")",ext=yb0+2,dy=14)
h.globo("10",dx+r12,dyt-10,dx+70,dyt-30); h.globo("11",dx+r12,dyt+30,dx+76,dyt+36)
h.globo("12",dx+EP/2*kd-4,dyt-1,dx+76,dyt+8)
h.txt(dx+90,dyt+40,"VARILLA",9.5); h.txt(dx+90,dyt+12,"SELLADOR",9.5); h.txt(dx+84,dyt-26,"TUERCA + ARANDELA",9.5)
# =================== D2 · MURO (corte + vista)
h.titulo(560,483,"D2 - MURO","ESC. 1:5 - HILADAS, JUNTA Y HIERROS")
km=0.62; mx=622; myt=535; NH=4
for r in range(NH):
    yb=myt+(NH*HIL-r*HIL)*km
    h.rect(mx,yb-LADH*km,EP*km,LADH*km,"url(#ANSI31)",K,.6); h.rect(mx,yb-HIL*km,EP*km,(HIL-LADH)*km,"#fff",K,.4)
    if r in (0,2):
        for f in (.3,.7): h.circ(mx+EP*km*f,yb-(LADH+(HIL-LADH)/2)*km,3*km,K,K,0)
h.rect(mx-10*km,myt,10*km,NH*HIL*km,"url(#CONCP)",K,.5); h.ln(mx-.8,myt,mx-.8,myt+NH*HIL*km,K,1.6)
h.ln(mx+EP*km+1,myt,mx+EP*km+1,myt+NH*HIL*km,OR,1.6)
h.rect(mx,myt,EP*km,NH*HIL*km,"none",K,1.2)
vx0,vx1=mx+70,mx+215
for r in range(NH):
    yb=myt+(NH*HIL-r*HIL)*km; off=0 if r%2==0 else -(LAD+JV)/2
    x=vx0+off*km
    while x<vx1:
        a,b=max(x,vx0),min(x+LAD*km,vx1)
        if b>a: h.rect(a,yb-LADH*km,b-a,LADH*km,"#fff",K,.7)
        x+=(LAD+JV)*km
    if r in (0,2):
        ym=yb-(LADH+(HIL-LADH)/2)*km
        for d in (-1.8,1.8): h.ln(vx0,ym+d,vx1,ym+d,K,.7,h.OCULTA)
h.path(f"M{vx1},{myt} l-4,9 l5,9 l-5,9 l5,9 l-5,9 l5,9 l-5,9 l5,9 l-5,9 l4,{NH*HIL*km-81}","none",K,.6)
ybot=myt+NH*HIL*km
h.dimV(mx-22,ybot-LADH*km,ybot,"50",ext=mx-10*km-2); h.dimV(mx-22,ybot-HIL*km,ybot-LADH*km,"25",ext=mx-10*km-2)
h.dimV(mx-44,ybot-2*HIL*km,ybot,"150",ext=mx-24)
h.dimH(ybot+16,mx,mx+EP*km,"72",ext=ybot+2,dy=12); h.dimH(myt-8,mx-10*km,mx,"10",dy=-4)
h.dimH(ybot+16,vx0,vx0+LAD*km,"250",ext=ybot+2,dy=12)
xj=vx0+(LAD-(LAD+JV)/2)*km
h.dimH(myt-8,xj,xj+JV*km,"10 (*)",c=OR,ext=myt+2)
gy=ybot+44
h.globo("5",mx-1,myt+60,mx-50,gy); h.globo("4",mx-5*km,myt+120,mx-22,gy); h.globo("3",mx+EP*km*.7,myt+(NH*HIL-(LADH+12))*km,mx+6,gy)
h.globo("6",mx+EP*km+1,myt+150,mx+34,gy,OR); h.globo("1",vx0+60,ybot-LADH*km/2,mx+130,gy); h.globo("2",vx0+120,ybot-LADH*km-5,mx+160,gy)
# =================== CÓMPUTO (tipos A y B)
rows=[("PERIMETRO (de)","2,60 m","2,07 m","2 x (L + 0,40)"),("MAMPOSTERIA","0,112 m³","0,089 m³","de x 0,60 x 0,072"),
 ("LADRILLOS 25x12x5","81 u","65 u","mamp. / (0,25x0,12x0,05) x 1,08"),("MORTERO JUNTA 1:3","0,028 m³","0,022 m³","mamp. x 0,25"),
 ("HIERRO Ø6","20,8 m","16,6 m","4 niveles x 2 x de"),("ASIENTO H° SIMPLE","0,130 m³","0,104 m³","de x 0,50 x 0,10"),
 ("REVOQUE EXT. 1 cm","0,016 m³","0,012 m³","de x 0,60 x 0,01"),("PINTURA ASFALTICA","1,56 m²","1,24 m²","de x 0,60"),
 ("SELLADOR DE JUNTA","2,60 m","2,07 m","de"),("KWIK BOLT + VARILLA","4 u","4 u","constante"),("PEAD Ø50 / PVC Ø90","N / 1","N / 1","N = circuitos")]
h.tabla(40,803,[(150,"l",False),(76,"c",True),(76,"c",True),(190,"l",False)],[("CONCEPTO","TIPO A","TIPO B","CALCULO (CALCULADORA)")]+rows,rowh=18,
 titulo="COMPUTO POR BASE - A 0,900x0,400 / B 0,635x0,400 x 0,60")
h.rayados(560,803,[("ANSI31","LADRILLO (CORTE)"),("CONC","H° SIMPLE"),("CONCP","REVOQUE EXT."),("EARTH","TERRENO")],cols=2,dx=140)
h.ln(560,885,590,885,OR,1.6); h.txt(598,889,"REVOQUE INTERIOR (*)",10.5,400,OR)
# VARIANTE nota 4: H°A° H-13 e = 12 cm con malla SIMA 15x15
h.txt(560,918,"VARIANTE (NOTA 4): H°A° H-13 e = 120",11.5,700); h.ln(560,922,800,922,K,.8)
vk=0.25; vx,vy=600,935
h.rect(vx,vy,AN*vk,HT*vk*.5,"none",K,0)
for xx in (vx,vx+(AN-120)*vk):
    h.rect(xx,vy,120*vk,HT*vk*.5,"url(#CONC)",K,1.2)
    for yy in range(0,int(HT*vk*.5)-2,int(150*vk)): h.circ(xx+120*vk/2,vy+6+yy,1.6,K,K,0)
    h.ln(xx+120*vk/2,vy+2,xx+120*vk/2,vy+HT*vk*.5-2,K,.6)
h.dimH(vy+HT*vk*.5+14,vx,vx+120*vk,"120",dy=12)
h.txt(vx+AN*vk+14,vy+20,"MALLA SIMA 15x15 AL MEDIO",9.5); h.txt(vx+AN*vk+14,vy+36,"ENCOFRADO INT. Y EXT.",9.5); h.txt(vx+AN*vk+14,vy+52,"(VER POS. 15 Y 16)",9.5)
# =================== NOTAS
h.notas(40,1046,["COTAS EN mm. A: 0,900x0,400 - B: 0,635x0,400 - ALTO 0,60. LADRILLO MACIZO, JUNTA CEMENTICIA REFORZADA (NOTA 1).",
"2 HIERROS Ø6 CADA 2 HILADAS (HILADA 75): 4 NIVELES. REVOQUE EXT. 1 cm SOBRE PINTURA ASFALTICA CON ARENA.",
"CABLES: EL DE EPEC ENTRA POR EL PVC Ø90; LOS CIRCUITOS SALEN A LA ZANJA POR UN PEAD Ø50 CADA UNO. SUBEN AL GABINETE.",
"(*) PARED 72 CON LADRILLO 25x12x5: ¿DE CANTO? JUNTA VERTICAL, REVOQUE INT., ANCLAJES Y CAÑOS: CONFIRMAR POSICION.",
"(*) SOBRESALE 100 DEL PISO Y ASIENTO DE 1000: NO ACOTADOS. LA CALCULADORA HACE de x 0,50 x 0,10."])
# =================== 3D
h.titulo(890,62,"VISTA 3D EN CORTE - BASE TIPO A","SIN EL GABINETE; MURO DE ADELANTE CORTADO Y CAPAS EN ESCALONES SOBRE LA CARA DERECHA")
h.iso(.26,1165,190)
zt,zb=100,-500
def tuboY(y0,y1,xc,zc,r,fill,st="#000"):
    p0=h.P(xc,y0,zc); p1=h.P(xc,y1,zc); nx,ny=.5*r*h._s,.866*r*h._s
    h.a(f'<polygon points="{p0[0]+nx:.1f},{p0[1]-ny:.1f} {p1[0]+nx:.1f},{p1[1]-ny:.1f} {p1[0]-nx:.1f},{p1[1]+ny:.1f} {p0[0]-nx:.1f},{p0[1]+ny:.1f}" fill="{fill}" stroke="{st}" stroke-width=".6"/>')
    h.poly3([(xc+r*math.cos(2*math.pi*i/30),y1,zc+r*math.sin(2*math.pi*i/30)) for i in range(30)],"#d6d9dd",st,.6)
h.BOX(-50,950,-300,-50,-90,0,"url(#grass)","url(#soil3)","url(#soil3)")
h.BOX(-300,-50,-50,450,-90,0,"url(#grass)","url(#soil3)","url(#soil3)")
# caños que salen por debajo del asiento: PEAD a la zanja (+x) y PVC de EPEC (+y); el asiento tapa lo de abajo
for ys,zc in ((170,-650),(240,-680)):
    h.tuboX(600,1060,ys,zc,25,"url(#pead)","#000"); h.poly3(h.circX(1060,ys,zc,25),"#333","#000",.5); h.poly3(h.circX(1061,ys,zc,9,14),"#111","#000",.4)
tuboY(200,620,250,-660,45,"url(#pvc)","#555"); h.poly3([(250+14*math.cos(2*math.pi*i/16),621,-660+14*math.sin(2*math.pi*i/16)) for i in range(16)],"#1a1a1a","#000",.4)
h.BOX(-50,950,-50,450,zb-BE,zb,"url(#conc3)","url(#conc3)","url(#conc3)")
REV="#ece6d8"; MORT="#bfb6a6"
def pared(x0,x1,y0,y1,top=MORT): h.BOX(x0,x1,y0,y1,zb,zt,top,"url(#lad3)","url(#lad3)")
pared(0,900,0,EP); pared(0,EP,EP,AN-EP)
# caños dentro y los cables que suben al gabinete
h.tuboZ(zb,zb+100,250,AN/2,45,45,"url(#pvc)","#555"); h.tuboZ(zb+100,zt+260,250,AN/2,14,14,"#1a1a1a","#000")
for xs,ys in ((560,170),(680,240)):
    h.tuboZ(zb,zb+100,xs,ys,25,25,"url(#pead)","#000"); h.tuboZ(zb+100,zt+220,xs,ys,9,9,"#2a2a2a","#000")
pared(900-EP,900,EP,AN-EP)
# capas en escalones sobre la cara +x: pintura asfáltica y revoque
h.BOX(900,903,120,AN,zb,zt,"#2b2b2b","#2b2b2b","url(#asph3)","#111",.5)
h.BOX(903,911,250,AN,zb,zt,REV,REV,REV,"#8a8577",.6)
pared(0,200,AN-EP,AN)
for r in range(8):
    z0=zb+r*HIL
    h.F3([(200,AN-EP,z0+LADH),(200,AN,z0+LADH),(200,AN,z0+HIL),(200,AN-EP,z0+HIL)],MORT,"#6b5a4a",.4)
    h.F3([(200,AN-EP,z0),(200,AN,z0),(200,AN,z0+LADH),(200,AN-EP,z0+LADH)],"#b8533a","#6b2a1a",.4)
    if r+1 in NIV:
        for f in (.3,.7):
            px,py=h.P(200,AN-EP+EP*f,z0+LADH+12); h.circ(px,py,1.7,"#3d4650","#000",.3)
for (xa,ya) in ((LA/2-GBL/2+40,EP/2),(LA/2+GBL/2-40,EP/2),(LA/2-GBL/2+40,AN-EP/2)):   # el 4.o queda en el muro cortado
    h.tuboZ(zt,zt+55,xa,ya,9,9,"url(#galv)","#333")
GX=1480
h.g3("10",(LA/2+GBL/2-40,EP/2,zt+50),GX,105,"KWIK BOLT 1/2\" (4)")
h.g3("17",(680,240,zt+200),GX,150,"CABLES AL GABINETE")
h.g3("1",(780,0,0),GX,195,"LADRILLO MACIZO")
h.g3("2",(200,AN-EP*.5,zb+HIL*5-10),GX,240,"JUNTA CEMENTICIA")
h.g3("3",(200,AN-EP*.3,zb+HIL*3+12),GX,285,"HIERRO Ø6 C/ 2 HILADAS")
h.g3("5",(902,180,-200),GX,330,"PINTURA ASFALTICA")
h.g3("4",(911,330,-100),GX,375,"REVOQUE EXT. 1 cm")
h.g3("9",(1060,240,-680),GX,420,"PEAD Ø50 A LA ZANJA")
h.g3("8",(250,620,-640),GX,465,"PVC Ø90 DE EPEC")
h.g3("7",(700,450,zb-50),GX,510,"ASIENTO H° SIMPLE")
# =================== LISTA DE MATERIALES (tipo A)
L=[("POS.","DESCRIPCION","CANT. (A)","CODIGO"),
("1","LADRILLO COMUN MACIZO 25x12x5 (+8 % ROTURAS)","81 u","8016"),
("2","MORTERO DE JUNTA CEMENTICIA REFORZADA 1:3","0,028 m³","A VINCULAR"),
("3","HIERRO REDONDO Ø6 PARA MAMPOSTERIA","20,8 m","8012"),
("4","REVOQUE GRUESO EXTERIOR e = 1 cm","0,016 m³","A VINCULAR"),
("5","PINTURA ASFALTICA FRIA, SALPICADA CON ARENA","1,56 m²","8023"),
("6","REVOQUE IGNIFUGO + CALCAREO INTERIOR (*)","1,56 m²","A VINCULAR"),
("7","HORMIGON SIMPLE DE ASIENTO (0,50 x 0,10)","0,130 m³","A VINCULAR"),
("8","CAÑO PVC Ø90 - INGRESO DE LA ACOMETIDA EPEC","1 u","5010"),
("9","CAÑO PEAD Ø50 PN6 - SALIDA, 1 POR CIRCUITO","N u","5005"),
("10","ANCLAJE KWIK BOLT 15 cm, TUERCA Y ARANDELA 1/2\"","4 u","8002"),
("11","VARILLA ROSCADA PARA ANCLAJE DEL GABINETE","4 u","4040"),
("12","SELLADOR ELASTICO DE JUNTA GABINETE-BASE","2,60 m","8026"),
("13","GRAMPA DE SUJECION DE CAÑOS (NO DIBUJADA)","N + 1 u","5015"),
("14","GABINETE A NIVEL TIPO B (AP-T-002)","1 u","VER AP-T-002"),
("15","VARIANTE: H°A° H-13 e = 12 cm EN LUGAR DE 1 A 4","0,187 m³","8013"),
("16","VARIANTE: MALLA SIMA 15x15","1,56 m²","8018"),
("17","CABLES: ACOMETIDA EPEC Y CIRCUITOS (S/ PROYECTO)","-","SEGUN CALCULO")]
h.tabla(890,580,[(40,"c",False),(470,"l",False),(100,"c",True),(140,"c",False)],L,rowh=21,titulo="LISTA DE MATERIALES (1 BASE TIPO A)",
 colores=lambda i,j,t: OR if (t=="A VINCULAR" or "(*)" in t) else K)
h.rotulo(890,h.H-150,750,"AP-TC-007","BASE DE MAMPOSTERIA","PARA TABLERO A NIVEL","TIPOS A Y B - CORTES, DETALLES, VARIANTE Y 3D","1:20 / 1:5","D1 1:2, 3D S/E",fecha="07/11/2026")
h.guardar("ap_tc_007.svg"); print("ok")
