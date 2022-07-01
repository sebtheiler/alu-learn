// Capitalizes the first letter of a string
// If `all` is true, it does this for each word in the string
export default function capitalize(str: string, all=false) {
  if (all)
    return str.split(' ').map(s => capitalize(s)).join(' ');
  return str.charAt(0).toUpperCase() + str.slice(1);
}
