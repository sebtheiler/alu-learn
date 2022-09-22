const formatPlural = (
  count: number,
  noun: string,
  plural: string | undefined = undefined
) => {
  if (count === 1) {
    return `${count} ${noun}`;
  }
  if (plural) return plural;
  return `${count} ${noun}s`;
};

export default formatPlural;
