import OverlayTrigger from '@components/OverlayTrigger';
import Tooltip from '@components/Tooltip';
import { ExtendedReactEditor } from '../../types';
import { insertLink } from './helpers';

interface LinkButtonProps {
  /**
   * Editor into which to insert the link
   */
  editor: ExtendedReactEditor;
  /**
   * Is the button selectable with tab?
   */
  untabbable: boolean;
}

/**
 * Display a button to insert a link into a SlateJS editor
 */
export default function LinkButton({ editor, untabbable }: LinkButtonProps) {
  return (
    <OverlayTrigger
      overlay={
        <Tooltip id='link-button-tooltip'>
          Insert Link
        </Tooltip>
      }
    >
      <button
        onClick={event => {
          event.preventDefault();
          const url = window.prompt('Enter the URL of the link:');
          if (!url) return;
          insertLink(editor, url);
        }}
        style={{
          background: 'rgba(0, 0, 0, 0)',
          border: 'none',
        }}
        tabIndex={untabbable && '-1'}
        className='text-dark'
      >
        <i className='fas fa-link' />
      </button>
    </OverlayTrigger>
  );
}

