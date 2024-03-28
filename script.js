const button = document.getElementById('button');
const scoreDisplay = document.getElementById('score'); 
const maxScoreDisplay = document.getElementById('max-score');
const resetChanceDisplay = document.getElementById('reset-chance');
const autoClickToggleButton = document.getElementById('auto-click-toggle');

const WIN_SCORE = 100;
let score = 0;
let maxScore = 0;
let autoClickActive = false;
let autoClickInterval;

function updateMaxScore() {
    maxScoreDisplay.textContent = maxScore;
}

function updateResetChance() {
    resetChanceDisplay.textContent = `${score}%`;
}

function resetGame() {
    score = 0;
    scoreDisplay.textContent = score; 
    updateMaxScore();
    updateResetChance();
}

function saveMaxScoreToDatabase(score) {
    const request = indexedDB.open('maxScoreDatabase', 1);

    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        db.createObjectStore('maxScoreStore', { keyPath: 'id' });
    };

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['maxScoreStore'], 'readwrite');
        const objectStore = transaction.objectStore('maxScoreStore');
        const maxScoreData = { id: 1, score: score };
        objectStore.put(maxScoreData);
    };
}

function loadMaxScoreFromDatabase() {
    const request = indexedDB.open('maxScoreDatabase', 1);

    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        db.createObjectStore('maxScoreStore', { keyPath: 'id' });
    };

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['maxScoreStore'], 'readonly');
        const objectStore = transaction.objectStore('maxScoreStore');
        const getRequest = objectStore.get(1);

        getRequest.onsuccess = function(event) {
            if (getRequest.result) {
                maxScore = getRequest.result.score;
                updateMaxScore();
            }
        };
    };
}

function simulateButtonClick() {
    score++;
    scoreDisplay.textContent = score;

    if (score > maxScore) {
        maxScore = score;
        updateMaxScore();
        saveMaxScoreToDatabase(maxScore);
    }

    if (score === WIN_SCORE) {
        alert('Você venceu!');
        resetGame();
    }

    updateResetChance();

    if (Math.random() * 100 <= score) {
        resetGame();
    }
}

// Adiciona evento de clique no botão
button.addEventListener('click', () => {
    simulateButtonClick();
});

// Adiciona evento de clique no botão de alternar clique automático
autoClickToggleButton.addEventListener('click', () => {
    if (!autoClickActive) {
        autoClickActive = true;
        autoClickInterval = setInterval(simulateButtonClick, 100);
        autoClickToggleButton.textContent = 'Desativar Clique Automático';
        autoClickToggleButton.classList.add('active'); // Adiciona a classe "active"
    } else {
        autoClickActive = false;
        clearInterval(autoClickInterval);
        autoClickToggleButton.textContent = 'Ativar Clique Automático';
        autoClickToggleButton.classList.remove('active'); // Remove a classe "active"
    }
});

// Carrega a pontuação máxima armazenada no IndexedDB quando a página é carregada
loadMaxScoreFromDatabase();

// Configuração inicial
scoreDisplay.textContent = score; 
updateResetChance();
