/**
 * "Clamps" a number between a minimum and maximum value
 * @param value Value to clamp
 * @param min Minimum possible value
 * @param max The maximum value
 * @returns The clamped value
 */
const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default clamp;
