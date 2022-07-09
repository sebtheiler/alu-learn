import Tooltip from '@components/Tooltip';
import { ExtendedReactEditor } from '../../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons'
import { insertLink } from './helpers';

interface LinkButtonProps {
  /**
   * Editor into which to insert the link
   */
  editor: ExtendedReactEditor;
  /**
   * Is the button selectable with tab?
   */
  tabbable: boolean;
}

/**
 * Display a button to insert a link into a SlateJS editor
 */
export default function LinkButton({ editor, tabbable=true }: LinkButtonProps) {
  return (
    <Tooltip tooltip='Insert Link'>
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
        tabIndex={tabbable ? undefined : -1}
        className='px-2 py-1'
      >
        <FontAwesomeIcon icon={faLink} />
      </button>
    </Tooltip>
  );
}

