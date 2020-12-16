import React from 'react';
import { Card, CardDeck } from 'react-bootstrap';

export function CustomCard(props) {
  const {faName, headerText, imageUrl, imageAlt, bodyText, className, experimentParams} = props;
  const width = props.width ? props.width + '%': '33%';

  return (
    <Card className={'text-center mb-5 ' + className} style={{width: width}}>
      <Card.Header>
        <h2>
          {experimentParams[8] === '1' ? null : <><i className={`fas fa-${faName}`} />{' '}</>}
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
}

export function HowItWorks(props) {
  const {isMobile, experimentParams} = props;
  const width = isMobile ? 90 : 33; // in percent

  // These two prop dicts are required for less repeated-code
  // when supporting adjacent (for desktop) and non-adjacent (for mobile)
  const adjCard1Props = {
    faName: 'plus',
    headerText: 'Create Flashcards',
    imageUrl: 'http://127.0.0.1:8000/static/images/create-flashcard.png',
    imageAlt: 'The page for creating flashcards',
    className: 'ml-4',
    width: width,
    experimentParams: experimentParams,
    bodyText: <>Quickly turn your notes into flashcards</>,
  }

  const adjCard2Props = {
    faName: 'search',
    headerText: 'Find Flashcards',
    imageUrl: 'http://127.0.0.1:8000/static/images/explore-decks.png',
    imageAlt: 'The "Explore" page, with lists of decks made by others',
    className: 'mr-4',
    width: width,
    experimentParams: experimentParams,
    bodyText: <>Find decks of flashcards made by others to improve your studying experience</>,
  }

  return (
    <>
      <CustomCard
        faName='pencil-alt'
        headerText='Take Notes'
        imageUrl='https://www.wordtemplatesonline.net/wp-content/uploads/Cornell-Notetaking-Template-24.jpg'
        imageAlt='The Cornell note-taking system'
        className='mx-auto'
        width={width}
        experimentParams={experimentParams}
        bodyText={<>
          Take powerful notes using <strong>Cornell</strong>{' '}
          and <strong>Hierarchical</strong> note systems
        </>}
      />
      {
        isMobile ?
          <>
            {/* Don't display adjacently */}
            <CustomCard {...adjCard1Props} className='mx-auto' />
            <CustomCard {...adjCard2Props} className='mx-auto' />
          </>
          :
          <CardDeck className='mx-auto' style={{width: width*2.2 + '%'}}>
            {/* Display adjacently */}
            <CustomCard {...adjCard1Props} />
            <CustomCard {...adjCard2Props} />
          </CardDeck>
      }
      <CustomCard
        faName='graduation-cap'
        headerText='Study and Review'
        imageUrl='http://127.0.0.1:8000/static/images/studying-flashcard.png'
        imageAlt='Studying an individual flashcard'
        className='mx-auto'
        width={width}
        experimentParams={experimentParams}
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
        width={width}
        experimentParams={experimentParams}
        bodyText={<>
          Made a deck of flashcards you think others will like?{' '}
          Share it, and people from around the world can thank you!
        </>}
      />
    </>
  );
}
