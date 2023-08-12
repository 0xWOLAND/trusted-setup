import { N_CELLS } from "./config.js";
import { fourier_grid } from "./fourier.js";
const WIDTH = N_CELLS;
const HEIGHT = N_CELLS;

const PARTICLE_MASS = 5.0;
const PARTICLE_SIZE = 3.0;
const G = 6.6743 * 1e-11;

export function solve(g) {
  const positions = [
    [...g.filter((_, i) => i % 2 == 0)],
    [...g.filter((_, i) => i % 2 == 1)],
  ];
  const velocities = Array.from(Array(2), () => new Array(10).fill(0));
  const fgrid = fourier_grid();
  console.log(fgrid);
}
