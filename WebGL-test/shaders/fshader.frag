uniform mediump vec2 uFogRange;
varying mediump vec3 vFragmentColor;
varying mediump float vDist;

void main(void) {
        mediump float fogFactor = clamp((uFogRange.y-vDist)/(uFogRange.y-uFogRange.x), 0.0, 1.0);
        gl_FragColor = vec4(fogFactor*vFragmentColor, 1.0);
}
