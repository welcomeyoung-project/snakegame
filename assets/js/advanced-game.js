// Game Configuration Manager
class GameConfig {
    constructor() {
        this.difficulties = {
            easy: {
                name: 'Easy',
                speed: 250,
                obstacleChance: 0,
                obstacleLifetime: 0,
                description: 'Slow speed, no obstacles'
            },
            normal: {
                name: 'Normal',
                speed: 200,
                obstacleChance: 0.05,
                obstacleLifetime: 8000,
                description: 'Normal speed, few obstacles'
            },
            hard: {
                name: 'Hard',
                speed: 150,
                obstacleChance: 0.1,
                obstacleLifetime: 6000,
                description: 'Fast speed, more obstacles'
            },
            expert: {
                name: 'Expert',
                speed: 100,
                obstacleChance: 0.15,
                obstacleLifetime: 4000,
                description: 'High speed, many obstacles'
            },
            insane: {
                name: 'Insane',
                speed: 80,
                obstacleChance: 0.2,
                obstacleLifetime: 3000,
                description: 'Extreme speed, dangerous obstacles'
            }
        };
        
        this.boardSizes = {
            small: { width: 300, height: 300, name: 'Small (15x15)' },
            medium: { width: 400, height: 400, name: 'Medium (20x20)' },
            large: { width: 500, height: 500, name: 'Large (25x25)' },
            xlarge: { width: 600, height: 600, name: 'X-Large (30x30)' },
            huge: { width: 700, height: 700, name: 'Huge (35x35)' }
        };
        
        this.currentDifficulty = 'normal';
        this.currentBoardSize = 'medium';
        this.gridSize = 20;
        
        this.loadSettings();
    }

    getDifficulty() {
        return this.difficulties[this.currentDifficulty];
    }

    getBoardSize() {
        return this.boardSizes[this.currentBoardSize];
    }

    setDifficulty(difficulty) {
        if (this.difficulties[difficulty]) {
            this.currentDifficulty = difficulty;
            this.saveSettings();
        }
    }

    setBoardSize(size) {
        if (this.boardSizes[size]) {
            this.currentBoardSize = size;
            this.saveSettings();
        }
    }

    getTileCount() {
        const boardSize = this.getBoardSize();
        return {
            width: Math.floor(boardSize.width / this.gridSize),
            height: Math.floor(boardSize.height / this.gridSize)
        };
    }

    saveSettings() {
        const settings = {
            difficulty: this.currentDifficulty,
            boardSize: this.currentBoardSize
        };
        localStorage.setItem('snakeGameSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('snakeGameSettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                if (settings.difficulty && this.difficulties[settings.difficulty]) {
                    this.currentDifficulty = settings.difficulty;
                }
                if (settings.boardSize && this.boardSizes[settings.boardSize]) {
                    this.currentBoardSize = settings.boardSize;
                }
            } catch (e) {
                console.warn('Failed to load settings:', e);
            }
        }
    }
}

// Obstacle Manager
class ObstacleManager {
    constructor() {
        this.obstacles = [];
        this.obstacleTypes = ['mine', 'rock', 'bomb'];
        this.lastObstacleTime = 0;
        this.obstacleInterval = 5000; // 5秒
    }

    update(gameInstance) {
        const now = Date.now();
        const difficulty = gameInstance.config.getDifficulty();
        
        // Generate new obstacles
        if (now - this.lastObstacleTime > this.obstacleInterval && 
            Math.random() < difficulty.obstacleChance) {
            this.generateObstacle(gameInstance);
            this.lastObstacleTime = now;
        }
        
        // Update existing obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            
            if (now - obstacle.createdAt > difficulty.obstacleLifetime) {
                this.obstacles.splice(i, 1);
            }
        }
    }

    generateObstacle(gameInstance) {
        const tileCount = gameInstance.config.getTileCount();
        let attempts = 0;
        const maxAttempts = 50;
        
        while (attempts < maxAttempts) {
            const x = Math.floor(Math.random() * tileCount.width);
            const y = Math.floor(Math.random() * tileCount.height);
            
            // 检查位置是否被占用
            if (!this.isPositionOccupied(x, y, gameInstance)) {
                const obstacle = {
                    x: x,
                    y: y,
                    type: this.obstacleTypes[Math.floor(Math.random() * this.obstacleTypes.length)],
                    createdAt: Date.now()
                };
                this.obstacles.push(obstacle);
                break;
            }
            attempts++;
        }
    }

    isPositionOccupied(x, y, gameInstance) {
        // Check snake body
        for (let segment of gameInstance.snake) {
            if (segment.x === x && segment.y === y) {
                return true;
            }
        }
        
        // Check food
        if (gameInstance.food.x === x && gameInstance.food.y === y) {
            return true;
        }
        
        // Check other obstacles
        for (let obstacle of this.obstacles) {
            if (obstacle.x === x && obstacle.y === y) {
                return true;
            }
        }
        
        return false;
    }

    checkCollision(x, y) {
        return this.obstacles.some(obstacle => 
            obstacle.x === x && obstacle.y === y
        );
    }

    clear() {
        this.obstacles = [];
    }

    draw(ctx, gameInstance) {
        const theme = gameInstance.themeManager.getCurrentTheme();
        const difficulty = gameInstance.config.getDifficulty();
        
        this.obstacles.forEach(obstacle => {
            const x = obstacle.x * gameInstance.config.gridSize;
            const y = obstacle.y * gameInstance.config.gridSize;
            const size = gameInstance.config.gridSize;
            
            // Calculate remaining time ratio
            const timeLeft = (difficulty.obstacleLifetime - (Date.now() - obstacle.createdAt)) / difficulty.obstacleLifetime;
            const alpha = Math.max(0.3, timeLeft); // Gradually fade
            
            ctx.save();
            ctx.globalAlpha = alpha;
            
            switch (obstacle.type) {
                case 'mine':
                    this.drawMine(ctx, x, y, size, theme);
                    break;
                case 'rock':
                    this.drawRock(ctx, x, y, size, theme);
                    break;
                case 'bomb':
                    this.drawBomb(ctx, x, y, size, theme);
                    break;
            }
            
            ctx.restore();
            
            // Draw countdown
            if (timeLeft < 0.3) {
                ctx.save();
                ctx.fillStyle = '#ff0000';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('!', x + size/2, y + size/2 + 4);
                ctx.restore();
            }
        });
    }

    drawMine(ctx, x, y, size, theme) {
        const centerX = x + size / 2;
        const centerY = y + size / 2;
        const radius = size * 0.3;
        
        // Main body
        ctx.fillStyle = theme.obstacles.mine;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Spikes
        ctx.strokeStyle = theme.obstacles.mine;
        ctx.lineWidth = 2;
        const spikes = 8;
        for (let i = 0; i < spikes; i++) {
            const angle = (i / spikes) * Math.PI * 2;
            const startX = centerX + Math.cos(angle) * radius;
            const startY = centerY + Math.sin(angle) * radius;
            const endX = centerX + Math.cos(angle) * (radius + 4);
            const endY = centerY + Math.sin(angle) * (radius + 4);
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        
        // Warning sign
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('!', centerX, centerY + 3);
    }

    drawRock(ctx, x, y, size, theme) {
        ctx.fillStyle = theme.obstacles.rock;
        ctx.beginPath();
        ctx.moveTo(x + 2, y + size - 2);
        ctx.lineTo(x + size * 0.3, y + 2);
        ctx.lineTo(x + size * 0.7, y + size * 0.2);
        ctx.lineTo(x + size - 2, y + size * 0.4);
        ctx.lineTo(x + size - 2, y + size - 2);
        ctx.closePath();
        ctx.fill();
        
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.moveTo(x + size * 0.6, y + size * 0.3);
        ctx.lineTo(x + size - 2, y + size * 0.4);
        ctx.lineTo(x + size - 2, y + size - 2);
        ctx.lineTo(x + size * 0.6, y + size - 2);
        ctx.closePath();
        ctx.fill();
    }

    drawBomb(ctx, x, y, size, theme) {
        const centerX = x + size / 2;
        const centerY = y + size * 0.7;
        const radius = size * 0.25;
        
        // Fuse
        ctx.strokeStyle = theme.obstacles.bomb;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, y + 2);
        ctx.lineTo(centerX, centerY - radius);
        ctx.stroke();
        
        // Spark
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.arc(centerX, y + 2, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Bomb body
        ctx.fillStyle = theme.obstacles.bomb;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(centerX - 2, centerY - 2, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Enhanced Snake Game Class
class AdvancedSnakeGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.themeManager = new EnhancedThemeManager();
        this.config = new GameConfig();
        this.obstacleManager = new ObstacleManager();
        
        // Game state
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameLoop = null;
        
        // Snake initial state
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        
        // Food
        this.food = { x: 15, y: 15 };
        
        // Score
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('snakeGameHighScore')) || 0;
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.themeManager.applyTheme();
        this.updateScoreDisplay();
        this.updateConfigDisplay();
        this.draw();
    }

    setupCanvas() {
        const boardSize = this.config.getBoardSize();
        this.canvas.width = boardSize.width;
        this.canvas.height = boardSize.height;
        this.canvas.style.maxWidth = '100%';
        this.canvas.style.height = 'auto';
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Theme switching
        document.getElementById('theme-select').addEventListener('change', (e) => {
            this.themeManager.setTheme(e.target.value);
        });
        
        // Difficulty switching
        document.getElementById('difficulty-select').addEventListener('change', (e) => {
            this.config.setDifficulty(e.target.value);
            this.updateConfigDisplay();
        });
        
        // Game board size switching
        document.getElementById('board-size-select').addEventListener('change', (e) => {
            this.config.setBoardSize(e.target.value);
            this.setupCanvas();
            this.resetGame();
            this.updateConfigDisplay();
        });
        
        // Game control buttons
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        
        // Virtual directional pad
        document.querySelectorAll('.d-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const direction = e.target.dataset.direction;
                this.handleDirectionInput(direction);
            });
        });

        // Theme change events
        document.addEventListener('themeChanged', () => {
            this.draw();
        });

        // Touch controls
        this.setupTouchControls();
    }

    setupTouchControls() {
        let startX, startY;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!startX || !startY) return;
            
            const touch = e.changedTouches[0];
            const endX = touch.clientX;
            const endY = touch.clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 30) this.handleDirectionInput('right');
                else if (deltaX < -30) this.handleDirectionInput('left');
            } else {
                if (deltaY > 30) this.handleDirectionInput('down');
                else if (deltaY < -30) this.handleDirectionInput('up');
            }
            
            startX = null;
            startY = null;
        });
    }

    handleKeyPress(e) {
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                this.handleDirectionInput('up');
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.handleDirectionInput('down');
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.handleDirectionInput('left');
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.handleDirectionInput('right');
                break;
            case ' ':
                e.preventDefault();
                this.togglePause();
                break;
            case 'Enter':
                e.preventDefault();
                if (!this.gameRunning) this.startGame();
                break;
            case 'r':
            case 'R':
                e.preventDefault();
                if (!this.gameRunning) this.resetGame();
                break;
        }
    }

    handleDirectionInput(direction) {
        if (!this.gameRunning || this.gamePaused) return;
        
        switch(direction) {
            case 'up':
                if (this.direction.y === 0) {
                    this.nextDirection = { x: 0, y: -1 };
                }
                break;
            case 'down':
                if (this.direction.y === 0) {
                    this.nextDirection = { x: 0, y: 1 };
                }
                break;
            case 'left':
                if (this.direction.x === 0) {
                    this.nextDirection = { x: -1, y: 0 };
                }
                break;
            case 'right':
                if (this.direction.x === 0) {
                    this.nextDirection = { x: 1, y: 0 };
                }
                break;
        }
    }

    startGame() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.gamePaused = false;
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        
        const difficulty = this.config.getDifficulty();
        this.updateButtonStates();
        this.hideGameOver();
        this.gameLoop = setInterval(() => this.update(), difficulty.speed);
    }

    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        this.updateButtonStates();
        
        if (this.gamePaused) {
            clearInterval(this.gameLoop);
        } else {
            const difficulty = this.config.getDifficulty();
            this.gameLoop = setInterval(() => this.update(), difficulty.speed);
        }
    }

    resetGame() {
        this.stopGame();
        const tileCount = this.config.getTileCount();
        this.snake = [{ x: Math.floor(tileCount.width/2), y: Math.floor(tileCount.height/2) }];
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.score = 0;
        this.obstacleManager.clear();
        this.generateFood();
        this.updateScoreDisplay();
        this.hideGameOver();
        this.draw();
    }

    restartGame() {
        this.resetGame();
        this.startGame();
    }

    stopGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        this.updateButtonStates();
    }

    update() {
        if (!this.gameRunning || this.gamePaused) return;
        
        // Update direction
        this.direction = { ...this.nextDirection };
        
        // Move snake head
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // Check collision
        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // Check if food eaten
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScoreDisplay();
            this.generateFood();
        } else {
            this.snake.pop();
        }
        
        // Update obstacles
        this.obstacleManager.update(this);
        
        this.draw();
    }

    checkCollision(head) {
        const tileCount = this.config.getTileCount();
        
        // Wall collision
        if (head.x < 0 || head.x >= tileCount.width || 
            head.y < 0 || head.y >= tileCount.height) {
            return true;
        }
        
        // Self collision
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                return true;
            }
        }
        
        // Obstacle collision
        if (this.obstacleManager.checkCollision(head.x, head.y)) {
            return true;
        }
        
        return false;
    }

    generateFood() {
        const tileCount = this.config.getTileCount();
        let attempts = 0;
        const maxAttempts = 100;
        
        do {
            this.food = {
                x: Math.floor(Math.random() * tileCount.width),
                y: Math.floor(Math.random() * tileCount.height)
            };
            attempts++;
        } while (
            (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y) ||
             this.obstacleManager.checkCollision(this.food.x, this.food.y)) &&
            attempts < maxAttempts
        );
    }

    gameOver() {
        this.stopGame();
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeGameHighScore', this.highScore.toString());
            this.updateScoreDisplay();
        }
        
        this.showGameOver();
    }

    draw() {
        const theme = this.themeManager.getCurrentTheme();
        
        // Clear canvas
        this.ctx.fillStyle = theme.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid(theme);
        
        // Draw obstacles
        this.obstacleManager.draw(this.ctx, this);
        
        // Draw food
        this.drawFood(theme);
        
        // Draw snake
        this.drawSnake(theme);
        
        // Draw game status
        this.drawGameStatus();
    }

    drawGrid(theme) {
        const tileCount = this.config.getTileCount();
        this.ctx.strokeStyle = theme.gridColor;
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= tileCount.width; i++) {
            const x = i * this.config.gridSize;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let i = 0; i <= tileCount.height; i++) {
            const y = i * this.config.gridSize;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawSnake(theme) {
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.config.gridSize;
            const y = segment.y * this.config.gridSize;
            
            if (index === 0) {
                // Snake head
                this.ctx.fillStyle = theme.snake.head;
                this.ctx.fillRect(x, y, this.config.gridSize, this.config.gridSize);
                
                this.ctx.strokeStyle = theme.snake.border;
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x, y, this.config.gridSize, this.config.gridSize);
                
                // Draw eyes
                this.drawSnakeEyes(x, y, theme);
            } else {
                // Snake body
                this.ctx.fillStyle = theme.snake.body;
                this.ctx.fillRect(x + 1, y + 1, this.config.gridSize - 2, this.config.gridSize - 2);
            }
        });
    }

    drawSnakeEyes(x, y, theme) {
        const eyeSize = 3;
        const eyeOffset = 5;
        
        this.ctx.fillStyle = '#FFFFFF';
        
        let eye1X = x + eyeOffset;
        let eye1Y = y + eyeOffset;
        let eye2X = x + this.config.gridSize - eyeOffset - eyeSize;
        let eye2Y = y + eyeOffset;
        
        if (this.direction.x === -1) {
            eye1X = x + eyeOffset;
            eye1Y = y + eyeOffset;
            eye2X = x + eyeOffset;
            eye2Y = y + this.config.gridSize - eyeOffset - eyeSize;
        } else if (this.direction.y === 1) {
            eye1X = x + eyeOffset;
            eye1Y = y + this.config.gridSize - eyeOffset - eyeSize;
            eye2X = x + this.config.gridSize - eyeOffset - eyeSize;
            eye2Y = y + this.config.gridSize - eyeOffset - eyeSize;
        } else if (this.direction.y === -1) {
            eye1X = x + eyeOffset;
            eye1Y = y + eyeOffset;
            eye2X = x + this.config.gridSize - eyeOffset - eyeSize;
            eye2Y = y + eyeOffset;
        }
        
        this.ctx.fillRect(eye1X, eye1Y, eyeSize, eyeSize);
        this.ctx.fillRect(eye2X, eye2Y, eyeSize, eyeSize);
    }

    drawFood(theme) {
        const x = this.food.x * this.config.gridSize;
        const y = this.food.y * this.config.gridSize;
        
        this.ctx.fillStyle = theme.food.color;
        this.ctx.fillRect(x + 2, y + 2, this.config.gridSize - 4, this.config.gridSize - 4);
        
        this.ctx.strokeStyle = theme.food.border;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x + 2, y + 2, this.config.gridSize - 4, this.config.gridSize - 4);
    }

    drawGameStatus() {
        const theme = this.themeManager.getCurrentTheme();
        this.ctx.fillStyle = theme.ui.text;
        this.ctx.font = '14px Arial';
        
        if (this.gamePaused) {
            this.ctx.fillStyle = theme.ui.accent;
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Paused', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.fillStyle = theme.ui.text;
            this.ctx.font = '14px Arial';
            this.ctx.fillText('Press spacebar to continue', this.canvas.width / 2, this.canvas.height / 2 + 30);
        } else if (!this.gameRunning) {
            this.ctx.fillStyle = theme.ui.primary;
            this.ctx.font = 'bold 18px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Press Start button or Enter key to begin', this.canvas.width / 2, this.canvas.height / 2);
        }
        
        this.ctx.textAlign = 'left';
    }

    updateScoreDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('high-score').textContent = this.highScore;
    }

    updateConfigDisplay() {
        const difficulty = this.config.getDifficulty();
        const boardSize = this.config.getBoardSize();
        
        document.getElementById('difficulty-select').value = this.config.currentDifficulty;
        document.getElementById('board-size-select').value = this.config.currentBoardSize;
        document.getElementById('difficulty-desc').textContent = difficulty.description;
        document.getElementById('board-size-desc').textContent = boardSize.name;
    }

    updateButtonStates() {
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        
        if (!this.gameRunning) {
            startBtn.textContent = 'Start Game';
            pauseBtn.textContent = 'Pause';
        } else if (this.gamePaused) {
            startBtn.textContent = 'Start Game';
            pauseBtn.textContent = 'Resume';
        } else {
            startBtn.textContent = 'Playing...';
            pauseBtn.textContent = 'Pause';
        }
    }

    showGameOver() {
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-over-screen').classList.remove('hidden');
    }

    hideGameOver() {
        document.getElementById('game-over-screen').classList.add('hidden');
    }
}

// Export game class
window.AdvancedSnakeGame = AdvancedSnakeGame;