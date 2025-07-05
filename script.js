// script.js
// --- Referencias a elementos del DOM ---
const DOM = {
    gameContainer: document.getElementById('game-container'),
    gameArea: document.getElementById('game-area'),
    fruitContainer: document.getElementById('fruit-container'),
    basket: document.getElementById('basket'),
    scoreDisplay: document.getElementById('score'),
    livesDisplay: document.getElementById('lives'),
    highScoreIndicator: document.getElementById('high-score-indicator'),
    loadingScreen: document.getElementById('loading-screen'),
    mainMenu: document.getElementById('main-menu'),
    modesMenu: document.getElementById('modes-menu'),
    gameScreen: document.getElementById('game-screen'),
    optionsMenu: document.getElementById('options-menu'),
    customModeMenu: document.getElementById('custom-mode-menu'),
    highScoresMenu: document.getElementById('high-scores-menu'),
    ratingMenu: document.getElementById('rating-menu'),
    suggestionMenu: document.getElementById('suggestion-menu'),
    instructionsMenu: document.getElementById('instructions-menu'),
    gameOverScreen: document.getElementById('game-over-screen'),
    pauseMenu: document.getElementById('pause-menu'),
    modesButton: document.getElementById('modes-button'),
    startGameButton: document.getElementById('start-game-button'),
    customModeButtonMain: document.getElementById('custom-mode-button-main'),
    optionsButton: document.getElementById('options-button'),
    highScoresButton: document.getElementById('high-scores-button'),
    rateGameButton: document.getElementById('rate-game-button'),
    suggestFeatureButton: document.getElementById('suggest-feature-button'),
    instructionsButton: document.getElementById('instructions-button'),
    backToMainFromModesButton: document.getElementById('back-to-main-from-modes-button'),
    backToMainFromOptionsButton: document.getElementById('back-to-main-from-options-button'),
    backToModesFromCustomButton: document.getElementById('back-to-modes-from-custom-button'),
    backToMainFromHighScoresButton: document.getElementById('back-to-main-from-highscores-button'),
    backToMainFromRatingButton: document.getElementById('back-to-main-from-rating-button'),
    backToMainFromSuggestionButton: document.getElementById('back-to-main-from-suggestion-button'),
    backToMainFromInstructionsButton: document.getElementById('back-to-main-from-instructions-button'),
    applyCustomSettingsButton: document.getElementById('apply-custom-settings-button'),
    restartGameButton: document.getElementById('restart-game-button'),
    saveScoreButton: document.getElementById('save-score-button'),
    pauseButton: document.getElementById('pause-button'),
    resumeButton: document.getElementById('resume-button'),
    restartFromPauseButton: document.getElementById('restart-from-pause-button'),
    backToMainFromPauseButton: document.getElementById('back-to-main-from-pause-button'),
    mobileLeftButton: document.getElementById('mobile-left-button'),
    mobileRightButton: document.getElementById('mobile-right-button'),
    stars: document.querySelectorAll('.star'),
    ratingMessage: document.getElementById('rating-message'),
    suggestionForm: document.getElementById('suggestion-form'),
    suggestionText: document.getElementById('suggestion-text'),
    charCount: document.getElementById('char-count'),
    fruitFallSpeedRange: document.getElementById('fruit-fall-speed'),
    fruitSpawnRateRange: document.getElementById('fruit-spawn-rate'),
    maxLivesNumber: document.getElementById('max-lives'),
    basketSizeRange: document.getElementById('basket-size'),
    goodBadRatioRange: document.getElementById('good-bad-ratio'),
    playerNameInput: document.getElementById('player-name'),
    finalScoreDisplay: document.getElementById('final-score'),
    gameOverMessage: document.getElementById('gameOverMessage'),
    saveScoreSection: document.getElementById('save-score-section'),
    customModeMessage: document.getElementById('custom-mode-message'),
    fruitFallSpeedValue: document.getElementById('fruit-fall-speed-value'),
    fruitSpawnRateValue: document.getElementById('fruit-spawn-rate-value'),
    maxLivesValue: document.getElementById('max-lives-value'),
    basketSizeValue: document.getElementById('basket-size-value'),
    goodBadRatioValue: document.getElementById('good-bad-ratio-value'),
    nameError: document.querySelector('.name-error'),
    notification: document.getElementById('game-notification'),
    notificationMessage: document.getElementById('game-notification-message')
};

// --- Variables de Estado del Juego ---
let score = 0;
let lives = 3;
let highScore = parseInt(localStorage.getItem('highScore')) || 0;
let gameLoopId = null;
let fruitSpawnInterval = null;
let gamePaused = false;
let isCustomMode = false;
let customSettings = {};

// Configuración por defecto
const DEFAULT_SETTINGS = {
    fruitFallSpeed: 3,
    fruitSpawnRate: 1500,
    maxLives: 3,
    basketSize: 80,
    goodBadRatio: 0.8
};

// Assets del juego - Imágenes base64 para evitar problemas de carga
const GOOD_FRUITS = [
    { 
        name: 'apple', 
        src: 'assets/images/apple.png', 
        score: 10, 
        size: 40 
    },
    { 
        name: 'orange', 
        src: 'assets/images/orange.png', 
        score: 15, 
        size: 45 
    },
    { 
        name: 'cherry', 
        src: 'assets/images/cherry_berry.png', 
        score: 20, 
        size: 35 
    },
    { 
        name: 'kiwi', 
        src: 'assets/images/kiwi-game.png', 
        score: 25, 
        size: 50 
    }
];

const BAD_FRUITS = [
    { 
        name: 'rotten_apple', 
        src: 'assets/images/apple-mala.png', 
        penalty: 1, 
        scorePenalty: 15, 
        size: 40 
    }
];

// Imagen de la canasta en base64
const BASKET_IMAGE = 'assets/images/canasta.png';

// --- Funciones de Utilidad ---
// Mostrar pantalla específica
function showScreen(screenToShow) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    screenToShow.classList.remove('hidden');
}

// Mostrar notificación en el juego
function showNotification(message, type = 'info', duration = 3000) {
    DOM.notificationMessage.textContent = message;
    DOM.notification.className = '';
    DOM.notification.classList.add(type);
    DOM.notification.classList.add('show');
    
    setTimeout(() => {
        DOM.notification.classList.remove('show');
    }, duration);
}

// Precargar assets
function loadAssets() {
    return new Promise((resolve) => {
        const images = [
            ...GOOD_FRUITS.map(f => f.src),
            ...BAD_FRUITS.map(f => f.src),
            BASKET_IMAGE // Agregar la imagen de la canasta
        ];
        
        let loaded = 0;
        const total = images.length;
        
        if (total === 0) resolve();
        
        images.forEach(src => {
            const img = new Image();
            img.onload = () => {
                if (++loaded === total) resolve();
            };
            img.onerror = () => {
                console.error(`Error loading: ${src}`);
                if (++loaded === total) resolve();
            };
            img.src = src;
        });
    });
}

// Obtener fruta aleatoria
function getRandomFruit() {
    const isGoodFruit = Math.random() < (customSettings.goodBadRatio || DEFAULT_SETTINGS.goodBadRatio);
    
    if (isGoodFruit) {
        return GOOD_FRUITS[Math.floor(Math.random() * GOOD_FRUITS.length)];
    } else {
        return BAD_FRUITS[Math.floor(Math.random() * BAD_FRUITS.length)];
    }
}

// Crear fruta
function createFruit() {
    if (gamePaused || DOM.gameScreen.classList.contains('hidden')) return;
    
    const fruitData = getRandomFruit();
    if (!fruitData) return;
    
    const fruit = document.createElement('div');
    fruit.classList.add('fruit');
    
    const size = fruitData.size || 40;
    fruit.style.width = `${size}px`;
    fruit.style.height = `${size}px`;
    fruit.style.backgroundImage = `url('${fruitData.src}')`;
    fruit.dataset.type = fruitData.name;
    
    if (fruitData.score) fruit.dataset.score = fruitData.score;
    if (fruitData.penalty) fruit.dataset.penalty = fruitData.penalty;
    if (fruitData.scorePenalty) fruit.dataset.scorePenalty = fruitData.scorePenalty;
    
    const gameAreaWidth = DOM.gameArea.offsetWidth;
    const maxX = gameAreaWidth - size;
    const startX = Math.max(0, Math.random() * maxX);
    
    fruit.style.left = `${startX}px`;
    fruit.style.top = `-${size}px`;
    
    DOM.fruitContainer.appendChild(fruit);
    return fruit;
}

// Mover frutas
function moveFruits() {
    if (gamePaused) return;
    
    const fruits = document.querySelectorAll('.fruit');
    const gameAreaHeight = DOM.gameArea.offsetHeight;
    
    fruits.forEach(fruit => {
        const currentTop = parseFloat(fruit.style.top);
        const fallSpeed = parseFloat(customSettings.fruitFallSpeed || DEFAULT_SETTINGS.fruitFallSpeed);
        const newTop = currentTop + fallSpeed;
        
        fruit.style.top = `${newTop}px`;
        
        if (newTop > gameAreaHeight) {
            fruit.remove();
            if (!fruit.dataset.penalty || fruit.dataset.penalty === "0") {
                updateLives(-1);
            }
        }
        else if (newTop > gameAreaHeight - 100) {
            if (checkCollision(fruit)) {
                handleFruitCollision(fruit);
            }
        }
    });
}

// Comprobar colisión
function checkCollision(fruit) {
    const basketRect = DOM.basket.getBoundingClientRect();
    const fruitRect = fruit.getBoundingClientRect();
    const gameAreaRect = DOM.gameArea.getBoundingClientRect();
    
    const adjustedBasketRect = {
        top: basketRect.top - gameAreaRect.top,
        bottom: basketRect.bottom - gameAreaRect.top,
        left: basketRect.left - gameAreaRect.left,
        right: basketRect.right - gameAreaRect.left
    };
    
    const adjustedFruitRect = {
        top: fruitRect.top - gameAreaRect.top,
        bottom: fruitRect.bottom - gameAreaRect.top,
        left: fruitRect.left - gameAreaRect.left,
        right: fruitRect.right - gameAreaRect.left
    };
    
    return (
        adjustedFruitRect.bottom > adjustedBasketRect.top &&
        adjustedFruitRect.top < adjustedBasketRect.bottom &&
        adjustedFruitRect.right > adjustedBasketRect.left &&
        adjustedFruitRect.left < adjustedBasketRect.right
    );
}

// Manejar colisión de fruta
function handleFruitCollision(fruit) {
    if (fruit.dataset.collided) return;
    fruit.dataset.collided = true;
    
    if (fruit.dataset.penalty && parseInt(fruit.dataset.penalty) > 0) {
        updateLives(-parseInt(fruit.dataset.penalty));
        updateScore(-parseInt(fruit.dataset.scorePenalty || 0));
        createExplosionEffect(fruit);
    } else {
        updateScore(parseInt(fruit.dataset.score || 0));
        fruit.style.transform = 'scale(1.2)';
        fruit.style.opacity = '0.7';
        setTimeout(() => {
            if (fruit.parentNode) {
                fruit.remove();
            }
        }, 200);
    }
}

// Crear efecto de explosión
function createExplosionEffect(fruit) {
    const explosion = document.createElement('div');
    explosion.classList.add('explosion-effect');
    
    const fruitRect = fruit.getBoundingClientRect();
    const gameAreaRect = DOM.gameArea.getBoundingClientRect();
    
    explosion.style.left = `${fruitRect.left - gameAreaRect.left + fruitRect.width/2}px`;
    explosion.style.top = `${fruitRect.top - gameAreaRect.top + fruitRect.height/2}px`;
    
    DOM.fruitContainer.appendChild(explosion);
    fruit.remove();
    
    explosion.addEventListener('animationend', () => {
        explosion.remove();
    }, { once: true });
}

// Actualizar puntuación
function updateScore(points) {
    score += points;
    if (score < 0) score = 0;
    DOM.scoreDisplay.textContent = `PUNTOS: ${score}`;
    
    DOM.scoreDisplay.style.transform = 'scale(1.1)';
    DOM.scoreDisplay.style.color = points > 0 ? '#4CAF50' : '#F44336';
    setTimeout(() => {
        DOM.scoreDisplay.style.transform = 'scale(1)';
        DOM.scoreDisplay.style.color = 'white';
    }, 300);
}

// Actualizar vidas
function updateLives(change) {
    lives += change;
    if (lives < 0) lives = 0;
    DOM.livesDisplay.textContent = `VIDAS: ${lives}`;
    
    DOM.livesDisplay.style.transform = 'scale(1.1)';
    DOM.livesDisplay.style.color = change > 0 ? '#4CAF50' : '#F44336';
    setTimeout(() => {
        DOM.livesDisplay.style.transform = 'scale(1)';
        DOM.livesDisplay.style.color = 'white';
    }, 300);
    
    if (lives <= 0) {
        gameOver();
    }
}

// --- Lógica del Juego ---
// Inicializar juego
function initGame() {
    score = 0;
    lives = customSettings.maxLives || DEFAULT_SETTINGS.maxLives;
    DOM.scoreDisplay.textContent = `PUNTOS: ${score}`;
    DOM.livesDisplay.textContent = `VIDAS: ${lives}`;
    updateHighScoreDisplay();
    
    DOM.fruitContainer.innerHTML = '';
    
    // Configurar la canasta como imagen
    DOM.basket.src = BASKET_IMAGE;
    DOM.basket.style.backgroundImage = 'none';
    
    if (isCustomMode) {
        DOM.customModeMessage.classList.remove('hidden');
        DOM.saveScoreSection.classList.add('hidden');
    } else {
        DOM.customModeMessage.classList.add('hidden');
        DOM.saveScoreSection.classList.remove('hidden');
    }
    
    const basketSize = customSettings.basketSize || DEFAULT_SETTINGS.basketSize;
    DOM.basket.style.width = `${basketSize}px`;
    DOM.basket.style.height = `${basketSize * 0.75}px`;
    
    const gameAreaWidth = DOM.gameArea.offsetWidth;
    const basketWidth = DOM.basket.offsetWidth;
    const initialLeft = Math.max(
        basketWidth / 2, 
        Math.min(
            gameAreaWidth - basketWidth / 2, 
            gameAreaWidth / 2
        )
    );
    
    DOM.basket.style.left = `${initialLeft}px`;
    showScreen(DOM.gameScreen);
    startGameLoop();
}

// Iniciar bucle del juego
function startGameLoop() {
    cancelAnimationFrame(gameLoopId);
    clearInterval(fruitSpawnInterval);
    
    gameLoopId = requestAnimationFrame(gameLoop);
    fruitSpawnInterval = setInterval(
        createFruit, 
        customSettings.fruitSpawnRate || DEFAULT_SETTINGS.fruitSpawnRate
    );
    
    gamePaused = false;
    DOM.gameScreen.classList.remove('game-state--paused');
}

// Bucle principal del juego
function gameLoop() {
    if (!gamePaused) {
        moveFruits();
    }
    gameLoopId = requestAnimationFrame(gameLoop);
}

// Pausar juego
function pauseGame() {
    if (gamePaused) return;
    
    gamePaused = true;
    clearInterval(fruitSpawnInterval);
    DOM.gameScreen.classList.add('game-state--paused');
    showScreen(DOM.pauseMenu);
}

// Reanudar juego
function resumeGame() {
    if (!gamePaused) return;
    
    fruitSpawnInterval = setInterval(
        createFruit, 
        customSettings.fruitSpawnRate || DEFAULT_SETTINGS.fruitSpawnRate
    );
    
    gamePaused = false;
    DOM.gameScreen.classList.remove('game-state--paused');
    
    // Mostrar la pantalla de juego y ocultar menú de pausa
    DOM.gameScreen.classList.remove('hidden');
    DOM.pauseMenu.classList.add('hidden');
}

// Volver al menú principal
function returnToMainMenu() {
    gamePaused = true;
    cancelAnimationFrame(gameLoopId);
    clearInterval(fruitSpawnInterval);
    gameLoopId = null;
    fruitSpawnInterval = null;
    isCustomMode = false;
    
    DOM.fruitContainer.innerHTML = '';
    
    if (DOM.mobileLeftButton && DOM.mobileRightButton) {
        DOM.mobileLeftButton.parentElement.style.display = 'flex';
    }
    
    showScreen(DOM.mainMenu);
}

// Reiniciar desde pausa
function restartFromPause() {
    pauseGame();
    cancelAnimationFrame(gameLoopId);
    clearInterval(fruitSpawnInterval);
    DOM.fruitContainer.innerHTML = '';
    showScreen(DOM.modesMenu);
}

// Game Over
function gameOver() {
    gamePaused = true;
    cancelAnimationFrame(gameLoopId);
    clearInterval(fruitSpawnInterval);
    
    if (DOM.mobileLeftButton && DOM.mobileRightButton) {
        DOM.mobileLeftButton.parentElement.style.display = 'none';
    }
    
    DOM.finalScoreDisplay.textContent = score;
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        DOM.gameOverMessage.textContent = "¡NUEVO RÉCORD!";
        DOM.gameOverMessage.style.color = '#FFD700';
        if (!isCustomMode) {
            DOM.saveScoreSection.classList.remove('hidden');
        }
    } else {
        DOM.gameOverMessage.textContent = "GAME OVER";
        DOM.gameOverMessage.style.color = '#F44336';
        DOM.saveScoreSection.classList.add('hidden');
    }
    
    DOM.playerNameInput.value = '';
    updateHighScoreDisplay();
    showScreen(DOM.gameOverScreen);
}

// Guardar puntuación
function saveScore() {
    if (isCustomMode) {
        DOM.customModeMessage.classList.remove('hidden');
        DOM.saveScoreSection.classList.add('hidden');
        return;
    }
    
    const playerName = DOM.playerNameInput.value.trim();
    
    if (playerName.length < 2 || playerName.length > 10) {
        DOM.playerNameInput.classList.add('invalid');
        DOM.nameError.style.display = 'block';
        DOM.playerNameInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
            DOM.playerNameInput.style.animation = '';
        }, 500);
        return;
    }
    
    let scores = JSON.parse(localStorage.getItem('highScores')) || [];
    scores.push({ name: playerName, score: score });
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem('highScores', JSON.stringify(scores.slice(0, 5)));
    
    renderHighScores();
    DOM.saveScoreSection.classList.add('hidden');
    
    // Mostrar notificación en lugar de alert
    showNotification(`¡Puntuación de ${playerName} guardada!`, 'success');
}

// Renderizar mejores puntuaciones
function renderHighScores() {
    const highScoresList = document.getElementById('high-scores-list');
    highScoresList.innerHTML = '';
    const scores = JSON.parse(localStorage.getItem('highScores')) || [];
    
    if (scores.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No hay puntuaciones aún. ¡Sé el primero!';
        highScoresList.appendChild(li);
    } else {
        scores.forEach((entry, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${index + 1}. ${entry.name}</span> <span>${entry.score}</span>`;
            if (index === 0 && entry.score === highScore) {
                li.style.backgroundColor = 'rgba(255, 215, 0, 0.3)';
                li.style.fontWeight = 'bold';
            }
            highScoresList.appendChild(li);
        });
    }
}

// Actualizar indicador de high score
function updateHighScoreDisplay() {
    highScore = parseInt(localStorage.getItem('highScore')) || 0;
    DOM.highScoreIndicator.textContent = `MEJOR PUNT.: ${highScore}`;
    
    if (score > highScore) {
        DOM.highScoreIndicator.style.animation = 'pulse 0.5s 3';
        setTimeout(() => {
            DOM.highScoreIndicator.style.animation = '';
        }, 1500);
    }
}

// Mover canasta
function moveBasket(direction) {
    if (gamePaused) return;
    
    const basket = DOM.basket;
    const gameArea = DOM.gameArea;
    let basketLeft = parseFloat(basket.style.left);
    const basketWidth = basket.offsetWidth;
    const gameAreaWidth = gameArea.offsetWidth;
    const speed = 15;
    
    const minLeft = basketWidth / 2;
    const maxLeft = gameAreaWidth - (basketWidth / 2);
    
    if (direction === 'left') {
        basketLeft = Math.max(minLeft, basketLeft - speed);
    } else if (direction === 'right') {
        basketLeft = Math.min(maxLeft, basketLeft + speed);
    }
    
    basket.style.left = `${basketLeft}px`;
}

// Configurar controles móviles
function setupMobileControls() {
    if (!DOM.mobileLeftButton || !DOM.mobileRightButton) return;
    
    let moveInterval;
    const moveSpeed = 8;
    
    const startMove = (direction) => {
        if (moveInterval) clearInterval(moveInterval);
        moveInterval = setInterval(() => moveBasket(direction), 16);
    };
    
    const stopMove = () => {
        if (moveInterval) clearInterval(moveInterval);
    };
    
    DOM.mobileLeftButton.addEventListener('pointerdown', () => startMove('left'));
    DOM.mobileLeftButton.addEventListener('pointerup', stopMove);
    DOM.mobileLeftButton.addEventListener('pointerleave', stopMove);
    
    DOM.mobileRightButton.addEventListener('pointerdown', () => startMove('right'));
    DOM.mobileRightButton.addEventListener('pointerup', stopMove);
    DOM.mobileRightButton.addEventListener('pointerleave', stopMove);
}

// --- Inicialización del Juego ---
document.addEventListener('DOMContentLoaded', () => {
    showScreen(DOM.loadingScreen);
    
    // Configurar la canasta como imagen
    DOM.basket.src = BASKET_IMAGE;
    DOM.basket.style.backgroundImage = 'none';
    
    loadAssets().then(() => {
        DOM.loadingScreen.classList.add('hidden');
        showScreen(DOM.mainMenu);
        updateHighScoreDisplay();
        renderHighScores();
        setupMobileControls();
    });
    
    // Configuración de eventos
    DOM.modesButton.addEventListener('click', () => showScreen(DOM.modesMenu));
    DOM.highScoresButton.addEventListener('click', () => {
        renderHighScores();
        showScreen(DOM.highScoresMenu);
    });
    DOM.optionsButton.addEventListener('click', () => showScreen(DOM.optionsMenu));
    DOM.instructionsButton.addEventListener('click', () => showScreen(DOM.instructionsMenu));
    DOM.rateGameButton.addEventListener('click', () => showScreen(DOM.ratingMenu));
    DOM.suggestFeatureButton.addEventListener('click', () => showScreen(DOM.suggestionMenu));
    
    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', returnToMainMenu);
    });
    
    DOM.startGameButton.addEventListener('click', () => {
        isCustomMode = false;
        customSettings = { ...DEFAULT_SETTINGS };
        initGame();
    });
    
    DOM.customModeButtonMain.addEventListener('click', () => {
        showScreen(DOM.customModeMenu);
        DOM.fruitFallSpeedRange.value = customSettings.fruitFallSpeed || DEFAULT_SETTINGS.fruitFallSpeed;
        DOM.fruitSpawnRateRange.value = customSettings.fruitSpawnRate || DEFAULT_SETTINGS.fruitSpawnRate;
        DOM.maxLivesNumber.value = customSettings.maxLives || DEFAULT_SETTINGS.maxLives;
        DOM.basketSizeRange.value = customSettings.basketSize || DEFAULT_SETTINGS.basketSize;
        DOM.goodBadRatioRange.value = customSettings.goodBadRatio || DEFAULT_SETTINGS.goodBadRatio;
        
        DOM.fruitFallSpeedValue.textContent = DOM.fruitFallSpeedRange.value;
        DOM.fruitSpawnRateValue.textContent = DOM.fruitSpawnRateRange.value;
        DOM.maxLivesValue.textContent = DOM.maxLivesNumber.value;
        DOM.basketSizeValue.textContent = DOM.basketSizeRange.value;
        DOM.goodBadRatioValue.textContent = `${(DOM.goodBadRatioRange.value * 100).toFixed(0)}% Buenas`;
    });
    
    DOM.fruitFallSpeedRange.addEventListener('input', (e) => {
        DOM.fruitFallSpeedValue.textContent = parseFloat(e.target.value).toFixed(1);
    });
    
    DOM.fruitSpawnRateRange.addEventListener('input', (e) => {
        DOM.fruitSpawnRateValue.textContent = e.target.value;
    });
    
    DOM.maxLivesNumber.addEventListener('input', (e) => {
        DOM.maxLivesValue.textContent = e.target.value;
    });
    
    DOM.basketSizeRange.addEventListener('input', (e) => {
        DOM.basketSizeValue.textContent = e.target.value;
    });
    
    DOM.goodBadRatioRange.addEventListener('input', (e) => {
        DOM.goodBadRatioValue.textContent = `${(parseFloat(e.target.value) * 100).toFixed(0)}% Buenas`;
    });
    
    DOM.applyCustomSettingsButton.addEventListener('click', () => {
        isCustomMode = true;
        customSettings = {
            fruitFallSpeed: parseFloat(DOM.fruitFallSpeedRange.value),
            fruitSpawnRate: parseInt(DOM.fruitSpawnRateRange.value),
            maxLives: parseInt(DOM.maxLivesNumber.value),
            basketSize: parseInt(DOM.basketSizeRange.value),
            goodBadRatio: parseFloat(DOM.goodBadRatioRange.value)
        };
        initGame();
    });
    
    DOM.pauseButton.addEventListener('click', pauseGame);
    DOM.resumeButton.addEventListener('click', resumeGame);
    DOM.restartFromPauseButton.addEventListener('click', restartFromPause);
    DOM.backToMainFromPauseButton.addEventListener('click', returnToMainMenu);
    
    DOM.restartGameButton.addEventListener('click', () => showScreen(DOM.modesMenu));
    DOM.saveScoreButton.addEventListener('click', saveScore);
    
    DOM.playerNameInput.addEventListener('input', function() {
        const name = this.value;
        if (name.length > 0 && (name.length < 2 || name.length > 10)) {
            this.classList.add('invalid');
            DOM.nameError.style.display = 'block';
        } else {
            this.classList.remove('invalid');
            DOM.nameError.style.display = 'none';
        }
    });
    
    // Controles de teclado
    document.addEventListener('keydown', (e) => {
        if (gamePaused) return;
        switch(e.key) {
            case 'ArrowLeft': case 'a': moveBasket('left'); break;
            case 'ArrowRight': case 'd': moveBasket('right'); break;
            case ' ': pauseGame(); break;
        }
    });
    
    // Calificación con estrellas
    DOM.stars.forEach(star => {
        star.addEventListener('click', (e) => {
            const rating = parseInt(e.target.dataset.value);
            DOM.stars.forEach(s => {
                if (parseInt(s.dataset.value) <= rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
            DOM.ratingMessage.textContent = `¡Gracias por calificar con ${rating} estrellas!`;
            DOM.ratingMessage.style.color = '#FFD700';
            localStorage.setItem('gameRating', rating);
        });
    });
    
    // Cargar calificación guardada
    const savedRating = localStorage.getItem('gameRating');
    if (savedRating) {
        DOM.stars.forEach(star => {
            if (parseInt(star.dataset.value) <= savedRating) {
                star.classList.add('active');
            }
        });
    }
    
    // Contador de caracteres para sugerencias
    DOM.suggestionText.addEventListener('input', () => {
        const maxLength = DOM.suggestionText.maxLength;
        const currentLength = DOM.suggestionText.value.length;
        DOM.charCount.textContent = `${maxLength - currentLength} caracteres restantes`;
        if (maxLength - currentLength < 20) {
            DOM.charCount.classList.add('low');
        } else {
            DOM.charCount.classList.remove('low');
        }
    });
    
    // Envío de sugerencias
    DOM.suggestionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: formData,
                headers: { 'Accept': 'application/json' }
            });
            if (response.ok) {
                // Mostrar notificación en lugar de alert
                showNotification('¡Gracias por tu sugerencia! La hemos recibido.', 'success');
                form.reset();
                DOM.charCount.textContent = `${DOM.suggestionText.maxLength} caracteres restantes`;
                DOM.charCount.classList.remove('low');
                
                // Volver al menú principal después de 3 segundos
                setTimeout(() => showScreen(DOM.mainMenu), 3000);
            } else {
                showNotification('Hubo un problema al enviar tu sugerencia. Por favor, inténtalo de nuevo.', 'error');
            }
        } catch (error) {
            console.error('Error al enviar la sugerencia:', error);
            showNotification('Hubo un problema de red. Por favor, inténtalo de nuevo más tarde.', 'error');
        }
    });
    
    // Ajustar posición de la canasta al redimensionar
    window.addEventListener('resize', () => {
        if (!DOM.gameScreen.classList.contains('hidden')) {
            const gameAreaWidth = DOM.gameArea.offsetWidth;
            const basketWidth = DOM.basket.offsetWidth;
            const currentLeft = parseFloat(DOM.basket.style.left);
            const minLeft = basketWidth / 2;
            const maxLeft = gameAreaWidth - basketWidth / 2;
            const newLeft = Math.max(minLeft, Math.min(maxLeft, currentLeft));
            DOM.basket.style.left = `${newLeft}px`;
        }
    });
    
    // Añadir animaciones CSS dinámicamente
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -60%); }
            20%, 80% { opacity: 1; transform: translate(-50%, -50%); }
            100% { opacity: 0; transform: translate(-50%, -40%); }
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        .screen {
            animation: fadeIn 0.3s ease-out;
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
            75% { transform: translateX(-5px); }
            100% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
});
