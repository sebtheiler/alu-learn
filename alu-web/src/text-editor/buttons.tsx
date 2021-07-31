import React from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import { isMarkActive, toggleMark, isBlockActive, toggleBlock } from './editor';
import { ImageButton } from './images';
import { LinkButton } from './links';
import { ReactEditor } from 'slate-react';

interface EditorButtonProps {
  editor: ReactEditor;
  saveHandler?(): void;
  className?: string;
  untabbable?: boolean;
}
export function EditorButtons(props: EditorButtonProps) {
  const { editor, saveHandler=undefined, className='', untabbable=false } = props;
  return (
    <ButtonGroup style={{ flexWrap: 'wrap' }} className={className}>
      <MarkButton format='bold' icon='bold' editor={editor} untabbable={untabbable} />
      <MarkButton format='italic' icon='italic' editor={editor} untabbable={untabbable} />
      <MarkButton format='underline' icon='underline' editor={editor} untabbable={untabbable} />
      <MarkButton format='code' icon='code' editor={editor} untabbable={untabbable} />
      <MarkButton format='math_inline' icon='divide' editor={editor} untabbable={untabbable} />

      <span className='mx-2' />

      <LinkButton editor={editor} untabbable={untabbable} />
      <ImageButton editor={editor} untabbable={untabbable} />

      <span className='mx-2' />

      <BlockButton format='heading-one' icon='heading' editor={editor} untabbable={untabbable} />
      {!untabbable &&
        <DropdownButton
          id="dropdown-basic-button"
          variant='light'
          title={
            <i className={'fas fa-heading fa-xs'} tabIndex={untabbable ? -1 : undefined} />
          }
        >
        <Dropdown.Item onClick={event => toggleBlock(editor, 'heading-two')}>H2</Dropdown.Item>
        <Dropdown.Item onClick={event => toggleBlock(editor, 'heading-three')}>H3</Dropdown.Item>
        <Dropdown.Item onClick={event => toggleBlock(editor, 'heading-four')}>H4</Dropdown.Item>
        <Dropdown.Item onClick={event => toggleBlock(editor, 'heading-five')}>H5</Dropdown.Item>
        <Dropdown.Item onClick={event => toggleBlock(editor, 'heading-six')}>H6</Dropdown.Item>
      </DropdownButton>}
      <BlockButton format='numbered-list' icon='list-ol' editor={editor} untabbable={untabbable} />
      <BlockButton format='bulleted-list' icon='list-ul' editor={editor} untabbable={untabbable} />
      <BlockButton format='math-block' icon='square-root-alt' editor={editor} untabbable={untabbable} />

      <span className='mx-2' />

      {saveHandler && <Button
        variant='light'
        onClick={saveHandler}
      >
        <i className='far fa-save' />
      </Button>}
    </ButtonGroup>
  );
}

function MarkButton({ format, icon, editor, untabbable }) {
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
}

function BlockButton({ format, icon, editor, untabbable }) {
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
}
