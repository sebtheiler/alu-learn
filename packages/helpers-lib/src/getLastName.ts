/**
 * Returns the last name of a full name string
 * @param name The full name string
 * @returns The last name
*/
const getLastName = (name: string) => name.toLocaleLowerCase().split(" ")[1];
export default getLastName;
