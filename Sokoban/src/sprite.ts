
// 精灵抽象类
abstract class AbstractSprite {
  protected color = '#000';
  constructor(public x: number, public y: number, public grip_w: number) {}
  // abstract draw(ctx: CanvasRenderingContext2D): void
  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.grip_w, this.grip_w);
    ctx.restore(); 
  }
}

// 墙
class Wall extends AbstractSprite{
  protected color = '#98812c'
}
// 地砖
class Tile {
  protected color = '#98812c' 
}
// 目的地
class Goal {
  constructor() {}
}
// 玩家
class Player {
  constructor(public x: number, public y: number) {}
  move(direction: string) {}
}
// 箱子
class Box {
  constructor(public x: number, public y: number) {}
}

// 简单工厂函数
function createSprite(id: number) {
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

}