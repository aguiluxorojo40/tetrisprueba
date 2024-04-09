

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('tetris');
    const context = canvas.getContext('2d');
    context.scale(20, 20);

    let requestId;
    let level = 0;

    function createMatrix(w, h) {
        const matrix = [];
        while (h--) {
            matrix.push(new Array(w).fill(0));
        }
        return matrix;
    }

    function createPiece(type) {
        switch (type) {
            case 'T':
                return [
                    [0, 0, 0],
                    [1, 1, 1],
                    [0, 1, 0],
                ];
            case 'O':
                return [
                    [2, 2],
                    [2, 2],
                ];
            case 'L':
                return [
                    [0, 3, 0],
                    [0, 3, 0],
                    [0, 3, 3],
                ];
            case 'J':
                return [
                    [0, 4, 0],
                    [0, 4, 0],
                    [4, 4, 0],
                ];
            case 'I':
                return [
                    [0, 5, 0, 0],
                    [0, 5, 0, 0],
                    [0, 5, 0, 0],
                    [0, 5, 0, 0],
                ];
            case 'S':
                return [
                    [0, 6, 6],
                    [6, 6, 0],
                    [0, 0, 0],
                ];
            case 'Z':
                return [
                    [7, 7, 0],
                    [0, 7, 7],
                    [0, 0, 0],
                ];
        }
    }

    const colors = [
        null,
        '#FF0D72',
        '#0DC2FF',
        '#0DFF72',
        '#F538FF',
        '#FF8E0D',
        '#FFE138',
        '#3877FF',
    ];

    const arena = createMatrix(10, 20);

    const player = {
        pos: { x: 0, y: 0 },
        matrix: null,
        score: 0,
    };

    function drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    context.fillStyle = colors[value];
                    context.fillRect(x + offset.x, y + offset.y, 1, 1);
                }
            });
        });
    }

    function merge(arena, player) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    arena[y + player.pos.y][x + player.pos.x] = value;
                }
            });
         });
    }

    function rotate(matrix, dir) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
            }
        }
        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }

    function playerDrop() {
        player.pos.y++;
        if (collide(arena, player)) {
            player.pos.y--;
            merge(arena, player);
            playerReset();
            arenaSweep();
            updateScore();
        }
        dropCounter = 0;
    }

    function playerMove(dir) {
        player.pos.x += dir;
        if (collide(arena, player)) {
            player.pos.x -= dir;
        }
    }

    function playerReset() {
        const pieces = 'ILJOTSZ';
        player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
        player.pos.y = 0;
        player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    
        // Si la pieza no puede entrar en la arena, el juego se acaba
        if (collide(arena, player)) {
            arena.forEach(row => row.fill(0));
            player.score = 0;
            // Aquí puedes manejar el fin del juego, por ejemplo mostrando un mensaje y reiniciando el juego
        }
    }
    

        
    
    
    function update(time = 0) {
        const deltaTime = time - lastTime;
        lastTime = time;
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            playerDrop();
        }
        draw();
        requestAnimationFrame(update);
    }
    
    update();

    function playerRotate(dir) {
        const pos = player.pos.x;
        let offset = 1;
        rotate(player.matrix, dir);
        while (collide(arena, player)) {
            player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > player.matrix[0].length) {
                rotate(player.matrix, -dir);
                player.pos.x = pos;
                return;
            }
        }
    }

    function collide(arena, player) {
        const [m, o] = [player.matrix, player.pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                    (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    function arenaSweep() {t
        let rowCount = 1;
        outer: for (let y = arena.length - 1; y > 0; --y) {
            for (let x = 0; x < arena[y].length; ++x) {
                if (arena[y][x] === 0) {
                    continue outer;
                }
            }

            const row = arena.splice(y, 1)[0].fill(0);
            arena.unshift(row);
            ++y;

            player.score += rowCount * 10;
            rowCount *= 2;
            updateLevel();
        }
    }

    function updateScore() {
        document.getElementById('score').innerText = `Score: ${player.score}`;
    }

    function draw() {
        context.fillStyle = '#000';
        context.fillRect(0, 0, canvas.width, canvas.height);

        drawMatrix(arena, { x: 0, y: 0 });
        drawMatrix(player.matrix, player.pos);
    }

    let lastTime = 0;
    let dropCounter = 0;
    let dropInterval = 1000;

    function update(time = 0) {
        const deltaTime = time - lastTime;
        lastTime = time;

        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            playerDrop();
        }

        draw();
        requestId = requestAnimationFrame(update);
        updateLevel();
    }

    function updateLevel() {
        level = Math.floor(player.score / 100);
        dropInterval = 1000 - (level * 100);
    }

    function updateHighScore() {
        const highScore = parseInt(localStorage.getItem('tetrisHighScore')) || 0;
        if (player.score > highScore) {
            localStorage.setItem('tetrisHighScore', player.score);
            document.getElementById('highScore').innerText = `High Score: ${player.score}`;
        }
    }

    function gameOver() {
        cancelAnimationFrame(requestId); // Detiene el bucle del juego
        context.fillStyle = 'black';
        context.fillRect(1, 3, 8, 1.2);
        context.font = '1px Arial';
        context.fillStyle = 'red';
        context.fillText('GAME OVER', 1.5, 4);
        updateHighScore(); // Actualiza la puntuación máxima al final del juego
    }

    document.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') {
            playerMove(-1);
        } else if (event.key === 'ArrowRight') {
            playerMove(1);
        } else if (event.key === 'ArrowDown') {
            playerDrop();
        } else if (event.key === 'q') {
            playerRotate(-1);
        } else if (event.key === 'w') {
            playerRotate(1);
        }
    });

    document.getElementById('leftButton').addEventListener('click', () => playerMove(-1));
    document.getElementById('rightButton').addEventListener('click', () => playerMove(1));
    document.getElementById('downButton').addEventListener('click', () => playerDrop());
    document.getElementById('rotateLeftButton').addEventListener('click', () => playerRotate(-1));
    document.getElementById('rotateRightButton').addEventListener('click', () => playerRotate(1));

    playerReset();
    updateScore();
    initGame();
});
