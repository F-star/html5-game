interface readyonlyObj {
  readonly [x: number]: string
}
const map: readyonlyObj = {
  0: 'tile', // 地砖
  1: 'wall',
  2: 'box',
  3: 'goal',
  4: 'player'
}

class Game {
  constructor(private width: number, private height: number, private grip_width: number) {}
  initMapInfo(map: string): void {
    map = map.replace(/\s+/g, '')
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        createSprite(map[y * this.height + x], x, y, this.grip_width)
      }
    }
  }
  start() {}
}
// 精灵抽象类
abstract class Sprite {
  constructor(public x: number, public y: number, public grip_w: number) {}
  abstract draw(ctx: CanvasRenderingContext2D): void
}
class KeyBoardController {

}
class Goal {
  constructor() {}
}
class Player {
  constructor(public x: number, public y: number) {}
  move(direction: string) {}
}
class Box {
  constructor(public x: number, public y: number) {}
}
class Wall extends Sprite{
  private color = 'red'
  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.grip_w, this.grip_w);
    ctx.restore();
  }
}

const gameMap = `
1111111111
1000004001
1101020301
1111111111
`
const width = 10;
const height = 4;
const grip_width = 20;

const game = new Game(width, height, grip_width);
game.initMapInfo(gameMap)


