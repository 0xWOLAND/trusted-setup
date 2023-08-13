import { fourier_grid, potential, sample_freq } from "../fourier.js";
import { N_CELLS } from "../config.js";
import { expect } from "chai";
import { update } from "../integrate.js";

describe("fourier test", async function () {
  it("sample frequencies should work as expected", () => {
    {
      const samples = sample_freq(10);
      const res = [0, 0.1, 0.2, 0.3, 0.4, -0.5, -0.4, -0.3, -0.2, -0.1];
      samples.forEach((x, i) => expect(x).equals(res[i]));
    }
    {
      const samples = sample_freq(3);
      const res = [0, 0.3333333333333333, -0.3333333333333333];
      samples.forEach((x, i) => expect(x).equals(res[i]));
    }
  });
  it("check potential", () => {
    const NUM_PARTICLES = 10;
    const fgrid = fourier_grid();
    const density = Array.from(Array(N_CELLS), () =>
      new Array(N_CELLS).fill(0).map((_, i) => i)
    );
    const velocities = Array.from(Array(2), () =>
      new Array(NUM_PARTICLES).fill(0).map((x) => Math.random() * 5)
    );
    const positions = Array.from(Array(2), () =>
      new Array(NUM_PARTICLES).fill(0).map((x) => Math.random() * N_CELLS)
    );
    const t = 100;
    const dt = 10;

    console.log(positions);
    console.log(update(positions, velocities, fgrid, density, t, dt)[0]);
  });
});
