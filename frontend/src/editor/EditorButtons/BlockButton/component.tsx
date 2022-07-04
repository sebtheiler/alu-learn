import capitalize from 'helpers/capitalize';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { ReactEditor } from 'slate-react';
import { isBlockActive, toggleBlock } from '../../FullEditable/helpers';

type numbers = 'one' | 'two' | 'three' | 'four' | 'five' | 'six';
type BlockFormat = `heading-${numbers}` | 'numbered-list' | 'bulleted-list' | 'math-block' | 'list-item' | 'image';

interface BlockButtonProps {
  /**
   * Rich text block format for the button to apply to the editor
   */
  format: BlockFormat;
  /**
   * Font Awesome icon to display in the button
   */
  faIcon: IconProp;
  /**
   * SlateJS editor to apply the styling to
   */
  editor: ReactEditor;
  /**
   * Is the button able to be selected with tab?
   */
  tabbable: boolean;
}

/**
 * Displays a button to apply block rich text formatting to an editor
 */
export default function BlockButton({ format, faIcon, editor, tabbable=true }: BlockButtonProps) {
  return (
    <OverlayTrigger
      overlay={
        <Tooltip id={`block-tooltip-${format}`}>
          {capitalize(format.replace('-', ' '), true)}
        </Tooltip>
      }
    >
      <button
        onClick={event => {
          event.preventDefault();
          toggleBlock(editor, format);
        }}
        style={{
          background: isBlockActive(editor, format) ? '#e1e6ed' : 'transparent',
        }}
        tabIndex={tabbable ? undefined : -1}
        className='p-1 mx-1'
      >
        <FontAwesomeIcon icon={faIcon} />
      </button>
    </OverlayTrigger>
  );
}
