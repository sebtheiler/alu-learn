import React, { useState } from 'react';
import {DeckDefaultButtonGroup, DeckForeignUserButtonGroup} from './buttons';
import {NoteDefaultButtonGroup} from '../notes/buttons';
import {FlashCardsList} from './flashcards';
import {apiDeckThank} from '../lookup';
import {DisplayCountChar, errorHandler, MarkdownRender} from '../utils';
import {UserLink} from '../profiles';
import {Card, ButtonGroup, Button} from 'react-bootstrap';

// Display an individual deck
// This is used on pages displaying multiple decks
export function Deck(props) {
  const {deck, currentUsername, type} = props;
  const className = props.className ? props.className : 'col-10 mx-auto col-md-6';

  if (deck.length === 0) {
    return <div>Loading...</div>
  };

  return (
    <div className={className}>
      <Card className='border-0'>
        <Card.Body>
          <Card.Title className='mb-0'>
            {deck.serializer_name === 'cssm' && <><i className='fas fa-filter' />{' '}</>}
            {deck.title}
          </Card.Title>
          <Card.Text>{deck.description}</Card.Text>
          <ButtonGroup>
            {type === 'note' ? 
              <NoteDefaultButtonGroup note={deck} />
            :
              (currentUsername === deck.author.username ?
                <DeckDefaultButtonGroup deck={deck} />
              : <Button href={`/decks/${deck.id}/`}>View</Button>)
            }
          </ButtonGroup>
        </Card.Body>
      </Card>
    </div>
  );
};

// This is used on pages displaying a single deck
export function DeckDetail(props) {
  const {deck, flashcards, numFlashcards, currentUsername, hideExtras, titleLink} = props;
  const textAlign = props.textAlign ? props.textAlign : 'center';
  // const [browsingState, setBrowsingState] = useState('FLASHCARDS');
  const [thankBtnLabel, setThankBtnLabel] = useState(deck.you_have_thanked ? 'Thanked' : 'Thank');

  // const handleBrowseSwitch = (event) => {
  //   event.preventDefault();
  //   setBrowsingState(browsingState === 'FLASHCARDS' ? 'COMMENTS' : 'FLASHCARDS');
  // };

  const handleThankDeck = (event) => {
    event.preventDefault();
    if (deck.you_have_thanked !== true) {
      setThankBtnLabel('Loading...');
      apiDeckThank(deck.id, (response, status) => {
        if (status === 201) {
          deck.you_have_thanked = true;
          deck.num_thanks++;
          setThankBtnLabel('Thanked');
        } else {
          // Error thanking deck
          setThankBtnLabel('Thank');
          errorHandler(response, status, 1005);
        };
      });
    };
  };

  return (
    <div className={`text-${textAlign}`}>
      <div>
        <a href={titleLink ? `/decks/${deck.id}/` : null}>
          <h1 className='mb-0 text-dark'>{deck.title}</h1>
        </a>
        <UserLink user={deck.author} />
        <p className='text-secondary mb-3'>
          {/* <DisplayCountChar>{deck.num_thanks}</DisplayCountChar> {'thank' + (deck.num_thanks !== 1 ? 's' : '')}
          {' --- '} */}
          <DisplayCountChar>{deck.num_clones}</DisplayCountChar> {deck.num_clones !== 1 ? 'copies' : 'copy'}
        </p>
        <MarkdownRender source={deck.description} />
        {/* <div className={'mb-1' + (hideExtras ? ' d-none' : '')}>
          <ButtonGroup>
            <Button onClick={handleBrowseSwitch}>
              {browsingState === 'FLASHCARDS' ? 'Display Comments' : 'Display Flashcards'}
            </Button>
          </ButtonGroup>
        </div> */}
      </div>
      {hideExtras ? null : <div>
        {/* <div className={browsingState !== 'COMMENTS' ? 'd-none' : ''}>
            <hr />
            <div>
              <h2>Comments</h2>
              <p>Comments are currently not implemented.  We hope to add this funcitonality soon.</p>
            </div>
        </div> */}
        <div>{/* className={browsingState !== 'FLASHCARDS' ? 'd-none' : ''}> */}
          <hr />
          <div className='text-center'>
            <h2>Example Flashcards</h2>
            {flashcards && <>
              <h5>{`(${numFlashcards} in total, ${Math.min(numFlashcards, 10)} displayed)`}</h5>
              {currentUsername === deck.author.username ?
                <ButtonGroup>
                  <Button href={`/decks/${deck.creators[0]}/share/`}>
                    Update Settings
                  </Button>
                  <Button href={`/decks/${deck.id}/flashcards/`} className='ml-1'>
                    View Flashcards
                  </Button>
                </ButtonGroup> 
              :
                <DeckForeignUserButtonGroup deck={deck} handleThankDeck={handleThankDeck} thankBtnLabel={thankBtnLabel} />
              }
              <div>
                <FlashCardsList flashcardList={flashcards.slice(0, 10)} foreignUser={true} />
              </div>
            </>}
          </div>
        </div>
      </div>}
    </div>
  );
};