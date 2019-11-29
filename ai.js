delay = 50;
running = false;

ai_state = {
	path: []
};

async function runAi() {
	if (running) {
		return;
	}
	console.log('AI started.');
	running = true;
	init();
	while (step()) {
		await sleep(delay);
	}
	console.log('AI stopped.');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function init() {
	
}

function step() {
	if (ai_state.path.length == 0) {
		ai_state.path = aStar(state.snake[0], state.target);
		if (ai_state.path == null) return false;
		// remove start
		ai_state.path.shift();
	}
	var next = ai_state.path.shift();
	return move(next.x - state.snake[0].x, next.y - state.snake[0].y);
}

function drawOverlay() {
	if (ai_state.path.length == 0) return;
	var c = document.getElementById('maze').getContext('2d');
	c.strokeStyle = 'gray';
	c.lineWidth = 5;
	c.beginPath();
	var start = state.snake[0];
	var sc = center(start.x, start.y);
	c.moveTo(sc.x, sc.y);
	for (var i = 0; i < ai_state.path.length; i++) {
		var next = ai_state.path[i];
		var nc = center(next.x, next.y);
		c.lineTo(nc.x, nc.y);
	}
	c.stroke();
}

function aStar(start, goal) {
	var fringe = [];
	enqueue(fringe, start, 0);
	var gScore = new MapWithDefault([[k(start), 0]]);
	var fScore = new MapWithDefault([[k(start), heur(start, goal)]]);
	while (fringe.length > 0) {
		// var current = fringe.map(n => {n:n, s:(fScore.has(k(n)) ? fScore.get(k(n)) : Infinity)})
		// 					.reduce((acc, cur) => cur.s < acc.s ? cur : acc).n;
		var cur = fringe.shift().n;
		if (k(cur) == k(goal)) {
			return pathTo(cur);
		}
		var nbrs = neighbors(cur);
		for (var i = 0; i < nbrs.length; i++) {
			var n = nbrs[i];
			var tentative_g = gScore.get(k(cur)) + 1
			if (tentative_g < gScore.get(k(n))) {
				n.prev = cur;
				gScore.set(k(n), tentative_g);
				fScore.set(k(n), gScore.get(k(n)) + heur(n, goal));
				if (!isIn(fringe, n)) enqueue(fringe, n, fScore.get(k(n)));
			}
		}
	}
	return null;
}

function k(node) {
	return node.x + ',' + node.y;
}

function heur(start, goal) {
	return Math.abs(goal.x - start.x) + Math.abs(goal.y - start.y);
}

function pathTo(node) {
	var path = [node];
	while (typeof node.prev != 'undefined') {
		node = node.prev;
		path.unshift(node);
	}
	return path;
}

function enqueue(arr, node, score) {
	for (var i = 0; i < arr.length; i++) {
		if (score < arr[i].s) {
			arr.splice(i, 0, {n:node, s:score});
			return;
		}
	}
	arr.push({n:node, s:score});
}

function neighbors(n) {
	var ns = [];
	if (n.x > 0) ns.push({x:n.x-1, y:n.y});
	if (n.x < maze_w - 1) ns.push({x:n.x+1, y:n.y});
	if (n.y > 0) ns.push({x:n.x, y:n.y-1});
	if (n.y < maze_h - 1) ns.push({x:n.x, y:n.y+1});
	return ns.filter(n => state.board[n.x][n.y] != S_SNAKE);
}

function isIn(arr, node) {
	return arr.findIndex(n => n.x == node.x && n.y == node.y) >= 0;
}

class MapWithDefault extends Map {
	get(key) {
		return this.has(key) ? super.get(key) : Infinity;
	}
}