/**
 * Gets specified values from an HTML form elements array
 * @param elements HTML form elements to get values from (`form.elements`)
 * @param valNames Names of the values to get (`['email', 'username']`)
 * @returns An object with keys that have the names of the values
 */
export const getElementsVals = (
  elements,
  valNames: string[]
): { [key: string]: string } => {
  const result = {};
  for (const valName of valNames) {
    result[valName] = elements[valName].value;
  }

  return result;
};
