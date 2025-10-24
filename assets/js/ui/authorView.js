// assets/js/ui/authorView.js
import { getCapsule, saveCapsule } from '../storage.js';
import { uid, debounce, escapeHtml } from '../utils.js';

function emptyCapsule() {
  return {
    schema: 'pocket-classroom/v1',
    id: null,
    meta: { title: '', subject: '', level: 'Beginner', description: '' },
    notes: [],
    flashcards: [],
    quiz: []
  };
}

export function renderAuthor(container, router, capsuleId) {
  let capsule = (capsuleId && getCapsule(capsuleId)) ? getCapsule(capsuleId) : emptyCapsule();
  if(!capsule.id) capsule.id = uid('capsule');

  container.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3>Author — ${escapeHtml(capsule.meta.title || 'New Capsule')}</h3>
      <div>
        <button id="saveBtn" class="btn btn-primary btn-sm">Save</button>
        <button id="backBtn" class="btn btn-outline-secondary btn-sm ms-2">Back</button>
      </div>
    </div>

    <div class="card p-3 mb-3">
      <div class="row g-2">
        <div class="col-12 col-md-6">
          <label class="form-label">Title *</label>
          <input id="title" class="form-control" value="${escapeHtml(capsule.meta.title || '')}" />
        </div>
        <div class="col-6 col-md-3">
          <label class="form-label">Subject</label>
          <input id="subject" class="form-control" value="${escapeHtml(capsule.meta.subject || '')}" />
        </div>
        <div class="col-6 col-md-3">
          <label class="form-label">Level</label>
          <select id="level" class="form-select">
            <option ${capsule.meta.level==='Beginner'?'selected':''}>Beginner</option>
            <option ${capsule.meta.level==='Intermediate'?'selected':''}>Intermediate</option>
            <option ${capsule.meta.level==='Advanced'?'selected':''}>Advanced</option>
          </select>
        </div>
        <div class="col-12">
          <label class="form-label">Description</label>
          <textarea id="description" class="form-control" rows="2">${escapeHtml(capsule.meta.description || '')}</textarea>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-12 col-md-6">
        <div class="card p-3 mb-3">
          <h6>Notes</h6>
          <div id="notesList"></div>
          <div class="mt-2">
            <textarea id="newNote" class="form-control" rows="3" placeholder="Add new notes (one per line)"></textarea>
            <div class="mt-2 d-flex gap-2">
              <button id="addNoteBtn" class="btn btn-sm btn-success">Add</button>
              <button id="clearNotesBtn" class="btn btn-sm btn-outline-danger">Clear</button>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-6">
        <div class="card p-3 mb-3">
          <h6>Flashcards</h6>
          <div id="flashcardsList"></div>
          <button id="addFCBtn" class="btn btn-sm btn-success mt-2">Add Flashcard</button>
        </div>

        <div class="card p-3">
          <h6>Quiz (Multiple choice)</h6>
          <div id="quizList"></div>
          <button id="addQuizBtn" class="btn btn-sm btn-success mt-2">Add Question</button>
        </div>
      </div>
    </div>
  `;

  // references
  const notesList = container.querySelector('#notesList');
  const flashcardsList = container.querySelector('#flashcardsList');
  const quizList = container.querySelector('#quizList');

  function renderNotes(){
    if(!(capsule.notes && capsule.notes.length)) {
      notesList.innerHTML = '<div class="text-muted">No notes yet.</div>'; return;
    }
    notesList.innerHTML = capsule.notes.map((n, idx) => `
      <div class="d-flex align-items-start gap-2 mb-2">
        <div class="flex-grow-1 border rounded p-2">${escapeHtml(n)}</div>
        <div><button class="btn btn-sm btn-outline-danger btn-delete-note" data-i="${idx}"><i class="bi bi-trash"></i></button></div>
      </div>
    `).join('');
  }

  function renderFlashcards(){
    if(!(capsule.flashcards && capsule.flashcards.length)) {
      flashcardsList.innerHTML = '<div class="text-muted">No flashcards yet.</div>'; return;
    }
    flashcardsList.innerHTML = capsule.flashcards.map((c, i) => `
      <div class="mb-2">
        <div class="d-flex gap-2">
          <input class="form-control form-control-sm fc-front" data-i="${i}" value="${escapeHtml(c.front||'')}" placeholder="Front"/>
          <input class="form-control form-control-sm fc-back" data-i="${i}" value="${escapeHtml(c.back||'')}" placeholder="Back"/>
          <button class="btn btn-sm btn-outline-danger btn-del-fc" data-i="${i}"><i class="bi bi-trash"></i></button>
        </div>
      </div>
    `).join('');
  }

  function renderQuiz(){
    if(!(capsule.quiz && capsule.quiz.length)) {
      quizList.innerHTML = '<div class="text-muted">No questions yet.</div>'; return;
    }
    quizList.innerHTML = capsule.quiz.map((q, i) => `
      <div class="border rounded p-2 mb-2">
        <div class="d-flex">
          <input class="form-control form-control-sm quiz-question" data-i="${i}" value="${escapeHtml(q.question||'')}" placeholder="Question"/>
          <button class="btn btn-sm btn-outline-danger ms-2 btn-del-q" data-i="${i}"><i class="bi bi-trash"></i></button>
        </div>
        <div class="mt-2">
          ${[0,1,2,3].map(j => `
            <div class="input-group mb-1">
              <span class="input-group-text">${j+1}</span>
              <input class="form-control form-control-sm quiz-choice" data-i="${i}" data-j="${j}" value="${escapeHtml(q.choices?.[j]||'')}" placeholder="Choice ${j+1}">
            </div>
          `).join('')}
          <div class="text-muted">Correct answer:
            <select class="form-select form-select-sm mt-1 correct-select" data-i="${i}">
              ${[0,1,2,3].map(j => `<option value="${j}" ${q.correctIndex===j?'selected':''}>${j+1}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>
    `).join('');
  }

  // initial render
  renderNotes(); renderFlashcards(); renderQuiz();

  // events
  container.querySelector('#addNoteBtn').addEventListener('click', () => {
    const txt = container.querySelector('#newNote').value.trim();
    if(!txt) return alert('Note is empty.');
    const parts = txt.split('\n').map(s=>s.trim()).filter(Boolean);
    capsule.notes = capsule.notes.concat(parts);
    container.querySelector('#newNote').value = '';
    renderNotes();
    debSave();
  });

  notesList.addEventListener('click', (e) => {
    const b = e.target.closest('.btn-delete-note'); if(!b) return;
    const i = Number(b.dataset.i); capsule.notes.splice(i,1); renderNotes(); debSave();
  });

  container.querySelector('#clearNotesBtn').addEventListener('click', ()=> {
    if(confirm('Clear all notes?')) { capsule.notes = []; renderNotes(); debSave(); }
  });

  container.querySelector('#addFCBtn').addEventListener('click', ()=> { capsule.flashcards.push({front:'', back:''}); renderFlashcards(); debSave(); });

  flashcardsList.addEventListener('input', (e) => {
    if(e.target.matches('.fc-front')) {
      const i = Number(e.target.dataset.i); capsule.flashcards[i].front = e.target.value;
    }
    if(e.target.matches('.fc-back')) {
      const i = Number(e.target.dataset.i); capsule.flashcards[i].back = e.target.value;
    }
    debSave();
  });

  flashcardsList.addEventListener('click', (e) => {
    const b = e.target.closest('.btn-del-fc'); if(!b) return; const i = Number(b.dataset.i); capsule.flashcards.splice(i,1); renderFlashcards(); debSave();
  });

  container.querySelector('#addQuizBtn').addEventListener('click', ()=> {
    capsule.quiz.push({ question: '', choices: ['','','',''], correctIndex: 0 });
    renderQuiz(); debSave();
  });

  quizList.addEventListener('input', (e) => {
    if(e.target.matches('.quiz-question')) { const i = Number(e.target.dataset.i); capsule.quiz[i].question = e.target.value; }
    if(e.target.matches('.quiz-choice')) { const i = Number(e.target.dataset.i); const j = Number(e.target.dataset.j); capsule.quiz[i].choices[j] = e.target.value; }
    if(e.target.matches('.correct-select')) { const i = Number(e.target.dataset.i); capsule.quiz[i].
        correctIndex = Number(e.target.value); }
    debSave();
  });

  quizList.addEventListener('click', (e) => {
    const b = e.target.closest('.btn-del-q'); if(!b) return; const i = Number(b.dataset.i); capsule.quiz.splice(i,1); renderQuiz(); debSave();
  });

  // meta fields
  const titleInput = container.querySelector('#title');
  const subjectInput = container.querySelector('#subject');
  const levelInput = container.querySelector('#level');
  const descInput = container.querySelector('#description');

  titleInput.addEventListener('input', ()=> { capsule.meta.title = titleInput.value; debSave(); });
  subjectInput.addEventListener('input', ()=> { capsule.meta.subject = subjectInput.value; debSave(); });
  levelInput.addEventListener('change', ()=> { capsule.meta.level = levelInput.value; debSave(); });
  descInput.addEventListener('input', ()=> { capsule.meta.description = descInput.value; debSave(); });

  container.querySelector('#saveBtn').addEventListener('click', ()=> {
    const ok = validateAndSave(true);
    if(ok) alert('Saved successfully.');
  });

  container.querySelector('#backBtn').addEventListener('click', ()=> router.navigate('/library'));

  const debSave = debounce(()=> { validateAndSave(false); }, 800);

  function validateAndSave(showAlert = true) {
    // cleanup empty items
    capsule.notes = (capsule.notes || []).map(s => s.trim()).filter(Boolean);
    capsule.flashcards = (capsule.flashcards || []).filter(fc => (fc.front||'').trim()  (fc.back||'').trim());
    capsule.quiz = (capsule.quiz || []).map(q => {
      q.choices = (q.choices || []).map(c => c || '');
      return q;
    }).filter(q => (q.question||'').trim() && q.choices.some(Boolean));

    if(!(capsule.meta.title || '').trim()) { if(showAlert) alert('Title is required.'); return false; }
    if(!(capsule.notes.length || capsule.flashcards.length || capsule.quiz.length)) { if(showAlert) alert('Please add at least notes, flashcards or quiz.'); return false; }

    saveCapsule(capsule);
    return true;
  }

  window.addEventListener('beforeunload', ()=> { validateAndSave(false); });
}

