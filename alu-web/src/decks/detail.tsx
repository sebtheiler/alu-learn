import React, { useMemo } from 'react';
import { DeckForeignUserButtonGroup, DefaultSharedDeckButtons } from './buttons';
import { NoteDefaultButtonGroup } from '../notes/buttons';
import { FlashCardsList } from './flashcards';
import { DisplayCountChar, has, MarkdownRender } from '../utils';
import { UserLink } from '../profiles';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Card from 'react-bootstrap/Card';
import { ClassroomDefaultButtonGroup } from '../teachers/buttons';
import { SharedDeck, FlashCard, Deck, CSSM } from './types';
import { Note } from '../notes/types';
import { Classroom } from '../teachers/types';

// Used for displaying any sort of homepage
interface HomePageCardsProps {
  items: (Deck | Note | Classroom | SharedDeck | CSSM)[];
  type: 'deck' | 'note' | 'classroom';
  currentUsername: string;
}
export function HomePageCards(props: HomePageCardsProps) {
  const { items, type, currentUsername } = props;

  return (
    <div className='card-deck text-center mx-auto justify-content-center'>
      {items.map((item, index) => 
        <VariousCard
          card={item}
          currentUsername={currentUsername}
          type={type}
          className='mb-3 mx-1 border bg-white text-dark'
          key={`${index}-${item.id}`}
        />
      )}
    </div>
  );
}

// Display an individual portion of a homepage
// Used on homepages, as well as the shared deck list
interface VariousCardProps {
  card: Deck | SharedDeck | Note | Classroom | CSSM;
  currentUsername: string;
  type: 'note' | 'classroom' | 'deck';
  noButtons?: boolean;
  className?: string;
}
export function VariousCard(props: VariousCardProps) {
  const {card, currentUsername, type, noButtons} = props;
  const className = props.className ? props.className : 'col-10 mx-auto col-md-6';

  const buttons = useMemo(() => {
    if (noButtons) return;
    switch (type) {
      case 'note':
        return <NoteDefaultButtonGroup note={card} />
      case 'classroom':
        return <ClassroomDefaultButtonGroup classroom={card} />
      case 'deck':
        if (has(card, 'author') && currentUsername === card.author.username) {
          // return <DeckDefaultButtonGroup deck={card as Deck} />
          return <p>No</p>
        } else {
          return <Button href={`/decks/${card.id}/`}>View</Button>
        }
    }
  }, [card, currentUsername, noButtons, type]);

  return (
    <div className={className}>
      <Card className='border-0'>
        <Card.Body>
          <Card.Title className='mb-0'>
            {has(card, 'serializer_name') && card.serializer_name === 'cssm' && <>
              <i className='fas fa-filter' />{' '}
            </>}
            {card.title}
          </Card.Title>
          <Card.Text>
            {has(card, 'description') && card.description}
          </Card.Text>
          <ButtonGroup>
            {buttons}
          </ButtonGroup>
        </Card.Body>
      </Card>
    </div>
  );
}

// This is used on pages displaying a single deck
interface DeckDetailProps {
  deck: SharedDeck;
  flashcards?: FlashCard[];
  numFlashcards?: number;
  currentUsername?: string;
  hideExtras?: boolean;
  titleLink?: boolean;
  textAlign?: 'center' | 'left' | 'right';
}
export function DeckDetail(props: DeckDetailProps) {
  const { deck, flashcards, numFlashcards, currentUsername, hideExtras, titleLink, textAlign } = props;

  return (
    <div className={`text-${textAlign}`}>
      <div>
        <a href={titleLink ? `/decks/${deck.id}/` : undefined}>
          <h1 className='mb-0 text-dark'>{deck.title}</h1>
        </a>
        <UserLink user={deck.author} />
        <p className='text-secondary mb-3'>
          <DisplayCountChar>{deck.num_clones}</DisplayCountChar> {deck.num_clones !== 1 ? 'copies' : 'copy'}
        </p>
        <MarkdownRender source={deck.description} />
      </div>
      {hideExtras ? null : <div>
        <div>
          <hr />
          <div className='text-center'>
            <h2>Example Flashcards</h2>
            {flashcards && <>
              {numFlashcards && <h5>{`(${numFlashcards} in total, ${Math.min(numFlashcards, 10)} displayed)`}</h5>}
              {currentUsername === deck.author.username ?
                <DefaultSharedDeckButtons deck={deck} />
              :
                <DeckForeignUserButtonGroup deck={deck} />
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
}
