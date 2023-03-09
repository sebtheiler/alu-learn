/**
 * TypeScript-compliant filter to remove null/undefined values from an array
 * @see https://stackoverflow.com/a/46700791/10226703
 * @example myArray.filter(notEmpty)
 */
function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

export default notEmpty;