import Button from '@components/Button';
import ButtonGroup from '@components/ButtonGroup';
import Dropdown from '@components/Dropdown';
import DropdownButton from '@components/DropdownButton';
import FlashCardLinkButton from '@slate-plugins/FlashcardLink/button';
import LinkButton from '@slate-plugins/Link/button';
import OverlayTrigger from '@components/OverlayTrigger';
import Tooltip from '@components/Tooltip';
import capitalize from '@helpers/capitalize';
import { ReactEditor } from 'slate-react';
import { isMarkActive, toggleMark, isBlockActive, toggleBlock } from '../FullEditor/helpers';

type numbers = 'one' | 'two' | 'three' | 'four' | 'five' | 'six';

type MarkFormat = 'bold' | 'italic' | 'underline' | 'code' | 'math_inline' | 'link' | 'flashcard_link';
type BlockFormat = `heading-${numbers}` | 'numbered-list' | 'bulleted-list' | 'math-block' | 'list-item' | 'image';

interface EditorButtonProps {
  editor: ReactEditor;
  saveHandler?(): void;
  className?: string;
  untabbable?: boolean;
  isFlashCard?: boolean;
  isPro?: boolean;
}
export default function EditorButtons(props: EditorButtonProps) {
  const { editor, saveHandler=undefined, className='', untabbable=false, isFlashCard=false, isPro=false } = props;

  return (
    <ButtonGroup style={{ flexWrap: 'wrap' }} className={className}>
      <MarkButton format='bold' icon='bold' editor={editor} untabbable={untabbable} />
      <MarkButton format='italic' icon='italic' editor={editor} untabbable={untabbable} />
      <MarkButton format='underline' icon='underline' editor={editor} untabbable={untabbable} />
      <MarkButton format='code' icon='code' editor={editor} untabbable={untabbable} />
      <MarkButton format='math_inline' icon='divide' editor={editor} untabbable={untabbable} />
      <LinkButton editor={editor} untabbable={untabbable} />

      {isFlashCard && <>
        <span className='mx-2' />
        <FlashCardLinkButton
          editor={editor}
          untabbable={untabbable}
          enabled={isPro}
        />
      </>}

      <span className='mx-2' />

      {!isFlashCard && <BlockButton format='heading-one' icon='heading' editor={editor} untabbable={untabbable} />}
      {!untabbable &&
        <DropdownButton
          id="dropdown-basic-button"
          variant='editor'
          title={
            <i className={'fas fa-heading fa-xs'} tabIndex={untabbable ? -1 : undefined} />
          }
        >
        <Dropdown.Item onClick={() => toggleBlock(editor, 'heading-two')}>H2</Dropdown.Item>
        <Dropdown.Item onClick={() => toggleBlock(editor, 'heading-three')}>H3</Dropdown.Item>
        <Dropdown.Item onClick={() => toggleBlock(editor, 'heading-four')}>H4</Dropdown.Item>
        <Dropdown.Item onClick={() => toggleBlock(editor, 'heading-five')}>H5</Dropdown.Item>
        <Dropdown.Item onClick={() => toggleBlock(editor, 'heading-six')}>H6</Dropdown.Item>
      </DropdownButton>}
      <BlockButton format='numbered-list' icon='list-ol' editor={editor} untabbable={untabbable} />
      <BlockButton format='bulleted-list' icon='list-ul' editor={editor} untabbable={untabbable} />
      <BlockButton format='math-block' icon='square-root-alt' editor={editor} untabbable={untabbable} />

      <span className='mx-2' />

      {saveHandler && <Button
        variant='editor'
        onClick={saveHandler}
      >
        <i className='far fa-save' />
      </Button>}
    </ButtonGroup>
  );
}

interface MarkButtonProps {
  format: MarkFormat;
  icon: string;
  editor: ReactEditor;
  untabbable: boolean;
}
function MarkButton({ format, icon, editor, untabbable }: MarkButtonProps) {
  return (
    <OverlayTrigger
      overlay={
        <Tooltip id={`mark-tooltip-${format}`}>
          {capitalize(format.replace('_', ' '), true)}
        </Tooltip>
      }
    >
      <Button
        variant='editor'
        onClick={event => {
          event.preventDefault();
          toggleMark(editor, format);
        }}
        style={{
          background: isMarkActive(editor, format) ? '#e1e6ed' : 'rgba(0, 0, 0, 0)',
          border: 'none',
        }}
        tabIndex={untabbable ? -1 : undefined}
        className='text-dark'
      >
        <i className={`fas fa-${icon}`} />
      </Button>
    </OverlayTrigger>
  );
}

interface BlockButtonProps {
  format: BlockFormat;
  icon: string;
  editor: ReactEditor;
  untabbable: boolean;
}
function BlockButton({ format, icon, editor, untabbable }: BlockButtonProps) {
  return (
    <OverlayTrigger
      overlay={
        <Tooltip id={`block-tooltip-${format}`}>
          {capitalize(format.replace('-', ' '), true)}
        </Tooltip>
      }
    >
      <Button
        variant='editor'
        onClick={event => {
          event.preventDefault();
          toggleBlock(editor, format);
        }}
        style={{
          background: isBlockActive(editor, format) ? '#e1e6ed' : 'rgba(0, 0, 0, 0)',
          border: 'none',
        }}
        tabIndex={untabbable ? -1 : undefined}
        className='text-dark'
      >
        <i className={`fas fa-${icon}`} />
      </Button>
    </OverlayTrigger>
  );
}
