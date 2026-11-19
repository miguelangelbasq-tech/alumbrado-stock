// v181 · prueba del camino «SDK real» (prototipos: DocumentReference, CollectionReference.add, WriteBatch, Transaction con reintento) con clases falsas al estilo compat. Uso: node real_sdk.js [registroCambios.js]
const fs = require('fs');
const DB = { avanceObras: { p1: { nombre: 'A', mapaColor: '#EA4335' } }, gastosObra: { g1: { importe: 5, desc: 'x' } } };
const clon = (o) => o === undefined ? undefined : JSON.parse(JSON.stringify(o));
class DocSnap { constructor(c, id) { this.id = id; this._d = clon((DB[c] || {})[id]); this.exists = this._d !== undefined; } data() { return clon(this._d); } }
class QuerySnap { constructor(c) { this.docs = Object.keys(DB[c] || {}).map((id) => new DocSnap(c, id)); this.size = this.docs.length; } forEach(f) { this.docs.forEach(f); } }
const oy = [];
const avisar = () => setTimeout(() => oy.forEach((f) => f()), 0);
class Query { constructor(c) { this._c = c; this.path = c; } get() { return Promise.resolve(new QuerySnap(this._c)); } onSnapshot(cb) { const f = () => cb(new QuerySnap(this._c)); oy.push(f); setTimeout(f, 0); return () => {}; } where() { return new Query(this._c); } }
let auto = 0;
class DocumentReference { constructor(c, id) { this._c = c; this.id = id; this.path = c + '/' + id; }
  set(d, o) { DB[this._c] = DB[this._c] || {}; DB[this._c][this.id] = o && o.merge ? Object.assign({}, DB[this._c][this.id], d) : clon(d); avisar(); return Promise.resolve(); }
  update(d) { const x = DB[this._c][this.id]; Object.keys(d).forEach((k) => { if (d[k] && d[k]._methodName === 'FieldValue.delete') delete x[k]; else x[k] = d[k]; }); avisar(); return Promise.resolve(); }
  delete() { delete DB[this._c][this.id]; avisar(); return Promise.resolve(); }
  get(o) { return Promise.resolve(new DocSnap(this._c, this.id)); } onSnapshot(cb) { setTimeout(() => cb(new DocSnap(this._c, this.id)), 0); return () => {}; } }
class CollectionReference extends Query { doc(id) { return new DocumentReference(this._c, id || 'auto' + (++auto)); } add(d) { const r = this.doc(); return r.set(d).then(() => r); } get id() { return this._c; } }
class WriteBatch { constructor() { this.o = []; } set(r, d, o) { this.o.push(() => DB[r._c][r.id] = clon(d)); return this; } update(r, d) { this.o.push(() => Object.assign(DB[r._c][r.id], d)); return this; } delete(r) { this.o.push(() => delete DB[r._c][r.id]); return this; } commit() { this.o.forEach((f) => f()); avisar(); return Promise.resolve(); } }
class Transaction { constructor() { this.o = []; } get(r) { return r.get(); } set(r, d) { this.o.push(() => DB[r._c][r.id] = clon(d)); return this; } update(r, d) { this.o.push(() => Object.assign(DB[r._c][r.id], d)); return this; } delete(r) { this.o.push(() => delete DB[r._c][r.id]); return this; } }
class Firestore { collection(c) { return new CollectionReference(c); } batch() { return new WriteBatch(); } async runTransaction(fn) { let r; for (let i = 0; i < 2; i++) { const tx = new Transaction(); r = await fn(tx); if (i === 1) tx.o.forEach((f) => f()); } return r; } }
const fsI = new Firestore();
const firestore = () => fsI; Object.assign(firestore, { DocumentReference, CollectionReference, Query, WriteBatch, Transaction, Firestore, FieldValue: { delete: () => ({ _methodName: 'FieldValue.delete' }) } });
const LS = {};
global.window = global; global.firebase = { firestore };
global.localStorage = { getItem: (k) => LS[k] || null, setItem: (k, v) => { LS[k] = v; } };
const ev = {}; global.addEventListener = (t, f) => {}; global.document = { addEventListener: () => {}, getElementById: () => null, querySelectorAll: () => [], body: { classList: { contains: () => false } }, hidden: false };
global.__fbUser = { email: 'admin@x', uid: 'u1' }; global.PERMISOS = { yo: () => ({ rol: 'admin', nombre: 'Ana' }) };
global.__rcEspera = 50; global.__rcTope = 200;
eval(fs.readFileSync(process.argv[2] || (__dirname + "/registroCambios.js"), "utf8"));
(async () => {
  const f = firebase.firestore();
  f.collection('avanceObras').onSnapshot(() => {}); f.collection('gastosObra').onSnapshot(() => {});
  await new Promise((r) => setTimeout(r, 20));
  await f.collection('avanceObras').doc('p1').update({ mapaColor: '#1A73E8' });
  const r = await f.collection('gastosObra').add({ importe: 9, desc: 'nuevo' });
  const b = f.batch(); b.update(f.collection('avanceObras').doc('p1'), { nombre: 'B' }); b.delete(f.collection('gastosObra').doc('g1')); await b.commit();
  await f.runTransaction(async (tx) => { await tx.get(f.collection('avanceObras').doc('p1')); tx.update(f.collection('avanceObras').doc('p1'), { barrio: 'Centro' }); });
  await new Promise((r) => setTimeout(r, 100));
  await window.__regCambios.flush();
  await new Promise((r) => setTimeout(r, 50));
  const aud = Object.values(DB.auditoria || {});
  console.log('real=', window.__regCambios.real(), 'docs auditoria', aud.length);
  aud.forEach((d) => d.cambios.forEach((E) => console.log(E.t, E.c, E.id, E.n, '|', E.r, E.prev ? '| prev ' + E.prev : '')));
})();
