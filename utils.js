export function createShader(gl, src, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

export function createProgram(
  gl,
  vertexShaderSource,
  fragmentShaderSource,
  varyings,
  feedbackType
) {
  var vshader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  var fshader = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

  var program = gl.createProgram();
  gl.attachShader(program, vshader);
  gl.deleteShader(vshader);
  gl.attachShader(program, fshader);
  gl.deleteShader(fshader);

  // set only if feedback varying are defined
  if (varyings && varyings.length) {
    gl.transformFeedbackVaryings(program, varyings, feedbackType);
  }
  gl.linkProgram(program);

  // check status
  var log = gl.getProgramInfoLog(program);
  if (log) {
    console.error("Program Info: ", log);
    gl.deleteProgram(program);
    return null;
  }

  log = gl.getShaderInfoLog(vshader);
  if (log) {
    console.error("Shader Info: ", log);
    gl.deleteProgram(program);
    return null;
  }

  return program;
}
export function makeBuffer(gl, sizeOrData, usage) {
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, sizeOrData, usage);
  return buf;
}

export function makeVertexArray(gl, bufLocPairs) {
  const va = gl.createVertexArray();
  gl.bindVertexArray(va);
  for (const [buffer, loc] of bufLocPairs) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(
      loc, // attribute location
      2, // number of elements
      gl.FLOAT, // type of data
      false, // normalize
      0, // stride (0 = auto)
      0 // offset
    );
  }
  return va;
}
export function invert(currentIndex) {
  return (currentIndex + 1) % 2;
}
