import RenderEditor from 'editor/RenderEditor'
import blankSlateElement from '@helpers/blankSlateElement';
import { ReactEditor } from 'slate-react';
import { createFullEditor } from 'editor/FullEditable';
import { useMemo, useState } from 'react'
// import 'bootstrap/dist/css/bootstrap.min.css';
import 'main.scss';
import 'index.scss';

function App() {
  const editor = useMemo<ReactEditor>(createFullEditor, []);
  const [value, setValue] = useState(blankSlateElement);

  return (
    <div className="App">
      <RenderEditor
        editor={editor}
        value={value}
        setValue={setValue as any}
      />
    </div>
  );
}

export default App;
