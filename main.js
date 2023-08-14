import { solve } from "./pm-solver.js";
import { N_CELLS } from "./config.js";

const vertexShaderSource = `#version 300 es

in vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es

precision highp float;

out vec4 outColor;

void main() {
  outColor = vec4(1, 0, 0.5, 1);
}
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return undefined;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  return undefined;
}

function main() {
  const canvas = document.createElement("canvas");
  canvas.width = Math.min(window.innerWidth, window.innerHeight);
  canvas.height = canvas.width;
  document.body.appendChild(canvas);

  const gl = canvas.getContext("webgl2", { antialias: false });
  const isWebGL2 = !!gl;
  if (!isWebGL2) {
    document.getElementById("info").innerHTML =
      'WebGL 2 is not available.  See <a href="https://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">How to get a WebGL 2 implementation</a>';
  }

  canvas.addEventListener(
    "webglcontextlost",
    function (event) {
      event.preventDefault();
    },
    false
  );

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

  const NUM_PARTICLES = 10;

  const program = createProgram(gl, vertexShader, fragmentShader);
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = new Array(NUM_PARTICLES * 2)
    .fill(0)
    .map((x) => Math.random() - 0.5);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(positionAttributeLocation);

  const size = 2;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.vertexAttribPointer(
    positionAttributeLocation,
    size,
    type,
    normalize,
    stride,
    offset
  );

  let t = 0;
  function render(dt) {
    dt *= 0.00000000001;
    t += dt;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);

    var out = new Float32Array(NUM_PARTICLES * 2);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.getBufferSubData(gl.ARRAY_BUFFER, 0, out);
    console.log(t, dt);
    let res = solve(out, t, dt)[0];
    let _res = new Float32Array(NUM_PARTICLES * 2)
      .fill(0)
      .map((_, i) => res[i % 2][Math.floor(i / 2)] / N_CELLS - 0.5);
    gl.bufferSubData(
      gl.ARRAY_BUFFER,
      0,
      new Float32Array(NUM_PARTICLES * 2).fill(0).map((_, i) => _res[i])
    );

    gl.bindVertexArray(vao);
    gl.drawArrays(gl.POINTS, 0, NUM_PARTICLES);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
