import { useState, useMemo } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import LoadingButton from './buttons/LoadingButton';
import { FlashCard, FlashCardTypes } from '../types';
import { Slate, ReactEditor } from 'slate-react';
import { Node } from 'slate';
import { blankSlateElement, createFullEditor, EditorButtons, FullEditor } from '../../text-editor';
import { QuestionBubble } from '../../utils';
import { apiObjectCreate, apiObjectDelete, apiObjectEdit, useObjectGet } from '../../lookup/lookup';
import './create-flashcard.scss';

const ONE_SIDED_CARDS = ['cloze'];
export default function CreateFlashcard({ deckId, flashcardId }: { deckId: string, flashcardId?: string }) {
  const [frontValue, setFrontValue] = useState<Node[]>(blankSlateElement)
  const [backValue, setBackValue] = useState<Node[]>(blankSlateElement)
  const [flashcardType, setFlashcardType] = useState<FlashCardTypes>('basic');
  const [errorMessage, setErrorMessage] = useState('');
  const [history, setHistory] = useState<FlashCard[]>([]);

  const [flashcard] = useObjectGet<FlashCard>(
    'decks', 'flashcard',
    flashcardId ?? '',
    undefined,
    flashcard => {
      setFrontValue(flashcard.fields[0]);
      if (flashcard.fields.length > 1)
        setBackValue(flashcard.fields[1]);
    },
    !!flashcardId,
  );

  const createFlashcard = async event => {
    event.preventDefault();

    // Check if the flashcard is valid
    switch (flashcardType) {
      case 'basic': case 'reversed':
        if (frontValue === blankSlateElement || backValue === blankSlateElement) {
          setErrorMessage('The front and back of flashcards must not be empty');
          return;
        }
        break;
      case 'cloze':
        const clozeRegex = /{{c\d*::.*?}}/gm;
        const match = JSON.stringify(frontValue).match(clozeRegex);
        if (!match) {
          setErrorMessage('Cloze flashcards must have at least one instance of a cloze deletion');
          return;
        }
        break;
      default:
        break;
    }
    setErrorMessage('');

    const flashcardInfo = {
      fields: ONE_SIDED_CARDS.includes(flashcardType) ? [frontValue] : [frontValue, backValue],
      tags: (document.getElementsByName('tags')[0] as HTMLFormElement)?.value ?? '',
    }
    if (flashcardId) {
      // Edit flashcard
      await apiObjectEdit<FlashCard>('decks', 'flashcard', flashcardId, flashcardInfo);
    } else {
      // Create flashcard
      await apiObjectCreate<FlashCard>('decks', 'flashcard', {
        deck_id: deckId,
        flashcard_type: flashcardType,
        ...flashcardInfo,
      }).then(flashcard => {
        setFrontValue(blankSlateElement);
        setBackValue(blankSlateElement);
        setHistory([flashcard, ...history]);
  
        const flashcardTypeEl = document.getElementById('flashcardType');
        if (flashcardTypeEl) flashcardTypeEl.focus()
      });
    }
  }

  const deleteFlashcard = async event => {
    event.preventDefault();
    if (!flashcardId || !window.confirm('Are you sure you want do delete this flashcard?')) return;
    await apiObjectDelete<FlashCard>('decks', 'flashcard', flashcardId).then(() =>
      window.location.href = `/deck/${deckId}/flashcards/`,
    );
  }

  return (
    <Container className='mt-3'>
      <h1 className='text-center'>
        {flashcardId ? 'Edit' : 'Create'} Flashcard
      </h1>
      <p className='text-center'>
        Use "Tab" to cycle through steps, and use enter to press create once it is selected
      </p>
      <Form onSubmit={event => event.preventDefault()}>
        {!flashcardId && <Form.Group>
          <Form.Label>Flashcard Type</Form.Label>
          <Form.Control
            as='select'
            onChange={event => setFlashcardType(event.target.value as FlashCardTypes)}
            id='flashcardType'
            autoFocus
            custom
          >
            <option value='basic'>Basic</option>
            <option value='reversed'>Basic and Reversed</option>
            <option value='cloze'>Cloze</option>
          </Form.Control>
        </Form.Group>}
        <Form.Group>
          <div className='flashcard-create'>
            <RenderEditor value={frontValue} setValue={setFrontValue} />
          </div>
        </Form.Group>
        {!ONE_SIDED_CARDS.includes(flashcardType) &&
          <Form.Group>
            <div className='flashcard-create'>
              <RenderEditor value={backValue} setValue={setBackValue} />
            </div>
          </Form.Group>
        }
        <Form.Group>
          <Form.Label
            htmlFor='tags'
            className='mb-0 w-100'
          >
            <p className='mb-0'>
              Tags (separate with commas){' '}
              <QuestionBubble>
                You can give your flashcards tags to group them together.
                Learn more [here](/help/flashcard-tags/).
              </QuestionBubble>
            </p>
          </Form.Label>
          <Form.Control
            type='text'
            placeholder='unit 1, unit 1.1, europe, people, ...'
            defaultValue={flashcard?.tags}
            id='tags'
            name='tags'
            maxLength={1024}
            style={{ textTransform: 'lowercase' }}
          />
         </Form.Group>
         <Form.Group className='text-center mt-1'>
           <p className='text-center text-danger'>{errorMessage}</p>
           <LoadingButton
             clickFunc={createFlashcard}
             variant='primary'
             id='create'
             block
           >
             {flashcardId ? 'Save' : 'Create'}
           </LoadingButton>
         </Form.Group>
      </Form>
      <Row>
        {history.length > 0 && <Col>
          <Form.Control
            as='select'
            name='history'
            style={{ maxWidth: '300px' }}
            onChange={event => {
              // Get selected value and open new page editing that flashcard
              const target = event.target as HTMLSelectElement;
              const flashcardId = target.options[target.selectedIndex].value;
              if (flashcardId.length >= 4)
                window.open(`/deck/${deckId}/flashcards/${flashcardId}/edit/`);
            }}
            custom
          >
            <option value='-1'>Recent Flashcards</option>
            {history.map(flashcard =>
              <option key={flashcard.id} value={flashcard.id}>
                {(flashcard.fields[0][0] as any).children[0].text.slice(0, 20)}...
              </option>
            )}
          </Form.Control>
        </Col>}
        {deckId && <Col>
          <ButtonGroup className='float-right'>
            <Button
              href={`/deck/${deckId}/flashcards/`}
              target='_blank'
            >
              View All Flashcards
            </Button>
            {flashcardId && <LoadingButton
              clickFunc={deleteFlashcard}
              variant='danger'
              className='ml-1'
            >
              Delete
            </LoadingButton>}
          </ButtonGroup>
        </Col>}
      </Row>
    </Container>
  );
}

interface RenderEditorProps {
  value: Node[];
  setValue: (value: Node[]) => void;
}
function RenderEditor({ value, setValue }: RenderEditorProps) {
  const editor = useMemo<ReactEditor>(
    () => createFullEditor(),
    [],
  );

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => {
        setValue(newValue);
      }}
    >
      <div className='editor-head'>
        <EditorButtons
          editor={editor}
          untabbable
        />
      </div>
      <FullEditor
        id='frontText'
        editor={editor}
        styleOptions={{ minHeight: '200px' }}
      />
    </Slate>
  );
}
