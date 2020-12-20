import React, { useState, useMemo, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { QuestionBubble, errorHandler } from '../../utils';
import { apiFlashCardSuspendLeech, apiFlashCardDelete } from '../../lookup';
import { createFullEditor, FullEditor } from '../../notes/editor-components';
import { Slate } from 'slate-react';
import './detail.css';


// At the time of coding creating error boundaries with hooks is not possible
// Ideally when this functionality is added to React, this component would be updated
class FlashCardRenderErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasFlash: false }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  // componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo);
  // }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <p>Something went wrong. Please report this issue.</p>;
    }

    return this.props.children; 
  }
}


export function RenderFlashCardText(props) {
  const {flashcard, fixSlateLazy} = props;
  
  const [frontValue, setFrontValue] = useState(flashcard.deck_fields[0].text);
  const frontEditor = useMemo(
    () => createFullEditor(),
    []
  );
  const [backValue, setBackValue] = useState(flashcard.deck_fields.length > 1 && flashcard.deck_fields[1].text);
  const backEditor = useMemo(
    () => createFullEditor(),
    []
  );
 
  useEffect(() => {
    try {
      if (fixSlateLazy) {
        // Slate is lazy and won't automatically update the editor when the flashcard
        // prop is changed, so we manually have to check if it has changed
        // The frontValue dependency is excluded on purpose - including it causes infinite loop
        if (flashcard.deck_fields[0].text !== frontValue || (flashcard.deck_fields.length > 1 && flashcard.deck_fields[1].text !== backValue)) {
          setFrontValue(flashcard.deck_fields[0].text);
          setBackValue(flashcard.deck_fields.length > 1 && flashcard.deck_fields[1].text);
        }
      }
    } catch (e) {
      console.log(e);
    }
    // eslint-disable-next-line
  }, [flashcard]);

  try {
      switch (flashcard.flashcard_type) {
      case 'basic': case 'reversed': // two-sided
        return (
          <FlashCardRenderErrorBoundary>
            <div className='col-md-6 text-center'>
              <Slate
                editor={frontEditor}
                value={frontValue}
                onChange={newValue => {
                  setFrontValue(newValue);
                }}
              >
                <FullEditor
                  editor={frontEditor}
                  readOnly={true}
                  styleOptions={{ showBorder: false, minHeight: '0px' }}
                />
              </Slate>
            </div>
            <div className='col-md-6 text-center'>
              <Slate
                editor={backEditor}
                value={backValue}
                onChange={newValue => {
                  setBackValue(newValue);
                }}
              >
                <FullEditor
                  editor={backEditor}
                  readOnly={true}
                  styleOptions={{ showBorder: false, minHeight: '0px' }}
                />
              </Slate>
            </div>
          </FlashCardRenderErrorBoundary>
        )
      case 'cloze': // one-sided
        return (
          <FlashCardRenderErrorBoundary>
            <div className='col-md-12 text-center'>
              <Slate
                editor={frontEditor}
                value={frontValue}
                onChange={newValue => {
                  setFrontValue(newValue);
                }}
              >
                <FullEditor
                  editor={frontEditor}
                  readOnly={true}
                  styleOptions={{ showBorder: false, minHeight: '0px' }}
                />
              </Slate>
            </div>
          </FlashCardRenderErrorBoundary>
        );
      default:
        return (
          <div className='col-md-12 text-center'>
            <strong>Invalid flashcard type "{flashcard.flashcard_type}". Please report this issue.</strong>
          </div>
        );
    }
  } catch (e) {
    console.log(e);
  }
}


// Display an individual flashcard
export function FlashCard(props) {
  const {flashcard, number, showParentDeckTitle, suspendCallback, deleteCallback, foreignUser, hideSuspend, fixSlateLazy} = props;

  const [deleteIsLoading, setDeleteIsLoading] = useState(false);
  const [suspendIsLoading, setSuspendIsLoading] = useState(false);

  const handleSuspend = (event) => {
    event.preventDefault();

    if (suspendIsLoading === false) {
      setSuspendIsLoading(true);

      const action = flashcard.is_suspended ? 'unsuspend' : 'suspend';
      apiFlashCardSuspendLeech(flashcard.parent_deck_id, flashcard.id, action, (response, status) => {
        if (status === 200) {
          flashcard.is_suspended = action === 'suspend';
          suspendCallback();
          setSuspendIsLoading(false);
        } else {
          // Error suspending/leeching flashcard
          errorHandler(response, status, 2003);
        }
      });
    }
  }

  const handleDelete = (event) => {
    event.preventDefault();

    if (deleteIsLoading === false) {
      setDeleteIsLoading(true);

      apiFlashCardDelete(flashcard.parent_deck_id, flashcard.creator_id || flashcard.id, (response, status) => {
        if (status === 200) {
          deleteCallback();
          setDeleteIsLoading(false);
        } else if (status === 400) {
          // Act like its been deleted even if it hasn't
          // might be bad practice, but it works for when you delete a single creator that deletes multiple flashcards
          deleteCallback();
          setDeleteIsLoading(false);
        } else {
          // Error deleting flashcard
          errorHandler(response, status, 2004);
        }
      });
    }

  }

  if (!flashcard) {
    return null;
  }

  return (
    <div className={'container-fluid border my-3' + (foreignUser ? '' : (flashcard.is_suspended ? ' suspended' : '') + (flashcard.is_leech ? ' leech' : ''))}>
      <div className='row mt-3 text-center'>
        <div className='col-md-12'>
          <p className='mb-0'>
            <strong>Flashcard - #{number + 1}</strong>
            {flashcard.learning_status !== 'UNSEEN' && !foreignUser ? <> | Type: "{flashcard.flashcard_type}"</> : null}
          </p>
          {showParentDeckTitle ? 
            <small className='text-secondary'>
              From <a href={`/decks/${flashcard.parent_deck_id}/`}>"{flashcard.parent_deck_title}"</a>
            </small>
          : null}
          <p className={foreignUser ? 'd-none' : ''}>
            <em className={flashcard.is_leech ? '' : 'd-none'}>
              This flashcard is a leech{' '}
              <QuestionBubble>
                A leech is a card that you've repeatedly struggled to learn.
                You should give this card special attention, such as rewording the question, or reviewing the material.
                You can learn more [here](/help/leeches/).
              </QuestionBubble>
              <br />
            </em>
            <em className={flashcard.is_suspended ? '' : 'd-none'}>
              This flashcard is suspended{' '}
              <QuestionBubble>
                A suspended card will not be shown to you when you study this deck. Learn more [here](/help/suspended/).
              </QuestionBubble>
              <br />
            </em>
          </p>
        </div>
      </div>
      <div className='row'>
        <RenderFlashCardText flashcard={flashcard} fixSlateLazy={fixSlateLazy} />
      </div>
      <div className='text-center mx-auto w-50' style={{ wordWrap: 'break-word' }}>
        {flashcard.tags ? 
          <>
            Tags: <br />
            {flashcard.tags}
          </>
        : null}
      </div>
      {foreignUser ? null : 
        <div className='col-md-12 mb-3 text-center'>
          <div className='btn-group'>
            <Button href={`/decks/${flashcard.parent_deck_id}/flashcards/${flashcard.creator_id || flashcard.id}/edit/`} variant='primary'>Edit</Button>
            {!hideSuspend && <Button onClick={handleSuspend} variant='primary' className='ml-1'>
              {suspendIsLoading ? (flashcard.is_suspended ? 'Unsuspending...' : 'Suspending...') : (flashcard.is_suspended ? 'Unsuspend' : 'Suspend')}
            </Button>}
            <Button onClick={handleDelete} variant='danger' className='ml-1'>
              {deleteIsLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      }
    </div>
  );
}