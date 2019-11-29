window.addEventListener("DOMContentLoaded", main);
window.addEventListener("keydown", process_input);

maze_w = 20;
maze_h = 10;
cell_size = 0;
state = {
	snake: [{x: 0, y: 0}],
	target: {x: 5, y: 5},
	board: [],
	to_grow: 0
};
changed = [];

const S_NOTHING = 0;
const S_SNAKE = 1;
const S_TARGET = 2;

function main(event) {
	initState();
	drawMaze();


	// markCell(1, 2);
	// state.board[1][2] = S_TARGET;
	// changed.push({x:1, y:2});
	// state.board[1][1] = S_SNAKE;
	// changed.push({x:1, y:1});
	// updateMaze();
}

function initState() {
	for (var i = 0; i < maze_w; i++) {
		state.board[i] = [];
		for (var j = 0; j < maze_h; j++) {
			state.board[i][j] = S_NOTHING;
		}
	}
	for (var i = 0; i < state.snake.length; i++) {
		var c = state.snake[i];
		state.board[c.x][c.y] = S_SNAKE;
	}
	state.board[state.target.x][state.target.y] = S_TARGET;
}

function drawMaze() {
	var w = window.innerWidth;
	var h = window.innerHeight;
	cell_size = Math.min(w/maze_w, h/maze_h);

	var maze = document.getElementById('maze');
	for (var i = 0; i < maze_h; i++) {
		var row = document.createElement('tr');
		row.classList.add('row');
		row.id = 'r' + i;
		maze.appendChild(row);
		for (var j = 0; j < maze_w; j++) {
			var cell = document.createElement('td');
			cell.setAttribute('width', cell_size);
			cell.setAttribute('height', cell_size);
			cell.classList.add('cell');
			cell.id = id(j, i);
			row.appendChild(cell);
			changed.push({x:j, y:i});
		}
	}
	updateMaze();
}

function updateMaze() {
	for (var i = 0; i < changed.length; i++) {
		var c = changed[i];
		var s = state.board[c.x][c.y];
		if (s == S_SNAKE) {
			markCell(c.x, c.y, 'green');
		} else if (s == S_TARGET) {
			markCell(c.x, c.y, 'red');
		} else {
			clearCell(c.x, c.y);
		}
	}
	changed = [];
}

function markCell(x, y, color) {
	var div = document.createElement('div');
	div.style.height = cell_size*.9 + 'px';
	div.style.width = cell_size*.9 + 'px';
	div.style['background-color'] = color;
	var c = cell(x, y);
	c.innerHTML = "";
	c.appendChild(div)
}

function clearCell(x, y) {
	cell(x, y).innerHTML = "";
}

function cell(x, y) {
	return document.getElementById(id(x, y));
}

function id(x, y) {
	return 'c' + x + '-' + y;
}

function process_input(e) {
  if (e.code === "ArrowUp")			move(0, -1);
  else if (e.code === "ArrowDown")	move(0, 1);
  else if (e.code === "ArrowRight")	move(1, 0);
  else if (e.code === "ArrowLeft")	move(-1, 0);
}

function move(dx, dy) {
	var head = state.snake[0];
	var newpos = {x:head.x + dx, y:head.y + dy};

	if (newpos.x < 0 || newpos.x >= maze_w || newpos.y < 0 || newpos.y >= maze_h) {
		console.log('Refusing to move off-grid.');
		return;
	}
	if (state.board[newpos.x][newpos.y] == S_SNAKE) {
		console.log('Refusing to move into tail.');
		return;	
	}

	if (state.board[newpos.x][newpos.y] == S_TARGET) {
		state.to_grow += 2;
		do {
			newtarget = {x:getRandomInt(0, maze_w), y:getRandomInt(0, maze_h)};
		} while (state.board[newtarget.x][newtarget.y] != S_NOTHING);
		state.board[newtarget.x][newtarget.y] = S_TARGET;
		changed.push(newtarget);
	}

	state.snake.unshift(newpos);
	if (state.to_grow > 0) {
		state.to_grow -= 1;
	} else {
		var old = state.snake.pop();
		state.board[old.x][old.y] = S_NOTHING;
		changed.push(old);
	}
	state.board[newpos.x][newpos.y] = S_SNAKE;
	changed.push(state.snake[0]);
	updateMaze();
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  //The maximum is exclusive and the minimum is inclusive
  return Math.floor(Math.random() * (max - min)) + min;
}