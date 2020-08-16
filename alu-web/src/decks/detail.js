import React from 'react';
import {EditButton, RedirectButton} from './buttons';
import {
  Card, CardText, CardBody,
  CardTitle, ButtonGroup
} from 'reactstrap';


// Display an individual deck
// This will be heavily revamped in the future
// to look more like a deck and less like a Tweet
export function Deck(props) {
  const {deck} = props; // JSON data with attributes such as `id` and `author`
  const className = props.className ? props.className : 'col-10 mx-auto col-md-6';
  
  // If this is a detail view, i.e., we are not looking at a list of other decks,
  // we do not want to display a link to this deck (since we already there)
  const path = window.location.pathname;
  const match = path.match(/(?<deckid>\d+)/);
  const urlDeckId = match ? match.groups.deckid : -1;
  const isDetail = `${deck.id}` === `${urlDeckId}`;

  if (deck.length === 0) {
    // Still not sure why this happens
    // Will need to investigate further
    return null;
  };

  return (
    <div className={className}>
      <Card className='border-0'>
        <CardBody>
          <CardTitle>{deck.title}</CardTitle>
          <CardText>{deck.description}</CardText>
          <ButtonGroup>
            <EditButton deck={deck} />
            <RedirectButton deck={deck} link={{href: isDetail ? 'flashcards/create/' : `${deck.id}/flashcards/create/`, display: 'Add Cards'}} />
            <RedirectButton deck={deck} link={{href: isDetail ? 'flashcards/' : `${deck.id}/flashcards/`, display: 'Browse'}} />
            <RedirectButton deck={deck} link={{href: isDetail ? 'study/' : `${deck.id}/study/`, display: 'Study'}} />
          </ButtonGroup>
        </CardBody>
      </Card>
    </div>
  );
};