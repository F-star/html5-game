"use strict";
var Point = /** @class */ (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
}());
/**
 * 游戏类
 */
var Game = /** @class */ (function () {
    function Game(width, height, grid_width) {
        this.width = width;
        this.height = height;
        this.grid_width = grid_width;
        this.el = document.createElement('canvas');
        this.ctx = this.el.getContext('2d');
        this.walls = [];
        this.tiles = [];
        this.goals = [];
        this.boxes = [];
        this.player = new Point(0, 0);
        this.el.width = width * grid_width;
        this.el.height = height * grid_width;
    }
    Game.prototype.setWalls = function (points) { this.walls = points; };
    Game.prototype.setTiles = function (points) { this.tiles = points; };
    Game.prototype.setGoals = function (points) { this.goals = points; };
    Game.prototype.setBoxes = function (points) { this.boxes = points; };
    Game.prototype.setPlayer = function (point) { this.player = point; };
    Game.prototype.mounted = function (selector) {
        var parentEl = document.querySelector(selector);
        if (parentEl === null)
            throw new Error('挂载的元素不存在');
        parentEl.appendChild(this.el);
    };
    Game.prototype.move = function (dir) {
        // 玩家移动。
        // 1. 判断前进方向格子，（1）是否为箱子（2）是否为墙壁。
        dir = dir.toLowerCase();
        if (dir === 'left')
            this.player.x--;
        else if (dir === 'right')
            this.player.x++;
        else if (dir === 'up')
            this.player.y--;
        else if (dir === 'down')
            this.player.y++;
    };
    Game.prototype.renderPoints = function (points, color) {
        var ctx = this.ctx;
        var grid_w = this.grid_width;
        ctx.save();
        ctx.fillStyle = color;
        points.forEach(function (pt) {
            ctx.fillRect(pt.x * grid_w, pt.y * grid_w, grid_w, grid_w);
        });
        ctx.restore();
    };
    Game.prototype.render = function () {
        var ctx = this.ctx;
        var grid_w = this.grid_width;
        if (ctx === null) {
            throw new Error('canvas 上下文获取失败。');
        }
        // 绘制不同元素
        this.renderPoints(this.walls, '#94691d');
        this.renderPoints(this.tiles, 'green');
        this.renderPoints(this.goals, 'red');
        this.renderPoints(this.boxes, 'blue');
        this.renderPoints([this.player], 'black');
    };
    return Game;
}());
// 解析地图字符串，生成多个点集
function resolveMap(mapStr, width, height) {
    var map = {
        '.': 'empty',
        0: 'tile',
        1: 'wall',
        2: 'goal',
        3: 'box',
        P: 'player'
    };
    mapStr = mapStr.replace(/\s+/g, '');
    var walls = [];
    var tiles = [];
    var boxes = [];
    var goals = [];
    var player = null;
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            var id = mapStr[y * width + x];
            var item = map[id];
            if (item === 'empty')
                continue;
            var point = new Point(x, y);
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
        walls: walls, tiles: tiles, boxes: boxes, goals: goals, player: player
    };
}
var gameMap = "\n.111111111\n100000P001\n1000000001\n1111020301\n...111111.\n";
var width = 10;
var height = 5;
var data = resolveMap(gameMap, width, height);
console.log(data);
var grid_width = 20;
var game = new Game(width, height, grid_width);
game.setWalls(data.walls);
game.setTiles(data.tiles);
game.setGoals(data.goals);
game.setBoxes(data.boxes);
game.setPlayer(data.player);
game.mounted('#game');
game.render();
// game.initMapInfo(gameMap, width, height);
// game.set
// 箱子有两种状态。
// 玩家也会有 4 种朝向。
document.body.addEventListener('keydown', function (e) {
    console.log('移动');
    var eventKey = e.key;
    var dir = '';
    if (eventKey === 'ArrowLeft')
        dir = 'left';
    else if (eventKey === 'ArrowRight')
        dir = 'right';
    else if (eventKey === 'ArrowUp')
        dir = 'up';
    else if (eventKey === 'ArrowDown')
        dir = 'down';
    if (dir === undefined)
        return;
    game.move(dir);
    game.render();
});
