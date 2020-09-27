const content = [{"type": "heading-one", "children": [{"text": "Header 1"}]}, {"type": "paragraph", "children": [{"text": "Content 1 - "}, {"bold": true, "text": "Various"}, {"text": " "}, {"text": "words and phrases", "italic": true}, {"text": " "}, {"text": "created", "strikethrough": true}, {"text": " brought to life "}, {"url": "https://google.com", "type": "link", "children": [{"text": "using"}]}, {"text": " a "}, {"text": "powerful", "underline": true}, {"text": " "}, {"code": true, "text": "rich text editor"}]}, {"type": "paragraph", "children": [{"text": "This also has support for "}, {"bold": true, "text": "multiple paragraphs"}]}, {"type": "heading-two", "children": [{"text": "Header 2"}]}, {"type": "paragraph", "children": [{"text": "Content 2 - "}, {"bold": true, "text": "Various"}, {"text": " "}, {"text": "words and phrases", "italic": true}, {"text": " "}, {"text": "created", "strikethrough": true}, {"text": " brought to life "}, {"url": "https://google.com", "type": "link", "children": [{"text": "using"}]}, {"text": " a "}, {"text": "powerful", "underline": true}, {"text": " "}, {"code": true, "text": "rich text editor"}]}, {"type": "paragraph", "children": [{"text": "This also has support for "}, {"bold": true, "text": "multiple paragraphs"}]}, {"type": "heading-one", "children": [{"text": "Second Header 1"}]}, {"type": "paragraph", "children": [{"text": "Content 1 - "}, {"bold": true, "text": "Various"}, {"text": " "}, {"text": "words and phrases", "italic": true}, {"text": " "}, {"text": "created", "strikethrough": true}, {"text": " brought to life "}, {"url": "https://google.com", "type": "link", "children": [{"text": "using"}]}, {"text": " a "}, {"text": "powerful", "underline": true}, {"text": " "}, {"code": true, "text": "rich text editor"}]}, {"type": "paragraph", "children": [{"text": "This also has support for "}, {"bold": true, "text": "multiple paragraphs"}]}, {"type": "heading-two", "children": [{"text": "Second Header 2"}]}, {"type": "paragraph", "children": [{"text": "Content 2 - "}, {"bold": true, "text": "Various"}, {"text": " "}, {"text": "words and phrases", "italic": true}, {"text": " "}, {"text": "created", "strikethrough": true}, {"text": " brought to life "}, {"url": "https://google.com", "type": "link", "children": [{"text": "using"}]}, {"text": " a "}, {"text": "powerful", "underline": true}, {"text": " "}, {"code": true, "text": "rich text editor"}]}, {"type": "paragraph", "children": [{"text": "This also has support for "}, {"bold": true, "text": "multiple paragraphs"}]}];
const wordToNum = { 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9 };
const numToWord = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine' };
const sectionString = 'Third Header'//#'Second Header 1 >  Second Header 2';
const contentToAdd = [{"type": "paragraph", "children": [{"text": "This also has support for "}, {"bold": true, "text": "multiple paragraphs"}]}, {"type": "paragraph", "children": [{"text": "This also has support for "}, {"bold": true, "text": "multiple paragraphs"}]}];
const parsedSection = sectionString.split('>').map(sec => sec.trim());

const checkHeadingMatch = (element, targetText, targetHeadingSize) => {
  return (
    element.type.startsWith('heading-') && // check that it's a heading
    (!targetHeadingSize || wordToNum[element.type.substring(8)] === targetHeadingSize) && // check the heading size is correct
    (!targetText || element.children[0].text === targetText) // check the text is correct
  );
};

const insertElement = (data, headingSize, startingIndex=0) => {
  var elementMatch;
  for (let [index, element] of data.slice(startingIndex).entries()) {
    index += startingIndex;
    if (elementMatch) {
      // Match has been found
      if (checkHeadingMatch(element) || index === data.length - 1) {
        const newHeadingSize = wordToNum[element.type.substring(8)];
        console.log(headingSize, newHeadingSize, data)
        if (newHeadingSize <= headingSize || parsedSection.length === headingSize) {
          console.log('inserting at', index)
          // If the next same (or larger) level section has begun,
          // append the data right before it
          // OR
          // If we have no more subsections to search
          return [
            ...data.slice(0, index),
            ...contentToAdd,
            ...data.slice(index),
          ];
        } else if (index === data.length - 1) {
          console.log('adding at end')
          // If this is the very last section,
          // append the data
          return [
            ...data,
            ...contentToAdd,
          ];
        } else if (parsedSection[headingSize] === element.children[0].text) {
          console.log('recursively searching')
          // If the new element is a subsection
          // that matches the next listed subsection
          return insertElement(data, headingSize + 1, index - 1);
        };
      };
    } else {
      // Still looking for match
      console.log(index, data.length - 1)
      if (checkHeadingMatch(element, parsedSection[headingSize - 1], headingSize)) {
        // Found a match
        const size = element.type.substring(8);
        const title = element.children[0].text;
        console.log(title, wordToNum[size])
        elementMatch = element;
      } else if (
          (
            checkHeadingMatch(element) &&
            wordToNum[element.type.substring(8)] < headingSize
          ) || index === data.length - 1
        ) {
        console.log('inserting')
        // No matches at all; insert new heading
        return [
          ...data.slice(0, index),
          {"type": `heading-${numToWord[headingSize]}`, "children": [{"text": parsedSection[headingSize - 1]}]},
          ...contentToAdd,
          ...data.slice(index),
        ];
      };
    };
  };
};
console.log(insertElement(content, 1));