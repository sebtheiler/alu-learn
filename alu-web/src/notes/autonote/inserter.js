const wordToNum = { 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9 };
const numToWord = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine' };

// Checks whether an element is a heading that matches some (optional) criteria
const checkHeadingMatch = (element, targetText, targetHeadingSize) => {
  return (
    element.type.startsWith('heading-') && // check that it's a heading
    (!targetHeadingSize || wordToNum[element.type.substring(8)] === targetHeadingSize) && // check the heading size is correct
    (!targetText || element.children[0].text === targetText) // check the text is correct
  );
};

// Returns a new array with `contentToAdd` inserted in the correct position
const findElementInsertion = (data, contentToAdd, parsedSection, headingSize=1, startingIndex=0, debug=false) => {
  let elementMatch; // this is the heading we are looking for
  if (debug) {console.log('Beginning insertion')};

  for (let [index, element] of data.slice(startingIndex).entries()) {
    index += startingIndex;
    if (debug) {console.log('Index:', index, 'Element:', element)};

    if (elementMatch) {
      // Match has been found
      if (debug) {console.log('Match has been found')};
      if (checkHeadingMatch(element) || index === data.length - 1) {
        if (debug) {console.log('Element is header')};
        // If the element is heading or end of data, we might insert the data
        const newHeadingSize = wordToNum[element.type.substring(8)];

        if (newHeadingSize <= headingSize || parsedSection.length === headingSize) {
          // If the next same (or larger) level section has begun,
          // append the data right before it
          // OR
          // If we have no more subsections to search

          // Prepare new sections to insert (if any)
          const headings = parsedSection.slice(headingSize).map((sectionTitle, index) => {
            return {"type": `heading-${numToWord[headingSize + 1 + index]}`, "children": [{"text": sectionTitle}]};
          });
          
          if (debug) {console.log(`Stopping point found, inserting ${headings.length} headings`)};
          return [
            ...data.slice(0, index + 1),
            ...headings,
            ...contentToAdd,
            ...data.slice(index + 1),
          ];
        } else if (index === data.length - 1) {
          // If this is the very last section,
          // append the content

          const headings = parsedSection.slice(headingSize).map((sectionTitle, index) => {
            return {"type": `heading-${numToWord[headingSize + 1 + index]}`, "children": [{"text": sectionTitle}]};
          });
          if (debug) {console.log(`Appending content to very end with ${headings.length} new headings`)};
          return [
            ...data,
            ...headings,
            ...contentToAdd,
          ];
        } else if (parsedSection[headingSize] === element.children[0].text) {
          // If the new element is a subsection
          // that matches the next listed subsection
          // recursively check it
          if (debug) {console.log('Found new section to recursively check')};
          return findElementInsertion(
            data,
            contentToAdd,
            parsedSection,
            headingSize + 1,
            index - 1
          );
        };
      };
    } else {
      // Still looking for match
      if (debug) {console.log('Match not found yet')};
      if (checkHeadingMatch(element, parsedSection[headingSize - 1], headingSize)) {
        // Found a match
        if (debug) {console.log('Match found')};
        elementMatch = element;
      } else if (
          (
            checkHeadingMatch(element) &&
            wordToNum[element.type.substring(8)] < headingSize
          ) || index === data.length - 1
        ) {
          // No matches at all; insert new heading
          const headings = parsedSection.slice(headingSize - 1).map((sectionTitle, index) => {
            return {"type": `heading-${numToWord[headingSize + index]}`, "children": [{"text": sectionTitle}]};
          });
        if (debug) {console.log(`Never found a match, inserting ${headings.length} headings`)};
        return [
          ...data.slice(0, index + 1),
          ...headings,
          ...contentToAdd,
          ...data.slice(index + 1),
        ];
      };
    };
  };
};

// Actual function for inserting `element` into `content` at `sectionString`
export const insertElement = (element, noteDocument, sectionString) => {
  if (element) {
    const parsedSection = sectionString.split('>').map(sec => sec.trim());
    return findElementInsertion(
      noteDocument,
      element,
      parsedSection,
      1,
      0,
      false, // debug
    );
  } else {
    return noteDocument;
  };
};