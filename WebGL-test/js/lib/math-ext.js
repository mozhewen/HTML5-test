// 1. 数学函数缩写

var PI = Math.PI;

var sin = Math.sin;
var cos = Math.cos;
var tan = Math.tan;
var asin = Math.asin;
var acos = Math.acos;
var atan = Math.atan;
var pow = Math.pow;

var max = Math.max;
var min = Math.min;
var rand = function (a, b) {
    if (arguments.length == 0){
        return Math.random();
    } else {
        return a+Math.random()*(b-a);
    }
};

// 2. 矩阵相关函数扩展

/**
 * 3维矢量转4维矢量
 * 
 * @param {Array} x 3维矢量
 * @return 4维矢量
 */
function v3Tov4(x) {
    var y = new Array(...x);

    y.push(1);
    return y;
}

// WebGL中，矩阵是按列优先存储的！

/**
 * 计算A*x
 * 
 * @param {Array} A 4*4矩阵
 * @param {Array} x 3维矢量，假设x3=1
 * @return 3维矢量，A*x的值
 */
function transform43(A, x) {
    var y = new Array();

    y[0] = A[0]*x[0] + A[4]*x[1] + A[8]*x[2] + A[12];
    y[1] = A[1]*x[0] + A[5]*x[1] + A[9]*x[2] + A[13];
    y[2] = A[2]*x[0] + A[6]*x[1] + A[10]*x[2] + A[14];
    return y;
}

/**
 * 计算A*x
 * 
 * @param {Array} A 4*4矩阵
 * @param {Array} x 4维矢量
 * @return A*x的值
 */
function transform4(A, x) {
    var y = new Array();

    y[0] = A[0]*x[0] + A[4]*x[1] + A[8]*x[2] + A[12]*x[3];
    y[1] = A[1]*x[0] + A[5]*x[1] + A[9]*x[2] + A[13]*x[3];
    y[2] = A[2]*x[0] + A[6]*x[1] + A[10]*x[2] + A[14]*x[3];
    y[3] = A[3]*x[0] + A[7]*x[1] + A[11]*x[2] + A[15]*x[3];
    return y;
}

/**
 * 计算A*B
 * 
 * @param {Array} A 4*4矩阵
 * @param {Array} B 4*4矩阵
 * @return A*B的值
 */
function multiply4(A, B) {
    var C = new Array();

    for (var i=0; i<4; i++){
        C[0+4*i] = A[0]*B[0+4*i] + A[4]*B[1+4*i] + A[8]*B[2+4*i] + A[12]*B[3+4*i];
        C[1+4*i] = A[1]*B[0+4*i] + A[5]*B[1+4*i] + A[9]*B[2+4*i] + A[13]*B[3+4*i];
        C[2+4*i] = A[2]*B[0+4*i] + A[6]*B[1+4*i] + A[10]*B[2+4*i] + A[14]*B[3+4*i];
        C[3+4*i] = A[3]*B[0+4*i] + A[7]*B[1+4*i] + A[11]*B[2+4*i] + A[15]*B[3+4*i];
    }
    return C;
}

/**
 * 构造单位矩阵
 * 
 * @return 单位矩阵
 */
function identityMatrix4() {
    var A = new Array();

    A[0] = 1; A[4] = 0; A[8] = 0; A[12] = 0;
    A[1] = 0; A[5] = 1; A[9] = 0; A[13] = 0;
    A[2] = 0; A[6] = 0; A[10] = 1; A[14] = 0;
    A[3] = 0; A[7] = 0; A[11] = 0; A[15] = 1;
    return A;
}

/**
 * 构造正交矩阵
 * 
 * 旋转部分采用X1Y2Z3形式(分别表示绕XYZ轴旋转)(https://en.wikipedia.org/wiki/Euler_angles)，先旋转后平移
 * 
 * @param {Array} TBAngles Tait-Bryan角alpha, beta, gamma
 * @param {Array} displacement 平移方向
 * @return 旋转矩阵
 */
function orthogonalMatrix4(TBAngles, displacement) {
    var c1 = cos(TBAngles[0]), s1 = sin(TBAngles[0]),
        c2 = cos(TBAngles[1]), s2 = sin(TBAngles[1]),
        c3 = cos(TBAngles[2]), s3 = sin(TBAngles[2]);
    var A = new Array();

    A[0] = c2*c3; A[4] = -c2*s3; A[8] = s2; A[12] = displacement[0];
    A[1] = c1*s3+c3*s1*s2; A[5] = c1*c3-s1*s2*s3; A[9]=-c2*s1; A[13] = displacement[1];
    A[2] = s1*s3-c1*c3*s2; A[6] = c3*s1+c1*s2*s3; A[10] = c1*c2; A[14] = displacement[2];
    A[3] = 0; A[7] = 0; A[11] = 0; A[15] = 1; 
    return A;
}

/**
 * 构造透视矩阵
 * 
 * @param {*} fov 垂直视场角 
 * @param {*} aspect 宽高比
 * @param {*} near 近裁面距离
 * @param {*} far 远裁面距离
 * @return 透视矩阵
 */
function perspectiveMatrix4(fov, aspect, near, far) {
    var A = new Array();

    A[0] = 1/(aspect*tan(fov/2)); A[4] = 0;A[8] = 0; A[12] = 0;
    A[1] = 0; A[5] = 1/tan(fov/2); A[9] = 0; A[13] = 0;
    A[2] = 0; A[6] = 0; A[10] = (far+near)/(far-near); A[14] = -2*far*near/(far-near);
    A[3] = 0; A[7] = 0; A[11] = 1; A[15] = 0;
    return A;
}

/**
 * 在正交矩阵A的基础上平移(左乘)
 * 
 * @param {Array} A 必须为正交矩阵，且A30~A32=0, A33=1
 * @param {Array} displacement 平移方向
 */
function translate4(A, displacement) {
    var B = new Array(...A);

    B[12] += displacement[0];
    B[13] += displacement[1];
    B[14] += displacement[2];
    return B;
}

// 3. 色彩空间变换

/**
 * HSV空间变换到RGB空间
 * 
 * @param {Array} HSV 数组，三个分量分别代表H(色相), S(饱和度), V(明度)，取值范围均为[0.0, 1.0]
 * @return RGB颜色
 */
function HSV2RGB(HSV){
    var H = HSV[0], S = HSV[1], V = HSV[2];
    var f = (H*6)%1,
        m = V*(1-S), inc = V*f+m*(1-f), dec = V*(1-f)+m*f;
    var RGB = new Array();

    if (0 <= H && H < 1/6) {
        RGB[0] = V; RGB[1] = inc; RGB[2] = m;
    } else if (1/6 <= H && H < 1/3) {
        RGB[0] = dec; RGB[1] = V; RGB[2] = m;
    } else if (1/3 <= H && H < 1/2) {
        RGB[0] = m; RGB[1] = V; RGB[2] = inc;
    } else if (1/2 <= H && H < 2/3) {
        RGB[0] = m; RGB[1] = dec; RGB[2] = V;
    } else if (2/3 <= H && H < 5/6) {
        RGB[0] = inc; RGB[1] = m; RGB[2] = V;
    } else if (5/6 <= H && H <= 1) {
        RGB[0] = V; RGB[1] = m; RGB[2] = dec;
    }
    return RGB;
}

/**
 * RGB空间变换到HSV空间
 * 
 * @param {Array} RGB 数组，三个分量分别代表R(红), G(绿), B(蓝)，取值范围均为[0.0, 1.0]
 * @return HSV颜色
 */
function RGB2HSV(RGB){
    var R = RGB[0], G = RGB[1], B = RGB[2];
    var V = max(R, G, B), m = min(R, G, B),
        S = (V-m)/V, H;

    if (R == V) {
        H = (G-B)/(V-m)/6;
    } else if (G == V) {
        H = 1/3+(B-R)/(V-m)/6;
    }else if (B == V) {
        H = 2/3+(R-G)/(V-m)/6;
    }
    if (H < 0) H += 1;
    return [H, S, V];
}
