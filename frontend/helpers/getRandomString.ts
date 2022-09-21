const VALID_CHARACTERS = {
  all: "bcdfghjkmpqrtvwxyBCDFGHJKMPQRTVWXY346789",
  upper: "BCDFGHJKMPQRTVWXY346789",
  lower: "BCDFGHJKMPQRTVWXY346789",
};

const getRandomString = (
  len: number,
  mode: "all" | "upper" | "lower" = "all"
): string => {
  const CHARACTERS = VALID_CHARACTERS[mode];
  const CHARACTERS_LENGTH = CHARACTERS.length;

  let result = "";
  for (let i = 0; i < len; i++) {
    result += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS_LENGTH));
  }

  return result;
};

export default getRandomString;
