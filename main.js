const vertexShaderSource = `#version 300 es

uniform float uPointSize;
uniform vec2 uPosition;

void main() {
    gl_Position = vec4(uPosition, 0.0, 1.0);
    gl_PointSize = uPointSize;
}
`;

const fragmentShaderSource = `#version 300 es
precision mediump float; 

uniform int uIndex;
uniform vec4 uColors[3];

out vec4 fragColor;

void main() {
    fragColor = uColors[uIndex];
}`;

const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl2");

const program = gl.createProgram();

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);
gl.attachShader(program, vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

gl.useProgram(program);

const uPositionLoc = gl.getUniformLocation(program, "uPosition");
const uPointSizeLoc = gl.getUniformLocation(program, "uPointSize");

gl.uniform1f(uPointSizeLoc, 100);
gl.uniform2f(uPositionLoc, 0, -0.2);

const uIndexLoc = gl.getUniformLocation(program, "uIndex");
const uColorsLoc = gl.getUniformLocation(program, "uColors");
gl.uniform1i(uIndexLoc, 2);
gl.uniform4fv(uColorsLoc, [1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1]);

gl.drawArrays(gl.POINTS, 0, 1);
