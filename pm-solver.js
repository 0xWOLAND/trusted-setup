import { N_CELLS } from "./config.js";
import { density } from "./density.js";
import { fourier_grid } from "./fourier.js";
import { update } from "./integrate.js";

export function solve(g, t, dt) {
  const fgrid = fourier_grid();
  console.log(g);
  g = g.map((x) => x + 0.5);
  console.log(g);
  g = g.map((x) => N_CELLS * x);
  const positions = [
    [...g.filter((_, i) => i % 2 == 0)],
    [...g.filter((_, i) => i % 2 == 1)],
  ];
  const velocities = Array.from(Array(2), () =>
    new Array(10).fill(0).map((x) => Math.random())
  );
  const rho = density(positions);
  const [_positions, _velocities] = update(
    positions,
    velocities,
    rho,
    fgrid,
    t,
    dt
  );
  return [_positions, _velocities];
}
