// 加载外部资源（异步！）
function load_maniScene() {
    var vertexShaderScript = new Object(), fragmentShaderScript = new Object();
    var remain = {num:2}, 
        onfinishFunc = function() {
            gl.program = createProgram(gl, vertexShaderScript, fragmentShaderScript);
            mainScene();
        };
    loadTextFile('shaders/vshader.vert', vertexShaderScript, remain, onfinishFunc, function() {});
    loadTextFile('shaders/fshader.frag', fragmentShaderScript, remain, onfinishFunc, function() {});
}

// 主函数
function mainScene() {
    // 1. 初始化工作
    setup_mainScene();

    // 2. 场景绘制与更新函数
    scene.draw = draw_mainScene;
    scene.update = update_mainScene;
    scene.fps = 30;

    // 3. 事件响应函数
    canvas.addEventListener('mousedown', mousedownFunc);
    canvas.addEventListener('touchstart', touchstartFunc);
    canvas.addEventListener('mousemove', mousemoveFunc);
    canvas.addEventListener('touchmove', touchmoveFunc);
    //   注意这里用window的mouseup事件，以处理用户将鼠标移开canvas后释放的情况
    window.addEventListener('mouseup', mouseupFunc);
    window.addEventListener('touchend', touchendFunc);
}

// 场景初始化与全局设置
function setup_mainScene() {
    // 1. GL设置
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE_MINUS_DST_COLOR, gl.ONE); // 曝光效果
    gl.disable(gl.DEPTH_TEST);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);

    // 2. 对象设置
    //   观察角度设置
    scene.perspMatrix = perspectiveMatrix4(PI/4, aspectRatio, 0.1, 10);
    scene.viewMatrix = orthogonalMatrix4([0, 0, 0], [0, 0, 1.5]);
    scene.rotatingMatrix = identityMatrix4();
    scene.rotationMatrix = identityMatrix4();
    //   三角形阵列
    var triArray = new TriangleArray();
    for (var i=0; i<300; i++) {
        var r = pow(rand(), 1/3),
            theta = acos(rand(-1, 1)),
            phi = rand(0, 2*PI);
        var pos = [r*sin(theta)*cos(phi), r*sin(theta)*sin(phi), r*cos(theta)];
        var dir = [rand()*2*PI, rand()*2*PI, rand()*2*PI];
        var posUpdateAngles = [rand(-1, 1)*PI/scene.fps/1200, rand(-1, 1)*PI/scene.fps/1200, rand(-1, 1)*PI/scene.fps/1200],
            dirUpdateAngles = [rand(-1, 1)*PI/scene.fps/30, rand(-1, 1)*PI/scene.fps/30, rand(-1, 1)*PI/scene.fps/30];
            triArray.push(pos, dir, 0.025, HSV2RGB([rand(), 0.8, 1.0]), posUpdateAngles, dirUpdateAngles);
    }
    triArray.setup();
    scene.objList.push(triArray);
}

// 主绘图函数
function draw_mainScene() {
    // 1. 清空帧缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 2. 使用着色程序
    gl.useProgram(gl.program);

    // 3. Uniform变量设置
    //   世界坐标到裁剪坐标
    associateUniformMatrix4WithData(gl, gl.program, 'uProjMatrix', multiply4(
        scene.perspMatrix, 
        scene.viewMatrix
    ));
    //   局部坐标到世界坐标
    associateUniformMatrix4WithData(gl, gl.program, 'uModelMatrix',multiply4(
        scene.rotatingMatrix,
        scene.rotationMatrix
    ));
    //   观察点的世界坐标
    associateUniform4WithData(gl, gl.program, 'uEye', [
        -scene.viewMatrix[12],
        -scene.viewMatrix[13],
        -scene.viewMatrix[14],
        -scene.viewMatrix[15]
    ]);
    //   远处雾化
    associateUniform2WithData(gl, gl.program, 'uFogRange', [1.0, 2.5]);

    // 4. 绘制对象
    for (var i = 0; i < scene.objList.length; i++) {
        scene.objList[i].draw();
    }

    gl.flush();
}

// 主更新函数
function update_mainScene() {
    // 1. 检测触发事件（例如：碰撞检测）

    // 2. 更新对象
    for (var i = 0; i < scene.objList.length; i++) {
        scene.objList[i].update();
    }
}

// 事件响应函数
var lastMouseX = -1, lastMouseY =-1, draging = false;
function mousedownFunc(event) {
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    draging = true;
}

function mousemoveFunc(event) {
    var x = event.clientX, y = event.clientY;
    if (draging) {
        var factor = PI/4/ch;
        var alpha = factor*(y-lastMouseY), beta = factor*(x-lastMouseX);
        // 注意这里绕x轴旋转其实改变的是y方向，x轴不变；y轴同理
        scene.rotatingMatrix = orthogonalMatrix4([-alpha, -beta, 0], [0, 0, 0]);
    }
}

function mouseupFunc(event) {
    if (draging) {
        draging = false;
        scene.rotationMatrix = multiply4(
            scene.rotatingMatrix,
            scene.rotationMatrix
        );
        scene.rotatingMatrix = identityMatrix4();
    }
}

function touchstartFunc(event) {
    if (event.targetTouches.length == 1) {
        lastMouseX = event.targetTouches[0].clientX;
        lastMouseY = event.targetTouches[0].clientY;
        draging = true;
    }
}

function touchmoveFunc(event) {
    var x = event.targetTouches[0].clientX, y = event.targetTouches[0].clientY;
    if (event.targetTouches.length == 1) {
        if (draging) {
            var factor = PI/4/ch;
            var alpha = factor*(y-lastMouseY), beta = factor*(x-lastMouseX);
            // 注意这里绕x轴旋转其实改变的是y方向，x轴不变；y轴同理
            scene.rotatingMatrix = orthogonalMatrix4([-alpha, -beta, 0], [0, 0, 0]);
        }
    }
}

function touchendFunc(event) {
    if (event.targetTouches.length == 0) {
        if (draging) {
            draging = false;
            scene.rotationMatrix = multiply4(
                scene.rotatingMatrix,
                scene.rotationMatrix
            );
            scene.rotatingMatrix = identityMatrix4();
        }
    }
}
