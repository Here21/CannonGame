'use strict';

import { Letter, Cannon, Shell, Board } from './model';
import { shuffle } from './common';
import res from './resources';

// const letterRes = require('./26letters.json');

const colorsBank = ['#f5222d', '#fa541c', '#fa8c16', '#faad14', '#fadb14', '#a0d911',
  '#52c41a', '#13c2c2', '#1890ff', '#2f54eb', '#722ed1', '#eb2f96', '#a3f3eb', '#f1ffab',
  '#6bd5e1', '#ffd98e', '#ff8364', '#92a4c0', '#f4adad', '#e58cdb'];

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

class Main {
  // 数据
  targets;

  // canvas
  canvas = document.getElementById('wrap');
  wrap = document.getElementById('wrap');

  // 画布尺寸
  canvasWidth;
  canvasHeight;
  ctx;
  fps = 0;
  lastFrameTime = 0;
  frametime = 0;  // 上一帧动画的时间，   两帧时间差


  mx;
  my; // 点击坐标
  targetAngle; // 目标角度

  lettersObj = [];

  // 组件
  cannon;
  shell;
  board;

  // 资源
  rawImages = new Map(res);

  // 声音
  rightAudio = new Audio();
  wrongAudio = new Audio();
  outAudio = new Audio();

  images = new Map();

  initGame() {
    console.log(123);
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
