import React from 'react';
import {Button, ButtonGroup} from 'react-bootstrap';
import {isMarkActive, toggleMark, isBlockActive, toggleBlock} from './editor';
import {ImageButton} from './images';
import {LinkButton} from './links';

export function EditorButtons(props) {
  const {editor, saveHandler} = props;

  return (
    <ButtonGroup style={{ flexWrap: 'wrap' }}>
      <MarkButton format='bold' icon='bold' editor={editor} />
      <MarkButton format='italic' icon='italic' editor={editor} />
      <MarkButton format='underline' icon='underline' editor={editor} />
      <MarkButton format='strikethrough' icon='strikethrough' editor={editor} />
      <MarkButton format='code' icon='code' editor={editor} />

      <span className='mx-2' />

      <LinkButton editor={editor} />
      <ImageButton editor={editor} />

      <span className='mx-2' />

      <BlockButton format='heading-one' icon='heading' editor={editor} />
      <BlockButton format='heading-two' icon='heading fa-xs' editor={editor} />
      {/* <BlockButton format='block-quote' label='Quote' /> */}
      <BlockButton format='numbered-list' icon='list-ol' editor={editor} />
      <BlockButton format='bulleted-list' icon='list-ul' editor={editor} />

      <span className='mx-2' />

      <Button
        variant='light'
        onClick={() => editor.undo()}
      >
        <i className='fas fa-undo' />
      </Button>
      <Button
        variant='light'
        onClick={() => editor.redo()}
      >
        <i className='fas fa-redo' />
      </Button>

      <span className='mx-2' />

      <Button
        variant='light'
        onClick={saveHandler}
      >
        <i className='far fa-save' />
      </Button>
    </ButtonGroup>
  );
};

function MarkButton(props) {
  const {format, icon, editor} = props;

  console.log(isMarkActive(editor, format))
  return (
    <Button
      // variant={isMarkActive(editor, format) ? 'primary' : 'outline-primary'}
      variant='light'
      onClick={event => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
      style={{
        background: isMarkActive(editor, format) ? '#e8f0fe' : undefined,
      }}
    >
      <i className={`fas fa-${icon}`} />
    </Button>
  );
};

function BlockButton(props) {
  const {format, icon, editor} = props;

  return (
    <Button
      variant={'light'}
      onClick={event => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
      style={{
        background: isBlockActive(editor, format) ? '#e8f0fe' : undefined,
      }}
    >
      <i className={`fas fa-${icon}`} />
    </Button>
  );
};