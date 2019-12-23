
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
    snake.draw(this.ctx);
    // window.requestAnimationFrame(function(ts) {

    // });
  }
}

// 蛇
class Snake {
  constructor(grid_w, pos, length, curr_dir) {
    this.grid_w = grid_w;
    // pos 为数组，存储位置的关键坐标信息，类似 svg 的 path 元素的 d。顺序为蛇头到蛇尾巴。
    this.pos = pos;
    this.length = length;
    this.curr_dir = curr_dir; // 方向
  }
  draw(ctx) {
    this.pos.reduce((prev, curr) => {
      const box = {
        x: Math.min(prev.x, curr.x) * this.grid_w,
        y: Math.min(prev.y, curr.y) * this.grid_w,
        width: (Math.abs(prev.x - curr.x) + 1) * this.grid_w,
        height: (Math.abs(prev.y - curr.y) + 1) * this.grid_w
      };
      ctx.fillRect(box.x, box.y, box.width, box.height);
      return curr;
    });
  }
  // 设置方向。
  setTargetDir(target_dir) {
    // 当前方向和要修改的方法反向时，失效。
    this.target_dir = target_dir;
  }
  // 更新位置信息。
  update() {
    // 只要是头和尾的修改。
    // 1. 头部的处理。
    if (this.target_dir === this.curr_dir) {
      if (this.target_dir === 'down') this.pos[0];
    }
  }
}

/* const Util = {
  getRandomColor() {
    const colors = ['red', ]
  }
}; */

const layer = new Layer(400, 500);
document.querySelector('#view').appendChild(layer.el);
const points = [
  { x: 2, y: 3 },
  { x: 2, y: 1 },
  { x: 1, y: 1 },
];
const snake = new Snake(20, points, 4, 'down');
layer.addSnake(snake);
layer.start();

/* window.addEventListener('keydown', function() {

}); */