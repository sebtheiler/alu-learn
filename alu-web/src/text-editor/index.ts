import { EditorButtons } from './buttons';
import { createFullEditor, FullEditor } from './editor';
import { Element, Leaf } from './renderer';

const blankSlateElement = [
    {
        "type": "paragraph",
        "children": [
            {
                "text": "",
            },
        ],
    },
];

export {
  createFullEditor,
  FullEditor,
  EditorButtons,
  Element,
  Leaf,
  blankSlateElement ,
}
