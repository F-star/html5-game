
class Game {
  private mapArr: string[][] = [];
  private width: number = 0;
  private height: number = 0;
  private grid_width: number = 0;
  private el = document.createElement('canvas');
  getElement() {
    return this.el
  }
  setGridWidth(width: number): void {
    this.grid_width = width;
  }
  initMapInfo(map: string, width: number, height: number): void {
    this.width = width;
    this.height = height;

    // 地图字符串 解析为 二维数组，保存到 mapArr 属性。
    map = map.replace(/\s+/g, '')
    this.mapArr = new Array(height)
    for (let x = 0; x < height; x++) {
      this.mapArr[x] = new Array(width)
      for (let y = 0; y < width; y++) {
        this.mapArr[x][y] = map[x * height + y];
      }
    }
  }
  render() {
    // 绘制背景和目标。
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        // 绘制 id 对应的物体。
      }
    }
    // 绘制物体：箱子和
  }
}

// const map = {
//   x: 'empty', // 空白
//   0: 'tile', // 地砖
//   1: 'wall',
//   2: 'box',
//   3: 'goal',
//   4: 'player'
// }

const map: {[propName: string]: string} = {
  x: 'empty',
  0: 'tile', // 地砖
  1: 'wall',
  2: 'box',
  3: 'goal',
  4: 'player'
}

function drawGrip(id: string) {
  const obj = map[id];
}

const gameMap = `
x111111111
1000004001
1111020301
xx1111111x
`
const width = 10;
const height = 4;
const grid_width = 20;

const game = new Game();
game.setGridWidth(grid_width);
game.initMapInfo(gameMap, width, height);
// game.set

// 箱子有两种状态。
// 玩家也会有 4 种朝向。

