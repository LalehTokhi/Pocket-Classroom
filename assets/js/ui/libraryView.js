// assets/js/ui/libraryView.js
import { getIndex, getCapsule, deleteCapsule } from '../storage.js';
import { timeAgo, escapeHtml, downloadJSON } from '../utils.js';

export function renderLibrary(container, router) {
  container.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3>Library</h3>
      <div><small class="text-muted">Press <kbd>Space</kbd> to flip flashcards in Learn mode</small></div>
    </div>
    <div id="libraryGrid" class="row gy-3"></div>
    <div class="mt-4">
      <button id="createNewBtn" class="btn btn-primary btn-sm"><i class="bi bi-plus-lg"></i> New Capsule</button>
      <button id="clearAllBtn" class="btn btn-outline-danger btn-sm ms-2">Clear All (LocalStorage)</button>
    </div>
  `;

  const grid = container.querySelector('#libraryGrid');

  function render() {
    const idx = getIndex();
    if(!idx.length) {
      grid.innerHTML = `<div class="col-12"><div class="empty-state card p-4 text-center">No capsules yet. Click “New Capsule” to create one.</div></div>`;
      return;
    }


    grid.innerHTML = idx.map(item => `
      <div class="col-12 col-md-6">
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h5 class="card-title mb-1">${escapeHtml(item.title)}</h5>
                <div class="text-muted">${escapeHtml(item.subject)} · ${escapeHtml(item.level)}</div>
              </div>
              <div class="text-end text-muted small">${timeAgo(item.updatedAt)}</div>
            </div>
            <div class="mt-3 d-flex gap-2">
              <button class="btn btn-sm btn-success btn-learn" data-id="${item.id}"><i class="bi bi-play-fill"></i> Learn</button>
              <button class="btn btn-sm btn-outline-secondary btn-edit" data-id="${item.id}"><i class="bi bi-pencil"></i> Edit</button>
              <button class="btn btn-sm btn-outline-primary btn-export" data-id="${item.id}"><i class="bi bi-download"></i> Export</button>
              <button class="btn btn-sm btn-outline-danger btn-delete ms-auto" data-id="${item.id}"><i class="bi bi-trash"></i> Delete</button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // events delegation
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if(!btn) return;
    const id = btn.dataset.id;
    if(btn.classList.contains('btn-learn')) router.navigate(`/learn/${id}`);
    if(btn.classList.contains('btn-edit')) router.navigate(`/author/${id}`);
    if(btn.classList.contains('btn-delete')) {
      if(confirm('Are you sure you want to delete this capsule? This action cannot be undone.')) {
        deleteCapsule(id);
        render();
      }
    }
    if(btn.classList.contains('btn-export')) {
      const capsule = getCapsule(id);
      if(capsule) {
        capsule.schema = capsule.schema || 'pocket-classroom/v1';
        downloadJSON(capsule, `${(capsule.meta?.title || 'capsule').replaceAll(' ', '_')}.json`);
      } else alert('Capsule not found.');
    }
  });

  container.querySelector('#createNewBtn').addEventListener('click', () => router.navigate('/author/new'));
  container.querySelector('#clearAllBtn').addEventListener('click', () => {
    if(confirm('Clear entire LocalStorage? This will remove all capsules and progress.')) {
      localStorage.clear();
      render();
    }
  });

  render();
}