import { N_CELLS } from "./config";
import { fourier_grid } from "./fourier";

export function init() {
  const dft_grid = fourier_grid();
}

export function integrate(positions, velocity, t, dt) {
  const centers = positions.map((x) => Math.floor(x));
  const ρ = density_dist(positions, centers);
}

export function density_dist(positions, centers) {
  const len = positions[0].length;

  let ρ = Array.from(Array(4), () => new Array(len).fill(0));

  for (let i = 0; i < len; i++) {
    const dx = positions[0][i] - centers[0][i];
    const dy = positions[1][i] - centers[1][i];

    const tx = 1 - dx;
    const ty = 1 - dy;

    ρ[0][i] = tx * ty;
    ρ[1][i] = dx * ty;
    ρ[2][i] = tx * dy;
    ρ[3][i] = dx * dy;
  }
  return ρ;
}

// TODO compute this in shader
export function update(
  centers,
  positions,
  velocities,
  potential,
  f_t,
  ρ,
  t,
  dt
) {
  // Central Difference Approximation
  const cda_r = [...centers].map((x) => (x + 1) % N_CELLS);
  const cda_l = [...centers].map((x) => x - 1);
  const len = positions[0].length;

  // x = 0
  // y = 1
  for (let i = 0; i < len; i++) {
    const x1 = cda_r[0][i];
    const y1 = cda_r[0][i];
    const x2 = cda_l[0][i];
    const y2 = cda_l[0][i];

    const [X1, Y1, X2, Y2] = [x1, y1, x2, y2].map((x) => (x + 1) % N_CELLS);

    const g = -potential[x1][y1] + potential[x2][y2];
    const g_x = -potential[X1][y1] + potential[X2][y2];
    const g_y = -potential[x1][Y1] + potential[x2][Y2];
    const g_xy = -potential[X1][Y1] + potential[X2][Y2];

    const g_p = [g, g_x, g_y, g_xy]
      .map((x, i) => (x * ρ[i]) / 2)
      .reduce((acc, cur) => acc + cur, 0);

    velocities[i] += g_p * dt * f_t;
    positions[i] =
      (positions[i] + (f_t * dt * velocities[i]) / Math.pow(t + dt, 2)) %
      N_CELLS;
  }
  return [positions, velocities];
}
