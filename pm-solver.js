import { N_CELLS } from "./config.js";
import { fourier_grid } from "./fourier.js";
import { update } from "./integrate.js";
const WIDTH = N_CELLS;
const HEIGHT = N_CELLS;

const PARTICLE_MASS = 5.0;
const PARTICLE_SIZE = 3.0;
const G = 6.6743 * 1e-11;
const fgrid = fourier_grid();
let t = 0.01;
const dt = 0.5;

export function solve(g) {
  const positions = [
    [...g.filter((_, i) => i % 2 == 0)],
    [...g.filter((_, i) => i % 2 == 1)],
  ];
  const velocities = Array.from(Array(2), () =>
    new Array(10).fill(0).map((x) => Math.random() * 10)
  );
  const density = Array.from(Array(N_CELLS), () =>
    new Array(N_CELLS).fill(0).map((_, i) => i)
  );
  const [_positions, _velocities] = update(
    positions,
    velocities,
    fgrid,
    density,
    t,
    dt
  );
  t + dt;
  return [_positions, _velocities];
}
