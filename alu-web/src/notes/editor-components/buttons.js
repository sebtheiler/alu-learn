import React from 'react';
import {Button, ButtonGroup} from 'react-bootstrap';
import {isMarkActive, toggleMark, isBlockActive, toggleBlock} from './editor';
import {ImageButton} from './images';
import {LinkButton} from './links';

export function EditorButtons(props) {
  const {editor, saveHandler} = props;

  return (
    <ButtonGroup style={{flexWrap: 'wrap'}}>
      <MarkButton format='bold' label='Bold' editor={editor} />
      <MarkButton format='italic' label='Italic' editor={editor} />
      <MarkButton format='underline' label='Underline' editor={editor} />
      <MarkButton format='strikethrough' label='Strikethrough' editor={editor} />
      <MarkButton format='code' label='Code' editor={editor} />
      <LinkButton editor={editor} />
      <ImageButton editor={editor} />

      <span className='mx-1' />

      <BlockButton format='heading-one' label='H1' editor={editor} />
      <BlockButton format='heading-two' label='H2' editor={editor} />
      {/* <BlockButton format='block-quote' label='Quote' /> */}
      <BlockButton format='numbered-list' label='OL' editor={editor} />
      <BlockButton format='bulleted-list' label='UL' editor={editor} />

      <span className='mx-1' />

      <Button
        variant='outline-primary'
        onClick={() => editor.undo()}
      >
        Undo
      </Button>
      <Button
        variant='outline-primary'
        onClick={() => editor.redo()}
      >
        Redo
      </Button>

      <span className='mx-1' />

      <Button
        variant='outline-primary'
        onClick={saveHandler}
      >
        Save
      </Button>
    </ButtonGroup>
  );
};

function MarkButton(props) {
  const {format, label, editor} = props;

  return (
    <Button
      variant={isMarkActive(editor, format) ? 'primary' : 'outline-primary'}
      onClick={event => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >{label}</Button>
  );
};

function BlockButton(props) {
  const {format, label, editor} = props;

  return (
    <Button
      variant={isBlockActive(editor, format) ? 'primary' : 'outline-primary'}
      onClick={event => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >{label}</Button>
  );
};