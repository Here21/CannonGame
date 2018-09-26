(function () {
  const canvasWidth = 800;
  const canvasHeight = 600;
  let canvas; // 画布对象
  let state = 'stop'; // 游戏状态
  let ctx; // 画布内容
  let mx, my; // 点击坐标
  let targetAngle; // 目标角度
  let sx, sy; // 炮弹坐标

  // 传值变量
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
  const colorsBank = ['#f5222d', '#fa541c', '#fa8c16', '#faad14', '#fadb14', '#a0d911', '#52c41a', '#13c2c2', '#1890ff', '#2f54eb', '#722ed1', '#eb2f96',
    '#a3f3eb', '#f1ffab', '#6bd5e1', '#ffd98e', '#ff8364', '#92a4c0', '#f4adad', '#e58cdb'];
  let targets = shuffle(letters); // 目标字母集合（乱序）
  let colors = shuffle(colorsBank);  // 目标字母背景色
  let letter; // 字母
  let cannon; // 炮管
  let shell; // 炮弹
  let board; // 公告板

  // 目前大多数设备的屏幕刷新率为 60 次/秒，所以通常来讲 fps 为 60 frame/s 时动画效果最好，也就是每帧的消耗时间为 16.67ms。
  let fps = 0;
  let lastframetime = 0,  frametime=0;  // 上一帧动画的时间，   两帧时间差


  window.G = window.G || {}; // 全局对象

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

    // new 公告类
    board = new BoardObject();
    board.init();

    // 事件
    canvas.addEventListener("click", (event) => {
      mx = event.offsetX;
      my = event.offsetY;
      console.log("x: ", mx, "y: ",  my);
      if (state === 'stop') {
        state = 'start';
      }
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

    if (state === 'start') {
      // 绘制画布内容
      letter.update();
      shell.update();
      cannon.update();
    } else if (state === 'stop') {
      board.update();
    }

  };


  // 定义字母类
  const LetterObject = function() {
    this.num = 0;
    this.x = [];
    this.y = [];
    this.radius = 25;
    this.margin = 20;
    this.letter = [];
    this.alive = [];  // boolean 是否可用
    this.color = [];  // 颜色
  };
  LetterObject.prototype.init = function() {
    this.num = letters.length;
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
      this.alive[i] = true;   // 初始值都为false
      this.letter[i] = letters[i];  // 分配字母
      this.color[i] = colors[i];  // 分配颜色
    }
  };
  LetterObject.prototype.update = function() {
    for(let i = 0; i < this.num; i++){
      if(this.alive[i]){
        this.draw(i);
        // 判断鼠标点击区域
        if (ctx.isPointInPath(mx, my)) {
          console.log('no is click', i);
          // 计算偏角
          shell.alive = true;
          if(circleCollide({x: this.x[i], y: this.y[i], radius: this.radius}, shell)) {
            // 初始化炮弹，重置鼠标点击位置
            shell.init();
            mx = 0;
            my = 0;

            // 判定目标
            if (cannon.letter === this.letter[i]) {
              this.alive[i] = false;
              targets.pop();
              cannon.init();
            }
          }
          targetAngle = tAngle({x: this.x[i], y: this.y[i]}, { x: cannon.tx, y: cannon.ty});
          //                     速度     *    时间 = 距离 /  帧率
          shell.x = shell.x + shell.speed * frametime / fps * Math.cos(targetAngle * Math.PI / 180);
          shell.y = shell.y - shell.speed * frametime / fps * Math.sin(targetAngle * Math.PI / 180);

        }
      }
    }
  };
  LetterObject.prototype.draw = function (index) {
    ctx.beginPath();
    ctx.arc(this.x[index], this.y[index], this.radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = this.color[index];
    ctx.fill();

    // 绘制文字 字体锚点在文字左下角
    ctx.fillStyle = '#FFFFFF';
    ctx.font = "32px KGMissKindyMarker";
    ctx.fillText(this.letter[index], this.x[index] - 10, this.y[index] + 15);
  };

  // 定义大炮类
  // anchor 图片在左上角
  const CannonObject = function () {
    this.angle = 0;
    this.speed = 30;
    this.x = 0;
    this.y = 0; // 距离底部高度
    this.tx = canvasWidth / 2; // 假象转化锚点后实际坐标位置
    this.ty = canvasHeight; // 假象转化锚点后实际坐标位置
    this.img = new Image();
    this.baseImg = new Image();
    this.bx = 0; // 直接定义位置
    this.by = 0; // 直接定义位置
    this.letter = '';
  };
  CannonObject.prototype.init = function () {
    this.img.src = 'img/cannon.png';
    this.baseImg.src = 'img/bottomCase.png';
    this.x = canvasWidth / 2 - this.img.width / 2;
    this.y = canvasHeight - this.img.height; // 距离底部高度
    this.bx = canvasWidth / 2 - this.baseImg.width / 2;
    this.by = canvasHeight - this.baseImg.height;
    if (targets.length > 0) {
      this.letter = targets[targets.length - 1];
    } else {
      this.letter = '';
    }
  };
  CannonObject.prototype.update = function () {
    // TODO: 炮台移动过程
    this.angle = 90 - targetAngle;
    this.draw(this.angle);
  };
  CannonObject.prototype.draw = function (degrees) {
    // 按照层级先绘制炮垒
    ctx.drawImage(this.baseImg, this.bx, this.by);
    // 绘制
    ctx.save();
    ctx.translate(this.x + this.img.width / 2, this.y + this.img.height);
    // 炮管朝向与坐标系Y轴是反的，旋转角度是90 - targetAngle的夹角
    ctx.rotate(degrees * Math.PI / 180);  // rotate() 参数是弧度为单位的值
    ctx.drawImage(this.img, -this.img.width / 2, -this.img.height);

    // 绘制文字 字体锚点在文字左下角
    if (this.letter) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = "50px KGMissKindyMarker";
      ctx.fillText(this.letter.toLocaleLowerCase(), -8, -this.img.height / 3);
    }
    ctx.restore();
  };


  // 定义炮弹类
  const ShellObject = function() {
    this.speed = 50;
    this.x = 0;
    this.y = 0;
    this.radius = 25;
    this.alive = false;  // boolean 是否可用
  };
  ShellObject.prototype.init = function() {
    this.x = cannon.tx;
    this.y = cannon.ty;
    this.alive = false;
  };
  ShellObject.prototype.update = function() {
    if(this.alive){
      this.draw();
    }
  };
  ShellObject.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = 'rgb(255,255,255)';
    ctx.fill();
  };

  // 定义公告牌类
  const BoardObject = function() {
    this.x = 0;
    this.y = 0;
    this.text = '';
  };
  BoardObject.prototype.init = function() {
    this.x = canvasWidth;
    this.y = canvasHeight / 2;
    this.text = '点击屏幕开始游戏';
  };
  BoardObject.prototype.update = function() {
    this.draw();
  };
  BoardObject.prototype.draw = function () {
    // 绘制文字 字体锚点在文字左下角
    ctx.fillStyle = '#FFFFFF';
    ctx.font = "60px KGMissKindyMarker";
    const textWidth = ctx.measureText(this.text);  // 预测文字宽度
    ctx.fillText(this.text, (this.x - textWidth.width) / 2, this.y);
  };

})();
