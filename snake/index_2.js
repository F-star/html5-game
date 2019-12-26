
/* class Container {
  constructor(selector, width, height) {
    this.el = document.querySelector(selector);
    this.layers = [];
  }
} */

class DataView {
  constructor() {
    this.el = document.createElement('span');
    document.body.append(this.el);
  }
  updateFPS(fps) {
    this.el.innerHTML = fps;
  }
}

//层
class Layer {
  constructor(width, height, grid_w) {
    this.el = document.createElement('canvas');
    this.ctx = this.el.getContext('2d');
    this.snake = null;
    this.apple = null;
    this.size(width, height);
    this.grid_w = grid_w;

    this.dataView = new DataView();
    this.last_ts = 0;
    this.count = 0;
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
  addApple(apple) {
    this.apple = apple;
  }
  clear() {
    this.ctx.clearRect(0, 0, this.width(), this.height());
  }
  start() {
    this.apple.setPosExcept(this.snake.row, this.snake.col, this.snake.points);
    this.apple.draw(this.ctx);

    this.update();
  }
  update() {
    window.requestAnimationFrame(ts => {
      // dt 为当前帧和上一帧的时间差。单位为 秒/帧，fps = 1/dt
      if (this.last_ts === 0) this.last_ts = ts;
      const dt = ts - this.last_ts; // 两帧的间隔时间
      if (this.count++ % 10 == 0) {
        this.dataView.updateFPS('fps: ' + 1 / dt * 1000);
        const next_head = this.snake.getNextHeadPos();
        // 吃到苹果
        let eat = false;
        if (next_head.x === apple.x && next_head.y === apple.y){
          this.apple.setPosExcept(this.snake.row, this.snake.col, this.snake.points);
          eat = true;
        }
        this.snake.update(next_head, eat);
        if (this.snake.isHitSelf()) {
          return this.stop();
        }

        // 渲染
        this.clear();
        this.apple.draw(this.ctx);
        this.snake.draw(this.ctx, this.grid_w);
      }
      this.last_ts = ts;
      this.update();
    });
  }
  stop() {
    alert('好了，你死了');
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
  constructor(grid_w, points, dirStr, width, height) {
    this.grid_w = grid_w;
    this.points = points; // 方向为：头到尾
    this.row = height / grid_w;
    this.col = width / grid_w;
    this.dir = this.getDirVectorByStr(dirStr);
    this.next_dir = null;
    this.speed_ = 0; // 每秒移动几个单位。
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
  speed(val) {
    if (val == undefined) {
      return this.speed_;
    }
    this.speed_ = val;
  }
  getLen() {
    return this.points.length;
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
  setNextDir(dirStr) {
    const next_dir = this.getDirVectorByStr(dirStr);
    this.next_dir = next_dir;
  }
  getNextHeadPos() {
    if (this.next_dir && this.next_dir.dotProduct(this.dir) >= 0) { // next_dir 不和 dir 反向
      this.dir = this.next_dir;
      this.next_dir = null;
    }
    const head = this.points[0];
    const next_head = {
      x: (head.x + this.dir.x + this.col) % this.col,
      y: (head.y + this.dir.y + this.row) % this.row
    };
    return next_head;
  }
  // 咬到自己了
  isHitSelf() {
    const head = this.points[0];
    const len = this.getLen();
    for (let i = 1; i < len; i++) {
      if (head.x === this.points[i].x && head.y === this.points[i].y) return true;
    }
    return false;
  }
  // 更新位置信息。
  update(next_head, grow) {
    /* if (this.next_dir && this.next_dir.dotProduct(this.dir) >= 0) { // next_dir 不和 dir 反向
      this.dir = this.next_dir;
      this.next_dir = null;
    }
    const head = this.points[0];
    const next_head = {
      x: (head.x + this.dir.x + this.col) % this.col,
      y: (head.y + this.dir.y + this.row) % this.row
    }; */
    this.points.unshift(next_head);
    if (!grow) this.points.pop();
  }
  draw(ctx) {
    this.points.forEach((point, index) => {
      const x = point.x * this.grid_w;
      const y = point.y * this.grid_w;
      if (index === 0) ctx.fillStyle = 'red';
      else ctx.fillStyle = '#000';
      ctx.fillRect(x, y, this.grid_w, this.grid_w);
    });
  }
}

// 苹果
class Apple {
  constructor(grid_w) {
    this.x = 0;
    this.y = 0;
    this.grid_w = grid_w;
  }
  // 设置一个随机坐标，要求在 [col, row] 内且不在 points 内。
  setPosExcept(row, col, points) {
    const obj = {};
    points.forEach(point => {
      if (!obj[point.x]) obj[point.x] = [];
      obj[point.x].push(point.y);
    });
    let space_sum = row * col - points.length; // 总空白格数
    let random_index = Math.floor(Math.random() * (space_sum + 1));
    console.log('随机数：', random_index);
    let x, y;
    let found = false;
    let col_space_count; // 列空白格数
    for (let i = 0; i < col; i++) {
      if (found) break;
      col_space_count = obj[i] ? row - obj[i].length : row; // 当前列的空格数
      if (random_index < col_space_count) {
        // 确定 x
        x = i;
        found = true;
        for (let j = 0; j < row; j++) {
          if (random_index === 0) {
            // 确定 y 坐标
            y = j;
            break;
          }
          if (!obj[i] || !obj[i].includes(j)) random_index--;
        }
      } else {
        random_index -= col_space_count;
      }
    }
    this.x = x;
    this.y = y;
    console.log(
      '苹果位置：', x, y
    );
  }
  draw(ctx) {
    ctx.save();
    ctx.fillStyle = 'yellow';
    ctx.fillRect(this.x * this.grid_w, this.y * this.grid_w, this.grid_w, this.grid_w);
    ctx.restore();
  }
}

const grid_w = 20; // 格子大小
const width = 400;
const height = 400;

const layer = new Layer(width, height, grid_w);
document.querySelector('#view').appendChild(layer.el);

const points = [
  { x: 2, y: 3 },
  { x: 2, y: 2 },
  { x: 2, y: 1 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
];
const snake = new Snake(grid_w, points, 'down', width, height);
const apple = new Apple(grid_w);
layer.addSnake(snake);
layer.addApple(apple);
layer.start();

window.addEventListener('keydown', function(e) {
  if (e.code === 'ArrowLeft' || e.keyCode === 37)
    snake.setNextDir('left'); 
  else if (e.code === 'ArrowUp' || e.keyCode === 38)
    snake.setNextDir('up'); 
  else if (e.code === 'ArrowRight' || e.keyCode === 39)
    snake.setNextDir('right');
  else if (e.code === 'ArrowDown' || e.keyCode === 40)
    snake.setNextDir('down');
});