// Minimal local shim to replace Firebase APIs after removal.
// Provides lightweight no-op / in-memory implementations so the app keeps building.

type Unsubscribe = () => void;

const _authState: { currentUser: any | null; _listeners: Function[] } = {
  currentUser: null,
  _listeners: [],
};

export const auth = {
  get currentUser() {
    return _authState.currentUser;
  },
};

export function onAuthStateChanged(_: any, cb: (u: any) => void): Unsubscribe {
  _authState._listeners.push(cb);
  // Immediately call back with current user (null by default)
  try {
    cb(_authState.currentUser);
  } catch (e) {
    // ignore
  }
  return () => {
    const i = _authState._listeners.indexOf(cb);
    if (i >= 0) _authState._listeners.splice(i, 1);
  };
}

function _notifyAuth(user: any | null) {
  _authState.currentUser = user;
  for (const l of [..._authState._listeners]) l(user);
}

export async function createUserWithEmailAndPassword(_: any, email: string) {
  const user = { uid: `local-${Date.now()}`, email };
  _notifyAuth(user);
  return { user };
}

export async function signInWithEmailAndPassword(_: any, email: string) {
  const user = { uid: `local-${Date.now()}`, email };
  _notifyAuth(user);
  return { user };
}

export async function signOut(_: any) {
  _notifyAuth(null);
}

export async function sendEmailVerification(_: any) {
  return Promise.resolve();
}

export async function sendPasswordResetEmail(_: any) {
  return Promise.resolve();
}

// Minimal in-memory Firestore-like store
const _store: Map<string, Map<string, any>> = new Map();

export const db: any = {};

export function collection(_: any, path: string) {
  return { _path: path };
}

export function doc(_: any, ...segments: string[]) {
  const id = segments.length > 1 ? segments[segments.length - 1] : "";
  const path = segments.join("/");
  return { _path: path, id };
}

export async function addDoc(collRef: any, data: any) {
  const path = collRef._path;
  if (!path) throw new Error("Invalid collection reference");
  const col = _store.get(path) || new Map<string, any>();
  const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  col.set(id, { ...data, id });
  _store.set(path, col);
  return { id, ref: { id, path } };
}

export async function getDocs(_: any) {
  // Accept collection refs or queries; always return empty list for simplicity
  return { docs: [], empty: true };
}

export async function getDoc(docRef: any) {
  return { exists: () => false, data: () => null };
}

export async function updateDoc(_: any, __: any) {
  return Promise.resolve();
}

export async function deleteDoc(_: any) {
  return Promise.resolve();
}

export function query(collRef: any, ...clauses: any[]) {
  return { _collection: collRef._path, _clauses: clauses };
}

export function where(field: string, op: string, value: any) {
  return { type: "where", field, op, value };
}

export function orderBy(_: string) {
  return {};
}

export function limit(n: number) {
  return { _limit: n };
}

export async function getCountFromServer(_: any) {
  return { data: () => ({ count: 0 }) };
}

export function onSnapshot(_: any, cb: (snap: any) => void) {
  try {
    cb({ docs: [] });
  } catch (e) {
    // ignore
  }
  return () => {};
}

export function writeBatch(_: any) {
  const ops: any[] = [];
  return {
    update(ref: any, data: any) {
      ops.push({ type: "update", ref, data });
    },
    commit: async () => Promise.resolve(),
  };
}

export const Timestamp = {
  now: () => ({ toDate: () => new Date() }),
};

export function serverTimestamp() {
  return new Date();
}

// Minimal storage shim
const _storage: Map<string, Blob> = new Map();

export function getStorage() {
  return {};
}

export function ref(_: any, path: string) {
  return { _path: path };
}

export async function uploadBytes(reference: any, file: Blob) {
  _storage.set(reference._path, file);
  return { ref: reference };
}

export async function getDownloadURL(reference: any) {
  return `https://local.storage/${encodeURIComponent(reference._path)}`;
}

// Exported auth/firestore/storage helpers used by the app
export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged as onAuthStateChanged,
  collection as collection,
  doc as doc,
  addDoc as addDoc,
  getDocs as getDocs,
  getDoc as getDoc,
  updateDoc as updateDoc,
  deleteDoc as deleteDoc,
  query as query,
  where as where,
  orderBy as orderBy,
  limit as limit,
  getCountFromServer as getCountFromServer,
  onSnapshot as onSnapshot,
  writeBatch as writeBatch,
  Timestamp as Timestamp,
  serverTimestamp as serverTimestamp,
  getStorage as getStorage,
  ref as ref,
  uploadBytes as uploadBytes,
  getDownloadURL as getDownloadURL,
};
