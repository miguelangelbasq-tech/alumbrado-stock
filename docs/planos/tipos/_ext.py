import re,sys
L=open('v130/130_2026-11-07_app-EMA_ORIGINAL.html').read().split('\n')
t='\n'.join(L[45903:46870])
def obj(start):
    i=t.index('{',start); d=0; j=i
    instr=None
    while True:
        c=t[j]
        if instr:
            if c=='\\': j+=2; continue
            if c==instr: instr=None
        elif c in '"\'`': instr=c
        elif c=='{': d+=1
        elif c=='}':
            d-=1
            if d==0: return t[i:j+1]
        j+=1
for k in sys.argv[1:]:
    for pat in [r're\.'+k+r' = \{', r'B\.'+k+r' = \{', r's\("'+k+r'", \{']:
        for m in re.finditer(pat,t):
            print("#####",pat); print(obj(m.start()))
