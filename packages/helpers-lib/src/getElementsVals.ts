/**
 * Gets specified values from an HTML form elements array
 * @param form Form from which to get the data
 * @param valNames Names of the values to get (e.g., `['email', 'username']`)
 * @returns An object with keys that have the names of the values
 */
export const getElementsVals = (
  form: HTMLFormElement,
  valNames: string[]
): { [key: string]: string } => {
  const result = {};
  for (const valName of valNames) {
    result[valName] = form.elements[valName].value;
  }

  return result;
};
