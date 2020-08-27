import React from 'react';
import {Card, CardDeck} from 'react-bootstrap';

export function CustomCard(props) {
  const {faName, headerText, imageUrl, imageAlt, bodyText, className} = props;

  return (
    <Card className={'text-center mb-5 ' + className} style={{width: '33%'}}>
      <Card.Header>
        <h2>
          <i className={`fas fa-${faName}`} />{' '}
          {headerText}
        </h2>
      </Card.Header>
      <Card.Img
        src={imageUrl}
        alt={imageAlt}
      />
      <Card.Body>
        <em>{bodyText}</em>
      </Card.Body>
    </Card>
  );
};

export function HowItWorks(props) {
  return (
    <>
      <CustomCard
        faName='pencil-alt'
        headerText='Take Notes'
        imageUrl='https://www.wordtemplatesonline.net/wp-content/uploads/Cornell-Notetaking-Template-24.jpg'
        imageAlt='The Cornell note-taking system'
        className='mx-auto'
        bodyText={<>
          Take powerful notes using <strong>Cornell</strong>{' '}
          and <strong>Hierarchical</strong> note systems
        </>}
      />
      <CardDeck className='mx-auto' style={{width: '66%'}}>
        <CustomCard
          faName='plus'
          headerText='Create Flashcards'
          imageUrl='http://127.0.0.1:8000/static/images/create-flashcard.png'
          imageAlt='The page for creating flashcards'
          className='ml-4'
          bodyText={<>
            Quickly turn your notes into flashcards
          </>}
        />
        <CustomCard
          faName='search'
          headerText='Find Flashcards'
          imageUrl='http://127.0.0.1:8000/static/images/explore-decks.png'
          imageAlt='The "Explore" page, with lists of decks made by others'
          className='mr-4'
          bodyText={<>
            Find decks of flashcards made by others to improve your studying experience
          </>}
        />
      </CardDeck>
      <CustomCard
        faName='graduation-cap'
        headerText='Study and Review'
        imageUrl='http://127.0.0.1:8000/static/images/studying-flashcard.png'
        imageAlt='Studying an individual flashcard'
        className='mx-auto'
        bodyText={<>
          Our spaced repetition algorithm will give you the{' '}
          flashcards you need <strong>to focus on most</strong>
        </>}
      />
      <CustomCard
        faName='share'
        headerText='Share with Others!'
        imageUrl='http://127.0.0.1:8000/static/images/explore-decks.png'
        imageAlt='The "Explore" page, with lists of decks made by others'
        className='mx-auto'
        bodyText={<>
          Made a deck of flashcards you think others will like?{' '}
          Share it, and people from around the world can thank you!
        </>}
      />
    </>
  );
};