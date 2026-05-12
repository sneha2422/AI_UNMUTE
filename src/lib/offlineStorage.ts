// src/lib/offlineStorage.ts
import { openDB } from 'idb';

const DB_NAME = 'unmute-offline';
const DB_VERSION = 1;

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('captions')) {
        db.createObjectStore('captions', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('notes')) {
        db.createObjectStore('notes', { keyPath: 'sessionId' });
      }
      if (!db.objectStoreNames.contains('questions')) {
        db.createObjectStore('questions', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

export async function saveCaption(sessionId: string, text: string) {
  const db = await getDB();
  await db.add('captions', { sessionId, text, ts: Date.now(), synced: false });
}

export async function saveNotes(sessionId: string, notes: string[]) {
  const db = await getDB();
  await db.put('notes', { sessionId, notes, ts: Date.now(), synced: false });
}

export async function getNotes(sessionId: string) {
  const db = await getDB();
  return db.get('notes', sessionId);
}

export async function saveQuestion(sessionId: string, question: string, studentName: string) {
  const db = await getDB();
  await db.add('questions', { sessionId, question, studentName, ts: Date.now(), synced: false });
}

export async function getUnsyncedCaptions() {
  const db = await getDB();
  const all = await db.getAll('captions');
  return all.filter((c) => !c.synced);
}

export async function markSynced(store: 'captions' | 'questions', id: number) {
  const db = await getDB();
  const item = await db.get(store, id);
  if (item) {
    item.synced = true;
    await db.put(store, item);
  }
}
