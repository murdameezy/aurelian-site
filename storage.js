/* ===========================================
   storage.js  –  tiny IndexedDB wrapper
   Keeps your Alpaca key pair (or any future
   settings) in the browser, never on server.
   =========================================== */

const DB_NAME   = 'aurelian';
const DB_VER    = 1;
const STORE     = 'settings';

/* ---------- open (or upgrade) the DB ---------- */
function openDB() {
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: 'id' });
    };
    req.onsuccess = () => res(req.result);
    req.onerror   = () => rej(req.error);
  });
}

/* ---------- generic helpers ---------- */
async function _get(id) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readonly')
                 .objectStore(STORE)
                 .get(id);
    tx.onsuccess = () => res(tx.result ? tx.result.value : null);
    tx.onerror   = () => rej(tx.error);
  });
}

async function _put(id, value) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite')
                 .objectStore(STORE)
                 .put({ id, value });
    tx.onsuccess = () => res();
    tx.onerror   = () => rej(tx.error);
  });
}

async function _del(id) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite')
                 .objectStore(STORE)
                 .delete(id);
    tx.onsuccess = () => res();
    tx.onerror   = () => rej(tx.error);
  });
}

/* ---------- exported API ---------- */

/** Save Alpaca keys (object: {id, secret}) */
export function saveKey(k)       { return _put('alpacaKey', k); }
/** Load keys → {id, secret} or null */
export function loadKey()        { return _get('alpacaKey');    }
/** Clear stored keys */
export function clearKey()       { return _del('alpacaKey');    }

/* Additional generic helpers if needed later */
export function saveSetting(k,v) { return _put(k,v); }
export function loadSetting(k)   { return _get(k);  }
export function delSetting(k)    { return _del(k);  }
