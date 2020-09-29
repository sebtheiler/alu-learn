import React from 'react';
import {Button, ButtonGroup, DropdownButton, Dropdown} from 'react-bootstrap';
import {isMarkActive, toggleMark, isBlockActive, toggleBlock} from './editor';
import {ImageButton} from './images';
import {LinkButton} from './links';

export function EditorButtons(props) {
  const {editor, saveHandler, className} = props;

  return (
    <ButtonGroup style={{ flexWrap: 'wrap' }} className={className}>
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
        {/* <Dropdown.Toggle
          variant='light'
          className='dropdown-toggle'
          id='dropdown-basic'
        >
          <i className={'fas fa-heading fa-xs'} />
        </Dropdown.Toggle> */}
      {/* <Dropdown>
        <Dropdown.Toggle
          variant="light"
        >
          <i className={'fas fa-heading fa-xs'} />
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
          <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
          <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown> */}
      <DropdownButton id="dropdown-basic-button" variant='light' title={<i className={'fas fa-heading fa-xs'} />}>
        <Dropdown.Item onClick={event => toggleBlock(editor, 'heading-two')}>H2</Dropdown.Item>
        <Dropdown.Item onClick={event => toggleBlock(editor, 'heading-three')}>H3</Dropdown.Item>
        <Dropdown.Item onClick={event => toggleBlock(editor, 'heading-four')}>H4</Dropdown.Item>
        <Dropdown.Item onClick={event => toggleBlock(editor, 'heading-five')}>H5</Dropdown.Item>
        <Dropdown.Item onClick={event => toggleBlock(editor, 'heading-six')}>H6</Dropdown.Item>
      </DropdownButton>
      {/* <BlockButton format='heading-two' icon='heading fa-xs' editor={editor} /> */}
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
  const {format, icon, editor} = props;

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