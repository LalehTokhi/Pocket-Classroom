// assets/js/utils.js
export function uid(prefix = 'id') {
  return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8);
}

export function safeParse(s) {
  try { return JSON.parse(s); } catch(e) { return null; }
}

export function escapeHtml(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'", '&#39;');
}

export function debounce(fn, wait = 400) {
  let t;
  return (...args)=>{ clearTimeout(t); t = setTimeout(()=> fn(...args), wait); };
}

export function timeAgo(iso) {
  if(!iso) return '';
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff/1000);
  if(sec < 60) return `${sec} sec ago`;
  const min = Math.floor(sec/60);
  if(min < 60) return `${min} min ago`;
  const hr = Math.floor(min/60);
  if(hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr/24);
  return `${day} day(s) ago`;
}

export function downloadJSON(obj, filename = 'pocket-capsule.json') {
  const blob = new Blob([JSON.stringify(obj, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}