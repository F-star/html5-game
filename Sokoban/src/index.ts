
class Point {
  constructor(public x: number, public y: number) {}
  add(point: Point) {
    return new Point(
      point.x + this.x,
      point.y + this.y
    )
  }
}
/**
 * 箱子类
 */
class Boxes {
  constructor(boxes: Point[]) {}
}
/**
 * 游戏类
 */
class Game {
  private el = document.createElement('canvas');
  private ctx = this.el.getContext('2d') 
  private walls: Point[] = [];
  private tiles: Point[] = [];
  private goals: Point[] = [];
  private boxes: Point[] = [];
  private player: Point = new Point(0, 0);

  constructor(private width: number, private height: number, private grid_width: number) {
    this.el.width = width * grid_width ;
    this.el.height = height * grid_width;
  }
  setWalls(points: Point[]) { this.walls = points }
  setTiles(points: Point[]) { this.tiles = points }
  setGoals(points: Point[]) { this.goals = points }
  setBoxes(points: Point[]) { this.boxes = points }
  setPlayer(point: Point) { this.player = point }
  mounted(selector: string) {
    const parentEl = document.querySelector(selector);
    if (parentEl === null) throw new Error('挂载的元素不存在');
    parentEl.appendChild(this.el);
  }
  move(dir: string) {
    // 获取方向向量
    dir = dir.toLowerCase();
    let dirVector: Point;
    if (dir === 'left') dirVector = new Point(-1, 0);
    else if (dir === 'right') dirVector = new Point(1, 0);
    else if (dir === 'up') dirVector = new Point(0, -1);
    else if (dir === 'down') dirVector = new Point(0, 1);
    else {
      throw new Error('方向字符串不合法')
    }
    const forwardPlayer = this.player.add(dirVector);
    // 1. 玩家前面是否有墙
    let forwardIsWall = this.walls.some(item => item.x === forwardPlayer.x && item.y === forwardPlayer.y);
    if (forwardIsWall) return;
    // 2. 玩家的前进方向是否有箱子。
    let boxIndex: number; 
    boxIndex = this.boxes.findIndex(item => item.x === forwardPlayer.x && item.y === forwardPlayer.y);
    if (boxIndex === -1) {
      this.player = forwardPlayer;
      return;
    }
    // 3. 玩家前面的箱子的前面，是否有箱子或者墙。
    const forwardBox = this.boxes[boxIndex].add(dirVector);
    forwardIsWall = this.walls.some(item => item.x === forwardBox.x && item.y === forwardBox.y);
    console.log('forwardIsWall', forwardIsWall)
    if (forwardIsWall) return;
    const forwardIsBox = this.boxes.some(item => item.x === forwardBox.x && item.y === forwardBox.y);
    if (forwardIsBox) return;

    this.player = forwardPlayer;
    this.boxes[boxIndex] = forwardBox;
  }
  checkSucess() {
    const isSucess = this.goals.every(goal => {
      const isMatch = this.boxes.some(box => box.x === goal.x && box.y === goal.y);
      return isMatch;
    })
    return isSucess;
  }
  pause() {
    // TODO:
  }
  renderPoints(points: Point[], color: string) {
    const ctx = this.ctx as CanvasRenderingContext2D;
    const grid_w = this.grid_width
    ctx.save();
    ctx.fillStyle = color;
    points.forEach(pt => {
      ctx.fillRect(pt.x * grid_w, pt.y * grid_w, grid_w, grid_w);
    })
    ctx.restore();
  }
  renderPointsToStroke(points: Point[], color: string) {
    const ctx = this.ctx as CanvasRenderingContext2D;
    const grid_w = this.grid_width
    ctx.save();
    ctx.fillStyle = color;
    points.forEach(pt => {
      ctx.strokeRect(pt.x * grid_w, pt.y * grid_w, grid_w, grid_w);
    })
    ctx.restore();
  }
  render() {
    const ctx = this.ctx;
    const grid_w = this.grid_width
    if (ctx === null) {
      throw new Error('canvas 上下文获取失败。')
    }
    
    // 绘制不同元素
    this.renderPoints(this.walls, '#94691d');
    this.renderPoints(this.tiles, 'green');
    this.renderPointsToStroke(this.goals, 'red');
    this.renderPoints(this.boxes, 'blue');
    this.renderPoints([ this.player ], 'black');
  }
}

// 解析地图字符串，生成多个点集
function resolveMap(mapStr: string, width: number, height: number) {
  const map: {[propName: string]: string} = {
    '.': 'empty',
    0: 'tile',
    1: 'wall',
    2: 'goal',
    3: 'box',
    P: 'player'
  }

  mapStr = mapStr.replace(/\s+/g, '')
  const walls: Point[] = [];
  const tiles: Point[] = [];
  const boxes: Point[] = [];
  const goals: Point[] = [];
  let player: Point | null = null;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const id = mapStr[y * width + x];
      const item = map[id];
      if (item === 'empty') continue;

      const point = new Point(x, y);
      if (item === 'wall') walls.push(point); // 墙
      else tiles.push(new Point(x, y)); // 砖。除了空白格、墙，都认为是砖，因为砖和箱子、目标、玩家重合了。

      if (item === 'goal') goals.push(new Point(x, y));
      else if (item === 'box') boxes.push(new Point(x, y));
      else if (item === 'player') player = point;
    }
  }
  return {
    walls, tiles, boxes, goals, player
  }
}

const gameMap = `
.111111111
100000P001
1000000001
1111020301
...111111.
`;
const width = 10;
const height = 5;
const data = resolveMap(gameMap, width, height);
console.log(data)
const grid_width = 20;
const game = new Game(width, height, grid_width);
game.setWalls(data.walls);
game.setTiles(data.tiles);
game.setGoals(data.goals);
game.setBoxes(data.boxes);
game.setPlayer(data.player as Point);

game.mounted('#game');
game.render();


// game.initMapInfo(gameMap, width, height);
// game.set

// 箱子有两种状态。
// 玩家也会有 4 种朝向。
let end = false;
document.body.addEventListener('keydown', function(e) {
  if (end) return;
  const eventKey = e.key;
  let dir: string = '';
  if (eventKey === 'ArrowLeft') dir = 'left';
  else if (eventKey === 'ArrowRight') dir = 'right'; 
  else if (eventKey === 'ArrowUp') dir = 'up'; 
  else if (eventKey === 'ArrowDown') dir = 'down';
  else return;
  
  game.move(dir);
  game.render();
  if (game.checkSucess()) {
    // 结束了。
    console.log('Game Clear！')
    end = true;
  }
})

