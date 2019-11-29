window.addEventListener("DOMContentLoaded", main);
window.addEventListener("keydown", process_input);

maze_w = 20;
maze_h = 11;
cell_size = 0;
state = {
	snake: [{x: 6, y: 5}, {x: 5, y: 5}, {x: 4, y: 5}],
	target: {x: 14, y: 5},
	board: [],
	to_grow: 0,
	game_over: false,
	score: 0
};
changed = [];

const S_NOTHING = 0;
const S_SNAKE = 1;
const S_TARGET = 2;

function main(event) {
	initState();
	drawMaze();
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
	var w = window.innerWidth * .95;
	var h = (window.innerHeight - 80) * .95;
	cell_size = Math.floor(Math.min(w/maze_w, h/maze_h));

	var maze = document.getElementById('maze');
	maze.width = cell_size * maze_w;
	maze.height = cell_size * maze_h;
	for (var i = 0; i < maze_h; i++) {
		for (var j = 0; j < maze_w; j++) {
			changed.push({x:j, y:i});
		}
	}
	updateMaze();
}

function updateMaze() {
	var maze = document.getElementById('maze');
	var ctx = maze.getContext('2d');
	ctx.clearRect(0, 0, maze.width, maze.height);
	var t = state.target;
	markCell(t.x, t.y, 'red');

	var head_dx = state.snake[0].x - state.snake[1].x;
	var head_dy = state.snake[0].y - state.snake[1].y;
	var tail_dx = state.snake[state.snake.length-2].x - state.snake[state.snake.length-1].x;
	var tail_dy = state.snake[state.snake.length-2].y - state.snake[state.snake.length-1].y;

	ctx.beginPath();
	if (state.game_over) {
		ctx.strokeStyle = 'orange';
	} else {
		ctx.strokeStyle = 'green';
	}
	ctx.lineWidth = cell_size * .8;
	var start = center(state.snake[0].x, state.snake[0].y);
	start = {
		x: start.x + cell_size * .4 * head_dx,
		y: start.y + cell_size * .4 * head_dy
	};
	ctx.moveTo(start.x, start.y);
	for (var i = 1; i < state.snake.length - 1; i++) {
		var next = center(state.snake[i].x, state.snake[i].y);
		ctx.lineTo(next.x, next.y);
	}
	var end = center(state.snake[state.snake.length-1].x, state.snake[state.snake.length-1].y);
	end = {
		x: end.x - cell_size * .4 * tail_dx,
		y: end.y - cell_size * .4 * tail_dy
	};
	ctx.lineTo(end.x, end.y);
	ctx.stroke();

	var score = document.getElementById('score');
	score.innerHTML = state.score;
}

function markCell(x, y, color) {
	var ctx = document.getElementById('maze').getContext('2d');
	ctx.fillStyle = color;
	ctx.fillRect(x * cell_size + cell_size * .25, y * cell_size + cell_size * .25, cell_size * .5, cell_size * .5);
}

function clearCell(x, y) {
	var c = document.getElementById('maze').getContext('2d');
	c.fillStyle = 'black';
	c.fillRect(x*cell_size, y*cell_size, cell_size, cell_size);
}

function center(x, y) {
	return {
		x: x * cell_size + cell_size * .5, 
		y: y * cell_size + cell_size * .5
	};
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
	if (Math.abs(dx) + Math.abs(dy) != 1) {
		console.log(`Refusing to move step (${dx},${dy}).`);
		return false;		
	}
	var head = state.snake[0];
	var newpos = {x:head.x + dx, y:head.y + dy};

	if (newpos.x < 0 || newpos.x >= maze_w || newpos.y < 0 || newpos.y >= maze_h) {
		console.log('Refusing to move off-grid.');
		return false;
	}
	if (state.board[newpos.x][newpos.y] == S_SNAKE) {
		console.log('Refusing to move into tail.');
		return false;
	}

	state.snake.unshift(newpos);
	if (state.to_grow > 0) {
		state.to_grow -= 1;
	} else {
		var old = state.snake.pop();
		state.board[old.x][old.y] = S_NOTHING;
		changed.push(old);
	}

	if (state.board[newpos.x][newpos.y] == S_TARGET) {
		state.to_grow += 2;
		state.score += 1;
		do {
			newtarget = {x:getRandomInt(0, maze_w), y:getRandomInt(0, maze_h)};
		} while (state.board[newtarget.x][newtarget.y] != S_NOTHING);
		state.board[newtarget.x][newtarget.y] = S_TARGET;
		state.target = newtarget;
		changed.push(newtarget);
	}

	state.board[newpos.x][newpos.y] = S_SNAKE;
	changed.push(state.snake[0]);

	checkGameOver();

	updateMaze();
	drawOverlay();
	return true;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  //The maximum is exclusive and the minimum is inclusive
  return Math.floor(Math.random() * (max - min)) + min;
}

function eq(a, b) {
	return a.x == b.x && a.y == b.y;
}

function checkGameOver() {
	var head = state.snake[0];
	var rightBlocked = head.x + 1 == maze_w || state.board[head.x + 1][head.y] == S_SNAKE;
	var leftBlocked = head.x  == 0 || state.board[head.x - 1][head.y] == S_SNAKE;
	var downBlocked = head.y + 1 == maze_h || state.board[head.x][head.y + 1] == S_SNAKE;
	var upBlocked = head.y  == 0 || state.board[head.x][head.y - 1] == S_SNAKE;
	state.game_over = rightBlocked && leftBlocked && downBlocked && upBlocked;
}