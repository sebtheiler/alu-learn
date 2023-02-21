export const daysToMinutes = 24 * 60;

export const inDays = (n: number) => {
  const date = new Date();
  date.setDate(date.getDate() + n);
  return date;
};

export const inMinutes = (n: number) => {
  const date = new Date();
  date.setMinutes(date.getMinutes() + n);
  return date;
};
