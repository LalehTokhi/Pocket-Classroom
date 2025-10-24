// assets/js/ui/learnView.js
import { getCapsule, getProgress, saveProgress } from '../storage.js';
import { escapeHtml } from '../utils.js';

export function renderLearn(container, router, capsuleId) {
  const capsule = getCapsule(capsuleId);
  if(!capsule) {
    container.innerHTML = '<div class="empty-state card p-4">Capsule not found.</div>';
    return;
  }
  let progress = getProgress(capsuleId);

  container.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3>Learn — ${escapeHtml(capsule.meta.title || 'Untitled')}</h3>
      <div><button id="backBtn" class="btn btn-outline-secondary btn-sm">Back</button></div>
    </div>

    <ul class="nav nav-tabs mb-3" id="learnTabs">
      <li class="nav-item"><a class="nav-link active" data-bs-toggle="tab" data-target="#notesTab">Notes</a></li>
      <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" data-target="#flashTab">Flashcards</a></li>
      <li class="nav-item"><a class="nav-link" data-bs-toggle="tab" data-target="#quizTab">Quiz</a></li>
    </ul>

    <div class="tab-content">
      <div id="notesTab" class="tab-pane active card p-3 mb-3">
        <div class="mb-2 text-muted">${escapeHtml(capsule.meta.subject || '')} · ${escapeHtml(capsule.meta.level || '')}</div>
        <div id="notesContainer"></div>
      </div>

      <div id="flashTab" class="tab-pane card p-3 mb-3">
        <div id="flashArea"></div>
      </div>

      <div id="quizTab" class="tab-pane card p-3 mb-3">
        <div id="quizArea"></div>
      </div>
    </div>
  `;

  container.querySelector('#backBtn').addEventListener('click', ()=> router.navigate('/library'));

  // Notes
  const notesContainer = container.querySelector('#notesContainer');
  if(!(capsule.notes && capsule.notes.length)) {
     notesContainer.innerHTML = '<div class="text-muted">No notes available.</div>';
  }
  else { notesContainer.innerHTML = `<ol>${capsule.notes.map(n => `<li class="mb-2">${escapeHtml(n)}</li>`).join('')}</ol>`;
  }

  // Flashcards
  const flashArea = container.querySelector('#flashArea');
  if(!(capsule.flashcards && capsule.flashcards.length)) {
    flashArea.innerHTML = '<div class="text-muted">No flashcards available.</div>';
  } else {
    let idx = 0;
    flashArea.innerHTML = `
      <div id="fcContainer">
        <div class="flashcard mb-3" id="fcCard">
          <div class="flashcard-inner">
            <div class="flashcard-face flashcard-front card p-3"><div id="fcFront"></div></div>
            <div class="flashcard-face flashcard-back card p-3"><div id="fcBack"></div></div>
          </div>
        </div>
        <div class="d-flex gap-2">
          <button id="prevFc" class="btn btn-sm btn-outline-secondary">Previous</button>
          <button id="flipFc" class="btn btn-sm btn-primary ms-auto">Flip</button>
          <button id="nextFc" class="btn btn-sm btn-outline-secondary">Next</button>
        </div>
        <div class="mt-2 d-flex gap-2">
          <button id="markKnown" class="btn btn-sm btn-success">Mark Known</button>
          <button id="markUnknown" class="btn btn-sm btn-outline-danger">Mark Unknown</button>
        </div>
        <div class="mt-2 text-muted">Card <span id="fcIdx">0</span> of ${capsule.flashcards.length}</div>
      </div>
    `;
    const fcCard = flashArea.querySelector('#fcCard');
    const front = flashArea.querySelector('#fcFront');
    const back = flashArea.querySelector('#fcBack');
    const fcIdxSpan = flashArea.querySelector('#fcIdx');

    function renderCard() {
      const c = capsule.flashcards[idx];
      front.innerHTML = escapeHtml(c.front || '(empty)');
      back.innerHTML = escapeHtml(c.back || '(empty)');
      fcIdxSpan.textContent = idx + 1;
      fcCard.classList.remove('flipped');
    }
    renderCard();

    flashArea.querySelector('#flipFc').addEventListener('click', ()=> fcCard.classList.toggle('flipped'));
    flashArea.querySelector('#prevFc').addEventListener('click', ()=> { idx = (idx - 1 + capsule.flashcards.length) % capsule.flashcards.length; renderCard(); });
    flashArea.
    querySelector('#nextFc').addEventListener('click', ()=> { idx = (idx + 1) % capsule.flashcards.length; renderCard(); });

    flashArea.querySelector('#markKnown').addEventListener('click', ()=> {
      progress.knownFlashcards = Array.from(new Set([...(progress.knownFlashcards || []), idx]));
      saveProgress(capsuleId, progress);
      alert('Marked as known.');
    });

    flashArea.querySelector('#markUnknown').addEventListener('click', ()=> {
      progress.knownFlashcards = (progress.knownFlashcards || []).filter(i => i !== idx);
      saveProgress(capsuleId, progress);
      alert('Marked as unknown.');
    });

    // keyboard flip
    window.addEventListener('keydown', (e) => {
      if(e.code === 'Space' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        fcCard.classList.toggle('flipped');
      }
    });
  }

  // Quiz
  const quizArea = container.querySelector('#quizArea');
  if(!(capsule.quiz && capsule.quiz.length)) {
    quizArea.innerHTML = '<div class="text-muted">No quiz questions available.</div>';
  } else {
    let qidx = 0; let score = 0;
    function renderQuestion() {
      const q = capsule.quiz[qidx];
      quizArea.innerHTML = `
        <div class="mb-2"><strong>Question ${qidx+1}/${capsule.quiz.length}</strong></div>
        <div class="mb-3">${escapeHtml(q.question)}</div>
        <div id="choices"></div>
        <div class="mt-3 text-muted">Score: ${score}</div>
      `;
      const choicesDiv = quizArea.querySelector('#choices');
      choicesDiv.innerHTML = q.choices.map((c,i) => `<div class="mb-2"><button class="btn btn-outline-primary btn-choice" data-i="${i}">${i+1}. ${escapeHtml(c||'')}</button></div>`).join('');
      choicesDiv.addEventListener('click', choiceHandler);
    }
    function choiceHandler(e) {
      const btn = e.target.closest('.btn-choice'); if(!btn) return;
      const pick = Number(btn.dataset.i);
      const q = capsule.quiz[qidx];
      const correct = q.correctIndex;
      if(pick === correct) { score++; btn.classList.remove('btn-outline-primary'); btn.classList.add('btn-success'); }
      else { btn.classList.remove('btn-outline-primary'); btn.classList.add('btn-danger'); }
      Array.from(quizArea.querySelectorAll('.btn-choice')).forEach(b => b.disabled = true);
      setTimeout(()=> {
        qidx++;
        if(qidx >= capsule.quiz.length) finishQuiz();
        else renderQuestion();
      }, 800);
    }
    function finishQuiz() {
      const percent = Math.round(score / capsule.quiz.length * 100);
      quizArea.innerHTML = `
        <div class="card p-3 text-center">
          <h4>Quiz finished — Score: ${score}/${capsule.quiz.length} (${percent}%)</h4>
          <div class="mt-2">
            <button id="retry" class="btn btn-outline-secondary btn-sm">Retry</button>
          </div>
        </div>
      `;
      if(percent > (progress.bestScore || 0)) {
        progress.bestScore = percent;
        saveProgress(capsuleId, progress);
        alert('New best score saved: ' + percent + '%');
      }
      quizArea.querySelector('#retry').addEventListener('click', ()=> { qidx = 0; score = 0; renderQuestion(); });
    }
    renderQuestion();
  }
}