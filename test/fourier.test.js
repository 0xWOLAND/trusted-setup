import { dft_transform, sample_freq } from "../fourier.js";
import { N_CELLS } from "../config.js";
import { expect } from "chai";

// const scale = 2 * Math.PI;
// const samples = sample_freq(N_CELLS).map((x) => scale * x);

// const fgrid = dft_transform(samples);
// console.log(samples);

// const density = Array.from(Array(N_CELLS), Array(N_CELLS).fill(0));

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
});
