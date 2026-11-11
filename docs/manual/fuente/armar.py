# Arma el manual (DOCX) a partir de contenido.py. Después actualizar.py (LibreOffice) llena el índice y saca ODT/DOCX/PDF.
# Uso: python3 armar.py SALIDA.docx [todo|cuadrilla|panol|oficina|admin]
import sys, os, re
from docx import Document
from docx.shared import Pt, Cm, RGBColor, Emu
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.section import WD_SECTION
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
IMG = os.environ.get('IMG', os.path.join(AQUI, '..', 'capturas', 'img'))
sys.path.insert(0, AQUI)
import contenido as C

NAVY = RGBColor(0x28, 0x28, 0x5E); TURQ = RGBColor(0x1E, 0x6F, 0x91); GRIS = RGBColor(0x6E, 0x7C, 0x93); TXT = RGBColor(0x0D, 0x14, 0x24)
FUENTE = 'Arial'

def sombra(celda, hexa):
    tcPr = celda._tc.get_or_add_tcPr(); s = OxmlElement('w:shd'); s.set(qn('w:val'), 'clear'); s.set(qn('w:color'), 'auto'); s.set(qn('w:fill'), hexa); tcPr.append(s)

def bordes_celda(celda, izq=None, resto='nil'):
    tcPr = celda._tc.get_or_add_tcPr(); b = OxmlElement('w:tcBorders')
    for lado in ('top', 'left', 'bottom', 'right'):
        e = OxmlElement('w:' + lado)
        if lado == 'left' and izq:
            e.set(qn('w:val'), 'single'); e.set(qn('w:sz'), '24'); e.set(qn('w:color'), izq)
        elif resto == 'nil':
            e.set(qn('w:val'), 'nil')
        else:
            e.set(qn('w:val'), 'single'); e.set(qn('w:sz'), '4'); e.set(qn('w:color'), resto)
        b.append(e)
    tcPr.append(b)

def margenes_celda(celda, cm=0.25):
    tcPr = celda._tc.get_or_add_tcPr(); m = OxmlElement('w:tcMar')
    for lado in ('top', 'left', 'bottom', 'right'):
        e = OxmlElement('w:' + lado); e.set(qn('w:w'), str(int(cm * 567))); e.set(qn('w:type'), 'dxa'); m.append(e)
    tcPr.append(m)

def no_partir(fila):
    trPr = fila._tr.get_or_add_trPr(); e = OxmlElement('w:cantSplit'); trPr.append(e)

def texto_rico(par, txt, tam=None, color=None):
    # **negrita**, *cursiva*
    for trozo in re.split(r'(\*\*[^*]+\*\*|\*[^*]+\*)', txt):
        if not trozo: continue
        if trozo.startswith('**'): r = par.add_run(trozo[2:-2]); r.bold = True
        elif trozo.startswith('*') and len(trozo) > 2: r = par.add_run(trozo[1:-1]); r.italic = True
        else: r = par.add_run(trozo)
        if tam: r.font.size = Pt(tam)
        if color is not None: r.font.color.rgb = color

def campo(par, instr):
    r = par.add_run(); f = OxmlElement('w:fldChar'); f.set(qn('w:fldCharType'), 'begin'); r._r.append(f)
    r = par.add_run(); t = OxmlElement('w:instrText'); t.set(qn('xml:space'), 'preserve'); t.text = instr; r._r.append(t)
    r = par.add_run(); f = OxmlElement('w:fldChar'); f.set(qn('w:fldCharType'), 'separate'); r._r.append(f)
    r = par.add_run('1')
    r = par.add_run(); f = OxmlElement('w:fldChar'); f.set(qn('w:fldCharType'), 'end'); r._r.append(f)

def estilos(doc):
    st = doc.styles
    n = st['Normal']; n.font.name = FUENTE; n.font.size = Pt(10.5); n.font.color.rgb = TXT
    n.element.rPr.rFonts.set(qn('w:eastAsia'), FUENTE)
    pf = n.paragraph_format; pf.space_after = Pt(5); pf.line_spacing = 1.15
    for nom, tam, col, antes, desp in (('Heading 1', 19, NAVY, 0, 10), ('Heading 2', 14, TURQ, 14, 5), ('Heading 3', 11.5, NAVY, 10, 3)):
        h = st[nom]; h.font.name = FUENTE; h.font.size = Pt(tam); h.font.bold = True; h.font.color.rgb = col; h.font.italic = False
        rpr = h.element.get_or_add_rPr(); rf = rpr.find(qn('w:rFonts'))
        if rf is None: rf = OxmlElement('w:rFonts'); rpr.append(rf)
        for a in ('w:ascii', 'w:hAnsi', 'w:eastAsia', 'w:cs'): rf.set(qn(a), FUENTE)
        for a in ('w:asciiTheme', 'w:hAnsiTheme', 'w:eastAsiaTheme', 'w:cstheme'):
            if rf.get(qn(a)) is not None: del rf.attrib[qn(a)]
        h.paragraph_format.space_before = Pt(antes); h.paragraph_format.space_after = Pt(desp); h.paragraph_format.keep_with_next = True
    # línea turquesa bajo el título 1
    pPr = st['Heading 1'].element.get_or_add_pPr(); bd = OxmlElement('w:pBdr'); b = OxmlElement('w:bottom')
    b.set(qn('w:val'), 'single'); b.set(qn('w:sz'), '8'); b.set(qn('w:space'), '4'); b.set(qn('w:color'), '89C2DB'); bd.append(b); pPr.append(bd)
    for nom in ('List Number', 'List Bullet'):
        s = st[nom]; s.font.name = FUENTE; s.font.size = Pt(10.5); s.paragraph_format.space_after = Pt(3)

CACHE = os.environ.get('CACHE', '/tmp/manual_img_cache')
def optimizar(f):
    # JPEG liviano para que el DOCX/ODT no pese 50 MB: celu a 640 px de ancho, compu a 1440 px
    os.makedirs(CACHE, exist_ok=True)
    o = os.path.join(CACHE, os.path.basename(f)[:-4] + '.jpg')
    if os.path.exists(o) and os.path.getmtime(o) >= os.path.getmtime(f): return o
    im = Image.open(f).convert('RGB'); w, h = im.size
    tope = 640 if h > w * 1.3 else 1440
    if w > tope: im = im.resize((tope, int(h * tope / w)), Image.LANCZOS)
    im.save(o, 'JPEG', quality=84, optimize=True)
    return o

class Armador:
    def __init__(self, doc, ancho_util):
        self.d = doc; self.ancho = ancho_util; self.n_lista = 0; self.figs = 0

    def h(self, nivel, txt, salto=False):
        p = self.d.add_heading(txt, level=nivel)
        if salto: p.paragraph_format.page_break_before = True
        return p

    def p(self, txt, **k):
        par = self.d.add_paragraph(); texto_rico(par, txt); return par

    def pasos(self, items):
        # numeración propia (1., 2., …) para que no siga de una lista a otra
        for i, t in enumerate(items, 1):
            par = self.d.add_paragraph(); par.paragraph_format.left_indent = Cm(0.9); par.paragraph_format.first_line_indent = Cm(-0.6); par.paragraph_format.space_after = Pt(3)
            r = par.add_run(f'{i}. '); r.bold = True; r.font.color.rgb = TURQ
            texto_rico(par, t)

    def vinetas(self, items):
        for t in items:
            par = self.d.add_paragraph(); par.paragraph_format.left_indent = Cm(0.9); par.paragraph_format.first_line_indent = Cm(-0.5); par.paragraph_format.space_after = Pt(3)
            r = par.add_run('•  '); r.bold = True; r.font.color.rgb = TURQ
            texto_rico(par, t)

    def recuadro(self, titulo, txt, fondo, borde, colt):
        t = self.d.add_table(rows=1, cols=1); t.alignment = WD_TABLE_ALIGNMENT.CENTER
        c = t.rows[0].cells[0]; sombra(c, fondo); bordes_celda(c, izq=borde); margenes_celda(c, 0.3); no_partir(t.rows[0])
        p0 = c.paragraphs[0]; r = p0.add_run(titulo); r.bold = True; r.font.color.rgb = colt; p0.paragraph_format.space_after = Pt(2)
        for i, linea in enumerate(txt if isinstance(txt, list) else [txt]):
            par = c.add_paragraph(); texto_rico(par, linea); par.paragraph_format.space_after = Pt(2)
        self.d.add_paragraph().paragraph_format.space_after = Pt(2)

    def consejo(self, txt): self.recuadro('Consejo', txt, 'E8F2F7', '1E6F91', TURQ)
    def atencion(self, txt): self.recuadro('Atención', txt, 'FFF4E5', 'E08A00', RGBColor(0xB0, 0x5E, 0x00))

    def tabla(self, cab, filas, anchos=None):
        t = self.d.add_table(rows=1, cols=len(cab)); t.style = 'Table Grid'; t.alignment = WD_TABLE_ALIGNMENT.CENTER
        for i, x in enumerate(cab):
            c = t.rows[0].cells[i]; sombra(c, '28285E'); c.paragraphs[0].text = ''; r = c.paragraphs[0].add_run(x); r.bold = True; r.font.color.rgb = RGBColor(255, 255, 255); r.font.size = Pt(9.5)
        for f in filas:
            row = t.add_row(); no_partir(row)
            for i, x in enumerate(f):
                c = row.cells[i]; par = c.paragraphs[0]
                texto_rico(par, x, tam=9.5)
                if i == 0:
                    for r in par.runs: r.bold = True
        # encabezado que se repite
        trPr = t.rows[0]._tr.get_or_add_trPr(); e = OxmlElement('w:tblHeader'); trPr.append(e)
        if not anchos: anchos = [17.0 / len(cab)] * len(cab)
        t.autofit = False
        for i, w in enumerate(anchos): t.columns[i].width = Cm(w)
        for row in t.rows:
            for i, w in enumerate(anchos): row.cells[i].width = Cm(w)
        self.d.add_paragraph().paragraph_format.space_after = Pt(2)

    def _foto(self, par, nombre, ancho_cm, alto_max_cm):
        f = os.path.join(IMG, nombre + '.png')
        if not os.path.exists(f):
            r = par.add_run('[falta la captura ' + nombre + ']'); r.font.color.rgb = RGBColor(200, 0, 0); print('FALTA', nombre); return
        f = optimizar(f)
        w, h = Image.open(f).size
        ancho = Cm(ancho_cm); alto = int(ancho * h / w)
        if alto > Cm(alto_max_cm): alto = Cm(alto_max_cm); ancho = int(alto * w / h)
        par.add_run().add_picture(f, width=ancho, height=alto)

    def img(self, nombre, pie, ancho=16.0, alto_max=19.0):
        self.pegar()
        par = self.d.add_paragraph(); par.alignment = WD_ALIGN_PARAGRAPH.CENTER; par.paragraph_format.keep_with_next = True; par.paragraph_format.space_after = Pt(2)
        self._foto(par, nombre, ancho, alto_max)
        self.pie(pie)

    def pie(self, pie):
        if not pie: return
        cap = self.d.add_paragraph(); cap.alignment = WD_ALIGN_PARAGRAPH.CENTER; r = cap.add_run(pie); r.italic = True; r.font.size = Pt(9); r.font.color.rgb = GRIS
        cap.paragraph_format.space_after = Pt(8)

    def pegar(self):
        # el último párrafo de texto va en la misma página que la captura que sigue
        ps = self.d.paragraphs
        if ps: ps[-1].paragraph_format.keep_with_next = True

    def cel(self, *pares, alto=10.5):
        self.pegar()
        # una, dos o tres capturas del celu una al lado de la otra: pares = (nombre, pie)
        n = len(pares); t = self.d.add_table(rows=2, cols=n); t.alignment = WD_TABLE_ALIGNMENT.CENTER
        ancho = min(7.4, (self.ancho - 0.4 * n) / n)
        for i, (nom, pie) in enumerate(pares):
            c = t.rows[0].cells[i]; bordes_celda(c); par = c.paragraphs[0]; par.alignment = WD_ALIGN_PARAGRAPH.CENTER
            self._foto(par, nom, ancho, alto)
            c2 = t.rows[1].cells[i]; bordes_celda(c2); p2 = c2.paragraphs[0]; p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r = p2.add_run(pie); r.italic = True; r.font.size = Pt(8.5); r.font.color.rgb = GRIS
        no_partir(t.rows[0])
        trPr = t.rows[0]._tr.get_or_add_trPr()
        self.d.add_paragraph().paragraph_format.space_after = Pt(2)

    def salto(self):
        self.d.add_paragraph().add_run().add_break(WD_BREAK.PAGE)

def portada(d, A, sub, quien):
    for _ in range(5): d.add_paragraph()
    par = d.add_paragraph(); par.alignment = WD_ALIGN_PARAGRAPH.CENTER; par.add_run().add_picture(os.path.join(AQUI, '..', 'capturas', 'logo.png'), width=Cm(8))
    d.add_paragraph()
    par = d.add_paragraph(); par.alignment = WD_ALIGN_PARAGRAPH.CENTER; r = par.add_run('Manual de uso'); r.bold = True; r.font.size = Pt(32); r.font.color.rgb = NAVY
    par = d.add_paragraph(); par.alignment = WD_ALIGN_PARAGRAPH.CENTER; r = par.add_run('App Alumbrado Público'); r.font.size = Pt(17); r.font.color.rgb = TURQ
    d.add_paragraph()
    par = d.add_paragraph(); par.alignment = WD_ALIGN_PARAGRAPH.CENTER; r = par.add_run(sub); r.bold = True; r.font.size = Pt(13); r.font.color.rgb = NAVY
    par = d.add_paragraph(); par.alignment = WD_ALIGN_PARAGRAPH.CENTER; r = par.add_run(C.FECHA_PORTADA); r.font.size = Pt(10.5); r.font.color.rgb = GRIS
    if quien:
        par = d.add_paragraph(); par.alignment = WD_ALIGN_PARAGRAPH.CENTER; r = par.add_run(quien); r.font.size = Pt(10.5); r.font.color.rgb = GRIS

def indice(d):
    d.add_paragraph().add_run().add_break(WD_BREAK.PAGE)
    p = d.add_paragraph(); r = p.add_run('Contenido'); r.bold = True; r.font.size = Pt(19); r.font.color.rgb = NAVY
    p = d.add_paragraph(); campo(p, 'TOC \\o "1-2" \\h \\z \\u')

def main():
    sal = sys.argv[1]; modo = sys.argv[2] if len(sys.argv) > 2 else 'todo'
    d = Document(); estilos(d)
    s = d.sections[0]; s.page_width = Cm(21); s.page_height = Cm(29.7); s.left_margin = s.right_margin = Cm(2); s.top_margin = Cm(2); s.bottom_margin = Cm(1.8)
    s.header_distance = Cm(0.9); s.footer_distance = Cm(0.8); s.different_first_page_header_footer = True
    hp = s.header.paragraphs[0]; hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT; r = hp.add_run('Manual de uso · App Alumbrado Público · EMA Servicios'); r.font.size = Pt(8); r.font.color.rgb = GRIS
    fp = s.footer.paragraphs[0]; fp.alignment = WD_ALIGN_PARAGRAPH.CENTER; r = fp.add_run('Página '); r.font.size = Pt(8.5); r.font.color.rgb = GRIS
    campo(fp, 'PAGE')
    for r in fp.runs: r.font.size = Pt(8.5)
    A = Armador(d, 17.0)
    sub, quien = C.PORTADAS[modo]
    portada(d, A, sub, quien)
    indice(d)
    C.escribir(A, modo)
    d.core_properties.title = 'Manual de uso — App Alumbrado Público'; d.core_properties.author = 'EMA Servicios'
    d.save(sal); print('ok', sal)

if __name__ == '__main__':
    main()
