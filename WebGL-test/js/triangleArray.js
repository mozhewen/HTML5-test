function triangleArray() {
    this.vertexBuffer = gl.createBuffer(),
    this.vertexColorBuffer = gl.createBuffer();
    // 用于.draw
    this.vertexArray = new Array(),
    this.vertexColorArray = new Array();
    // 用于.update
    this.element = new Array();

    this.length = this.element.length;
}

triangleArray.prototype.push = function (pos, dir, size, color, posUpdateAngles, dirUpdateAngles) {
    var dirMatrix = orthogonalMatrix4(dir, [0, 0, 0]);
    this.element.push({
        pos: pos,
        dirMatrix: dirMatrix,
        size: size,
        posUpdateMatrix: orthogonalMatrix4(posUpdateAngles, [0, 0, 0]),
        dirUpdateMatrix: orthogonalMatrix4(dirUpdateAngles, [0, 0, 0])
    });

    var transferMatrix = translate4(dirMatrix, pos);
    this.vertexArray.push(...transform4(transferMatrix, [0, size, 0, 1]));
    this.vertexArray.push(...transform4(transferMatrix, [size*cos(7/6*PI), size*sin(7/6*PI), 0, 1]));
    this.vertexArray.push(...transform4(transferMatrix, [size*cos(11/6*PI), size*sin(11/6*PI), 0, 1]));
    this.vertexColorArray.push(...color, ...color, ...color);

    this.length = this.element.length;
}

triangleArray.prototype.draw = function () {
    writeArrayBuffer(gl, this.vertexBuffer, this.vertexArray, gl.DYNAMIC_DRAW);
    associateVertexAttribWithBuffer(gl, gl.program, "aVertexPosition", this.vertexBuffer, 4, gl.FLOAT, 0, 0);
    writeArrayBuffer(gl, this.vertexColorBuffer, this.vertexColorArray, gl.DYNAMIC_DRAW);
    associateVertexAttribWithBuffer(gl, gl.program, "aVertexColor", this.vertexColorBuffer, 3, gl.FLOAT, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, this.length*3);
}

triangleArray.prototype.update = function () {
    for (var i = 0; i < this.length; i++) {
        // 更新坐标与朝向
        this.element[i].pos = transform43(this.element[i].posUpdateMatrix, this.element[i].pos);
        this.element[i].dirMatrix = multiply4(this.element[i].dirUpdateMatrix, this.element[i].dirMatrix);

        var transferMatrix = translate4(this.element[i].dirMatrix, this.element[i].pos);
        var size = this.element[i].size;
        this.vertexArray.splice(12*i, 4, ...transform4(transferMatrix, [0, size, 0, 1]));
        this.vertexArray.splice(12*i+4, 4, ...transform4(transferMatrix, [size*cos(7/6*PI), size*sin(7/6*PI), 0, 1]));
        this.vertexArray.splice(12*i+8, 4, ...transform4(transferMatrix, [size*cos(11/6*PI), size*sin(11/6*PI), 0, 1]));
    }
}
