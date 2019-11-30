delay = 1;
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
	ai_state.path = fillIn(hamilton(maze_w, maze_h));
	while (!eq(ai_state.path[0], state.snake[0])) {
		ai_state.path.push(ai_state.path.shift());
	}
	ai_state.path.push(ai_state.path.shift());
}

function step() {
	var next = ai_state.path.shift();
	ai_state.path.push(next);
	return move(next.x - state.snake[0].x, next.y - state.snake[0].y);
}

function drawOverlay() {
	return;
	if (ai_state.path.length == 0) return;
	var c = document.getElementById('maze').getContext('2d');
	c.strokeStyle = 'gray';
	c.lineWidth = 2;
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

function drawHamil() {
	var p = hamilton(maze_w, maze_h);
	var c = document.getElementById('maze').getContext('2d');
	c.strokeStyle = 'gray';
	c.lineWidth = 2;
	c.beginPath();
	var start = p[0];
	var sc = center(start.x, start.y);
	c.moveTo(sc.x, sc.y);
	for (var i = 1; i < p.length; i++) {
		var next = p[i];
		var nc = center(next.x, next.y);
		c.lineTo(nc.x, nc.y);
	}
	c.closePath();
	c.stroke();
}

function hamilton(w, h) {
	var cut = Math.floor((h-1)/2);
	var p = [{x:0,y:0}];
	for (var i = 1; i < w - 2; i += 2) {
		p.push({x:i,y:0}, {x:i,y:cut}, {x:i+1,y:cut}, {x:i+1,y:0});
	}

	if (w % 2 == 0) {
		p.push({x:w-1,y:0}, {x:w-1,y:h-1});
	} else {
		for (var i = 0; i < h - 3; i += 2) {
			p.push({x:w-1,y:i}, {x:w-1,y:i+1}, {x:w-2,y:i+1}, {x:w-2,y:i+2});
		}
		p.push({x:w-1,y:h-2}, {x:w-1,y:h-1});
	}

	for (var i = w - 2 - w % 2; i > 1; i -= 2) {
		p.push({x:i,y:h-1}, {x:i,y:cut+1}, {x:i-1,y:cut+1}, {x:i-1,y:h-1});
	}
	p.push({x:0,y:h-1});
	return p;
}

function fillIn(p) {
	p.push(p[0]);
	for (var i = 0; i < p.length - 1; i++) {
		toSplice = [];
		var xsign = Math.sign(p[i+1].x - p[i].x);
		for (var j = p[i].x + xsign; j*xsign < p[i+1].x*xsign; j += xsign) {
			toSplice.push({x:j,y:p[i].y});
		}
		var ysign = Math.sign(p[i+1].y - p[i].y);
		for (var j = p[i].y + ysign; j*ysign < p[i+1].y*ysign; j += ysign) {
			toSplice.push({x:p[i].x,y:j});
		}
		var args = [i+1, 0].concat(toSplice);
		Array.prototype.splice.apply(p, args);
		i += toSplice.length;
	}
	p.pop();
	return p;
}