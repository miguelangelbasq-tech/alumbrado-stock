s=open("ap_t_019.py").read()
a=s.index("# =================================================== PLANTA"); b=s.index("# =================================================== CORTE A-A AMPLIADO")
planta='''# =================================================== PLANTA
h.titulo(470, 62, "PLANTA DE EMPLAZAMIENTO", "S/E (APROX. 1:150) - RACK ⟂ AL TENDIDO, PUERTA AL ESPACIO VERDE")
kp = 0.024; px = 600; yl = 128
yc0 = yl + 28; yc1 = yc0 + 6000 * kp; yP = yc1 + 2500 * kp
h.rect(470, yc0, 360, yc1 - yc0, "url(#ANSI37)", K, 0)
for y in (yc0, yc1): h.ln(470, y, 830, y, K, 1.6)
h.rect(735, (yc0 + yc1) / 2 - 10, 70, 16, "#fff", None, 0); h.txt(770, (yc0 + yc1) / 2 + 2, "CALZADA", 9.5, 700, K, "middle")
h.txt(826, yc1 + 14, "VEREDA (*)", 8.5, 400, OR, "end"); h.txt(826, 412, "ESPACIO VERDE", 9.5, 700, K, "end")
h.ln(470, yl, 830, yl, K, 2.4, 'stroke-dasharray="16 4"'); h.txt(476, yl - 8, "LINEA PREENSAMBLADA EPEC", 8.5, 700)
for xx in (px, px + 140):
    h.circ(xx, yl, 5, "url(#CONC)", K, 1); h.circ(xx, yl, 1.5, K, K, 0)
h.txt(px + 148, yl + 16, "POSTE EPEC (*)", 8.5, 400, OR)
h.path(f"M{px},{yl+5} V{yP-5}", "none", K, 1.6)
for i in range(4): h.rect(px - 26 + i * 6, yl - 3, 4, 6, K, K, 0)
h.circ(px, yP, d_poste(0) / 2 * kp * 1.8, "#fff", K, 1.3); h.circ(px, yP, d_poste(0) / 2 * kp * 1.2, "none", K, .5)
h.rect(px - 8, yP - 9, 16, 3, "#fff", K, .6)
gwp = 430 * kp * 1.5; gdp = 200 * kp * 1.5
h.rect(px - gwp / 2, yP + 6, gwp, gdp, GAB_T, K, 1)
h.path(f"M{px},{yP+6+gdp} v18 m-4,-6 l4,6 l4,-6", "none", K, 1.1); h.txt(px + 8, yP + 30, "PUERTA", 8.5, 700)
h.path(f"M{px+4},{yP} H{px+80} Q{px+96},{yP} {px+96},{yP+16} V418 M{px+4},{yP+4} H{px+76} Q{px+90},{yP+4} {px+90},{yP+18} V418", "none", K, .8, h.OCULTA)
h.txt(px + 102, 404, "ZANJA (AP-TC-001)", 8.5, 700)
h.ln(px, yl - 24, px, yl - 8, K, .8, h.EJE); h.ln(px, yP + 36, px, yP + 52, K, .8, h.EJE)
for yy in (yl - 24, yP + 52): h.ln(px - 7, yy, px + 7, yy, K, 1.8)
h.txt(px - 11, yl - 18, "A", 13, 700, K, "end"); h.txt(px - 11, yP + 58, "A", 13, 700, K, "end")
h.dimV(px - 44, yl, yP, "≤ 10000", ext=px - 6)
h.dimV(px - 76, yc1, yP, "2500", ext=px - 8)
h.dimV(px + 60, yc0, yc1, "S/ OBRA (*)", ext=None, c=OR)
h.globo("4", px - 18, yl, 500, yl + 22); h.globo("6", px, yP - 8, 520, yP - 18); h.globo("2", px + gwp / 2, yP + 10, 690, yP + 14)
'''
s=s[:a]+planta+s[b:]
R=[('h.txt(xE + 8, Y(zE) + 2, "POSTE EPEC", 8.5, 700); h.txt(xE + 8, Y(zE) + 12, "EXISTENTE (*)", 8.5, 400, OR)',
 'h.txt(xE + 8, Y(3200), "POSTE EPEC", 8.5, 700); h.txt(xE + 8, Y(3200) + 10, "EXISTENTE (*)", 8.5, 400, OR)'),
('h.txt(xE + 16, Y(zL) - 10, "LINEA PREENSAMBLADA", 8.5, 700); h.txt(xE + 16, Y(zL) - 1, "EPEC (EN CORTE)", 8.5, 400, G)',
 'h.txt(xE + 14, Y(zL) + 22, "LINEA PREENSAMBLADA", 8.5, 700); h.txt(xE + 14, Y(zL) + 32, "EPEC (EN CORTE)", 8.5, 400, G)'),
('h.dimH(yg + 30, xc1, xP, "2500", ext=yg + 2, dy=12)\nh.dimH(yg + 30, xc0, xc1, "S/ OBRA (*)", ext=yg + 2, dy=12, c=OR)',
 'h.dimH(yg - 24, xc1, xP, "2500", ext=yg - 6)\nh.dimH(yg - 24, xc0, xc1, "S/ OBRA (*)", ext=yg - 6, c=OR)'),
('h.txt((xc0 + xc1) / 2, yg - 10, "CALZADA", 9, 700, K, "middle")','h.txt((xc0 + xc1) / 2, yg - 40, "CALZADA", 9, 700, K, "middle")'),
('h.txt(446, Y(-700) + 12, "A LA ZANJA →", 8.5, 700, K, "end")','h.rect(385, Y(-700) + 3, 62, 12, "#fff", None, 0); h.txt(446, Y(-700) + 12, "A LA ZANJA →", 8.5, 700, K, "end")'),
('h.txt(410, yg - 6, "ESPACIO VERDE"','h.txt(400, yg - 50, "ESPACIO VERDE"'),
('"S/E - 4 MORSETOS ESCALONADOS, UNO POR CONDUCTOR"','"S/E - UN MORSETO POR CONDUCTOR"'),
('h.titulo(605, 452, "D2 - RETENCION EN EL RACK"','h.titulo(612, 452, "D2 - RETENCION EN EL RACK"'),
('h.txt(352, ly - 14, "PREENSAMBLADO EPEC 3x1x50/50 (*)", 8.5, 400, OR)','h.txt(450, ly - 34, "LINEA EPEC 50 mm²", 8.5, 400)'),
('h.dimH(ly - 30, 400, 440, "(*)", c=OR)','h.dimH(ly - 30, 400, 440, "(*)", c=OR, ext=ly - 18)'),
('[(170, "l", False), (64, "c", True), (240, "l", False)]','[(186, "l", False), (60, "c", True), (220, "l", False)]'),
('"TABLERO AEREO EN POSTE PRFV", "ACOMETIDA EN TIRO FLOJO", "EMPLAZAMIENTO, CORTE, DERIVACION, RETENCION, CABLES Y 3D"',
 '"TABLERO AEREO PRFV:", "ACOMETIDA TIRO FLOJO", "EMPLAZAMIENTO, CORTE, MORSETOS, CABLES Y 3D"')]
for x,y in R:
    assert s.count(x)==1, x[:60]; s=s.replace(x,y)
a=s.index("# =================================================== 3D"); b=s.index("# =================================================== LISTA")
s=s[:a]+open("_019_3d.txt").read()+s[b:]
open("ap_t_019.py","w").write(s)
