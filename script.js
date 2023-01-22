//
const GAMEBOARD_CELLS_X = 7;	// 7 columns
const GAMEBOARD_CELLS_Y = 6;	// 6 rows
const WIN_CONNECTIONS = 4;

const gameState = {};

//
initGameState(gameState);

buildGameboard();
initDropZoneListeners();

//=======================================================================

//
function initGameState(gs) {
	gs.grid = new Array(GAMEBOARD_CELLS_X);
	for (let col = 0; col < GAMEBOARD_CELLS_X; ++col) {
		gs.grid[col] = new Array(GAMEBOARD_CELLS_Y).fill(0);
	}
	// console.log(gs.grid);

	gs.isPlayer1Turn = true;
	gs.isPlaying = true;
}

//
function buildGameboard() {
	// dropzone row
	{
		let html = '';
		for (let col = 0; col < GAMEBOARD_CELLS_X; ++col) {
			html += `<div class="grid-cell dropper" data-col="${col}"></div>`;
		}

		document.getElementById('gameboard-dropzone').innerHTML = `<div class="grid-row">${html}</div>`
	}

	// main grid
	{
		let outerHtml = '';
		for (let row = 0; row < GAMEBOARD_CELLS_Y; ++row) {
			let html = '';
			for (let col = 0; col < GAMEBOARD_CELLS_X; ++col) {
				html += `<div class="grid-cell marker" data-row="${row}" data-col="${col}"></div>`;
			}
			
			outerHtml += `<div class="grid-row">${html}</div>`;
		}

		document.getElementById('gameboard-grid').innerHTML = outerHtml;
	}
}

//
function initDropZoneListeners() {
	document.querySelectorAll('.dropper')
		.forEach((e) => {
			//
			e.addEventListener('mouseover', (ev) => {
				const col = ev.target.dataset.col;
				if (gameState.isPlaying && !gameState.grid[col][0]) {
					markDropZone(col, gameState.isPlayer1Turn);
				}
				else {
					// unable to play this column
				}
			});

			//
			e.addEventListener('mouseout', (ev) => {
				markDropZone(-1);
			});

			//
			e.addEventListener('click', (ev) => {
				const col = ev.target.dataset.col;
				// console.log(gameState.grid[col]);
				if (gameState.isPlaying && !gameState.grid[col][0]) {
					dropToken(col, gameState.isPlayer1Turn);
					markDropZone(col, gameState.isPlayer1Turn);

					const winData = checkWinner();
					if (winData) {
						showWinner(winData);
						endGame();
					}
				}
				else {
					// unable to play here
				}
			});
		});
}

//
function markDropZone(col, isPlayer1 = true) {
	document.querySelectorAll('.dropper')
		.forEach((e) => {
			e.classList.remove('marker-1', 'marker-2');
			if ((+e.dataset.col == +col) && !gameState.grid[col][0]) {
				e.classList.add(isPlayer1 ? 'marker-1' : 'marker-2');
			}
		});
}

//
function dropToken(col, isPlayer1) {
	// update board in the game state
	const gridCol = gameState.grid[col];

	let row;
	for (row = 0; row < GAMEBOARD_CELLS_Y; ++row) {
		if (gridCol[row] > 0) break;
	}

	--row;	// loop above finds the first spot taken, so bump it up one row
	gridCol[row] = isPlayer1 ? 1 : 2;
	
	// update the UI (temp; just splat it in)
	const marker = document.querySelector(`.marker[data-row="${row}"][data-col="${col}"]`);
	if (marker) {
		marker.classList.add(isPlayer1 ? 'marker-1' : 'marker-2');
	}

	// swap players in the game state
	gameState.isPlayer1Turn = !gameState.isPlayer1Turn;
}

//  returns winner (1 = player 1, 2 = player 2, 0 = none)
function checkWinner() {
	const grid = gameState.grid;

	function groupCheck(rs, re, cs, ce, ri, ci) {
		for (let r = rs; r <= re; ++r) {
			for (let c = cs; c <= ce; ++c) {
				const mark = grid[c][r];
				if (mark) {
					let i = 0;
					let cc = c;
					let rr = r;
					for (; i < WIN_CONNECTIONS; ++i, cc += ci, rr += ri ) {
						if (grid[cc][rr] != mark) break;
					}

					if (i == WIN_CONNECTIONS) {
						return { mark, r, c, ri, ci };
					}
				}
			}
		}
		return null;
	}
	// check horizontal, r=[0,5] c=[0,3], ri=0 ci=1
	{
		const win = groupCheck(0, 5, 0, 3, 0, 1);
		if (win) return win;
	}

	// check vertical, r=[0,2] c=[0,6], ri=1 ci=0
	{
		const win = groupCheck(0, 2, 0, 6, 1, 0);
		if (win) return win;
	}

	// check diagonal, ul to br, r=[0,2] c=[0,3], ri=1 ci=1
	{
		const win = groupCheck(0, 2, 0, 3, 1, 1);
		if (win) return win;
	}

	// check diagonal, ur to bl, r=[0,2] c=[3,6], ri=1 ci=-1
	{
		const win = groupCheck(0, 2, 3, 6, 1, -1);
		if (win) return win;
	}

	return null;
}

//
function showWinner(winData) {
	let { r, c } = winData;
	const { ri, ci } = winData;
	for (let i = 0; i < WIN_CONNECTIONS; ++i, r += ri, c += ci) {
		const marker = document.querySelector(`.marker[data-row="${r}"][data-col="${c}"]`);
		if (marker) {
			marker.classList.add('winner');
		}
	}
}

//
function endGame(winData) {
	gameState.isPlaying = false;
	markDropZone(-1);
}
