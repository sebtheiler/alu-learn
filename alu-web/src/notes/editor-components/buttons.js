import React from 'react';
import {Button, ButtonGroup, DropdownButton, Dropdown} from 'react-bootstrap';
import {isMarkActive, toggleMark, isBlockActive, toggleBlock} from './editor';
import {ImageButton} from './images';
import {LinkButton} from './links';

export function EditorButtons(props) {
  const {editor, saveHandler, className, untabbable} = props;

  return (
    <ButtonGroup style={{ flexWrap: 'wrap' }} className={className}>
      <MarkButton format='bold' icon='bold' editor={editor} untabbable={untabbable} />
      <MarkButton format='italic' icon='italic' editor={editor} untabbable={untabbable} />
      <MarkButton format='underline' icon='underline' editor={editor} untabbable={untabbable} />
      <MarkButton format='strikethrough' icon='strikethrough' editor={editor} untabbable={untabbable} />
      <MarkButton format='code' icon='code' editor={editor} untabbable={untabbable} />

      <span className='mx-2' />

      <LinkButton editor={editor} untabbable={untabbable} />
      <ImageButton editor={editor} untabbable={untabbable} />

      <span className='mx-2' />

      <BlockButton format='heading-one' icon='heading' editor={editor} untabbable={untabbable} />
      {!untabbable && <DropdownButton id="dropdown-basic-button" variant='light' title={<i className={'fas fa-heading fa-xs'} tabIndex={untabbable && '-1'} />}>
        <Dropdown.Item onClick={event => toggleBlock(editor, 'heading-two')}>H2</Dropdown.Item>
        <Dropdown.Item onClick={event => toggleBlock(editor, 'heading-three')}>H3</Dropdown.Item>
        <Dropdown.Item onClick={event => toggleBlock(editor, 'heading-four')}>H4</Dropdown.Item>
        <Dropdown.Item onClick={event => toggleBlock(editor, 'heading-five')}>H5</Dropdown.Item>
        <Dropdown.Item onClick={event => toggleBlock(editor, 'heading-six')}>H6</Dropdown.Item>
      </DropdownButton>}
      {/* <BlockButton format='block-quote' label='Quote' /> */}
      <BlockButton format='numbered-list' icon='list-ol' editor={editor} untabbable={untabbable} />
      <BlockButton format='bulleted-list' icon='list-ul' editor={editor} untabbable={untabbable} />

      <span className='mx-2' />

      <Button
        variant='light'
        onClick={() => editor.undo()}
        tabIndex={untabbable && '-1'}
      >
        <i className='fas fa-undo' />
      </Button>
      <Button
        variant='light'
        onClick={() => editor.redo()}
        tabIndex={untabbable && '-1'}
      >
        <i className='fas fa-redo' />
      </Button>

      <span className='mx-2' />

      {saveHandler && <Button
        variant='light'
        onClick={saveHandler}
      >
        <i className='far fa-save' />
      </Button>}
    </ButtonGroup>
  );
};

function MarkButton(props) {
  const {format, icon, editor, untabbable} = props;

  return (
    <Button
      variant='light'
      onClick={event => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
      style={{
        background: isMarkActive(editor, format) ? '#e8f0fe' : undefined,
      }}
      tabIndex={untabbable && '-1'}
    >
      <i className={`fas fa-${icon}`} />
    </Button>
  );
};

function BlockButton(props) {
  const {format, icon, editor, untabbable} = props;

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
      tabIndex={untabbable && '-1'}
    >
      <i className={`fas fa-${icon}`} />
    </Button>
  );
};