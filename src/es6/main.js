// import { Letter, Cannon, Shell, Board } from './model';
// import { shuffle } from './common';
// import res from './resources';

const res = [
  ["A", "./resources/a-z/a-apple.jpg"],
  ["B", "./resources/a-z/b-bear.jpg"],
  ["C", "./resources/a-z/c-cat.jpg"],
  ["D", "./resources/a-z/d-dog.jpg"],
  ["E", "./resources/a-z/e-egg.jpg"],
  ["F", "./resources/a-z/f-fox.jpg"],
  ["G", "./resources/a-z/g-grape.jpg"],
  ["H", "./resources/a-z/h-hamburger.jpg"],
  ["I", "./resources/a-z/i-icecream.jpg"],
  ["J", "./resources/a-z/j-jeep.jpg"],
  ["K", "./resources/a-z/k-kite.jpg"],
  ["L", "./resources/a-z/l-lion.jpg"],
  ["M", "./resources/a-z/m-monkey.jpg"],
  ["N", "./resources/a-z/n-nose.jpg"],
  ["O", "./resources/a-z/o-orange.jpg"],
  ["P", "./resources/a-z/p-panda.jpg"],
  ["Q", "./resources/a-z/q-quilt.jpg"],
  ["R", "./resources/a-z/r-rabbit.jpg"],
  ["S", "./resources/a-z/s-strawberry.jpg"],
  ["T", "./resources/a-z/t-tiger.jpg"],
  ["U", "./resources/a-z/u-umbrella.jpg"],
  ["V", "./resources/a-z/v-violin.jpg"],
  ["W", "./resources/a-z/w-watch.jpg"],
  ["X", "./resources/a-z/x-xylohone.jpg"],
  ["Y", "./resources/a-z/y-yacht.jpg"],
  ["Z", "./resources/a-z/z-zebra.jpg"],
  ['cannon', './resources/cannon.png'],
  ['bottom', './resources/bottomCase.png']
];

const colorsBank = ['#f5222d', '#fa541c', '#fa8c16', '#faad14', '#fadb14', '#a0d911',
  '#52c41a', '#13c2c2', '#1890ff', '#2f54eb', '#722ed1', '#eb2f96', '#a3f3eb', '#f1ffab',
  '#6bd5e1', '#ffd98e', '#ff8364', '#92a4c0', '#f4adad', '#e58cdb'];

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

class Main {
  constructor() {
    // super(props, context);
    // 数据
    this.targets;

    // canvas
    this.canvas = document.getElementById('canvas');
    this.wrap = document.getElementById('wrap');

    // 画布尺寸
    this.canvasWidth;
    this.canvasHeight;
    this.ctx;
    this.fps = 0;
    this.lastFrameTime = 0;
    this.frametime = 0;  // 上一帧动画的时间，   两帧时间差


    this.mx;
    this.my; // 点击坐标
    this.targetAngle; // 目标角度

    this.lettersObj = [];

    // 组件
    this.cannon;
    this.shell;
    this.board;

    // 资源
    this.rawImages = new Map(res);

    // 声音
    this.rightAudio = new Audio();
    this.wrongAudio = new Audio();
    this.outAudio = new Audio();

    this.images = new Map();
  }


  initGame() {
    // 通过wrap伪动态调整
    this.canvasWidth = this.wrap.clientWidth;
    this.canvasHeight = this.wrap.clientHeight;
    this.rightAudio.src = './resources/right.mp3';
    this.rightAudio.load();
    this.wrongAudio.src = './resources/wrong.mp3';
    this.wrongAudio.load();
    this.outAudio.src = './resources/out.mp3';
    this.outAudio.load();
    // 预加载资源
    this.loadResources().then(() => {
      this.init();
      this.lastFrameTime = Date.now();
      this.igniteLoop(Date.now());
    });
  }
  loadResources() {
    const pr = [];
    this.rawImages.forEach((value, key) => {// 预加载图片
      const p = this.preload(value)
        .then(img => this.images.set(key, img))
        .catch(err => console.log(err));
      pr.push(p);
    });
    return Promise.all(pr);
  }
  preload(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }
  init() {
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    // 字母行排
    let offset;
    // 打乱数据
    this.targets = shuffle(letters);
    const colors = shuffle(colorsBank);

    const radius = 30; // letter 半径
    const margin = 20; // letter 外边距
    const num = this.targets.length;

    if (this.canvasWidth < (num - 1) * radius * 2 + (margin * (num - 1))) {
      offset = radius;
    } else {
      offset = (this.canvasWidth - ((num - 1) * radius * 2 + (margin * (num - 1)))) / 2;
    }
    for (let i = 0; i < num; i++) {
      const LetterObj = new Letter(this.ctx);
      LetterObj.init(radius * 2 * i + margin * i + offset, 100, colors[i], this.targets[i], radius, margin);
      this.lettersObj.push(LetterObj);
    }

    // 大炮
    this.cannon = new Cannon(this.ctx);
    this.cannon.init(this.images.get('cannon'), this.images.get('bottom'), this.canvasWidth, this.canvasHeight, this.targets);

    // 炮弹
    this.shell = new Shell(this.ctx);
    this.shell.init(this.cannon.tx, this.cannon.ty);

    // 公告板
    this.board = new Board(this.ctx);

    // 事件
    this.canvas.addEventListener('click', (event) => {
      this.mx = event.offsetX;
      this.my = event.offsetY;
      this.board.alive = false;
      console.log('x: ', this.mx, 'y: ',  this.my);
      // console.log(event);
    });
  }

  igniteLoop(timestamp) {
    this.frametime = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;
    this.fps = Math.round(1000 / this.frametime);
    window.requestAnimationFrame(this.igniteLoop.bind(this));
    // 清除画布内容
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // 渲染
    for (const letter of this.lettersObj) {
      letter.update(this);
    }
    this.shell.update(this);
    this.cannon.update(this);
    this.board.update(this);
  }

  rightTarget() {
    this.rightAudio.play();
    // 初始化board
    const img = this.images.get(this.cannon.letter);
    const letterArr = img.src.replace(/(.*\/)*([^.]+).*/ig, '$2').split('-');
    letterArr[0] = letterArr[0].toUpperCase();
    this.board.init(this.canvasWidth / 6, this.canvasHeight / 2, letterArr, img);
  }

  wrongTarget() {
    this.wrongAudio.play();
  }

  shotShell() {
    this.outAudio.play();
  }
}

export default Main;

// 元素类
class Sprite {
  constructor(ctx) {
    this.ctx = ctx;
    this.x = 0;
    this.y = 0;
    this.color = '';
    this.radius = 0;
    this.alive = false;
    this.margin = 0;
    this.angle = 0;
  }
  update($event) {
    this.draw();
  }
  draw() {

  }
}

export class Letter extends Sprite {
  constructor(ctx) {
    super(ctx);
    this.letter;
    this.ctx;
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
  constructor(ctx) {
    super(ctx);
    this.tx; // 假象转化锚点后实际坐标位置
    this.ty; // 假象转化锚点后实际坐标位置
    this.bx; // 直接定义位置
    this.by; // 直接定义位置
    this.baseImg;
    this.img;
    this.targetAngle; // 目标角度
    this.letter;
    this.ammunition;

  }

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
  constructor(props) {
    super(props);
    this.speed;
  }

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
  constructor(props) {
    super(props);
    this.textArr;
    this.img;
  }
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

// 方法
export function tAngle(target, base) {
  const radians = Math.atan2(base.y - target.y, target.x - base.x);
  return radians * 180 / Math.PI; // degrees
}

export function circleCollide(c1, c2) {
  const dx = Math.abs(c1.x - c2.x);
  const dy = Math.abs(c1.y - c2.y);

  const dist = Math.sqrt(dx * dx + dy * dy);
  return dist < c1.radius + c2.radius;
}

export function shuffle(arr){
  const temp = [...arr];
  const result = [];
  let random;
  while(temp.length > 0){
    random = Math.floor(Math.random() * temp.length);
    result.push(temp[random]);
    temp.splice(random, 1)
  }
  return result;
}
