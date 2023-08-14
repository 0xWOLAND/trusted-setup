import { fourier_grid, potential, sample_freq } from "../fourier.js";
import { N_CELLS } from "../config.js";
import { expect } from "chai";
import { update } from "../integrate.js";
import { solve } from "../pm-solver.js";
import { density } from "../density.js";

const NUM_PARTICLES = 10;

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
    const fgrid = fourier_grid();
    const velocities = Array.from(Array(2), () =>
      new Array(NUM_PARTICLES).fill(0).map((x) => Math.random() * 5)
    );
    const positions = Array.from(Array(2), () =>
      new Array(NUM_PARTICLES).fill(0).map((x) => Math.random() * N_CELLS)
    );
    const rho = density(positions);
    const t = 100;
    const dt = 10;

    // console.log(update(positions, velocities, rho, fgrid, t, dt)[0]);
  });
  it("check update", () => {
    const t = 1;
    const dt = 0.01;
    let positions = new Array(NUM_PARTICLES * 2)
      .fill(0)
      .map((_) => Math.random() - 0.5);
    for (let i = 0; i < 10; i++) {
      positions = solve(positions, t, dt)[0];
      console.log(positions);
    }
  });
});
