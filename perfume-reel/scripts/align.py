import json,difflib,re,unicodedata,sys
w=json.load(open(sys.argv[1]))
toks=[]
for c in w:
    s=c['text'].strip(); a,b=c['timestamp']; b=b if b is not None else a+0.3
    if toks and (s.startswith("'") or s.startswith("-")): toks[-1]['w']+=s; toks[-1]['e']=b
    else: toks.append({'w':s,'s':a,'e':b})
txt="Aujourd'hui, je vous parle de l'un de mes parfums préférés, c'est le Tom Ford Ébène Fumé. Ce que j'aime avec lui, c'est son côté boisé, assez mystérieux, avec beaucoup de caractère. C'est un parfum d'une grande élégance et assez audacieux, notamment parce que c'est un parfum qui est dédié à la gente masculine, mais je trouve que justement, quand c'est une femme qui le porte, ça rajoute un petit truc en plus. Et justement, quand on pense à un parfum féminin, on va plutôt s'imaginer quelque chose de subtil, sucré, fleuri, alors que celui-ci va avoir plutôt des notes ambrées avec du bois de santal, donc quelque chose de beaucoup plus fort, plus puissant. Et sur une femme notamment, je trouve que c'est plus percutant. Pour moi, c'est typiquement le genre de fragrance qui laisse une empreinte sans en faire trop. Et croyez-moi, celui-ci, les gens ne vont pas l'oublier. Donc, si vous vouliez changer de parfum, mais que vous ne saviez pas quoi prendre, celui-ci, c'est ma meilleure recommandation."
U=txt.split()
n=lambda s:re.sub(r'[^a-z]','',unicodedata.normalize('NFD',s.lower()).encode('ascii','ignore').decode())
sm=difflib.SequenceMatcher(None,[n(x['w']) for x in toks],[n(x) for x in U],autojunk=False)
res=[None]*len(U)
for tag,i1,i2,j1,j2 in sm.get_opcodes():
    if tag=='equal' or (i2-i1)==(j2-j1):
        for k in range(j2-j1): res[j1+k]=(toks[i1+k]['s'],toks[i1+k]['e'])
    elif i2>i1 and j2>j1:
        s,e=toks[i1]['s'],toks[i2-1]['e']; d=(e-s)/(j2-j1)
        for k in range(j2-j1): res[j1+k]=(s+k*d,s+(k+1)*d)
for k in range(len(U)):
    if res[k] is None: p=res[k-1]; res[k]=(p[1],p[1]+0.2)
print(json.dumps([{'w':U[k],'s':round(res[k][0],2),'e':round(res[k][1],2)} for k in range(len(U))],ensure_ascii=False))
