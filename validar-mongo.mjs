// Ruta Pulppo - prueba de conexión a MongoDB
// Uso (una sola vez):
//   cd "C:\Users\Lenovo\Desktop\Creditos Hipotecarios\landing"
//   npm init -y
//   npm i mongodb
//   node validar-mongo.mjs
// Genera el archivo diagnostico-mongo.json en esta misma carpeta.

import { MongoClient } from 'mongodb';
import { readFileSync, writeFileSync } from 'node:fs';

const uri = readFileSync('./mongoconnection.txt', 'utf8').trim();
const out = { corridoEn: new Date().toISOString(), ok: false };

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });

try {
  await client.connect();
  const admin = client.db().admin();
  out.ping = await client.db().command({ ping: 1 });
  out.ok = true;

  const db = client.db(); // usa la base del connection string (pulppo)
  out.base = db.databaseName;

  try {
    const info = await admin.command({ buildInfo: 1 });
    out.versionServidor = info.version;
  } catch (e) { out.versionServidor = 'sin permiso para buildInfo'; }

  const cols = (await db.listCollections().toArray()).map(c => c.name).sort();
  out.colecciones = [];
  for (const name of cols) {
    let count = null;
    try { count = await db.collection(name).estimatedDocumentCount(); } catch (e) { count = 'sin permiso'; }
    out.colecciones.push({ nombre: name, documentos: count });
  }

  // Muestra la forma (solo nombres de campos, sin datos) de las colecciones clave
  const claves = ['agents', 'companies', 'leads', 'Properties', 'properties', 'operations', 'searches', 'visits', 'Metrics'];
  out.campos = {};
  for (const name of claves) {
    if (!cols.includes(name)) continue;
    try {
      const doc = await db.collection(name).findOne({}, { projection: { _id: 0 } });
      out.campos[name] = doc ? Object.keys(doc).sort() : 'colección vacía';
    } catch (e) { out.campos[name] = 'sin permiso de lectura'; }
  }

  // Pista para la métrica de WhatsApp: qué campos del asesor suenan a vinculación
  if (out.campos.agents && Array.isArray(out.campos.agents)) {
    out.posiblesCamposWhatsapp = out.campos.agents.filter(k => /whats|phone|meta|coexist|linked|conect/i.test(k));
  }
} catch (e) {
  out.error = `${e.name}: ${e.message}`;
} finally {
  await client.close().catch(() => {});
  writeFileSync('./diagnostico-mongo.json', JSON.stringify(out, null, 2), 'utf8');
  console.log(out.ok ? 'Conexión OK. Revisa diagnostico-mongo.json' : 'Falló: ' + out.error);
}
