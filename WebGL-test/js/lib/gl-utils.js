/**
 * 加载文本文件（异步!）
 * 
 * @param {string} fileName     源代码文件地址
 * @param source                结果输出到source对象的text属性中
 * @param remain                剩余文件请求数量
 * @param {function} onfinish   函数，加载完毕后执行
 * @param {function} onabort    函数，加载中断时执行
 */
function loadTextFile(fileName, source, remain, onfinish, onabort) {
    var request = new XMLHttpRequest();
    request.onload = function() {
        if (request.status == 200) {
            source.text = request.responseText;
            remain.num--;
            if (remain.num == 0) onfinish();
        } else {
            alert('Request: ' + fileName +'\n' + 
                request.status.toString() + ' - ' + request.statusText);
            onabort(/**/);
        }
    };
    request.open('GET', fileName, true);
    request.send();
}

/**
 * 通过着色器脚本创建程序
 * 
 * 着色器代码保存在*ShaderScript对象的text属性中
 * 
 * @param gl                    WebGL环境
 * @param vertexShaderScript    顶点着色器脚本
 * @param fragmentShaderScript  片元着色器脚本
 * @return program
 */
function createProgram(gl, vertexShaderScript, fragmentShaderScript) {
    // 编译顶点着色器
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderScript.text);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        alert("Couldn't compile the vertex shader");
        gl.deleteShader(vertexShader);
        return;
    }
    // 编译片元着色器
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderScript.text);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        alert("Couldn't compile the fragment shader");
        gl.deleteShader(fragmentShader);
        return;
    }
    // 创建着色程序
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert("Unable to initialise shaders");
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        return;
    }
    return program;
}

/**
 * 将数据写入数组缓冲区
 * 
 * @param gl                    WebGL环境
 * @param arrayBuffer           缓冲区对象
 * @param {Array} bufferData    待写入缓冲区的数据
 * @param type                  缓冲区数据类型
 */
function writeArrayBuffer(gl, arrayBuffer, bufferData, type) {
    fData= new Float32Array(bufferData);
    gl.bindBuffer(gl.ARRAY_BUFFER, arrayBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, fData, type);
}

function associateVertexAttribWithBuffer(gl, program, attribName, arrayBuffer, size, type, stride, offset) {
    gl.bindBuffer(gl.ARRAY_BUFFER, arrayBuffer);
    var attribLocation = gl.getAttribLocation(program, attribName);
    gl.enableVertexAttribArray(attribLocation);
    gl.vertexAttribPointer(attribLocation, size, type, false, stride, offset);
}

// 其他类似的函数只需把数字改一下
function associateUniform2WithData(gl, program, uniformName, uniformData) {
    var uniformLocation = gl.getUniformLocation(program, uniformName);
    gl.uniform2f(uniformLocation, ...uniformData);
}

function associateUniform4WithData(gl, program, uniformName, uniformData) {
    var uniformLocation = gl.getUniformLocation(program, uniformName);
    gl.uniform4f(uniformLocation, ...uniformData);
}

function associateUniformMatrix4WithData(gl, program, uniformName, uniformData) {
    var uniformLocation = gl.getUniformLocation(program, uniformName);
    gl.uniformMatrix4fv(uniformLocation, false, new Float32Array(uniformData));
}
