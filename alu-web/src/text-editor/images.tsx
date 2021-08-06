import React from 'react';
import Button from 'react-bootstrap/Button';
import { Element, Text, Transforms } from 'slate';
import { ReactEditor, useFocused, useSelected } from 'slate-react';
import isUrl from 'is-url';
import imageExtensions from 'image-extensions';

export const withImages = editor => {
  const { insertData, isVoid } = editor;

  editor.isVoid = (element: Element) => {
    return element.type === 'image' ? true: isVoid(element);
  }

  editor.insertData = data => {
    const text = data.getData('text/plain');
    const { files } = data;

    if (files && files.length > 0) {
      for (const file of files) {
        const reader = new FileReader();
        const [mime] = file.type.split('/');

        if (mime === 'image') {
          reader.addEventListener('load', () => {
            const url = reader.result as string;
            insertImage(editor, url);
          });

          reader.readAsDataURL(file);
        }
      }
    } else if (isImageUrl(text)) {
      insertImage(editor, text);
    } else {
      insertData(data);
    }
  }

  return editor;
}

export const ImageElement = ({ attributes, children, element }) => {
  const selected = useSelected();
  const focused = useFocused();
  return (
    <div {...attributes}>
      <div contentEditable={false}>
        <img
          // TODO: re-enable with CDN: `element.url`
          src='https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/263px-Wikipedia-logo-v2.svg.png'
          style={{
            display: 'block',
            maxWidth: '100%',
            maxHeight: '20em',
            marginLeft: 'auto', marginRight: 'auto',
            boxShadow: `${selected && focused ? '0 0 0 3px #B4D5FF' : 'none'}`,
          }}
          alt=''
        />
      </div>
      {children}
    </div>
  );
}

const isImageUrl = (url: string) => {
  if (!url) return false;
  if (!isUrl(url)) return false;

  const ext = new URL(url).pathname.split('.').pop();
  if (!ext) return false;

  return imageExtensions.includes(ext.toLowerCase());
}

const insertImage = (editor: ReactEditor, url: string) => {
  const text: Text = { text: '' };
  const image: Element = { type: 'image', url, children: [text] };
  Transforms.insertNodes(editor, image);
}

export function ImageButton({ editor, untabbable }) {
  return (
    <Button
      variant='light'
      onClick={event => {
        event.preventDefault();
        const url = window.prompt('Enter the URL of the image:');
        if (!url) return;
        insertImage(editor, url);
      }}
      style={{
        background: 'rgba(0, 0, 0, 0)',
        border: 'none',
      }}
      tabIndex={untabbable && '-1'}
    >
      <i className='fas fa-image' />
    </Button>
  );
}
