import React, {useCallback, useMemo, useState} from 'react';
import {createEditor, Editor, Transforms, Text} from 'slate'
import {Slate, Editable, withReact} from 'slate-react'


const CustomEditor = {
  isBoldMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: n => n.bold === true,
      universal: true,
    });

    return !!match;
  },

  isCodeBlockActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: n => n.type === 'code',
    });

    return !!match;
  },

  toggleBoldMark(editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor);
    Transforms.setNodes(
      editor,
      { bold: isActive ? null : true },
      { match: n => Text.isText(n), split: true },
    );
  },

  toggleCodeBlock(editor) {
    const isActive = CustomEditor.isCodeBlockActive(editor);
    Transforms.setNodes(
      editor,
      { type: isActive ? null : 'code' },
      { match: n => Editor.isBlock(editor, n) }
    );
  },
};

const CodeElement = props => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  );
};

const DefaultElement = props => {
  return (
    <p {...props.attributes}>
      {props.children}
    </p>
  );
};

const Leaf = props => {
  return (
    <span
      {...props.attributes}
      style={{ fontWeight: props.leaf.bold ? 'bold' : 'normal' }}
    >
      {props.children}
    </span>
  );
};


export function StandardNoteEditor() {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState([
    {
      type: 'paragraph',
      children: [{text: 'A line of text in a paragraph'}],
    },
  ]);

  const renderElement = useCallback(props => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />
      default:
        return <DefaultElement {...props} />
    };
  }, []);

  const renderLeaf = useCallback(props => {
    return <Leaf {...props} />
  }, []);

  return (
    <div className=''>
      <h1>Taking Notes</h1>
      <Slate
        editor={editor}
        value={value}
        onChange={newValue => {
          setValue(newValue);

          // const content = JSON.stringify(value);
          // console.log(content);
        }}
      >
        <div>
          <button
            onMouseDown={event => {
              event.preventDefault();
              CustomEditor.toggleBoldMark(editor);
            }}
          >
            Bold
          </button>
          <button
            onMouseDown={event => {
              event.preventDefault();
              CustomEditor.toggleCodeBlock(editor);
            }}
          >
            Code
          </button>
        </div>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={event => {
            if (!event.key) {
              return;
            };

            switch (event.key) {
              case '`':
                event.preventDefault();
                CustomEditor.toggleCodeBlock(editor);
                break;

              case 'b':
                event.preventDefault();
                CustomEditor.toggleBoldMark(editor);
                break;
              
              default:
                break;
            };
          }}
        />
      </Slate>
    </div>
  );
};