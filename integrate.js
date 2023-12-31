import { H0, N_CELLS, OMEGA_K0, OMEGA_LAMBDA0 } from "./config.js";
import { f } from "./cosmology.js";
import { potential } from "./fourier.js";

export function update(positions, velocities, rho, fourier_grid, t, dt) {
  const centers = positions.map((a) => a.map((x) => Math.floor(x)));
  const w = weights(positions, centers);
  const g = potential(rho, fourier_grid, t);
  const f_t = f(t + dt, [H0, OMEGA_LAMBDA0, OMEGA_K0]);
  return integrate(positions, velocities, g, centers, w, f_t, t, dt);
}

// TODO compute in shader
export function integrate(
  positions,
  velocities,
  potential,
  centers,
  weights,
  f_t,
  t,
  dt
) {
  return positions.map((_positions, i) =>
    interpolate(
      _positions,
      velocities[i],
      potential,
      centers,
      weights,
      f_t,
      t,
      dt,
      i
    )
  );
}

export function weights(positions, centers) {
  const len = positions[0].length;

  let rho = Array.from(Array(4), () => new Array(len).fill(0));

  for (let i = 0; i < len; i++) {
    const dx = positions[0][i] - centers[0][i];
    const dy = positions[1][i] - centers[1][i];

    const tx = 1 - dx;
    const ty = 1 - dy;

    rho[0][i] = tx * ty;
    rho[1][i] = dx * ty;
    rho[2][i] = tx * dy;
    rho[3][i] = dx * dy;
  }
  return rho;
}

// TODO compute this in shader
function interpolate(
  positions,
  velocities,
  potential,
  centers,
  weights,
  f_t,
  t,
  dt,
  direction
) {
  // Central Difference Approximation
  let cda_l = [...centers];
  let cda_r = [...centers];
  cda_l[direction] = cda_l[direction].map((x) => (x - 1 + N_CELLS) % N_CELLS);
  cda_r[direction] = cda_r[direction].map((x) => (x + 1) % N_CELLS);

  const len = positions.length;

  // x = 0
  // y = 1
  for (let i = 0; i < len; i++) {
    const x1 = cda_r[0][i];
    const y1 = cda_r[1][i];
    const x2 = cda_l[0][i];
    const y2 = cda_l[1][i];

    const [X1, Y1, X2, Y2] = [x1, y1, x2, y2].map((x) => (x + 1) % N_CELLS);

    const g = -potential[x1][y1] + potential[x2][y2];
    const g_x = -potential[X1][y1] + potential[X2][y2];
    const g_y = -potential[x1][Y1] + potential[x2][Y2];
    const g_xy = -potential[X1][Y1] + potential[X2][Y2];

    const g_p = [g, g_x, g_y, g_xy]
      .map((x, j) => (x * weights[j][i]) / 2)
      .reduce((acc, cur) => acc + cur, 0);

    velocities[i] += g_p * dt * f_t;
    positions[i] =
      (positions[i] + (f_t * dt * velocities[i]) / Math.pow(t + dt, 2)) %
      N_CELLS;
    positions[i] = (positions[i] + N_CELLS) % N_CELLS;
  }
  return [positions, velocities];
}
