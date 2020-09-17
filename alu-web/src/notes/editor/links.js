import React from 'react';
import {Editor, Transforms, Range} from 'slate';
import {Button, OverlayTrigger, Tooltip} from 'react-bootstrap';
import isUrl from 'is-url'

export const withLinks = editor => {
  const { insertData, insertText, isInline } = editor;

  editor.isInline = element => {
    return element.type === 'link' ? true : isInline(element);
  };

  editor.insertText = text => {
    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertText(text);
    };
  };

  editor.insertData = data => {
    const text = data.getData('text/plain');

    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertData(data);
    };
  };

  return editor;
};

export const LinkElement = ({ attributes, children, element }) => {
  return (
    <OverlayTrigger
      overlay={
        <Tooltip className={'button-tooltip text-center'}>
          <a href={element.url} style={{ color: 'white' }}>
            {element.url.length > 50 ? element.url.substring(0, 15) + '   ...   ' + element.url.substring(element.url.length - 10, element.url.length) : element.url}
          </a>
        </Tooltip>
      }
      placement='top'
      delay={{ show: 20, hide: 550 }}
    >
      <a {...attributes} href={element.url}>
        {children}
      </a>
    </OverlayTrigger>
  );
};

const insertLink = (editor, url) => {
  if (editor.selection) {
    wrapLink(editor, url);
  };
};

const isLinkActive = editor => {
  const [link] = Editor.nodes(editor, { match: n => n.type === 'link' });
  return !!link;
};

const unwrapLink = editor => {
  Transforms.unwrapNodes(editor, { match: n => n.type === 'link' });
};

const wrapLink = (editor, url) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  };

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link = {
    type: 'link',
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  };
};

export function LinkButton(props) {
  const {editor} = props;

  return (
    <Button
      variant='outline-primary'
      onClick={event => {
        event.preventDefault();
        const url = window.prompt('Enter the URL of the link:');
        if (!url) return;
        insertLink(editor, url);
      }}
    >
      Hyperlink
    </Button>
  );
};