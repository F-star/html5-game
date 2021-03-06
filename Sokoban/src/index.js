"use strict";
class Point {
    constructor(x, y) {
        if (typeof x === 'number' && typeof y === 'number') {
            this.x = x;
            this.y = y;
        }
        else if (typeof x === 'string') {
            [this.x, this.y] = {
                left: [-1, 0],
                right: [1, 0],
                up: [0, -1],
                down: [0, 1]
            }[x];
        }
        else {
            throw new Error('传入的参数类型和数量错误');
        }
    }
    add(point) {
        return new Point(point.x + this.x, point.y + this.y);
    }
    reverse() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }
    clone() {
        return new Point(this.x, this.y);
    }
}
/**
 * 游戏类
 */
class Game {
    constructor(width, height, grid_width) {
        this.width = width;
        this.height = height;
        this.grid_width = grid_width;
        this.el = document.createElement('canvas');
        this.ctx = this.el.getContext('2d');
        this.history = [];
        this.step = 0;
        this.walls = [];
        this.tiles = [];
        this.goals = [];
        this.boxes = [];
        this.player = new Point(0, 0);
        this.el.width = width * grid_width;
        this.el.height = height * grid_width;
    }
    setWalls(points) { this.walls = points; }
    setTiles(points) { this.tiles = points; }
    setGoals(points) { this.goals = points; }
    setBoxes(points) { this.boxes = points; }
    setPlayer(point) { this.player = point; }
    mounted(selector) {
        const parentEl = document.querySelector(selector);
        if (parentEl === null)
            throw new Error('挂载的元素不存在');
        parentEl.appendChild(this.el);
    }
    move(dir) {
        // 获取方向向量
        dir = dir.toLowerCase();
        const dirVector = new Point(dir); // TODO:  看看是否有优化空间（。。检验太严格貌似也不太好？）
        const forwardPlayer = this.player.add(dirVector);
        // 1. 玩家前面是否有墙
        let forwardIsWall = this.walls.some(item => item.x === forwardPlayer.x && item.y === forwardPlayer.y);
        if (forwardIsWall)
            return;
        // 2. 玩家的前进方向是否有箱子。
        let boxIndex;
        boxIndex = this.boxes.findIndex(item => item.x === forwardPlayer.x && item.y === forwardPlayer.y);
        if (boxIndex === -1) {
            this.player = forwardPlayer;
            this.step++;
            this.history.push(dirVector);
            return;
        }
        // 3. 玩家前面的箱子的前面，是否有箱子或者墙。
        const forwardBox = this.boxes[boxIndex].add(dirVector);
        forwardIsWall = this.walls.some(item => item.x === forwardBox.x && item.y === forwardBox.y);
        if (forwardIsWall)
            return;
        const forwardIsBox = this.boxes.some(item => item.x === forwardBox.x && item.y === forwardBox.y);
        if (forwardIsBox)
            return;
        this.player = forwardPlayer;
        this.boxes[boxIndex] = forwardBox;
        this.history.push(dirVector);
        this.step++;
    }
    redo() {
        if (this.history.length === 0)
            return false;
        this.step--;
        const dir = this.history.pop();
        // 是否需要复原箱子，如果要，找出并复原
        const movedBox = this.player.add(dir);
        const movedBoxIndex = this.boxes.findIndex(item => item.x === movedBox.x && item.y === movedBox.y);
        if (movedBoxIndex !== -1) {
            this.boxes[movedBoxIndex] = this.player.clone();
        }
        // 玩家复位
        this.player = this.player.add(dir.reverse());
        return true;
    }
    getStep() {
        // return this.step;
        return this.history.length;
    }
    checkSucess() {
        const isSucess = this.goals.every(goal => {
            const isMatch = this.boxes.some(box => box.x === goal.x && box.y === goal.y);
            return isMatch;
        });
        return isSucess;
    }
    renderPoints(points, color, offset = 0) {
        const ctx = this.ctx;
        let grid_w = this.grid_width;
        ctx.save();
        ctx.fillStyle = color;
        points.forEach(pt => {
            ctx.fillRect(pt.x * grid_w + offset, pt.y * grid_w + offset, grid_w - offset * 2, grid_w - offset * 2);
        });
        ctx.restore();
    }
    renderPointsToStroke(points, color, offset = 0) {
        const ctx = this.ctx;
        const grid_w = this.grid_width;
        ctx.save();
        ctx.strokeStyle = color;
        points.forEach(pt => {
            ctx.strokeRect(pt.x * grid_w + offset, pt.y * grid_w + offset, grid_w - offset * 2, grid_w - offset * 2);
        });
        ctx.restore();
    }
    render() {
        const ctx = this.ctx;
        const grid_w = this.grid_width;
        if (ctx === null)
            throw new Error('canvas 上下文获取失败。');
        // 绘制不同元素
        this.renderPoints(this.walls, '#db585b');
        this.renderPoints(this.tiles, '#75726e');
        this.renderPoints(this.boxes, '#cc9727', 1);
        this.renderPointsToStroke(this.goals, '#c8d8dc', 8);
        this.renderPoints([this.player], 'black');
    }
}
// 解析地图字符串，生成多个点集
function resolveMap(mapStr, width, height) {
    const map = {
        '.': 'empty',
        0: 'tile',
        1: 'wall',
        x: 'goal',
        b: 'box',
        p: 'player'
    };
    mapStr = mapStr.replace(/\s+/g, '');
    const walls = [];
    const tiles = [];
    const boxes = [];
    const goals = [];
    let player = null;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const id = mapStr[y * width + x];
            const item = map[id];
            if (item === 'empty')
                continue;
            const point = new Point(x, y);
            if (item === 'wall')
                walls.push(point); // 墙
            else
                tiles.push(new Point(x, y)); // 砖。除了空白格、墙，都认为是砖，因为砖和箱子、目标、玩家重合了。
            if (item === 'goal')
                goals.push(new Point(x, y));
            else if (item === 'box')
                boxes.push(new Point(x, y));
            else if (item === 'player')
                player = point;
        }
    }
    return {
        walls, tiles, boxes, goals, player
    };
}
const gameMap = `
..1111.
111001.
100xb11
1000bp1
101x001
1000001
1111111
`;
const width = 7;
const height = 7;
const grid_width = 40;
const data = resolveMap(gameMap, width, height);
console.log(data);
const game = new Game(width, height, grid_width);
game.setWalls(data.walls);
game.setTiles(data.tiles);
game.setGoals(data.goals);
game.setBoxes(data.boxes);
game.setPlayer(data.player);
game.mounted('#game');
game.render();
let end = false;
const stepCountElement = document.getElementById('count');
document.body.addEventListener('keydown', function (e) {
    if (end)
        return;
    const eventKey = e.key;
    let dir = '';
    if (eventKey === 'ArrowLeft')
        dir = 'left';
    else if (eventKey === 'ArrowRight')
        dir = 'right';
    else if (eventKey === 'ArrowUp')
        dir = 'up';
    else if (eventKey === 'ArrowDown')
        dir = 'down';
    else
        return;
    game.move(dir);
    game.render();
    stepCountElement.innerText = '' + game.getStep();
    if (game.checkSucess()) {
        // 结束
        console.log('Game Clear！');
        document.getElementById('win-tip').innerText = 'WIN';
        end = true;
    }
});
const redoBtn = document.getElementById('redo-btn');
redoBtn.onclick = function () {
    const canRedo = game.redo();
    if (!canRedo) {
        console.log('到底了，无法继续回退');
        return;
    }
    game.render();
    stepCountElement.innerText = '' + game.getStep();
};
