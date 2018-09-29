# 大炮游戏

![pic1](http://obd9ssud2.bkt.clouddn.com/canvasGame/1.png)

![pic2](http://obd9ssud2.bkt.clouddn.com/canvasGame/2.png)


## 玩法

大炮显示小写字母需要匹配对应目标的大写字母，答对会出现对应的单词和图片，答错只有错误声音。

## 项目概要

一个用纯`Canvas`实现的游戏，没有使用任何游戏框架，可以了解一些底层的游戏实现的逻辑，比如canvas制作游戏的绘制过程，动画是如何在canvas中运动的，组件碰撞，资源预加载等等。

第一版用ES5原型链的方式做的，之后再完善游戏的过程中，用ES6的类的方式重新抽离并实现了相应业务。但是ES6语法中的import并不能在js脚本中去使用。

所以想要实现彻底的组件化，还得借助其他工具（babel）。

### 游戏的实质

#### 帧率

游戏要动起来，和动画片或者电影的概念是一样的，就是一个不断重新绘制的过程，也就是说是由一帧一帧的图像构成的，这里要引出一个关键点**帧率（FPS）**。

**流畅动画的标准**

首先，理清一些概念。FPS 表示的是每秒钟画面更新次数。我们平时所看到的连续画面都是由一幅幅静止画面组成的，每幅画面称为一帧，FPS 是描述“帧”变化速度的物理量。

理论上说，FPS 越高，动画会越流畅，目前大多数设备的屏幕刷新率为 60 次/秒，所以通常来讲 FPS 为 60 frame/s 时动画效果最好，也就是每帧的消耗时间为 16.67ms。

**使用 `requestAnimationFrame` 计算 `FPS` 原理**

正常而言 `requestAnimationFrame` 这个方法在一秒内会执行 `60` 次，也就是不掉帧的情况下。假设动画在时间 `A` 开始执行，在时间 `B` 结束，耗时 `x ms`。而中间 `requestAnimationFrame` 一共执行了 `n` 次，则此段动画的帧率大致为：`n / (B - A)`。

核心代码如下，能近似计算每秒页面帧率，以及我们额外记录一个 `allFrameCount`，用于记录 `rAF` 的执行次数，用于计算每次动画的帧率 ：

```js
var rAF = function () {
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        }
    );
}();
  
var frame = 0;
var allFrameCount = 0;
var lastTime = Date.now();
var lastFameTime = Date.now();
  
var loop = function () {
    var now = Date.now();
    var fs = (now - lastFameTime);
    var fps = Math.round(1000 / fs);
  
    lastFameTime = now;
    // 不置 0，在动画的开头及结尾记录此值的差值算出 FPS
    allFrameCount++;
    frame++;
  
    if (now > 1000 + lastTime) {
        var fps = Math.round((frame * 1000) / (now - lastTime));
        console.log(`${new Date()} 1S内 FPS：`, fps);
        frame = 0;
        lastTime = now;
    };
  
    rAF(loop);
}
 
loop();
```

#### 动画

一是这一帧要画什么东西，二是这一帧与上一帧的时间差中要发生什么变化。


## 参考

[canvas 图像旋转](https://aotu.io/notes/2017/05/25/canvas-img-rotate-and-flip/index.html)

[Web 动画帧率（FPS）计算](https://www.cnblogs.com/coco1s/p/8029582.html)

[Canvas 半知半解](https://www.kancloud.cn/dennis/canvas/340110)

[文字textAlign属性](http://www.w3school.com.cn/html5/canvas_textalign.asp)
