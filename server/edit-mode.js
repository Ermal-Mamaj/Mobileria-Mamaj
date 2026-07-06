// Injected into every page by the server. Does nothing for normal visitors.
// If an admin key is present (saved by logging into /admin), it provides the
// window.omelette.writeFile bridge that <image-slot> checks for — which turns
// on the slots' built-in drag-&-drop / replace / reframe editing UI.
(() => {
  'use strict';
  const KEY = 'mamaj-admin-key';
  const key = () => localStorage.getItem(KEY) || '';
  if (!key()) return;

  let badgeEl = null;
  function badge(text, bad) {
    if (!badgeEl) {
      badgeEl = document.createElement('div');
      badgeEl.style.cssText =
        'position:fixed;left:16px;bottom:16px;z-index:99999;display:flex;align-items:center;gap:10px;' +
        'padding:9px 14px;background:#16222F;color:#EBC84C;border:1px solid #C9A227;' +
        'font:600 11px/1 Inter,system-ui,sans-serif;letter-spacing:1.5px;box-shadow:0 4px 14px rgba(22,34,47,.35)';
      const label = document.createElement('span');
      const exit = document.createElement('span');
      exit.textContent = 'EXIT';
      exit.style.cssText = 'cursor:pointer;color:#F6F2E9;border-bottom:1px solid #C9A227;padding-bottom:1px';
      exit.onclick = () => { localStorage.removeItem(KEY); location.reload(); };
      badgeEl.append(label, exit);
      const mount = () => document.body.appendChild(badgeEl);
      if (document.body) mount();
      else document.addEventListener('DOMContentLoaded', mount);
    }
    badgeEl.firstChild.textContent = text;
    badgeEl.style.color = bad ? '#FF8A80' : '#EBC84C';
  }

  // Install the bridge synchronously so image-slot renders as editable from
  // the first paint. Every write is still authenticated server-side.
  window.omelette = {
    writeFile: (name, content) =>
      fetch('/api/admin/write-state', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-admin-key': key() },
        body: JSON.stringify({ name, content }),
      }).then((r) => {
        if (!r.ok) {
          badge('SAVE FAILED — LOG IN AT /ADMIN AGAIN', true);
          throw new Error('write-state failed: ' + r.status);
        }
        badge('EDIT MODE — SAVED', false);
      }),
  };

  fetch('/api/admin/verify', { method: 'POST', headers: { 'x-admin-key': key() } })
    .then((r) => {
      if (!r.ok) throw new Error('bad key');
      badge('EDIT MODE — DRAG PHOTOS ONTO THE SLOTS', false);
    })
    .catch(() => {
      // Stale key: drop the bridge so the page behaves like a normal visit.
      delete window.omelette;
      localStorage.removeItem(KEY);
      if (badgeEl) badgeEl.remove();
    });
})();
