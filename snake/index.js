
/* class Container {
  constructor(selector, width, height) {
    this.el = document.querySelector(selector);
    this.layers = [];
  }
} */

//层
class Layer {
  constructor(width, height) {
    this.el = document.createElement('canvas');
    this.ctx = this.el.getContext('2d');
    this.snake = undefined;
    this.size(width, height);
  }
  width(val) {
    if (val == undefined) {
      const width = this.el.width;
      return width;
    }
    this.el.width = val;
  }
  height(val) {
    if (val == undefined) {
      const height = this.el.height;
      return height;
    }
    this.el.height = val;
  }
  size(width, height) {
    this.width(width);
    this.height(height);
  }
  addSnake(snake) {
    this.snake = snake;
  }
  clear() {
    this.ctx.clearRect(0, 0, this.width(), this.height());
  }
  start() {
    // 
    this.update();
  }
  update() {
    window.requestAnimationFrame(dt => {
      // dt 为当前帧和上一帧的时间差。单位为 秒/帧，fps = 1/dt
      console.log('触发')
      this.clear();
      snake.update();
      snake.draw(this.ctx);
      this.update();
    });
  }
}

// 向量
class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  dotProduct(vector) {
    return this.x * vector.x + this.y * vector.y;
  }
}

// 贪吃蛇
class Snake {
  constructor(grid_w, points, dirStr, row, col) {
    this.grid_w = grid_w;
    this.points = points; // 方向为：头到尾
    this.row = row;
    this.col = col;
    this.dir = this.getDirVectorByStr(dirStr);
    this.next_dir = null;
  }
  // 获取当前方向向量（在初始化的时候才被使用一次。）
  getDirVector() {
    const vector = {
      x: this.points[0].x - this.points[1].x,
      y: this.points[0].y - this.points[1].y
    };
    if (vector.x > 0) vector.x = vector.x / Math.abs(vector.x);
    if (vector.y > 0) vector.y = vector.y / Math.abs(vector.y);
    return vector;
  }
  draw(ctx) {
    this.points.forEach(point => {
      const x = point.x * this.grid_w;
      const y = point.y * this.grid_w;
      ctx.fillRect(x, y, this.grid_w, this.grid_w);
    });
  }
  getDirVectorByStr(dirStr) {
    const vector = {
      up:    {x: 0,  y: -1},
      down:  {x: 0,  y: 1},
      left:  {x: -1, y: 0},
      right: {x: 1,  y: 0}
    }[dirStr];
    if (!vector) throw new Error(`${dirStr} 方向字符串不在可选值范围内`);
    return new Vector(vector.x, vector.y);
  }
  // 设置方向。
  setDir(dirStr) {
    const next_dir = this.getDirVectorByStr(dirStr);
    if (this.dir.dotProduct(next_dir) < 0) return false; // 反向，设置失败
    this.dir = next_dir;
    return true;
  }
  // 更新位置信息。
  update() {
    const head = this.points[0];
    const next_head = {
      x: (head.x + this.dir.x + this.row) % this.row,
      y: (head.y + this.dir.y + this.col) % this.col
    };
    this.points.unshift(next_head);
    this.points.pop();
  }
}

const layer = new Layer(400, 500);
document.querySelector('#view').appendChild(layer.el);
const points = [
  { x: 2, y: 3 },
  { x: 2, y: 2 },
  { x: 2, y: 1 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
];
const snake = new Snake(20, points, 'down', 400 / 20, 500 / 20);
layer.addSnake(snake);
layer.start();

window.addEventListener('keydown', function(e) {
  if (e.code === 'ArrowLeft' || e.keyCode === 37) snake.setDir('left'); 
  else if (e.code === 'ArrowUp' || e.keyCode === 38) snake.setDir('up'); 
  else if (e.code === 'ArrowRight' || e.keyCode === 39) snake.setDir('right');
  else if (e.code === 'ArrowDown' || e.keyCode === 40) snake.setDir('down');
});