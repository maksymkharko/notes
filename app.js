// Initialize Telegram Web App
const tg = window.Telegram.WebApp;

// Wait for Telegram to initialize
tg.ready();
tg.expand();

// DOM Elements
const notesList = document.getElementById('notes-list');
const noteEditor = document.getElementById('note-editor');
const newNoteBtn = document.getElementById('new-note-btn');
const saveNoteBtn = document.getElementById('save-note-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const deleteNoteBtn = document.getElementById('delete-note-btn');
const noteTitle = document.getElementById('note-title');
const noteContent = document.getElementById('note-content');

// State
let notes = [];
let currentNoteId = null;

// Initialize app
function initApp() {
    loadNotes();
    setupEventListeners();
}

// Load notes from Telegram Cloud Storage
function loadNotes() {
    tg.CloudStorage.getItems(['notes'], (err, data) => {
        if (!err && data && data.notes) {
            try {
                notes = JSON.parse(data.notes);
                renderNotes();
            } catch (e) {
                console.error('Error parsing notes:', e);
                notes = [];
            }
        } else {
            notes = [];
        }
    });
}

// Save notes to Telegram Cloud Storage
function saveNotes() {
    tg.CloudStorage.setItem('notes', JSON.stringify(notes), (err) => {
        if (err) {
            console.error('Error saving notes:', err);
        }
    });
}

// Render notes list
function renderNotes() {
    notesList.innerHTML = '';
    
    if (notes.length === 0) {
        notesList.innerHTML = '<p class="empty-notes">No notes yet. Create your first note!</p>';
        return;
    }
    
    notes.forEach(note => {
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';
        noteCard.innerHTML = `
            <h3>${note.title || 'Untitled Note'}</h3>
            <p>${note.content.substring(0, 100) || ''}${note.content.length > 100 ? '...' : ''}</p>
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
    noteTitle.focus();
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
    
    if (!title && !content) {
        closeNoteEditor();
        return;
    }
    
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
    
    // Handle Enter key in title field
    noteTitle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            noteContent.focus();
        }
    });
}

// Initialize the app when Telegram is ready
if (tg.initDataUnsafe) {
    initApp();
} else {
    tg.onEvent('viewportChanged', initApp);
}
