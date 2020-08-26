import React, { useState } from 'react';
import {DeckDefaultButtonGroup, DeckForeignUserButtonGroup} from './buttons';
import {FlashCardsList} from './flashcards';
import {apiDeckThank} from '../lookup';
import {DisplayCount} from '../utils';
import {UserLink} from '../profiles';
import {Card, ButtonGroup, Button} from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import RemarkMathPlugin from 'remark-math';
import {BlockMath, InlineMath} from 'react-katex';
import 'katex/dist/katex.min.css';

// Display an individual deck
// This is used on pages displaying multiple decks
export function Deck(props) {
  const {deck, currentUsername} = props; // JSON data with attributes such as `id` and `author`
  const className = props.className ? props.className : 'col-10 mx-auto col-md-6';
  
  // If this is a detail view, i.e., we are not looking at a list of other decks,
  // we do not want to display a link to this deck (since we already there)
  // const path = window.location.pathname;
  // const match = path.match(/(?<deckid>\d+)/);
  // const urlDeckId = match ? match.groups.deckid : -1;
  // const isDetail = `${deck.id}` === `${urlDeckId}`;

  // Still not sure why this happens
  // TODO:
  if (deck.length === 0) {
    return <div>Loading...</div>
  };

  return (
    <div className={className}>
      <Card className='border-0'>
        <Card.Body>
          <Card.Title className='mb-0'>{deck.title}</Card.Title>
          <Card.Text>{deck.description}</Card.Text>
          <ButtonGroup>
            {currentUsername === deck.author.username ?
              <DeckDefaultButtonGroup deck={deck} />
            : <Button href={`/decks/${deck.id}/`}>View</Button>
            }
          </ButtonGroup>
        </Card.Body>
      </Card>
    </div>
  );
};

// This is used on pages displaying a single deck
export function DeckDetail(props) {
  const {deck, currentUsername, hideExtras, titleLink} = props;
  const textAlign = props.textAlign ? props.textAlign : 'center';
  const [browsingState, setBrowsingState] = useState('FLASHCARDS');
  const [thankBtnLabel, setThankBtnLabel] = useState(deck.you_have_thanked ? 'Thanked' : 'Thank');

  const handleBrowseSwitch = (event) => {
    event.preventDefault();
    setBrowsingState(browsingState === 'FLASHCARDS' ? 'COMMENTS' : 'FLASHCARDS');
  };

  const handleThankDeck = (event) => {
    event.preventDefault();
    if (deck.you_have_thanked === false) {
      setThankBtnLabel('Loading...');
      apiDeckThank(deck.id, (response, status) => {
        if (status === 201) {
          deck.you_have_thanked = true;
          deck.num_thanks++;
          setThankBtnLabel('Thanked');
        } else {
          console.log(response, status);
          alert('Error thanking deck');
          setThankBtnLabel('Thank');
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
          <DisplayCount>{deck.num_thanks}</DisplayCount> {'thank' + (deck.num_thanks !== 1 ? 's' : '')}
        </p>
        <ReactMarkdown
          source={deck.description}
          plugins={[RemarkMathPlugin]}
          renderers={{
            math: ({ value }) => <BlockMath>{value}</BlockMath>,
            inlineMath: ({ value }) => <InlineMath>{value}</InlineMath>
          }}
        />
        <div className={'mb-1' + (hideExtras ? ' d-none' : '')}>
          <ButtonGroup>
            <Button onClick={handleBrowseSwitch}>
              {browsingState === 'FLASHCARDS' ? 'Display Comments' : 'Display Flashcards'}
            </Button>
          </ButtonGroup>
        </div>
      </div>
      {hideExtras ? null : <div>
        <div className={browsingState !== 'COMMENTS' ? 'd-none' : ''}>
            <hr />
            <div>
              <h2>Comments</h2>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map((comment, index) => {
                return (
                  <div key={`comment-${index}`}>
                    <p>Comment #{index}</p>
                  </div>
                );
              })}
            </div>
        </div>
        <div className={browsingState !== 'FLASHCARDS' ? 'd-none' : ''}>
          <hr />
          <div className='text-center'>
            <h2>Example flashcards</h2>
            <h5>{`(${deck.flashcards.length} in total, ${Math.min(deck.flashcards.length, 10)} displayed)`}</h5>
            {currentUsername === deck.author.username ? null :
              <DeckForeignUserButtonGroup deck={deck} handleThankDeck={handleThankDeck} thankBtnLabel={thankBtnLabel} />
            }
            <div>
              <FlashCardsList flashcardList={deck.flashcards.slice(0, 10)} foreignUser={true} />
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
};