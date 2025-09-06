let myNotes = JSON.parse(localStorage.getItem('userNotes')) || [];
let currentEdit = null;

const textbox = document.getElementById('newtext');
const addbtn = document.getElementById('addbtn');
const notebox = document.getElementById('allnotes');
const searchbox = document.getElementById('findnote');
const modebtn = document.getElementById('modeswitch');

if (!textbox || !addbtn || !notebox || !searchbox || !modebtn) {
    console.error('Some elements not found!');
}

function saveData() {
    localStorage.setItem('userNotes', JSON.stringify(myNotes));
}

function makeId() {
    return Date.now() + Math.random().toString(16).slice(2);
}

function addNewNote() {
    const txt = textbox.value.trim();
    if (!txt) return;
    
    myNotes.unshift({
        id: makeId(),
        content: txt,
        pinned: false,
        created: new Date().toLocaleString()
    });
    
    textbox.value = '';
    saveData();
    showNotes();
}

function removeNote(id) {
    myNotes = myNotes.filter(n => n.id !== id);
    saveData();
    showNotes();
}

function togglePin(id) {
    const note = myNotes.find(n => n.id === id);
    if (note) {
        note.pinned = !note.pinned;
        saveData();
        showNotes();
    }
}

function startEdit(id) {
    currentEdit = id;
    showNotes();
}

function saveEdit(id, newTxt) {
    const note = myNotes.find(n => n.id === id);
    if (note && newTxt.trim()) {
        note.content = newTxt.trim();
        currentEdit = null;
        saveData();
        showNotes();
    }
}

function cancelEdit() {
    currentEdit = null;
    showNotes();
}

function showNotes() {
    const filter = searchbox.value.toLowerCase();
    let filtered = myNotes.filter(n => 
        n.content.toLowerCase().includes(filter)
    );
    
    const pinned = filtered.filter(n => n.pinned);
    const regular = filtered.filter(n => !n.pinned);
    const sorted = [...pinned, ...regular];
    
    if (sorted.length === 0) {
        notebox.innerHTML = '<div class="emptymsg">No notes yet. Start writing!</div>';
        return;
    }
    
    notebox.innerHTML = sorted.map(note => {
        const isEditing = currentEdit === note.id;
        const pinnedClass = note.pinned ? 'pinneditem' : '';
        const editClass = isEditing ? 'editingitem' : '';
        
        if (isEditing) {
            return `
                <div class="noteitem ${pinnedClass} ${editClass}">
                    <input class="editfield" value="${note.content}" id="edit${note.id}">
                    <div class="btngroup">
                        <button class="editbtn" onclick="saveEdit('${note.id}', document.getElementById('edit${note.id}').value)">Save</button>
                        <button class="delbtn" onclick="cancelEdit()">Cancel</button>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="noteitem ${pinnedClass}">
                <div class="notetext" onclick="startEdit('${note.id}')">${note.content}</div>
                <div class="btngroup">
                    <button class="pinbtn" onclick="togglePin('${note.id}')">${note.pinned ? 'Unpin' : 'Pin'}</button>
                    <button class="editbtn" onclick="startEdit('${note.id}')">Edit</button>
                    <button class="delbtn" onclick="removeNote('${note.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function switchMode() {
    document.body.classList.toggle('darkmode');
    const isDark = document.body.classList.contains('darkmode');
    localStorage.setItem('appTheme', isDark);
    modebtn.textContent = isDark ? '☀️' : '🌙';
}

addbtn.onclick = addNewNote;
textbox.onkeypress = function(e) {
    if (e.key === 'Enter') {
        addNewNote();
    }
};
searchbox.oninput = showNotes;
modebtn.onclick = switchMode;

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const el = document.activeElement;
        if (!(el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'))) {
            cancelEdit();
        }
    }
});

if (localStorage.getItem('appTheme') === 'true') {
    document.body.classList.add('darkmode');
    modebtn.textContent = '☀️';
}

document.addEventListener('DOMContentLoaded', function() {
    // Ensure the input is not readonly or disabled
    textbox.removeAttribute('readonly');
    textbox.removeAttribute('disabled');
    
    showNotes();
});
