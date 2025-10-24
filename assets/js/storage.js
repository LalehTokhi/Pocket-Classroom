// assets/js/storage.js
import { safeParse, uid } from './utils.js';

export const INDEX_KEY = 'pc_capsules_index';

function readRaw(key) { return localStorage.getItem(key); }
function writeRaw(key, val) { localStorage.setItem(key, val); }

export function getIndex() {
  const s = readRaw(INDEX_KEY);
  return safeParse(s) || [];
}

export function saveIndex(index) {
  writeRaw(INDEX_KEY, JSON.stringify(index));
}

export function saveCapsule(capsule) {
  // ensure id and timestamps
  if(!capsule.id) capsule.id = uid('capsule');
  capsule.updatedAt = new Date().toISOString();
  // write capsule
  writeRaw(`pc_capsule_${capsule.id}`, JSON.stringify(capsule));
  // update index summary
  const idx = getIndex();
  const summary = {
    id: capsule.id,
    title: (capsule.meta && capsule.meta.title) ? capsule.meta.title : 'Untitled',
    subject: capsule.meta?.subject || '',
    level: capsule.meta?.level || '',
    updatedAt: capsule.updatedAt
  };
  const found = idx.find(i => i.id === capsule.id);
  if(found) Object.assign(found, summary);
  else idx.unshift(summary);
  saveIndex(idx);
  return capsule.id;
}

export function getCapsule(id) {
  if(!id) return null;
  return safeParse(readRaw(`pc_capsule_${id}`));
}

export function deleteCapsule(id) {
  localStorage.removeItem(`pc_capsule_${id}`);
  const idx = getIndex().filter(i => i.id !== id);
  saveIndex(idx);
  localStorage.removeItem(`pc_progress_${id}`);
}

export function getProgress(id) {
  const s = safeParse(readRaw(`pc_progress_${id}`)) || { bestScore: 0, knownFlashcards: [] };
  // normalize
  s.knownFlashcards = s.knownFlashcards || [];
  s.bestScore = s.bestScore || 0;
  return s;
}

export function saveProgress(id, progress) {
  writeRaw(`pc_progress_${id}`, JSON.stringify(progress));
}