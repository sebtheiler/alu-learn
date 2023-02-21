/**
 * Creates a new object that is a copy of the original object, but with the specified keys omitted.
 * @template T The type of the original object
 * @template K The keys of the original object to omit
 * @param {T} obj The original object
 * @param {...K} keys The keys to omit from the new object
 * @returns {Omit<T, K>} The new object without the omitted keys
*/
export default function omit<T extends object, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> {
  const newObj = { ...obj };
  keys.forEach((key) => delete newObj[key]);
  return newObj;
}
