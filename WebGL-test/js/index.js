// 全局变量
var isMobile = false;
var canvas, cw, ch, aspectRatio/* = 16/9*/, gl;
var scene = {
    perspMatrix: [],    // 从视图坐标射影变换到裁剪坐标，产生透视效果
    viewMatrix: [],     // 从世界坐标旋转到视图坐标（以相机为原点)
    objList: [],
    draw: function() {},
    update: function() {},
    fps: 1,
}

// 程序入口
function entry() {
    // 识别移动端
    isMobile = /Android|webOS|iPhone|iPod|iPad|BlackBerry/i.test(navigator.userAgent) ? true : false;

    // 获取绘图环境
    canvas = document.getElementById("canvas");
    gl = canvas.getContext("experimental-webgl");
    if (!gl) {
        alert("There's no WebGL context available. ");
        return;
    }

    // 初始化画布
    resizeCanvas();
    window.onresize = resizeCanvas;

    // 开始动画
    animate();  // 用于更新图像
    elapse();   // 用于更新数据

    // 载入主场景
    load_mainScene();
}

// onresize回调函数
function resizeCanvas() {
    cw = window.innerWidth;
    ch = window.innerHeight;
    /*if (cw/ch > aspectRatio) {
        cw = ch*aspectRatio;
    } else if (cw/ch < aspectRatio) {
        ch = cw/aspectRatio;
    }*/
    aspectRatio = cw/ch;
    canvas.width = cw;
    canvas.height = ch;
    gl.viewport(0, 0, cw, ch); // 定义GL视口位置
    scene.draw();
    //alert('resize: (' +cw.toString()+ ', '+ ch.toString() + ')');
}

// 动画生成函数
function animate() {
    requestAnimationFrame(animate);
    scene.draw();
}

// 时间演化函数
function elapse() {
    setTimeout(elapse, 1000/scene.fps);
    scene.update();
}
