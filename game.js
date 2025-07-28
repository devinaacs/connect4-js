class Connect4 {
    constructor() {
        this.ROWS = 6;
        this.COLS = 7;
        this.DIRECTIONS = [[0, 1], [1, 0], [1, 1], [1, -1]];
        this.PLAYERS = { HUMAN: 'red', COMPUTER: 'yellow' };
        
        this.init();
        this.bindEvents();
    }

    init() {
        this.board = Array(this.ROWS).fill().map(() => Array(this.COLS).fill(null));
        this.currentPlayer = this.PLAYERS.HUMAN;
        this.gameOver = false;
        this.winningCells = [];
        this.isComputerTurn = false;
        
        this.render();
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '7') {
                this.handleMove(parseInt(e.key) - 1);
            } else if (e.key.toLowerCase() === 'r') {
                this.reset();
            }
        });
    }

    render() {
        this.renderBoard();
        this.updateStatus();
    }

    renderBoard() {
        const boardElement = document.getElementById('gameBoard');
        boardElement.innerHTML = '';

        for (let row = 0; row < this.ROWS; row++) {
            const rowElement = this.createRow(row);
            boardElement.appendChild(rowElement);
        }
    }

    createRow(row) {
        const rowElement = document.createElement('div');
        rowElement.className = 'row';
        
        for (let col = 0; col < this.COLS; col++) {
            const cell = this.createCell(row, col);
            rowElement.appendChild(cell);
        }
        
        return rowElement;
    }

    createCell(row, col) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = row;
        cell.dataset.col = col;
        
        const cellValue = this.board[row][col];
        if (cellValue) {
            cell.classList.add(cellValue);
        }

        if (this.isWinningCell(row, col)) {
            cell.classList.add('winning');
        }

        cell.addEventListener('click', () => this.handleMove(col));
        return cell;
    }

    isWinningCell(row, col) {
        return this.winningCells.some(([r, c]) => r === row && c === col);
    }

    handleMove(col) {
        if (this.gameOver || this.isComputerTurn) return;

        const row = this.getLowestEmptyRow(col);
        if (row === -1) return;

        this.makeMove(row, col);
    }

    makeMove(row, col) {
        this.board[row][col] = this.currentPlayer;
        
        if (this.checkWin(row, col)) {
            this.endGame(true);
        } else if (this.isBoardFull()) {
            this.endGame(false);
        } else {
            this.switchPlayer();
            if (this.isComputerTurn) {
                setTimeout(() => this.makeComputerMove(), 800);
            }
        }

        this.render();
    }

    endGame(hasWinner) {
        this.gameOver = true;
        this.isComputerTurn = false;
        
        if (hasWinner) {
            this.highlightWinningCells();
            confetti.celebrate();
        }
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === this.PLAYERS.HUMAN ? this.PLAYERS.COMPUTER : this.PLAYERS.HUMAN;
        this.isComputerTurn = this.currentPlayer === this.PLAYERS.COMPUTER;
    }

    makeComputerMove() {
        if (this.gameOver) return;

        const bestCol = this.getBestMove();
        const row = this.getLowestEmptyRow(bestCol);
        
        if (row !== -1) {
            this.makeMove(row, bestCol);
        }
    }

    getBestMove() {
        return this.getWinningMove() ?? this.getBlockingMove() ?? this.getStrategicMove() ?? this.getRandomMove();
    }

    getWinningMove() {
        return this.findMove(this.PLAYERS.COMPUTER);
    }

    getBlockingMove() {
        return this.findMove(this.PLAYERS.HUMAN);
    }

    findMove(player) {
        for (let col = 0; col < this.COLS; col++) {
            const row = this.getLowestEmptyRow(col);
            if (row !== -1) {
                this.board[row][col] = player;
                const isWin = this.checkWin(row, col);
                this.board[row][col] = null;
                
                if (isWin) return col;
            }
        }
        return null;
    }

    getStrategicMove() {
        const centerCols = [3, 2, 4, 1, 5, 0, 6];
        const validMoves = centerCols.filter(col => this.getLowestEmptyRow(col) !== -1);
        return validMoves.length > 0 ? validMoves[Math.floor(Math.random() * validMoves.length)] : null;
    }

    getRandomMove() {
        const validMoves = [];
        for (let col = 0; col < this.COLS; col++) {
            if (this.getLowestEmptyRow(col) !== -1) {
                validMoves.push(col);
            }
        }
        return validMoves[Math.floor(Math.random() * validMoves.length)];
    }

    getLowestEmptyRow(col) {
        for (let row = this.ROWS - 1; row >= 0; row--) {
            if (!this.board[row][col]) {
                return row;
            }
        }
        return -1;
    }

    checkWin(row, col) {
        for (const [dRow, dCol] of this.DIRECTIONS) {
            const winCells = this.getConnectedCells(row, col, dRow, dCol);
            if (winCells.length >= 4) {
                this.winningCells = winCells;
                return true;
            }
        }
        return false;
    }

    getConnectedCells(row, col, dRow, dCol) {
        const cells = [[row, col]];
        const player = this.currentPlayer;

        const addCells = (r, c, deltaR, deltaC) => {
            let newR = r + deltaR;
            let newC = c + deltaC;
            
            while (this.isValidPosition(newR, newC) && this.board[newR][newC] === player) {
                cells.push([newR, newC]);
                newR += deltaR;
                newC += deltaC;
            }
        };

        addCells(row, col, dRow, dCol);
        addCells(row, col, -dRow, -dCol);

        return cells;
    }

    isValidPosition(row, col) {
        return row >= 0 && row < this.ROWS && col >= 0 && col < this.COLS;
    }

    isBoardFull() {
        return this.board[0].every(cell => cell !== null);
    }

    highlightWinningCells() {
    }

    updateStatus() {
        const statusElement = document.getElementById('gameStatus');
        statusElement.className = 'status';
        
        if (this.gameOver) {
            this.showGameResult(statusElement);
        } else {
            this.showCurrentTurn(statusElement);
        }
    }

    showGameResult(element) {
        element.classList.add('winner');
        
        if (this.winningCells.length > 0) {
            const winner = this.board[this.winningCells[0][0]][this.winningCells[0][1]];
            if (winner === this.PLAYERS.HUMAN) {
                element.textContent = 'You win! 🎉';
                element.classList.add('red');
            } else {
                element.textContent = 'Computer wins! 🤖';
                element.classList.add('yellow');
            }
        } else {
            element.textContent = "It's a draw! 🤝";
            element.classList.add('draw');
        }
    }

    showCurrentTurn(element) {
        if (this.currentPlayer === this.PLAYERS.HUMAN) {
            element.textContent = 'Your turn';
            element.style.color = '#c0392b';
        } else {
            element.textContent = 'Computer thinking...';
            element.style.color = '#d68910';
        }
    }

    reset() {
        this.init();
    }
}

const game = new Connect4();