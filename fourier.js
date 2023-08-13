import { N_CELLS, OMEGA_M0 } from "./config.js";
import { FFT } from "./fft.js";

// f = [0, 1, ...,   n/2-1,     -n/2, ..., -1] / (d*n)   if n is even
// f = [0, 1, ..., (n-1)/2, -(n-1)/2, ..., -1] / (d*n)   if n is odd
export function sample_freq(n, d = 1.0) {
  const len = n % 2 == 0 ? n / 2 - 1 : (n - 1) / 2;

  const a = Array.from(Array(len + 1), (_, i) => i);
  const b = a
    .slice(0, len + (n % 2 == 0))
    .map((x) => -1 * (x + 1))
    .reverse();
  return a.concat(b).map((x) => x / (d * n));
}

export function fourier_grid() {
  const samples = sample_freq(N_CELLS);
  let grid = Array.from(Array(samples.length), () =>
    new Array(samples.length).fill(0)
  );

  for (let i = 0; i < samples.length; i++) {
    for (let j = 0; j < samples.length; j++) {
      grid[i][j] =
        Math.pow(Math.sin(samples[i] / 2), 2) +
        Math.pow(Math.sin(samples[j] / 2), 2);
      grid[i][j] = 1 / (grid[i][j] == 0 ? 1e-6 : grid[i][j]);
    }
  }

  return grid;
}

export function potential(density, fourier_grid, t) {
  let ans = density_k(density);
  ans = potential_k(t, fourier_grid, ans);
  return potential_real(ans);
}

export function density_k(density) {
  const dim = density.length;
  console.log(dim);
  const f = new FFT(dim);

  const ans = density.map((x) => {
    const out = f.createComplexArray();
    f.realTransform(out, x);
    return out;
  });
  return ans;
}

export function potential_k(t, fourier_grid, density_grid) {
  return fourier_grid.map((a, i) =>
    a.map((x, j) => ((-3 * OMEGA_M0) / 8 / t) * x * density_grid[i][j])
  );
}

export function potential_real(potential_k) {
  const dim = potential_k.length;
  console.log(dim);
  const f = new FFT(dim);

  const ans = potential_k.map((x) => {
    const out = f.createComplexArray();
    f.inverseTransform(out, x);
    return x;
  });
  return ans;
}
