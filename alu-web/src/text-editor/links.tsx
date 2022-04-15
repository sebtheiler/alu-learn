import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import isUrl from 'is-url'
import { Editor, Transforms, Range } from 'slate';
import { ReactEditor } from 'slate-react';

export const withLinks = (editor: ReactEditor) => {
  const { insertData, insertText, isInline } = editor;

  editor.isInline = element => {
    return element.type === 'link' ? true : isInline(element);
  }

  // If pasting a link, automatically make it a link
  editor.insertText = text => {
    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertText(text);
    }
  }

  editor.insertData = data => {
    const text = data.getData('text/plain');
    console.log('qwoeijdqpeowijdpoeqwijdq', data, text)

    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertData(data);
    }
  }

  return editor;
}

export const LinkElement = ({ attributes, children, element }) => {
  return (
    <OverlayTrigger
      overlay={
        <Tooltip className='button-tooltip text-center' id='link-tooltip'>
          <a href={element.url} style={{ color: 'white' }} target='_blank' rel='noreferrer'>
            {element.url.length > 50
              ? element.url.substring(0, 15) + '   ...   ' + element.url.substring(element.url.length - 10, element.url.length)
              : element.url
            }
          </a>
        </Tooltip>
      }
      placement='top'
      delay={{ show: 20, hide: 550 }}
    >
      <a {...attributes} href={element.url} target='_blank' rel='noreferrer'>
        {children}
      </a>
    </OverlayTrigger>
  );
}

const insertLink = (editor: ReactEditor, url: string) => {
  if (editor.selection) {
    wrapLink(editor, url);
  }
}

const isLinkActive = (editor: ReactEditor) => {
  const [link] = Editor.nodes(editor, { match: n => n.type === 'link' });
  return !!link;
}

const unwrapLink = (editor: ReactEditor) => {
  Transforms.unwrapNodes(editor, { match: n => n.type === 'link' });
}

const wrapLink = (editor: ReactEditor, url: string) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link = {
    type: 'link',
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };

  console.log('insert link', editor, link, isCollapsed);
  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    console.log('fcl', { selection: editor.selection })
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
}

export function LinkButton({ editor, untabbable }) {
  return (
    <OverlayTrigger
      overlay={
        <Tooltip id='link-button-tooltip'>
          Insert Link
        </Tooltip>
      }
    >
      <Button
        variant='editor'
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
      </Button>
    </OverlayTrigger>
  );
}
