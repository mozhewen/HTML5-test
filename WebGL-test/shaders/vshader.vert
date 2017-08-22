attribute mediump vec4 aVertexPosition;
attribute mediump vec3 aVertexColor;
uniform mediump mat4 uProjMatrix;
uniform mediump mat4 uModelMatrix;
uniform mediump vec4 uEye;
varying mediump vec3 vFragmentColor;
varying mediump float vDist;

void main(void) {
    gl_Position = uProjMatrix * uModelMatrix * aVertexPosition;
    vFragmentColor = aVertexColor;
    vDist = distance(vec3(uEye), vec3(uModelMatrix * aVertexPosition));
}
