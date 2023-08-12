/**
 * F(t) = H0/dt
 * @param {Number} t time
 * @param {*} constants [Ωm,0 + Ωk,0a + ΩΛ,0]
 */
export function f(t, constants) {
  const [Ωm, Ωk, ΩΛ] = constants;
  return 1 / Math.sqrt((Ωm + Ωk * t + ΩΛ * Math.pow(t, 3)) / t);
}
