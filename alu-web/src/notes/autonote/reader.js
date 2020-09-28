import React, { useState, useMemo } from 'react';
import {Button, Form} from 'react-bootstrap';
import {Slate, ReactEditor} from 'slate-react';
import {Transforms} from 'slate';
import {createFullEditor, EditorButtons, FullEditor} from '../editor-components';
import {insertElement} from './inserter';

const emptyValue = [
  {
    "type": "paragraph",
    "children": [
      {
        "text": ""
      },
    ],
  },
];

/*
Tauris is a great and noble city, situated in a great province called IRAQ, in which are many other towns and villages. But as Tauris is the most noble I will tell you about it.
The men of Tauris get their living by trade and handicrafts, for they weave many kinds of beautiful and valuable stuffs of silk and gold. The city has such a good position that merchandize is brought thither from India, Baudas, CREMESOR, and many other regions; and that attracts many Latin merchants, especially Genoese, to buy goods and transact other business there; the more as it is also a great market for precious stones. It is a city in fact where merchants make large profits.
The people of the place are themselves poor creatures; and are a great medley of different classes. There are Armenians, Nestorians, Jacobites, Georgians, Persians, and finally the natives of the city themselves, who are worshippers of Mahommet. These last are a very evil generation; they are known as TAURIZI.] The city is all girt round with charming gardens, full of many varieties of large and excellent fruits.
Now we will quit Tauris, and speak of the great country of Persia. [From Tauris to Persia is a journey of twelve days.]
===
In Turkey there are three classes of people. First, there are the Turcomans; these are worshippers of Mahommet, a rude people with an uncouth language of their own. They dwell among mountains and downs where they find good pasture, for their occupation is cattle-keeping. Excellent horses, known as Turquans, are reared in their country, and also very valuable mules. The other two classes are the Armenians and the Greeks, who live mixt with the former in the towns and villages, occupying themselves with trade and handicrafts. They weave the finest and handsomest carpets in the world, and also a great quantity of fine and rich silks of cramoisy and other colours, and plenty of other stuff. Their chief cities are CONIA, SAVAST [where the glorious Messer Saint Blaise suffered martyrdom], and CASARIA, besides many other towns and bishops' sees, of which we shall not speak at present, for it would be too long a matter. These people are subject to the Mongol of the Levant as their Suzerain.We will now leave this province, and speak of Greater Armenia.
*/
const parseText = (text, version='paragraph') => {
  switch (version) {
    case 'paragraph':
      return text.split('\n');
    case 'sentence':
      const splitText = text.split(/\.\s/gm); // split by '.' followed by whitespace
      const numSentences = 3; // maximum number of sentences to display at a time
      let textArray = [];
      let sentenceIndex = 0;

      do {
        const sentenceGroup = splitText.slice(sentenceIndex, sentenceIndex + numSentences);
        
        // Get sentences from the sentence group, unless it has a newline in it
        let pair = [];
        let newlinePairIndex;
        for (const [i, sentence] of sentenceGroup.entries()) {
          console.log(sentence, sentence.includes('\n'))
          if (sentence.includes('\n')) {
            newlinePairIndex = i;
            break;
          };
          pair.push(sentence);
        };

        // Merge the sentences together
        const mergedPair = pair.join('. ', '') + '.';
        if (mergedPair.length > 1) {
          textArray.push(mergedPair);
        };

        // Increase the sentence index by the number of sentences shown
        sentenceIndex += newlinePairIndex ? newlinePairIndex : numSentences;
      } while (sentenceIndex < splitText.length * numSentences);

      return textArray;
    default:
      return;
  };
};

export function AutoNote(props) {
  const [selectedPar, setSelectedPar] = useState(0);
  const [finished, setFinished] = useState(false);
  const [noteDocument, setNoteDocument] = useState(emptyValue);

  const [value, setValue] = useState(emptyValue);
  const editor = useMemo(
    () => createFullEditor(),
    []
  );
  const noteEditor = useMemo(
    () => createFullEditor(),
    []
  );

const text = parseText(`
In Turkey there are three classes of people. First, there are the Turcomans; these are worshippers of Mahommet, a rude people with an uncouth language of their own. They dwell among mountains and downs where they find good pasture, for their occupation is cattle-keeping. Excellent horses, known as Turquans, are reared in their country, and also very valuable mules. The other two classes are the Armenians and the Greeks, who live mixt with the former in the towns and villages, occupying themselves with trade and handicrafts. They weave the finest and handsomest carpets in the world, and also a great quantity of fine and rich silks of cramoisy and other colours, and plenty of other stuff. Their chief cities are CONIA, SAVAST [where the glorious Messer Saint Blaise suffered martyrdom], and CASARIA, besides many other towns and bishops' sees, of which we shall not speak at present, for it would be too long a matter. These people are subject to the Mongol of the Levant as their Suzerain.We will now leave this province, and speak of Greater Armenia.
`.trim(), 'sentence');

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;

    // Add the new notes to the document
    if (value !== emptyValue) {
      const newDocument = insertElement(
        value,
        noteDocument,
        form.elements.sectionTitle.value,
      );
      setNoteDocument(newDocument);
    };

    // Move the cursor to the beginning to avoid crash
    Transforms.move(editor, { edge: 'anchor', distance: 9999999, reverse: true });
    Transforms.move(editor, { edge: 'focus', distance: 9999999, reverse: true });
    ReactEditor.focus(editor);

    // Clear editor
    setValue(emptyValue);

    // Move selected paragraph
    if (selectedPar < text.length - 1) {
      setSelectedPar(selectedPar + 1);
    } else {
      setFinished(true);
    };
  };

  return (<div className='container mt-5'>
    <h3 className='text-center'>Content</h3>
    <div style={{ border: '1px solid gray', padding: '30px', height: '250px', overflow: 'hidden', borderRadius: '5px' }}>
      <p style={{ color: '#e0e0e0' }}>...{text[selectedPar - 1] && text[selectedPar - 1].substr(text[selectedPar - 1].length - 150, text[selectedPar - 1].length)}</p>
      <p style={{ color: '#000000' }}>{text[selectedPar]}</p>
      <p style={{ color: '#e0e0e0' }}>{text[selectedPar + 1] && text[selectedPar + 1].substr(0, 150)}...</p>
    </div>
    {!finished ? <>
      <Form onSubmit={handleSubmit} className='mt-4'>
        <Form.Group className='w-75 mx-auto'>
          <Form.Label as='h3'>Section (subsection with "&gt;")</Form.Label>
          <Form.Control
            type='text'
            name='sectionTitle'
            placeholder='B.F. Skinner > Skinner Box'
            required
          />
        </Form.Group>
        <Form.Group>
          <Form.Label as='h3'>Notes</Form.Label>
          <div style={{ borderStyle: 'solid', borderWidth: '1px', paddingTop: '5px', paddingLeft: '5px' }}>
            <Slate
              editor={editor}
              value={value}
              onChange={newValue => {
                setValue(newValue);
              }}
            >
              <EditorButtons
                editor={editor}
              />
              <FullEditor
                editor={editor}
                styleOptions={{ minHeight: '200px' }}
              />
            </Slate>
          </div>
        </Form.Group>
        <Button type='submit' block>Add Notes</Button>
      </Form>
      </> :
      <div className='my-5'>
        <h3 className='text-center'>Here are the notes you took for this paper:</h3>
        <Slate
          editor={noteEditor}
          value={noteDocument}
          onChange={newValue => setNoteDocument(newValue)}
        >
          <FullEditor
            editor={noteEditor}
            readOnly={true}
          />
        </Slate>
      </div>
      }
  </div>);
};