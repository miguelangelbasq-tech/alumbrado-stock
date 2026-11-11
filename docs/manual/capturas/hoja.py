import sys,glob,os
from PIL import Image,ImageDraw
fs=sorted(sys.argv[2:]); H=520; ims=[]
for f in fs:
    i=Image.open(f).convert('RGB'); r=H/i.height; i=i.resize((max(1,int(i.width*r)),H)); d=ImageDraw.Draw(i); d.rectangle([0,0,i.width,16],fill='yellow'); d.text((2,2),os.path.basename(f)[:40],fill='black'); ims.append(i)
W=1800; x=y=0; rows=[]; row=[]
for i in ims:
    if x+i.width>W and row: rows.append(row); row=[]; x=0
    row.append(i); x+=i.width+6
rows.append(row)
o=Image.new('RGB',(W,len(rows)*(H+6)),'gray')
for k,r in enumerate(rows):
    x=0
    for i in r: o.paste(i,(x,k*(H+6))); x+=i.width+6
o.save(sys.argv[1])
