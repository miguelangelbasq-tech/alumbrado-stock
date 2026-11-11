# Abre el DOCX con LibreOffice, llena el índice (páginas) y guarda ODT / DOCX / PDF.
# Uso: /usr/bin/python3 actualizar.py entrada.docx salida_sin_extension [odt,docx,pdf]
import sys, os, time, subprocess, uno
from com.sun.star.beans import PropertyValue

def pv(n, v):
    p = PropertyValue(); p.Name = n; p.Value = v; return p

def conectar():
    perfil = '/tmp/lo_manual_perfil'
    proc = subprocess.Popen(['soffice', '--headless', '--invisible', '--norestore', '-env:UserInstallation=file://' + perfil,
                             '--accept=socket,host=127.0.0.1,port=2099;urp;'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    local = uno.getComponentContext(); res = local.ServiceManager.createInstanceWithContext('com.sun.star.bridge.UnoUrlResolver', local)
    for _ in range(60):
        try:
            ctx = res.resolve('uno:socket,host=127.0.0.1,port=2099;urp;StarOffice.ComponentContext'); return proc, ctx
        except Exception:
            time.sleep(0.5)
    raise SystemExit('no arrancó LibreOffice')

def main():
    ent = os.path.abspath(sys.argv[1]); sal = os.path.abspath(sys.argv[2]); fmts = (sys.argv[3] if len(sys.argv) > 3 else 'odt,docx,pdf').split(',')
    proc, ctx = conectar()
    try:
        desk = ctx.ServiceManager.createInstanceWithContext('com.sun.star.frame.Desktop', ctx)
        doc = desk.loadComponentFromURL(uno.systemPathToFileUrl(ent), '_blank', 0, (pv('Hidden', True),))
        for _ in range(2):
            idx = doc.getDocumentIndexes()
            for i in range(idx.getCount()): idx.getByIndex(i).update()
            doc.refresh()
            try: doc.getTextFields().refresh()
            except Exception: pass
        for f in fmts:
            filtro = {'odt': 'writer8', 'docx': 'MS Word 2007 XML', 'pdf': 'writer_pdf_Export'}[f]
            props = [pv('FilterName', filtro), pv('Overwrite', True)]
            if f == 'pdf':
                props.append(pv('FilterData', uno.Any('[]com.sun.star.beans.PropertyValue', tuple([pv('ExportBookmarks', True), pv('Quality', 88), pv('ReduceImageResolution', True), pv('MaxImageResolution', 200), pv('UseTaggedPDF', True)]))))
            doc.storeToURL(uno.systemPathToFileUrl(sal + '.' + f), tuple(props)); print('ok', sal + '.' + f)
        doc.close(True)
    finally:
        try: desk.terminate()
        except Exception: pass
        time.sleep(1); proc.kill()

main()
