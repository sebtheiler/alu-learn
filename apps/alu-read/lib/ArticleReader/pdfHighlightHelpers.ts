import type { TextItem } from "react-pdf";

/**
 * Returns a new string where the first occurrence of `pattern` within `text` is wrapped with `<mark>` tags.
 *
 * @param {string} text - The string to search for `pattern`.
 * @param {string} pattern - The pattern to search for within `text`.
 * @returns {string} - A new string where the first occurrence of `pattern` within `text` is wrapped with `<mark>` tags.
 */
function highlightWithinLine(text: string, pattern: string): string {
  return text.replace(pattern, (value) => `<mark>${value}</mark>`);
}

/**
 * Returns a string containing the concatenated `str` properties of `TextItem` objects from `textItems` array that
 * are within a given range of `itemIndex`.
 *
 * @param {TextItem[]} textItems - An array of `TextItem` objects.
 * @param {number} itemIndex - The index of the target `TextItem` object.
 * @param {number} span - The number of `TextItem` objects to include on each side of the target `TextItem`.
 * @returns {string} - A string containing the concatenated `str` properties of the selected `TextItem` objects.
 */
function getTextItemWithNeighbors(
  textItems: TextItem[],
  itemIndex: number,
  span = 11
): string {
  return textItems
    .slice(Math.max(0, itemIndex - span), itemIndex + 1 + span)
    .filter(Boolean)
    .map((item) => item.str)
    .join("");
}

/**
 * Returns an array containing the starting and ending indices of the first occurrence of `substring` within `string`.
 *
 * @param {string} string - The string to search for `substring`.
 * @param {string} substring - The substring to search for within `string`.
 * @returns {[number, number]} - An array containing the starting and ending indices of the first occurrence of `substring`
 * within `string`, respectively.
 */
function getIndexRange(string: string, substring: string): [number, number] {
  const indexStart = string.indexOf(substring);
  const indexEnd = indexStart + substring.length;

  return [indexStart, indexEnd];
}

// Adapted from https://github.com/wojtekmaj/react-pdf/issues/614#issuecomment-664212981
export function highlight(
  text: string,
  stringToHighlight: string,
  textItems: TextItem[],
  itemIndex: number
) {
  const matchInTextItem = text.match(stringToHighlight);

  if (matchInTextItem) {
    // Found full match within current item, no need for black magic
    return highlightWithinLine(text, stringToHighlight);
  }

  // Full match within current item not found, let's check if we can find it
  // spanned across multiple lines

  // Get text item with neighbors
  const textItemWithNeighbors = getTextItemWithNeighbors(textItems, itemIndex);

  const matchInTextItemWithNeighbors =
    textItemWithNeighbors.match(stringToHighlight);

  if (!matchInTextItemWithNeighbors) {
    // No match
    return text;
  }

  // Now we need to figure out if the match we found was at least partially
  // in the line we're currently rendering
  const [matchIndexStart, matchIndexEnd] = getIndexRange(
    textItemWithNeighbors,
    stringToHighlight
  );
  const [textItemIndexStart, textItemIndexEnd] = getIndexRange(
    textItemWithNeighbors,
    text
  );

  if (
    // Match entirely in the previous line
    matchIndexEnd < textItemIndexStart ||
    // Match entirely in the next line
    matchIndexStart > textItemIndexEnd
  ) {
    return text;
  }

  // Match found was partially in the line we're currently rendering. Now
  // we need to figure out what does "partially" exactly mean

  // Find partial match in a line
  const indexOfCurrentTextItemInMergedLines =
    textItemWithNeighbors.indexOf(text);
  const matchIndexStartInTextItem = Math.max(
    0,
    matchIndexStart - indexOfCurrentTextItemInMergedLines
  );
  const matchIndexEndInTextItem =
    matchIndexEnd - indexOfCurrentTextItemInMergedLines;

  const partialStringToHighlight = text.slice(
    matchIndexStartInTextItem,
    matchIndexEndInTextItem
  );

  return highlightWithinLine(text, partialStringToHighlight);
}
