(function () {
  const canvasWidth = 800;
  const canvasHeight = 600;
  let canvas; // 画布对象
  let ctx; // 画布内容
  let mx, my; // 点击坐标
  let targetAngle; // 目标角度
  let sx, sy; // 炮弹坐标


  let letter; // 字母
  let cannon; // 炮管
  let shell; // 炮弹

  // 目前大多数设备的屏幕刷新率为 60 次/秒，所以通常来讲 fps 为 60 frame/s 时动画效果最好，也就是每帧的消耗时间为 16.67ms。
  let fps = 0;
  let lastframetime = 0,  frametime=0;  // 上一帧动画的时间，   两帧时间差


  window.G = {}; // 全局对象

  G.startGame = () => {
    G.init();
    lastframetime = Date.now();
    G.igniteLoop();
  };

  G.init = () => {
    canvas = document.getElementById("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx = canvas.getContext('2d');

    // new 字母类
    letter = new LetterObject();
    letter.init();

    // new 大炮类
    cannon = new CannonObject();
    cannon.init();

    // new 炮弹类
    shell = new ShellObject();
    shell.init();

    // 事件
    canvas.addEventListener("click", (event) => {
      mx = event.offsetX;
      my = event.offsetY;
      console.log("x: ", mx, "y: ",  my);
      console.log("cannon x: ", cannon.tx, "cannon y: ",  cannon.ty);

    });
  };

  // 帧动画
  G.igniteLoop = (timestamp) => {
    // 每帧耗时
    frametime = timestamp - lastframetime;
    lastframetime = timestamp;
    fps = Math.round(1000 / frametime);

    // requestAnimationFrame 的 callback中参数表示当前触发回调时当前的时间
    window.requestAnimationFrame(G.igniteLoop);
    // setInterval(G.igniteLoop, )

    // 清除画布内容
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 绘制画布内容
    letter.update();
    shell.update();
    cannon.update();

  };


  // 定义字母类
  const LetterObject = function() {
    this.num = 10;
    this.x = [];
    this.y = [];
    this.radius = 25;
    this.margin = 20;
    this.letter = [];
    this.alive = [];  // boolean 是否可用
  }
  LetterObject.prototype.init = function() {
    // 计算左偏移值，近似居中。anchor 在 x / 2, y / 2
    let offset;
    if (canvasWidth < (this.num - 1) * this.radius * 2 + (this.margin * (this.num - 1))) {
      offset = this.radius;
    } else {
      offset = (canvasWidth - ((this.num - 1) * this.radius * 2 + (this.margin * (this.num - 1)))) / 2;
    }
    for(let i = 0; i < this.num; i++){
      this.x[i] = this.radius * 2 * i + this.margin * i + offset; // 居中
      this.y[i] = 100; // 固定高度
      this.alive[i] = true;   //初始值都为false
    }
  }
  LetterObject.prototype.update = function() {
    for(let i =0;i< this.num; i++){
      if(this.alive[i]){
        ctx.beginPath();
        ctx.arc(this.x[i], this.y[i], this.radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.fill();

        // 判断鼠标点击区域
        if (ctx.isPointInPath(mx, my)) {
          console.log('no is click', i);
          // 计算偏角
          targetAngle = tAngle({x: this.x[i], y: this.y[i]}, { x: cannon.tx, y: cannon.ty});
          //                     速度     *    时间 = 距离 /  帧率
          shell.x = shell.x + shell.speed * frametime / fps * Math.cos(targetAngle * Math.PI / 180);
          shell.y = shell.y - shell.speed * frametime / fps * Math.sin(targetAngle * Math.PI / 180);
        }
      }
    }
  }


  // 定义大炮类
  // anchor 图片在左上角
  const CannonObject = function () {
    this.angle = 0;
    this.x = 0;
    this.y = 0; // 距离底部高度
    this.tx = canvasWidth / 2; // 假象转化锚点后实际坐标位置
    this.ty = canvasHeight; // 假象转化锚点后实际坐标位置
    this.img = new Image();
    this.baseImg = new Image();
    this.bx = 0; // 直接定义位置
    this.by = 0; // 直接定义位置
  };
  CannonObject.prototype.init = function () {
    this.img.src = 'img/cannon.png';
    this.baseImg.src = 'img/bottomCase.png';
    this.x = canvasWidth / 2 - this.img.width / 2;
    this.y = canvasHeight - this.img.height; // 距离底部高度
    this.bx = canvasWidth / 2 - this.baseImg.width / 2;
    this.by = canvasHeight - this.baseImg.height;
  };
  CannonObject.prototype.update = function () {
    // 按照层级先绘制炮垒
    ctx.drawImage(this.baseImg, this.bx, this.by);
    // 绘制
    ctx.save();
    ctx.translate(this.x + this.img.width / 2, this.y + this.img.height);
    // 炮管朝向与坐标系Y轴是反的，旋转角度是90 - targetAngle的夹角
    ctx.rotate((90 - targetAngle) * Math.PI / 180);  // rotate() 参数是弧度为单位的值
    ctx.drawImage(this.img, -this.img.width / 2, -this.img.height);
    ctx.restore();
  };

  // 定义炮弹类
  const ShellObject = function() {
    this.speed = 50;
    this.x = 0;
    this.y = 0;
    this.radius = 25;
    this.letter = '';
    this.alive = false;  // boolean 是否可用
  }
  ShellObject.prototype.init = function() {
    this.x = cannon.tx;
    this.y = cannon.ty;
    this.alive = true;
  }
  ShellObject.prototype.update = function() {
    if(this.alive){
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fillStyle = 'rgb(255,255,255)';
      ctx.fill();

      // // 判断鼠标点击区域
      // if (ctx.isPointInPath(mx, my)) {
      //   console.log('no is click', i);
      //   const angle = tAngle({x: this.x[i], y: this.y[i]}, { x: cannon.tx, y: cannon.ty});
      //   // 判断旋转角度，以cannon 的位置来看，cannon.tx 右边是正角度旋转，左边是负角度旋转
      //   targetAngle = angle;
      //   // console.log("------", angle, '====', targetAngle);
      //   // console.log("position", cannon.tx, cannon.ty, this.x[i], this.y[i]);
      // }
    }
  }

})();

// TODO: 使用ES6的类的方式重写
// class Node {
//   constructor() {
//   }
//   update() {
//
//   }
// }
//
// class Cannon extends Node {
//
// }
