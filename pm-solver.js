const WIDTH = 500;
const HEIGHT = 500;

const PARTICLE_MASS = 5.0;
const PARTICLE_SIZE = 3.0;
const G = 6.6743 * 1e-11;

function solve(g) {
  let M = new Array(WIDTH).fill(new Array(HEIGHT).fill(0));

  for (let i = 0; i < NUM_PARTICLES; i += 2) {
    const x = (WIDTH * g[i]) / 2 + WIDTH / 2;
    const y = (HEIGHT * g[i + 1]) / 2 + HEIGHT / 2;

    for (let _dx = -1; _dx < 1; _dx++) {
      for (let _dy = -1; _dy < 1; _dy++) {
        const dx = x - Math.floor(x) + _dx;
        const dy = y - Math.floor(y) + _dy;

        const m = (1 - dx) * (1 - dy);

        const _x = Math.floor(x);
        const _y = Math.floor(y);

        if (!(0 <= _x && _x < WIDTH) && !(0 <= _y && _y < HEIGHT)) continue;

        M[_x][_y] = PARTICLE_MASS * m;
      }
    }
  }

  console.log(M);
}
