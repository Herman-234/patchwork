// Patchwork - Main Application JavaScript
// Single-file implementation with localStorage persistence

// ============================================
// State Management
// ============================================
const appState = {
    currentTab: 'notes'
};

const localStorageKeys = {
    currentTab: 'patchwork_currentTab',
    notes: 'patchwork_notes',
    pomodoro: 'patchwork_pomodoro',
    kanban: 'patchwork_kanban',
    flashcards: 'patchwork_flashcards'
};

// ============================================
// Utility Functions
// ============================================
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error('Failed to save to localStorage:', e);
    }
}

function loadFromLocalStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error('Failed to load from localStorage:', e);
        return defaultValue;
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Debounce function for input handling
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// Tab Navigation
// ============================================
function initTabNavigation() {
    const tabs = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.tab-panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update tab buttons
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update tab panels
            const targetTab = tab.dataset.tab;
            panels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === targetTab) {
                    panel.classList.add('active');
                }
            });
            
            // Save current tab
            appState.currentTab = targetTab;
            saveToLocalStorage(localStorageKeys.currentTab, appState.currentTab);
        });
    });
    
    // Restore tab from localStorage
    const savedTab = loadFromLocalStorage(localStorageKeys.currentTab, 'notes');
    appState.currentTab = savedTab;
    
    const savedTabButton = document.querySelector(`.tab-btn[data-tab="${savedTab}"]`);
    if (savedTabButton) {
        savedTabButton.classList.add('active');
        document.getElementById(savedTab).classList.add('active');
    }
}

// ============================================
// Notes Tool
// ============================================
const markdownTools = {
    parse: function(text) {
        let html = text
            // Escape HTML special characters first
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            // Headings (h1-h6)
            .replace(/^###### (.+)$/gm, '<h6>$1</h6>')
            .replace(/^##### (.+)$/gm, '<h5>$1</h5>')
            .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            // Bold and italic
            .replace(/\*\*\*(.+)\*\*\*/g, '<strong><em>$1</em></strong>')
            .replace(/___(.+)___/g, '<strong><em>$1</em></strong>')
            .replace(/\*\*(.+)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.+)__/g, '<strong>$1</strong>')
            .replace(/\*(.+)\*/g, '<em>$1</em>')
            .replace(/_(.+)_/g, '<em>$1</em>')
            // Strikethrough
            .replace(/~~(.+)~~/g, '<del>$1</del>')
            // Code blocks
            .replace(/```([\s\S]+?)```/g, '<pre><code>$1</code></pre>')
            // Inline code
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
            // Images
            .replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
            // Ordered lists
            .replace(/(\d+)\. (.+)/g, '<ol><li>$2</li></ol>')
            // Unordered lists
            .replace(/[\-\*] (.+)/g, '<ul><li>$1</li></ul>')
            // Blockquotes
            .replace(/^> (.+)/gm, '<blockquote>$1</blockquote>')
            // Paragraphs (lines not already wrapped)
            .replace(/^(?!<[hoolip]|<blockquote)(.+)$/gm, '<p>$1</p>')
            // Convert consecutive p tags to paragraphs
            .replace(/<\/p><p>/g, '</p>\n<p>');
        
        // Fix nested lists and paragraphs
        html = html.replace(/<ol><li>(.+)<\/li><\/ol>/g, '<ol>$1</ol>');
        html = html.replace(/<ul><li>(.+)<\/li><\/ul>/g, '<ul>$1</ul>');
        
        return html;
    }
};

function initNotes() {
    const editor = document.getElementById('markdownInput');
    const preview = document.getElementById('markdownPreview');
    const saveTimestamp = document.getElementById('saveTimestamp');
    
    // Load saved notes
    const savedNotes = loadFromLocalStorage(localStorageKeys.notes, { content: '', timestamp: null });
    editor.value = savedNotes.content || '# My Notes\n\nWrite your notes here...';
    
    // Initial render
    updatePreview();
    
    // Update save timestamp
    if (savedNotes.timestamp) {
        saveTimestamp.textContent = 'Last saved: ' + new Date(savedNotes.timestamp).toLocaleString();
    }
    
    // Debounced preview update
    const debouncedUpdate = debounce(() => {
        updatePreview();
        saveNotes();
    }, 300);
    
    editor.addEventListener('input', debouncedUpdate);
}

function updatePreview() {
    const editor = document.getElementById('markdownInput');
    const preview = document.getElementById('markdownPreview');
    const markdown = editor.value;
    
    preview.innerHTML = markdownTools.parse(markdown);
}

function saveNotes() {
    const editor = document.getElementById('markdownInput');
    const saveTimestamp = document.getElementById('saveTimestamp');
    
    const notesData = {
        content: editor.value,
        timestamp: Date.now()
    };
    
    saveToLocalStorage(localStorageKeys.notes, notesData);
    saveTimestamp.textContent = 'Last saved: ' + new Date(notesData.timestamp).toLocaleString();
}

// ============================================
// Pomodoro Tool
// ============================================
const pomodoro = {
    workDuration: 25 * 60,  // 25 minutes in seconds
    breakDuration: 5 * 60,  // 5 minutes in seconds
    timeLeft: 25 * 60,
    currentPhase: 'work',
    cycles: 0,
    isRunning: false,
    timerId: null
};

function initPomodoro() {
    const savedPomodoro = loadFromLocalStorage(localStorageKeys.pomodoro, null);
    
    if (savedPomodoro) {
        pomodoro.workDuration = savedPomodoro.workDuration || pomodoro.workDuration;
        pomodoro.breakDuration = savedPomodoro.breakDuration || pomodoro.breakDuration;
        pomodoro.timeLeft = savedPomodoro.timeLeft || pomodoro.workDuration;
        pomodoro.currentPhase = savedPomodoro.currentPhase || 'work';
        pomodoro.cycles = savedPomodoro.cycles || 0;
        pomodoro.isRunning = false;  // Don't auto-start
    }
    
    updatePomodoroDisplay();
    
    document.getElementById('startBtn').addEventListener('click', startTimer);
    document.getElementById('pauseBtn').addEventListener('click', pauseTimer);
    document.getElementById('resetBtn').addEventListener('click', resetTimer);
}

function updatePomodoroDisplay() {
    const timerTime = document.getElementById('timerTime');
    const phaseIndicator = document.getElementById('phaseIndicator');
    const cycleCount = document.getElementById('cycleCount');
    
    // Format time
    const minutes = Math.floor(pomodoro.timeLeft / 60);
    const seconds = pomodoro.timeLeft % 60;
    timerTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update phase indicator
    phaseIndicator.textContent = pomodoro.currentPhase === 'work' ? 'Work Phase' : 'Break Phase';
    phaseIndicator.style.color = pomodoro.currentPhase === 'work' ? 'var(--color-primary)' : 'var(--color-success)';
    
    // Update circle color
    const timerCircle = document.querySelector('.timer-circle');
    timerCircle.style.background = pomodoro.currentPhase === 'work' 
        ? 'linear-gradient(135deg, var(--color-primary), #e55a5a)'
        : 'linear-gradient(135deg, var(--color-success), #50c878)';
    
    // Update cycle counter
    cycleCount.textContent = pomodoro.cycles;
    
    // Save state
    saveToLocalStorage(localStorageKeys.pomodoro, {
        workDuration: pomodoro.workDuration,
        breakDuration: pomodoro.breakDuration,
        timeLeft: pomodoro.timeLeft,
        currentPhase: pomodoro.currentPhase,
        cycles: pomodoro.cycles,
        isRunning: pomodoro.isRunning
    });
}

function startTimer() {
    if (pomodoro.isRunning) return;
    
    pomodoro.isRunning = true;
    document.getElementById('startBtn').textContent = '⏸ Running...';
    
    pomodoro.timerId = setInterval(() => {
        if (pomodoro.timeLeft > 0) {
            pomodoro.timeLeft--;
            updatePomodoroDisplay();
        } else {
            completePhase();
        }
    }, 1000);
}

function pauseTimer() {
    if (!pomodoro.isRunning) return;
    
    clearInterval(pomodoro.timerId);
    pomodoro.isRunning = false;
    document.getElementById('startBtn').textContent = '▶ Start';
    updatePomodoroDisplay();
}

function resetTimer() {
    clearInterval(pomodoro.timerId);
    pomodoro.isRunning = false;
    pomodoro.timeLeft = pomodoro.currentPhase === 'work' 
        ? pomodoro.workDuration 
        : pomodoro.breakDuration;
    document.getElementById('startBtn').textContent = '▶ Start';
    updatePomodoroDisplay();
}

function completePhase() {
    clearInterval(pomodoro.timerId);
    pomodoro.isRunning = false;
    
    // Play notification sound
    playNotificationSound();
    
    // Switch phase
    if (pomodoro.currentPhase === 'work') {
        pomodoro.cycles++;
        pomodoro.currentPhase = 'break';
        pomodoro.timeLeft = pomodoro.breakDuration;
        alert('Work session complete! Take a break! 🍵');
    } else {
        pomodoro.currentPhase = 'work';
        pomodoro.timeLeft = pomodoro.workDuration;
        alert('Break complete! Back to work! 💪');
    }
    
    document.getElementById('startBtn').textContent = '▶ Start';
    updatePomodoroDisplay();
}

function playNotificationSound() {
    // Create a simple beep sound using Web Audio API
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            const ctx = new AudioContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            oscillator.frequency.value = 800;
            gainNode.gain.value = 0.3;
            
            oscillator.start();
            setTimeout(() => {
                oscillator.stop();
            }, 300);
            
            setTimeout(() => {
                oscillator.start();
                setTimeout(() => {
                    oscillator.stop();
                }, 300);
            }, 600);
        }
    } catch (e) {
        console.error('Could not play notification sound:', e);
    }
}

// ============================================
// Kanban Tool
// ============================================
function initKanban() {
    const savedKanban = loadFromLocalStorage(localStorageKeys.kanban, null);
    
    let kanbanData;
    if (savedKanban) {
        kanbanData = savedKanban;
    } else {
        kanbanData = {
            columns: {
                'todo': [
                    { id: generateId(), title: 'Welcome to Patchwork!', description: 'Try dragging this card between columns.' },
                    { id: generateId(), title: 'Add a new task', description: 'Click the add task button above.' }
                ],
                'doing': [],
                'done': []
            }
        };
    }
    
    renderKanban(kanbanData);
    
    // Event listeners
    document.getElementById('addTaskBtn').addEventListener('click', addTask);
    
    // Drag and drop handlers
    setupDragAndDrop();
}

function renderKanban(data) {
    const columns = data.columns;
    
    ['todo', 'doing', 'done'].forEach(columnId => {
        const columnContent = document.querySelector(`.column-content[data-column="${columnId}"]`);
        columnContent.innerHTML = '';
        
        columns[columnId]?.forEach(task => {
            const card = createTaskCard(task);
            columnContent.appendChild(card);
        });
    });
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'kanban-card';
    card.draggable = true;
    card.dataset.taskId = task.id;
    
    card.innerHTML = `
        <h4>${escapeHtml(task.title)}</h4>
        ${task.description ? `<p>${escapeHtml(task.description)}</p>` : ''}
        <div class="kanban-card-actions">
            <button class="edit-btn" data-task-id="${task.id}">✏️ Edit</button>
            <button class="delete-btn" data-task-id="${task.id}">🗑️ Delete</button>
        </div>
    `;
    
    // Edit button
    card.querySelector('.edit-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        editTask(task.id);
    });
    
    // Delete button
    card.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTask(task.id);
    });
    
    // Drag events
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
    
    return card;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function addTask() {
    const titleInput = document.getElementById('taskTitle');
    const descInput = document.getElementById('taskDescription');
    
    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    
    if (!title) {
        alert('Please enter a task title');
        return;
    }
    
    const task = {
        id: generateId(),
        title: title,
        description: description
    };
    
    // Add to 'todo' column by default
    const kanbanData = loadFromLocalStorage(localStorageKeys.kanban, { columns: { 'todo': [], 'doing': [], 'done': [] } });
    kanbanData.columns['todo'].push(task);
    saveToLocalStorage(localStorageKeys.kanban, kanbanData);
    
    // Clear inputs
    titleInput.value = '';
    descInput.value = '';
    
    // Re-render
    renderKanban(kanbanData);
}

function editTask(taskId) {
    const kanbanData = loadFromLocalStorage(localStorageKeys.kanban);
    
    for (const columnId in kanbanData.columns) {
        const taskIndex = kanbanData.columns[columnId].findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            const task = kanbanData.columns[columnId][taskIndex];
            const newTitle = prompt('Edit task title:', task.title);
            
            if (newTitle !== null && newTitle.trim() !== '') {
                task.title = newTitle.trim();
                saveToLocalStorage(localStorageKeys.kanban, kanbanData);
                renderKanban(kanbanData);
            }
            return;
        }
    }
}

function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    const kanbanData = loadFromLocalStorage(localStorageKeys.kanban);
    
    for (const columnId in kanbanData.columns) {
        const taskIndex = kanbanData.columns[columnId].findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            kanbanData.columns[columnId].splice(taskIndex, 1);
            saveToLocalStorage(localStorageKeys.kanban, kanbanData);
            renderKanban(kanbanData);
            return;
        }
    }
}

function setupDragAndDrop() {
    let draggedElement = null;
    
    function handleDragStart(e) {
        draggedElement = this;
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.dataset.taskId);
    }
    
    function handleDragEnd(e) {
        this.classList.remove('dragging');
        draggedElement = null;
        
        // Remove drag-over classes
        document.querySelectorAll('.kanban-column').forEach(col => {
            col.classList.remove('drag-over');
        });
    }
    
    // Attach to existing cards
    document.querySelectorAll('.kanban-card').forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });
    
    // Column drop zones
    document.querySelectorAll('.column-content').forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            column.parentElement.classList.add('drag-over');
        });
        
        column.addEventListener('dragleave', (e) => {
            column.parentElement.classList.remove('drag-over');
        });
        
        column.addEventListener('drop', (e) => {
            e.preventDefault();
            column.parentElement.classList.remove('drag-over');
            
            const taskId = e.dataTransfer.getData('text/plain');
            const targetColumn = column.dataset.column;
            
            moveTaskToColumn(taskId, targetColumn);
        });
    });
}

function moveTaskToColumn(taskId, targetColumnId) {
    const kanbanData = loadFromLocalStorage(localStorageKeys.kanban);
    
    // Find and remove task from all columns
    let task = null;
    for (const columnId in kanbanData.columns) {
        const taskIndex = kanbanData.columns[columnId].findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            task = kanbanData.columns[columnId].splice(taskIndex, 1)[0];
            break;
        }
    }
    
    // Add to target column
    if (task) {
        kanbanData.columns[targetColumnId].push(task);
        saveToLocalStorage(localStorageKeys.kanban, kanbanData);
        renderKanban(kanbanData);
    }
}

// ============================================
// Flashcards Tool
// ============================================
const flashcards = {
    decks: [],
    currentDeckId: null,
    cards: [],
    currentCardIndex: 0,
    knownCount: 0,
    unknownCount: 0
};

function initFlashcards() {
    const savedFlashcards = loadFromLocalStorage(localStorageKeys.flashcards, null);
    
    if (savedFlashcards) {
        flashcards.decks = savedFlashcards.decks || [];
        flashcards.currentDeckId = savedFlashcards.currentDeckId;
        
        if (flashcards.decks.length > 0) {
            if (!flashcards.currentDeckId || !flashcards.decks.find(d => d.id === flashcards.currentDeckId)) {
                flashcards.currentDeckId = flashcards.decks[0].id;
            }
            loadDeck(flashcards.currentDeckId);
        }
    }
    
    renderDeckSelector();
    updateFlashcardDisplay();
    
    // Event listeners
    document.getElementById('deckSelect').addEventListener('change', (e) => {
        loadDeck(e.target.value);
        updateFlashcardDisplay();
    });
    
    document.getElementById('addDeckBtn').addEventListener('click', addDeck);
    document.getElementById('deleteDeckBtn').addEventListener('click', deleteDeck);
    
    document.getElementById('addCardBtn').addEventListener('click', addCard);
    
    document.getElementById('flipCardBtn').addEventListener('click', flipCard);
    document.getElementById('prevCardBtn').addEventListener('click', prevCard);
    document.getElementById('nextCardBtn').addEventListener('click', nextCard);
}

function renderDeckSelector() {
    const select = document.getElementById('deckSelect');
    const deleteBtn = document.getElementById('deleteDeckBtn');
    
    select.innerHTML = '';
    flashcards.decks.forEach(deck => {
        const option = document.createElement('option');
        option.value = deck.id;
        option.textContent = deck.name;
        if (deck.id === flashcards.currentDeckId) {
            option.selected = true;
        }
        select.appendChild(option);
    });
    
    deleteBtn.disabled = flashcards.decks.length <= 1;
}

function addDeck() {
    const name = prompt('Enter deck name:', 'New Deck');
    if (name && name.trim() !== '') {
        const deck = {
            id: generateId(),
            name: name.trim(),
            cards: []
        };
        
        flashcards.decks.push(deck);
        flashcards.currentDeckId = deck.id;
        
        saveFlashcards();
        renderDeckSelector();
        loadDeck(deck.id);
    }
}

function deleteDeck() {
    if (flashcards.decks.length <= 1) {
        alert('Cannot delete the last deck');
        return;
    }
    
    if (confirm('Are you sure you want to delete this deck? This cannot be undone.')) {
        const index = flashcards.decks.findIndex(d => d.id === flashcards.currentDeckId);
        if (index !== -1) {
            flashcards.decks.splice(index, 1);
            flashcards.currentDeckId = flashcards.decks[0].id;
            
            saveFlashcards();
            renderDeckSelector();
            loadDeck(flashcards.currentDeckId);
        }
    }
}

function loadDeck(deckId) {
    const deck = flashcards.decks.find(d => d.id === deckId);
    if (deck) {
        flashcards.currentDeckId = deckId;
        flashcards.cards = deck.cards || [];
        
        // Shuffle cards on load
        flashcards.cards.sort(() => Math.random() - 0.5);
        
        flashcards.currentCardIndex = 0;
        flashcards.knownCount = 0;
        flashcards.unknownCount = 0;
        
        renderCardList(deck);
        saveFlashcards();
    }
}

function renderCardList(deck) {
    const list = document.getElementById('cardList');
    list.innerHTML = '';
    
    if (deck.cards.length === 0) {
        list.innerHTML = '<li style="text-align: center; color: #666;">No cards yet. Add some cards to get started!</li>';
        return;
    }
    
    deck.cards.forEach((card, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${escapeHtml(card.front.substring(0, 30))}${card.front.length > 30 ? '...' : ''}</span>
            <div>
                <button class="edit-card-btn" data-card-index="${index}">✏️</button>
                <button class="delete-card-btn" data-card-index="${index}">🗑️</button>
            </div>
        `;
        list.appendChild(li);
    });
    
    // Add event listeners for card edit/delete
    list.querySelectorAll('.edit-card-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.cardIndex);
            editCard(index);
        });
    });
    
    list.querySelectorAll('.delete-card-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.cardIndex);
            deleteCard(index);
        });
    });
}

function addCard() {
    const frontInput = document.getElementById('cardFront');
    const backInput = document.getElementById('cardBack');
    
    const front = frontInput.value.trim();
    const back = backInput.value.trim();
    
    if (!front) {
        alert('Please enter the front of the card');
        return;
    }
    
    const card = {
        id: generateId(),
        front: front,
        back: back
    };
    
    const deck = flashcards.decks.find(d => d.id === flashcards.currentDeckId);
    if (deck) {
        deck.cards.push(card);
        saveFlashcards();
        renderCardList(deck);
        
        // Clear inputs
        frontInput.value = '';
        backInput.value = '';
        
        // Update current card
        flashcards.cards = deck.cards;
        flashcards.currentCardIndex = flashcards.cards.length - 1;
        updateFlashcardDisplay();
    }
}

function editCard(cardIndex) {
    const deck = flashcards.decks.find(d => d.id === flashcards.currentDeckId);
    if (!deck || !deck.cards[cardIndex]) return;
    
    const card = deck.cards[cardIndex];
    const newFront = prompt('Edit card front:', card.front);
    const newBack = prompt('Edit card back:', card.back);
    
    if (newFront !== null && newBack !== null) {
        card.front = newFront.trim() || 'Question?';
        card.back = newBack.trim() || 'Answer';
        saveFlashcards();
        renderCardList(deck);
        updateFlashcardDisplay();
    }
}

function deleteCard(cardIndex) {
    if (!confirm('Are you sure you want to delete this card?')) return;
    
    const deck = flashcards.decks.find(d => d.id === flashcards.currentDeckId);
    if (deck && deck.cards[cardIndex]) {
        deck.cards.splice(cardIndex, 1);
        saveFlashcards();
        renderCardList(deck);
        updateFlashcardDisplay();
    }
}

function updateFlashcardDisplay() {
    const flashcard = document.getElementById('flashcard');
    const flashcardFront = document.getElementById('flashcardFront');
    const flashcardBack = document.getElementById('flashcardBack');
    const prevBtn = document.getElementById('prevCardBtn');
    const nextBtn = document.getElementById('nextCardBtn');
    const knownCountSpan = document.getElementById('knownCount');
    const unknownCountSpan = document.getElementById('unknownCount');
    const remainingCountSpan = document.getElementById('remainingCount');
    
    flashcard.classList.remove('flipped');
    
    if (flashcards.cards.length === 0) {
        flashcardFront.textContent = 'No cards in this deck';
        flashcardBack.textContent = 'Add cards using the form above';
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        knownCountSpan.textContent = '0';
        unknownCountSpan.textContent = '0';
        remainingCountSpan.textContent = '0';
        return;
    }
    
    const currentCard = flashcards.cards[flashcards.currentCardIndex];
    flashcardFront.textContent = currentCard.front;
    flashcardBack.textContent = currentCard.back;
    
    // Update navigation buttons
    prevBtn.disabled = flashcards.currentCardIndex === 0;
    nextBtn.disabled = flashcards.currentCardIndex === flashcards.cards.length - 1;
    
    // Update counters
    knownCountSpan.textContent = flashcards.knownCount;
    unknownCountSpan.textContent = flashcards.unknownCount;
    remainingCountSpan.textContent = flashcards.cards.length - (flashcards.knownCount + flashcards.unknownCount);
}

function flipCard() {
    const flashcard = document.getElementById('flashcard');
    flashcard.classList.toggle('flipped');
}

function prevCard() {
    if (flashcards.currentCardIndex > 0) {
        flashcards.currentCardIndex--;
        updateFlashcardDisplay();
    }
}

function nextCard() {
    if (flashcards.currentCardIndex < flashcards.cards.length - 1) {
        flashcards.currentCardIndex++;
        updateFlashcardDisplay();
    }
}

function saveFlashcards() {
    saveToLocalStorage(localStorageKeys.flashcards, {
        decks: flashcards.decks,
        currentDeckId: flashcards.currentDeckId
    });
}

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initTabNavigation();
    initNotes();
    initPomodoro();
    initKanban();
    initFlashcards();
});
