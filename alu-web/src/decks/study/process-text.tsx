import { Node as SlateNode } from 'slate';
import { ReviewInstance } from '../types';

export function processFront(reviewInstance: ReviewInstance): SlateNode[] {
  const fields = reviewInstance.data?.fields;
  if (!fields) return [];

  switch (reviewInstance.flashcard_type) {
    case 'BASIC': case 'REVERSED':
      return fields[reviewInstance.content_indicies[0]];
    case 'CLOZE':
      return clozify(reviewInstance, false);
  }
}

export function processBack(reviewInstance: ReviewInstance): SlateNode[] {
  const fields = reviewInstance.data?.fields;
  if (!fields) return [];

  switch (reviewInstance.flashcard_type) {
    case 'BASIC': case 'REVERSED':
      return fields[reviewInstance.content_indicies[1]];
    case 'CLOZE':
      return clozify(reviewInstance, true);
  }
}

function clozify(reviewInstance: ReviewInstance, showAnswer: boolean): SlateNode[] {
  const fields = reviewInstance.data?.fields
  if (!fields) return [];

  const regex = /{{c\d*::.*?}}/gm;

  const field = fields[reviewInstance.content_indicies[0]];
  const currentCardText = JSON.stringify(field);
  const targetClozeNum = parseInt(reviewInstance.name.split('-')[1]);
  const str = JSON.stringify(field);
  
  let answerHiddenTextStr = currentCardText;
  let answerRevealedTextStr = currentCardText;
  let m;
  while ((m = regex.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) regex.lastIndex++;
    
    // The result can be accessed through the `m`-variable.
    // eslint-disable-next-line
    m.forEach(match => {
      const clozeMatch = str.slice(m.index, m.index + match.length);
      const clozeMatchNum = parseInt(clozeMatch.split('::')[0].slice(3));
      const clozeMatchText = clozeMatch.split('::').slice(1).join('').slice(0, -2);
      if (clozeMatchNum === targetClozeNum) {
        answerHiddenTextStr = answerHiddenTextStr.replace(clozeMatch, '[ ... ]'); // obfuscate
        answerRevealedTextStr = answerRevealedTextStr.replace(clozeMatch, `${clozeMatchText}`); // reveal
      } else {
        answerHiddenTextStr = answerHiddenTextStr.replace(clozeMatch, clozeMatchText);
        answerRevealedTextStr = answerRevealedTextStr.replace(clozeMatch, clozeMatchText);
      }
    });
  }

  const answerHiddenText = JSON.parse(answerHiddenTextStr) as SlateNode[];
  const answerRevealedText = JSON.parse(answerRevealedTextStr) as SlateNode[];

  return showAnswer ? answerRevealedText : answerHiddenText;
}
