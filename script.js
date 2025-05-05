// Game State
const gameState = {
    currentRoom: 1,
    inventory: [],
    puzzlesSolved: 0,
    totalPuzzles: 5,
    timeLeft: 30 * 60, // 30 minutes in seconds
    gameActive: false,
    timerInterval: null,
    currentPuzzle: null,
    foundItems: []
};

// Rooms Data
const rooms = {
    1: {
        name: "Entrance Hall",
        description: "A dimly lit hall with mysterious objects scattered around.",
        background: "url('images/room1.jpg')",
        hotspots: [
            { id: "desk", x: 70, y: 60, action: "examine", item: null },
            { id: "painting", x: 30, y: 20, action: "examine", item: "key1" },
            { id: "door", x: 50, y: 80, action: "door", item: null }
        ],
        puzzle: 1
    },
    2: {
        name: "Library",
        description: "Walls lined with ancient books. A large desk sits in the center.",
        background: "url('images/room2.jpg')",
        hotspots: [
            { id: "bookshelf", x: 20, y: 30, action: "examine", item: "book" },
            { id: "desk", x: 60, y: 50, action: "examine", item: null },
            { id: "safe", x: 80, y: 70, action: "examine", item: null }
        ],
        puzzle: 2
    },
    3: {
        name: "Laboratory",
        description: "Scientific equipment and strange potions fill this room.",
        background: "url('images/room3.jpg')",
        hotspots: [
            { id: "workbench", x: 40, y: 60, action: "examine", item: "flask" },
            { id: "cabinet", x: 70, y: 30, action: "examine", item: null },
            { id: "note", x: 20, y: 20, action: "examine", item: "note" }
        ],
        puzzle: 3
    }
};

// Puzzles Data
const puzzles = {
    1: {
        title: "Number Lock",
        description: "The desk drawer is locked with a 4-digit combination. Find the clues around the room to discover the code.",
        html: `
            <div class="puzzle-container">
                <p>The painting has a clue: <strong>The year the house was built</strong></p>
                <p>You found a note that says: <em>"The combination is the year the house was built minus 100"</em></p>
                <p>The house was built in 1923. What's the combination?</p>
                <div class="code-input">
                    <input type="number" maxlength="1" class="code-digit" data-index="0">
                    <input type="number" maxlength="1" class="code-digit" data-index="1">
                    <input type="number" maxlength="1" class="code-digit" data-index="2">
                    <input type="number" maxlength="1" class="code-digit" data-index="3">
                </div>
                <p id="codeFeedback" class="mt-3"></p>
            </div>
        `,
        solution: "1823",
        checkAnswer: function() {
            const digits = document.querySelectorAll('.code-digit');
            let enteredCode = '';
            digits.forEach(digit => {
                enteredCode += digit.value;
            });
            
            if (enteredCode === this.solution) {
                document.getElementById('codeFeedback').textContent = "Correct! The drawer opens.";
                document.getElementById('codeFeedback').style.color = "green";
                return true;
            } else {
                document.getElementById('codeFeedback').textContent = "Incorrect code. Try again.";
                document.getElementById('codeFeedback').style.color = "red";
                return false;
            }
        }
    },
    2: {
        title: "Book Puzzle",
        description: "The safe requires you to arrange books in the correct order.",
        html: `
            <div class="puzzle-container">
                <p>Arrange the books in the correct order based on the clues:</p>
                <ul>
                    <li>The red book is to the left of the blue book</li>
                    <li>The green book is not at either end</li>
                    <li>The yellow book is immediately to the right of the blue book</li>
                </ul>
                <p>Drag the books to the shelf below:</p>
                <div class="drop-zone" id="bookShelf"></div>
                <div class="mt-3">
                    <div class="draggable-item" draggable="true" data-color="red">Red</div>
                    <div class="draggable-item" draggable="true" data-color="blue">Blue</div>
                    <div class="draggable-item" draggable="true" data-color="green">Green</div>
                    <div class="draggable-item" draggable="true" data-color="yellow">Yellow</div>
                </div>
                <p id="bookFeedback" class="mt-3"></p>
            </div>
        `,
        solution: ["red", "blue", "yellow", "green"],
        checkAnswer: function() {
            const shelf = document.getElementById('bookShelf');
            const books = Array.from(shelf.children);
            const currentOrder = books.map(book => book.getAttribute('data-color'));
            
            // Check if all books are placed and in correct order
            if (books.length !== 4) {
                document.getElementById('bookFeedback').textContent = "Place all books on the shelf.";
                document.getElementById('bookFeedback').style.color = "red";
                return false;
            }
            
            let correct = true;
            for (let i = 0; i < 4; i++) {
                if (currentOrder[i] !== this.solution[i]) {
                    correct = false;
                    break;
                }
            }
            
            if (correct) {
                document.getElementById('bookFeedback').textContent = "Correct! The safe opens.";
                document.getElementById('bookFeedback').style.color = "green";
                return true;
            } else {
                document.getElementById('bookFeedback').textContent = "Incorrect order. Try again.";
                document.getElementById('bookFeedback').style.color = "red";
                return false;
            }
        },
        init: function() {
            const draggables = document.querySelectorAll('.draggable-item');
            const shelf = document.getElementById('bookShelf');
            
            draggables.forEach(draggable => {
                draggable.addEventListener('dragstart', () => {
                    draggable.classList.add('dragging');
                });
                
                draggable.addEventListener('dragend', () => {
                    draggable.classList.remove('dragging');
                });
            });
            
            shelf.addEventListener('dragover', e => {
                e.preventDefault();
                const draggable = document.querySelector('.dragging');
                shelf.appendChild(draggable);
            });
        }
    },
    3: {
        title: "Potion Mixing",
        description: "Create the correct potion by mixing ingredients in the right order.",
        html: `
            <div class="puzzle-container">
                <p>Mix the potion ingredients in the correct order:</p>
                <p>Clues:</p>
                <ul>
                    <li>Start with the blue liquid</li>
                    <li>Add the powder last</li>
                    <li>The green liquid goes after the red liquid</li>
                </ul>
                <div class="drop-zone" id="potionFlask"></div>
                <p>Available ingredients:</p>
                <div class="mt-3">
                    <div class="draggable-item" draggable="true" data-ingredient="blue">Blue Liquid</div>
                    <div class="draggable-item" draggable="true" data-ingredient="red">Red Liquid</div>
                    <div class="draggable-item" draggable="true" data-ingredient="green">Green Liquid</div>
                    <div class="draggable-item" draggable="true" data-ingredient="powder">Mystery Powder</div>
                </div>
                <p id="potionFeedback" class="mt-3"></p>
            </div>
        `,
        solution: ["blue", "red", "green", "powder"],
        checkAnswer: function() {
            const flask = document.getElementById('potionFlask');
            const ingredients = Array.from(flask.children);
            const currentOrder = ingredients.map(item => item.getAttribute('data-ingredient'));
            
            if (ingredients.length !== 4) {
                document.getElementById('potionFeedback').textContent = "Add all ingredients to the flask.";
                document.getElementById('potionFeedback').style.color = "red";
                return false;
            }
            
            let correct = true;
            for (let i = 0; i < 4; i++) {
                if (currentOrder[i] !== this.solution[i]) {
                    correct = false;
                    break;
                }
            }
            
            if (correct) {
                document.getElementById('potionFeedback').textContent = "Correct! The potion glows brightly.";
                document.getElementById('potionFeedback').style.color = "green";
                return true;
            } else {
                document.getElementById('potionFeedback').textContent = "Incorrect mixture. Try again.";
                document.getElementById('potionFeedback').style.color = "red";
                return false;
            }
        },
        init: function() {
            const draggables = document.querySelectorAll('.draggable-item');
            const flask = document.getElementById('potionFlask');
            
            draggables.forEach(draggable => {
                draggable.addEventListener('dragstart', () => {
                    draggable.classList.add('dragging');
                });
                
                draggable.addEventListener('dragend', () => {
                    draggable.classList.remove('dragging');
                });
            });
            
            flask.addEventListener('dragover', e => {
                e.preventDefault();
                const draggable = document.querySelector('.dragging');
                flask.appendChild(draggable);
            });
        }
    }
};

// Initialize the game
document.addEventListener('DOMContentLoaded', function() {
    // Check for saved game
    const savedGame = localStorage.getItem('escapeRoomGame');
    if (savedGame) {
        const parsed = JSON.parse(savedGame);
        if (parsed.gameActive) {
            document.getElementById('continue-game-btn').style.display = 'inline-block';
        }
    }
    
    // Event listeners
    document.getElementById('new-game-btn').addEventListener('click', startNewGame);
    document.getElementById('continue-game-btn').addEventListener('click', continueGame);
    document.getElementById('submitPuzzle').addEventListener('click', checkPuzzleAnswer);
    document.getElementById('playAgainBtn').addEventListener('click', startNewGame);
    
    // Initialize puzzle modal
    const puzzleModal = new bootstrap.Modal(document.getElementById('puzzleModal'));
    
    function startNewGame() {
        // Reset game state
        gameState.currentRoom = 1;
        gameState.inventory = [];
        gameState.puzzlesSolved = 0;
        gameState.timeLeft = 30 * 60;
        gameState.gameActive = true;
        gameState.foundItems = [];
        
        // Save game
        saveGame();
        
        // Start timer
        startTimer();
        
        // Show game screen
        document.getElementById('main-menu').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');
        
        // Load first room
        loadRoom(gameState.currentRoom);
        
        // Add to game log
        addToLog("You find yourself in an unfamiliar room. You need to escape!");
    }
    
    function continueGame() {
        const savedGame = JSON.parse(localStorage.getItem('escapeRoomGame'));
        if (savedGame && savedGame.gameActive) {
            Object.assign(gameState, savedGame);
            
            // Start timer
            startTimer();
            
            // Show game screen
            document.getElementById('main-menu').classList.remove('active');
            document.getElementById('game-screen').classList.add('active');
            
            // Load current room
            loadRoom(gameState.currentRoom);
            
            addToLog("Welcome back! Your progress has been loaded.");
        }
    }
    
    function saveGame() {
        localStorage.setItem('escapeRoomGame', JSON.stringify(gameState));
    }
    
    function startTimer() {
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
        }
        
        updateTimerDisplay();
        
        gameState.timerInterval = setInterval(function() {
            gameState.timeLeft--;
            updateTimerDisplay();
            
            if (gameState.timeLeft <= 0) {
                clearInterval(gameState.timerInterval);
                gameOver(false);
            }
        }, 1000);
    }
    
    function updateTimerDisplay() {
        const minutes = Math.floor(gameState.timeLeft / 60);
        const seconds = gameState.timeLeft % 60;
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    function loadRoom(roomNumber) {
        const room = rooms[roomNumber];
        if (!room) return;
        
        const roomDisplay = document.getElementById('room-display');
        roomDisplay.style.backgroundImage = room.background;
        
        // Clear previous hotspots
        document.querySelectorAll('.hotspot').forEach(el => el.remove());
        
        // Add hotspots
        room.hotspots.forEach(hotspot => {
            const hotspotEl = document.createElement('div');
            hotspotEl.className = 'hotspot';
            hotspotEl.style.left = `${hotspot.x}%`;
            hotspotEl.style.top = `${hotspot.y}%`;
            hotspotEl.dataset.id = hotspot.id;
            hotspotEl.dataset.action = hotspot.action;
            hotspotEl.dataset.item = hotspot.item || '';
            
            // Add icon or text based on action
            if (hotspot.action === 'examine') {
                hotspotEl.textContent = '?';
            } else if (hotspot.action === 'door') {
                hotspotEl.textContent = '🚪';
            }
            
            hotspotEl.addEventListener('click', handleHotspotClick);
            roomDisplay.appendChild(hotspotEl);
        });
        
        // Update inventory display
        updateInventory();
        
        // Update puzzles solved display
        document.getElementById('puzzles-solved').textContent = 
            `${gameState.puzzlesSolved}/${gameState.totalPuzzles}`;
    }
    
    function handleHotspotClick(e) {
        const hotspot = e.currentTarget;
        const action = hotspot.dataset.action;
        const item = hotspot.dataset.item;
        
        if (action === 'examine') {
            if (item) {
                // Check if item is already in inventory
                if (!gameState.inventory.includes(item)) {
                    gameState.inventory.push(item);
                    addToLog(`You found a ${item}!`);
                    updateInventory();
                    saveGame();
                } else {
                    addToLog(`You already have the ${item}.`);
                }
            } else {
                // Check if this hotspot has an associated puzzle
                const room = rooms[gameState.currentRoom];
                if (room.puzzle) {
                    openPuzzle(room.puzzle);
                } else {
                    addToLog("You examine the area but find nothing of interest.");
                }
            }
        } else if (action === 'door') {
            // Check if all puzzles are solved for this room
            const room = rooms[gameState.currentRoom];
            if (gameState.puzzlesSolved >= gameState.currentRoom) {
                // Move to next room
                gameState.currentRoom++;
                if (gameState.currentRoom > Object.keys(rooms).length) {
                    // All rooms completed
                    gameOver(true);
                } else {
                    loadRoom(gameState.currentRoom);
                    addToLog(`You move to the next room.`);
                    saveGame();
                }
            } else {
                addToLog("The door is locked. You need to solve the room's puzzles first.");
            }
        }
    }
    
    function openPuzzle(puzzleId) {
        gameState.currentPuzzle = puzzleId;
        const puzzle = puzzles[puzzleId];
        
        document.getElementById('puzzleModalTitle').textContent = puzzle.title;
        document.getElementById('puzzleModalBody').innerHTML = puzzle.html;
        
        // Initialize puzzle if it has an init function
        if (puzzle.init) {
            puzzle.init();
        }
        
        const puzzleModal = new bootstrap.Modal(document.getElementById('puzzleModal'));
        puzzleModal.show();
    }
    
    function checkPuzzleAnswer() {
        const puzzle = puzzles[gameState.currentPuzzle];
        if (puzzle.checkAnswer()) {
            // Puzzle solved
            gameState.puzzlesSolved++;
            document.getElementById('puzzles-solved').textContent = 
                `${gameState.puzzlesSolved}/${gameState.totalPuzzles}`;
            
            addToLog(`You solved the ${puzzle.title} puzzle!`);
            
            // Close modal after delay
            setTimeout(() => {
                const puzzleModal = bootstrap.Modal.getInstance(document.getElementById('puzzleModal'));
                puzzleModal.hide();
                
                // Check if all puzzles are solved
                if (gameState.puzzlesSolved === gameState.totalPuzzles) {
                    addToLog("You've solved all the puzzles! Find the exit to escape.");
                }
                
                saveGame();
            }, 1500);
        }
    }
    
    function updateInventory() {
        const inventoryEl = document.getElementById('inventory');
        inventoryEl.innerHTML = '';
        
        gameState.inventory.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'inventory-item';
            itemEl.textContent = item;
            itemEl.dataset.item = item;
            inventoryEl.appendChild(itemEl);
        });
    }
    
    function addToLog(message) {
        const logEntries = document.querySelector('.game-log .log-entries');
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = message;
        logEntries.appendChild(entry);
        logEntries.scrollTop = logEntries.scrollHeight;
    }
    
    function gameOver(success) {
        gameState.gameActive = false;
        clearInterval(gameState.timerInterval);
        saveGame();
        
        const gameOverModal = new bootstrap.Modal(document.getElementById('gameOverModal'));
        
        if (success) {
            document.getElementById('gameOverModalTitle').textContent = "Congratulations!";
            document.getElementById('gameOverModalBody').innerHTML = `
                <p>You escaped with ${Math.floor(gameState.timeLeft / 60)}:${(gameState.timeLeft % 60).toString().padStart(2, '0')} remaining!</p>
                <p>You solved all ${gameState.totalPuzzles} puzzles.</p>
                <p>Well done!</p>
            `;
        } else {
            document.getElementById('gameOverModalTitle').textContent = "Time's Up!";
            document.getElementById('gameOverModalBody').innerHTML = `
                <p>You didn't escape in time.</p>
                <p>You solved ${gameState.puzzlesSolved} out of ${gameState.totalPuzzles} puzzles.</p>
                <p>Try again!</p>
            `;
        }
        
        gameOverModal.show();
    }
});