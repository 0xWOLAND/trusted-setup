const WIDTH = 500;
const HEIGHT = 500;

const H = 1;
const PARTICLE_MASS = 5.0;
const PARTICLE_SIZE = 3.0;

function solve(g) {
  let M = new Array(WIDTH).fill(new Array(HEIGHT).fill(0));

  for (let i = 0; i < NUM_PARTICLES; i += 2) {
    const x = (WIDTH * g[i]) / 2 + WIDTH / 2;
    const y = (HEIGHT * g[i + 1]) / 2 + HEIGHT / 2;

    const dx = x - Math.floor(x / H) * H;
    const dy = y - Math.floor(y / H) * H;

    const m = ((1 - dx / H) * (1 - dy / H)) / (H * H);

    const _x = Math.floor(x);
    const _y = Math.floor(y);

    M[_x][_y] = PARTICLE_MASS * m;
  }
  console.log(M);
}
