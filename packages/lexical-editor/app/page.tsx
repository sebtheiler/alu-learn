"use client";
import LexicalEditor from '../src/LexicalEditor';
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import "./style.css";
import { useState } from 'react';
import Button from 'alu-ui/src/Button';
import ButtonGroup from 'alu-ui/src/ButtonGroup';

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
});

const App: React.FC = () => {
  const [editable, setEditable] = useState(true);
  const [isPro, setIsPro] = useState(true);

  return (
    <div>
      <ApolloProvider client={apolloClient}>
        <div className="container max-w-4xl mx-auto mt-10">
          <h1 className="font-bold text-4xl text-center my-3">Lexical Editor Playground</h1>
          <LexicalEditor
            style={{ minHeight: '500px' }}
            namespace="default"
            editable={editable}
            isPro={isPro}
            verticalOffset={40} // mt-10
            includeCloze
            createExtractCallback={(html) => console.log(`Made an extract: ${html}`)}
            maxLength={0}
          />

          <ButtonGroup className='mt-2' spaced>
            <Button onClick={() => setEditable(!editable)}>
              Mode: {editable ? "editable" : "view-only"}
            </Button>
            <Button onClick={() => setIsPro(!isPro)}>
              Pro: {isPro ? "is pro" : "not pro"}
            </Button>
          </ButtonGroup>
        </div>
      </ApolloProvider>
    </div>
  );
}

export default App;
