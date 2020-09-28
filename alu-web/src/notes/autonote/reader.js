import React, { useState, useMemo } from 'react';
import {Button, Form} from 'react-bootstrap';
import {Slate, ReactEditor} from 'slate-react';
// import {Editor} from 'slate';
import {createFullEditor, EditorButtons, FullEditor} from '../editor-components';
import './inserter';

const emptyValue = [
  {
    "type": "paragraph",
    "children": [
      {
        "text": ""
      }
    ]
  }
]

export function AutoNote(props) {
  const [selectedPar, setSelectedPar] = useState(0);
  const [finished, setFinished] = useState(false);

  const [value, setValue] = useState(emptyValue);
  const editor = useMemo(
    () => createFullEditor(),
    []
  );

  const text = `
Tauris is a great and noble city, situated in a great province called IRAQ, in which are many other towns and villages. But as Tauris is the most noble I will tell you about it.
The men of Tauris get their living by trade and handicrafts, for they weave many kinds of beautiful and valuable stuffs of silk and gold. The city has such a good position that merchandize is brought thither from India, Baudas, CREMESOR, and many other regions; and that attracts many Latin merchants, especially Genoese, to buy goods and transact other business there; the more as it is also a great market for precious stones. It is a city in fact where merchants make large profits.
The people of the place are themselves poor creatures; and are a great medley of different classes. There are Armenians, Nestorians, Jacobites, Georgians, Persians, and finally the natives of the city themselves, who are worshippers of Mahommet. These last are a very evil generation; they are known as TAURIZI.] The city is all girt round with charming gardens, full of many varieties of large and excellent fruits.
Now we will quit Tauris, and speak of the great country of Persia. [From Tauris to Persia is a journey of twelve days.]  
`.trim().replace('\n\n', '\n').split('\n');

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;

    // document.activeElement.blur();
    // editor.blur();
    // ReactEditor.blur(editor);
    // editor.moveTo([0, 0], 0
    form.elements.sectionTitle.select();
    setValue(emptyValue);

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
      <p style={{ color: '#e0e0e0' }}>...{text[selectedPar + 1] && text[selectedPar + 1].substr(0, 150)}</p>
    </div>
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
      {!finished ?
      <Button type='submit' block>Add Notes</Button>
      :
      <p className='text-center'>You've finished reviewing this paper!</p>
      }
    </Form>
  </div>);
};