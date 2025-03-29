// Initialize Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();

// DOM Elements
const notesList = document.getElementById('notes-list');
const noteEditor = document.getElementById('note-editor');
const newNoteBtn = document.getElementById('new-note');
const saveNoteBtn = document.getElementById('save-note');
const cancelEditBtn = document.getElementById('cancel-edit');
const deleteNoteBtn = document.getElementById('delete-note');
const noteTitle = document.getElementById('note-title');
const noteContent = document.getElementById('note-content');

// State
let notes = [];
let currentNoteId = null;

// Initialize app
function init() {
    loadNotes();
    setupEventListeners();
}

// Load notes from Telegram Cloud Storage
function loadNotes() {
    const savedNotes = tg.CloudStorage.getItem('notes');
    if (savedNotes) {
        notes = JSON.parse(savedNotes);
        renderNotes();
    } else {
        notes = [];
    }
}

// Save notes to Telegram Cloud Storage
function saveNotes() {
    tg.CloudStorage.setItem('notes', JSON.stringify(notes));
}

// Render notes list
function renderNotes() {
    notesList.innerHTML = '';
    
    if (notes.length === 0) {
        notesList.innerHTML = '<p>No notes yet. Create your first note!</p>';
        return;
    }
    
    notes.forEach(note => {
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';
        noteCard.innerHTML = `
            <h3>${note.title || 'Untitled Note'}</h3>
            <p>${note.content || ''}</p>
        `;
        noteCard.addEventListener('click', () => openNoteEditor(note.id));
        notesList.appendChild(noteCard);
    });
}

// Open note editor
function openNoteEditor(noteId = null) {
    currentNoteId = noteId;
    
    if (noteId !== null) {
        const note = notes.find(n => n.id === noteId);
        noteTitle.value = note.title || '';
        noteContent.value = note.content || '';
    } else {
        noteTitle.value = '';
        noteContent.value = '';
    }
    
    notesList.style.display = 'none';
    noteEditor.style.display = 'block';
}

// Close note editor
function closeNoteEditor() {
    notesList.style.display = 'grid';
    noteEditor.style.display = 'none';
    currentNoteId = null;
}

// Save note
function saveNote() {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    
    if (currentNoteId !== null) {
        // Update existing note
        const noteIndex = notes.findIndex(n => n.id === currentNoteId);
        if (noteIndex !== -1) {
            notes[noteIndex] = {
                id: currentNoteId,
                title,
                content
            };
        }
    } else {
        // Create new note
        notes.push({
            id: Date.now().toString(),
            title,
            content
        });
    }
    
    saveNotes();
    renderNotes();
    closeNoteEditor();
}

// Delete note
function deleteNote() {
    if (currentNoteId !== null) {
        notes = notes.filter(note => note.id !== currentNoteId);
        saveNotes();
        renderNotes();
        closeNoteEditor();
    }
}

// Set up event listeners
function setupEventListeners() {
    newNoteBtn.addEventListener('click', () => openNoteEditor());
    saveNoteBtn.addEventListener('click', saveNote);
    cancelEditBtn.addEventListener('click', closeNoteEditor);
    deleteNoteBtn.addEventListener('click', deleteNote);
}

// Initialize the app
init();
