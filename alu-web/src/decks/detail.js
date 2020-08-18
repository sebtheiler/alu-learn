import React from 'react';
import {DeckDefaultButtonGroup, DeckForeignUserButtonGroup} from './buttons';
import {Card, ButtonGroup} from 'react-bootstrap';


// Display an individual deck
export function Deck(props) {
  const {deck, showUsername, currentUsername} = props; // JSON data with attributes such as `id` and `author`
  const className = props.className ? props.className : 'col-10 mx-auto col-md-6';
  
  // If this is a detail view, i.e., we are not looking at a list of other decks,
  // we do not want to display a link to this deck (since we already there)
  // const path = window.location.pathname;
  // const match = path.match(/(?<deckid>\d+)/);
  // const urlDeckId = match ? match.groups.deckid : -1;
  // const isDetail = `${deck.id}` === `${urlDeckId}`;

  return (
    <div className={className}>
      <Card className='border-0'>
        <Card.Body>
          <Card.Title className='mb-0'>{deck.title}</Card.Title>
          {!showUsername ? null :
            <a href={`/profiles/u/${deck.author.username}`}>
              <small className='text-secondary'>
              {deck.author.first_name} {deck.author.last_name} - @{deck.author.username}
              </small>
            </a>
          }
          <Card.Text>{deck.description}</Card.Text>
          <ButtonGroup>
            {currentUsername === deck.author.username ?
              <DeckDefaultButtonGroup deck={deck} />
            : <DeckForeignUserButtonGroup deck={deck} />
            }
          </ButtonGroup>
        </Card.Body>
      </Card>
    </div>
  );
};