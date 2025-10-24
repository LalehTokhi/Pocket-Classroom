// assets/js/main.js
import { renderLibrary } from './ui/libraryView.js';
import { renderAuthor } from './ui/authorView.js';
import { renderLearn } from './ui/learnView.js';
import { saveCapsule } from './storage.js';


// basic references
const app = document.getElementById('app');
const fileInput = document.getElementById('fileImportInput');

// Router
function Router() {
  this.navigate = (path) => { location.hash = `#${path}`; this.renderCurrent(); };
  this.renderCurrent = () => {
    const hash = location.hash.replace(/^#/, '') || '/library';
    const parts = hash.split('/').filter(Boolean);

    if(parts.length === 0 || parts[0] === 'library') { renderLibrary(app, this); return; }
    if(parts[0] === 'author') { const id = parts[1] || null; renderAuthor(app, this, (id === 'new' ? null : id)); return; }
    if(parts[0] === 'learn') { const id = parts[1]; if(!id) { renderLibrary(app,this); return; } renderLearn(app, this, id); return; }

    renderLibrary(app, this);
  };
  window.addEventListener('hashchange', () => this.renderCurrent());
}
const router = new Router();

// navbar link wiring
document.querySelectorAll('[data-view]').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const v = a.dataset.view;
    if(v === 'library') router.navigate('/library');
    else if(v === 'author') router.navigate('/author/new');
    else if(v === 'learn') {
      const id = a.dataset.id;
      // if link has a data-id → open that specific learn view, otherwise go to library
      if(id) router.navigate(`/learn/${id}`);
      else router.navigate('/library');
    }
  });
});

// Add sample capsule ...
// start
window.addEventListener('load', () => router.renderCurrent());

// Add sample capsule (English) — Learning to Code
document.getElementById('addSampleBtn').addEventListener('click', () => {
  const sample = {
    schema: 'pocket-classroom/v1',
    meta: {
      title: 'Learning to Code',
      subject: 'Programming Basics',
      level: 'Beginner',
      description: 'A simple capsule for testing the Pocket Classroom app. Includes notes, flashcards, and a short quiz about programming.',
    },
    notes: [
      'Programming is the process of writing instructions for computers to follow.',
      'A variable stores data that can change during program execution.',
      'Functions are reusable blocks of code that perform specific tasks.'
    ],
    flashcards: [
      { front: 'What is a variable?', back: 'A storage location identified by a name that holds data.' },
      { front: 'What does a function do?', back: 'It executes a block of code when called.' },
      { front: 'What is JavaScript?', back: 'A programming language used mainly for web development.' }
    ],
    quiz: [
      {
        question: 'What is the purpose of a variable?',
        choices: ['To store data values', 'To perform math operations', 'To display text on screen', 'To connect to the internet'],
        correctIndex: 0
      },
      {
        question: 'Which keyword is used to declare a variable in JavaScript?',
        choices: ['func','let','if','print'],
        correctIndex: 1
      },
      {
        question: 'Which of the following is a JavaScript function?',
        choices: ['for', 'while', 'console.log()', 'var'],
        correctIndex: 2
      }
    ],
    updatedAt: new Date().toISOString()
  };
  saveCapsule(sample);
  alert('Sample lesson added successfully!');
  router.navigate('/library');
});

// Import button wiring
document.getElementById('importBtn').addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      if(data.schema !== 'pocket-classroom/v1') {
        alert('Invalid file format. Please select a valid Pocket Classroom JSON file.');
        return;
      }
      // to avoid id collision, give it a new id if none
      if(!data.id) data.id = 'imp-' + Date.now();
      data.updatedAt = new Date().toISOString();
      saveCapsule(data);
      alert('Import completed successfully!');
      router.navigate('/library');
    } catch(err) {
      console.error(err);
      alert('Error reading file. Make sure it is a valid JSON file.');
    }
  };
  reader.readAsText(file);
  fileInput.value = '';
});

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('pc_theme_dark', document.body.classList.contains('dark') ? '1' : '0');
});
if(localStorage.getItem('pc_theme_dark') === '1') document.body.classList.add('dark');

// start
window.addEventListener('load', () => router.renderCurrent());

document.body.classList.toggle('dark');

export { router };























