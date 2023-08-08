const vs = `#version 300 es
#define POSITION_LOCATION 0
#define VELOCITY_LOCATION 1
#define SPAWNTIME_LOCATION 2
#define LIFETIME_LOCATION 3
#define ID_LOCATION 4

precision highp float;
precision highp int;
precision highp sampler3D;

uniform float u_time;
uniform vec2 u_acceleration;

layout(location = POSITION_LOCATION) in vec2 a_position;
layout(location = VELOCITY_LOCATION) in vec2 a_velocity;
layout(location = SPAWNTIME_LOCATION) in float a_spawntime;
layout(location = LIFETIME_LOCATION) in float a_lifetime;
layout(location = ID_LOCATION) in float a_ID;

out vec2 v_position;
out vec2 v_velocity;
out float v_spawntime;
out float v_lifetime;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main()
{
    if ((a_spawntime == 0.0) || (u_time - a_spawntime > a_lifetime) || a_position.y < -0.5) {
        v_position = a_position;
        v_velocity = vec2(rand(vec2(a_ID, 0.0)) - 0.5, rand(vec2(a_ID, a_ID)));
        v_spawntime = u_time;
        v_lifetime = 5000.0;
    } else {
        v_velocity = a_velocity + 0.01 * u_acceleration;
        v_position = a_position + 0.01 * v_velocity;
        v_spawntime = a_spawntime;
        v_lifetime = a_lifetime;
    }

    gl_Position = vec4(v_position, 0.0, 1.0);
    gl_PointSize = 2.0;
}
`;

const fs = `#version 300 es 
precision highp float;
precision highp int;

uniform vec4 u_color;

out vec4 color;

void main() {
    color = u_color;
}
`;
// -- Init Canvas
var canvas = document.createElement("canvas");
canvas.width = Math.min(window.innerWidth, window.innerHeight);
canvas.height = canvas.width;
document.body.appendChild(canvas);

// -- Init WebGL Context
var gl = canvas.getContext("webgl2", { antialias: false });
var isWebGL2 = !!gl;
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

// -- Declare variables for the particle system

var NUM_PARTICLES = 1000;
var ACCELERATION = -1.0;

var appStartTime = Date.now();
var currentSourceIdx = 0;

var program = createProgram(
  gl,
  vs,
  fs,
  ["v_position", "v_velocity", "v_spawntime", "v_lifetime"],
  gl.SEPARATE_ATTRIBS
);

// Get uniform locations for the draw program
var drawTimeLocation = gl.getUniformLocation(program, "u_time");
var drawAccelerationLocation = gl.getUniformLocation(program, "u_acceleration");
var drawColorLocation = gl.getUniformLocation(program, "u_color");

// -- Initialize particle data

var particlePositions = new Float32Array(NUM_PARTICLES * 2).fill(1.0);
var particleVelocities = new Float32Array(NUM_PARTICLES * 2);
var particleSpawntime = new Float32Array(NUM_PARTICLES);
var particleLifetime = new Float32Array(NUM_PARTICLES);
var particleIDs = new Float32Array(NUM_PARTICLES);

var POSITION_LOCATION = 0;
var VELOCITY_LOCATION = 1;
var SPAWNTIME_LOCATION = 2;
var LIFETIME_LOCATION = 3;
var ID_LOCATION = 4;
var NUM_LOCATIONS = 5;

for (var p = 0; p < NUM_PARTICLES; ++p) {
  particleVelocities[p * 2] = 0.0;
  particleVelocities[p * 2 + 1] = 0.0;
  particleSpawntime[p] = 0.0;
  particleLifetime[p] = 0.0;
  particleIDs[p] = p;
}

// -- Init Vertex Arrays and Buffers
var particleVAOs = [gl.createVertexArray(), gl.createVertexArray()];

// Transform feedback objects track output buffer state
var particleTransformFeedbacks = [
  gl.createTransformFeedback(),
  gl.createTransformFeedback(),
];

var particleVBOs = new Array(particleVAOs.length);

for (var i = 0; i < particleVAOs.length; ++i) {
  particleVBOs[i] = new Array(NUM_LOCATIONS);

  // Set up input
  gl.bindVertexArray(particleVAOs[i]);

  particleVBOs[i][POSITION_LOCATION] = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, particleVBOs[i][POSITION_LOCATION]);
  gl.bufferData(gl.ARRAY_BUFFER, particlePositions, gl.STREAM_COPY);
  gl.vertexAttribPointer(POSITION_LOCATION, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(POSITION_LOCATION);

  particleVBOs[i][VELOCITY_LOCATION] = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, particleVBOs[i][VELOCITY_LOCATION]);
  gl.bufferData(gl.ARRAY_BUFFER, particleVelocities, gl.STREAM_COPY);
  gl.vertexAttribPointer(VELOCITY_LOCATION, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(VELOCITY_LOCATION);

  particleVBOs[i][SPAWNTIME_LOCATION] = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, particleVBOs[i][SPAWNTIME_LOCATION]);
  gl.bufferData(gl.ARRAY_BUFFER, particleSpawntime, gl.STREAM_COPY);
  gl.vertexAttribPointer(SPAWNTIME_LOCATION, 1, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(SPAWNTIME_LOCATION);

  particleVBOs[i][LIFETIME_LOCATION] = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, particleVBOs[i][LIFETIME_LOCATION]);
  gl.bufferData(gl.ARRAY_BUFFER, particleLifetime, gl.STREAM_COPY);
  gl.vertexAttribPointer(LIFETIME_LOCATION, 1, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(LIFETIME_LOCATION);

  particleVBOs[i][ID_LOCATION] = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, particleVBOs[i][ID_LOCATION]);
  gl.bufferData(gl.ARRAY_BUFFER, particleIDs, gl.STATIC_READ);
  gl.vertexAttribPointer(ID_LOCATION, 1, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(ID_LOCATION);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Set up output
  gl.bindTransformFeedback(
    gl.TRANSFORM_FEEDBACK,
    particleTransformFeedbacks[i]
  );
  gl.bindBufferBase(
    gl.TRANSFORM_FEEDBACK_BUFFER,
    0,
    particleVBOs[i][POSITION_LOCATION]
  );
  gl.bindBufferBase(
    gl.TRANSFORM_FEEDBACK_BUFFER,
    1,
    particleVBOs[i][VELOCITY_LOCATION]
  );
  gl.bindBufferBase(
    gl.TRANSFORM_FEEDBACK_BUFFER,
    2,
    particleVBOs[i][SPAWNTIME_LOCATION]
  );
  gl.bindBufferBase(
    gl.TRANSFORM_FEEDBACK_BUFFER,
    3,
    particleVBOs[i][LIFETIME_LOCATION]
  );
}

gl.useProgram(program);
gl.uniform4f(drawColorLocation, 1.0, 1.0, 1.0, 1.0);
gl.uniform2f(drawAccelerationLocation, 0.0, ACCELERATION);

gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

function render() {
  var time = Date.now() - appStartTime;
  var destinationIdx = (currentSourceIdx + 1) % 2;

  // Set the viewport
  gl.viewport(0, 0, canvas.width, canvas.height - 10);

  // Clear color buffer
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Toggle source and destination VBO
  var sourceVAO = particleVAOs[currentSourceIdx];
  var destinationTransformFeedback = particleTransformFeedbacks[destinationIdx];

  gl.bindVertexArray(sourceVAO);

  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, destinationTransformFeedback);
  console.log(particleVBOs[destinationIdx][POSITION_LOCATION]);
  gl.bindBufferBase(
    gl.TRANSFORM_FEEDBACK_BUFFER,
    0,
    particleVBOs[destinationIdx][POSITION_LOCATION]
  );

  // const res = new Float32Array(NUM_PARTICLES * 2);
  // gl.getBufferSubData(gl.TRANSFORM_FEEDBACK_BUFFER, 0, res);
  // console.log(res);

  gl.bindBufferBase(
    gl.TRANSFORM_FEEDBACK_BUFFER,
    1,
    particleVBOs[destinationIdx][VELOCITY_LOCATION]
  );
  gl.bindBufferBase(
    gl.TRANSFORM_FEEDBACK_BUFFER,
    2,
    particleVBOs[destinationIdx][SPAWNTIME_LOCATION]
  );
  gl.bindBufferBase(
    gl.TRANSFORM_FEEDBACK_BUFFER,
    3,
    particleVBOs[destinationIdx][LIFETIME_LOCATION]
  );

  // Set uniforms
  gl.uniform1f(drawTimeLocation, time);

  // Draw particles using transform feedback
  gl.beginTransformFeedback(gl.POINTS);
  gl.drawArrays(gl.POINTS, 0, NUM_PARTICLES);
  gl.endTransformFeedback();

  // Ping pong the buffers
  currentSourceIdx = (currentSourceIdx + 1) % 2;

  requestAnimationFrame(render);
}

requestAnimationFrame(render);
