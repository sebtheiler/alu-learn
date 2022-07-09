import BlockButton from './BlockButton';
import FlashCardLinkButton from '@slate-plugins/FlashcardLink/button';
import LinkButton from '@slate-plugins/Link/button';
import MarkButton from './MarkButton';
import { faBold, faItalic, faUnderline, faCode, faDivide, faHeading, faListOl, faListUl, faSquareRootAlt } from '@fortawesome/free-solid-svg-icons'

import type { ReactEditor } from 'slate-react';

interface EditorButtonProps {
  /**
   * SlateJS editor that the buttons will affect
   */
  editor: ReactEditor;
  /**
   * Classname to apply to the div
   */
  className?: string;
  /**
   * Is the button selectable with tab?
   */
  tabbable?: boolean;
  /**
   * Should the flashcard link button be displayed?
   */
  displayFlashCardLinkButton?: boolean;
  /**
   * Should the heading button be displayed?
   */
  displayHeadingButton?: boolean;
  /**
   * Is the current use a pro-user? If not, some buttons are inaccessible
   */
  isPro?: boolean;
}

/**
 * Displays a row of buttons that apply rich text formatting to an editor
 */
export default function EditorButtons({
  editor,
  className='',
  tabbable=false,
  displayFlashCardLinkButton=true,
  displayHeadingButton=false,
  isPro=false,
}: EditorButtonProps) {
  return (
    <div className={'divide-x ' + className}>
      <div className='inline px-2'>
        <MarkButton format='bold' faIcon={faBold} editor={editor} tabbable={tabbable} />
        <MarkButton format='italic' faIcon={faItalic} editor={editor} tabbable={tabbable} />
        <MarkButton format='underline' faIcon={faUnderline} editor={editor} tabbable={tabbable} />
        <MarkButton format='code' faIcon={faCode} editor={editor} tabbable={tabbable} />
        <MarkButton format='math_inline' faIcon={faDivide} editor={editor} tabbable={tabbable} />
        <LinkButton editor={editor} tabbable={tabbable} />
      </div>

      {displayFlashCardLinkButton && <div className='inline px-2'>
        <FlashCardLinkButton
          editor={editor}
          tabbable={tabbable}
          isPro={isPro}
        />
      </div>}

      <div className='inline px-2'>
        {displayHeadingButton && <BlockButton
          format='heading-one'
          faIcon={faHeading}
          editor={editor}
          tabbable={tabbable}
        />}
        <BlockButton format='numbered-list' faIcon={faListOl} editor={editor} tabbable={tabbable} />
        <BlockButton format='bulleted-list' faIcon={faListUl} editor={editor} tabbable={tabbable} />
        <BlockButton format='math-block' faIcon={faSquareRootAlt} editor={editor} tabbable={tabbable} />
      </div>
    </div>
  );
}
