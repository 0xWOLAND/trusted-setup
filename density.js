import { MASS, N_CELLS } from "./config.js";

export function density(positions) {
  let grid = Array.from(Array(N_CELLS), () => new Array(N_CELLS).fill(0));

  for (let i = 0; i < positions[0].length; i++) {
    const xc = Math.floor(positions[0][i]) % N_CELLS;
    const yc = Math.floor(positions[1][i]) % N_CELLS;

    const dx = positions[0][i] - xc;
    const dy = positions[0][i] - xc;

    const tx = 1 - dx;
    const ty = 1 - dx;

    const X = (xc + 1) % N_CELLS;
    const Y = (yc + 1) % N_CELLS;

    grid[xc][yc] += MASS * tx * ty;
    grid[X][yc] += MASS * dx * ty;
    grid[xc][Y] += MASS * tx * dy;
    grid[X][Y] += MASS * dx * dy;
  }
  return grid;
}
