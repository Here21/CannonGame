'use strict';

import { tAngle, circleCollide, shuffle } from './common';

class Sprite {
  x = 0;
  y = 0;
  color = '';
  radius = 0;
  alive = false;
  margin = 0;
  angle = 0;
  ctx;

  constructor(ctx) {
    this.ctx = ctx;
  }
  update($event) {
    this.draw();
  }
  draw() {

  }
}

export class Letter extends Sprite {
  letter;
  ctx;

  constructor(ctx) {
    super(ctx);
  }

  init(x, y, color, letter, radius, margin) {
    this.alive = true;
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = 30.5;
    this.letter = letter;
    this.margin = margin;
  }

  update($event) {
    if (this.alive) {
      this.draw();
      if (this.ctx.isPointInPath($event.mx, $event.my)) {
        // console.log('no is click', this.letter);
        $event.shell.alive = true;
        if (circleCollide({x: this.x, y: this.y, radius: this.radius}, $event.shell)) {
          // 初始化炮弹，重置鼠标点击位置
          $event.shell.init($event.cannon.tx, $event.cannon.ty);
          $event.mx = 0;
          $event.my = 0;

          // 判定目标
          if ($event.cannon.letter === this.letter) {
            this.alive = false;
            $event.targets.pop();
            // 换子弹
            $event.cannon.changeBullets();

            // 执行效果
            $event.rightTarget();
            // setTimeout(() => {
            //   $event.board.alive = false;
            // }, 1000);
          } else {
            // 错误
            $event.wrongTarget();
          }
        }
        $event.cannon.targetAngle = tAngle({x: this.x, y: this.y}, { x: $event.cannon.tx, y: $event.cannon.ty});
        //                     速度     *    时间 = 距离 /  帧率
        $event.shell.x =
          $event.shell.x + $event.shell.speed * $event.frametime / $event.fps * Math.cos($event.cannon.targetAngle * Math.PI / 180);

        $event.shell.y =
          $event.shell.y - $event.shell.speed * $event.frametime / $event.fps * Math.sin($event.cannon.targetAngle * Math.PI / 180);
      }
    }
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    this.ctx.closePath();
    this.ctx.fillStyle = this.color;
    this.ctx.fill();

    // 绘制文字 字体锚点在文字左下角
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '38px ChalkboardSE-Regular';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.letter, this.x, this.y + 12);
  }
}

export class Cannon extends Sprite {
  tx; // 假象转化锚点后实际坐标位置
  ty; // 假象转化锚点后实际坐标位置
  bx; // 直接定义位置
  by; // 直接定义位置
  baseImg;
  img;
  targetAngle; // 目标角度
  letter;
  ammunition;

  init(imgObj, baseImgObj, canvasWidth, canvasHeight, ammunition) {
    this.img = imgObj;
    this.baseImg = baseImgObj;
    this.x = canvasWidth / 2 - this.img.width / 2;
    this.y = canvasHeight - this.img.height; // 距离底部高度
    this.bx = canvasWidth / 2 - this.baseImg.width / 2;
    this.by = canvasHeight - this.baseImg.height;
    this.tx = canvasWidth / 2; // 假象转化锚点后实际坐标位置
    this.ty = canvasHeight; // 假象转化锚点后实际坐标位置
    this.ammunition = shuffle(ammunition);  // 填充弹药
  }

  update() {
    this.angle = 90 - this.targetAngle;
    this.letter = this.ammunition[0];
    if (this.ammunition.length > 0) {
      this.letter = this.ammunition[this.ammunition.length - 1];
    } else {
      this.letter = '';
    }
    this.draw();
  }
  draw() {
    // 按照层级先绘制炮垒
    this.ctx.drawImage(this.baseImg, this.bx, this.by);
    // 绘制
    this.ctx.save();
    this.ctx.translate(this.x + this.img.width / 2, this.y + this.img.height);
    // 炮管朝向与坐标系Y轴是反的，旋转角度是90 - targetAngle的夹角
    this.ctx.rotate(this.angle * Math.PI / 180);  // rotate() 参数是弧度为单位的值
    this.ctx.drawImage(this.img, -this.img.width / 2, -this.img.height);
    // 绘制文字 字体锚点在文字左下角
    if (this.letter) {
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = '58px ChalkboardSE-Regular';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(this.letter.toLocaleLowerCase(), 0, -this.img.height / 3);
    }
    this.ctx.restore();
  }
  changeBullets() {
    this.ammunition.pop();
  }
}

export class Shell extends Sprite {
  speed;
  init(x, y, speed = 30) {
    this.x = x;
    this.y = y;
    this.alive = false;
    this.speed = speed;
    this.radius = 25;
  }
  update($event) {
    if (this.y < 0) {
      return this.init($event.cannon.tx, $event.cannon.ty);
    }
    if (this.alive) {
      this.draw();
    }
  }
  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    this.ctx.closePath();
    this.ctx.fillStyle = 'rgb(255,255,255)';
    this.ctx.fill();
  }
}

export class Board extends Sprite {
  textArr;
  img;
  init(x, y, textArr, img) {
    this.x = x;
    this.y = y;
    this.alive = true;
    this.textArr = textArr;
    this.img = img;
  }
  update() {
    if (this.alive) {
      this.draw();
    }
  }
  draw() {
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '100px ChalkboardSE-Regular';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(this.textArr[0], this.x, this.y);

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '90px ChalkboardSE-Regular';
    this.ctx.textAlign = 'start';
    this.ctx.fillText(this.textArr[1], this.x * 1.5, this.y);

    this.ctx.drawImage(this.img, this.x * 4, this.y - 80);
  }
}
