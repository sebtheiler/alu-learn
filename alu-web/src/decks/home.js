import React, { useState, useEffect } from 'react';
import { apiDeckHome } from '../lookup';
import { Deck } from './detail';
import { Button, Row, Col } from 'react-bootstrap';
import { errorHandler } from '../utils';


// Paginated function for decks that should appear
// in the user's home page
export function DecksHomeList(props) {
  const {username} = props;
  const [decks, setDecks] = useState(null); // Current set of decks
  const [decksDidSet, setDecksDidSet] = useState(false);
  const [nextUrl, setNextUrl] = useState(null); // URLS used for pagination

  // Send request to the API to get decks and URLs for pagination
  useEffect(() =>  {
    if (decksDidSet === false) {
      setDecksDidSet(true);
      apiDeckHome((response, status) => {
        if (status === 200) {
          setNextUrl(response.next);
          setDecks(response.results);
        } else {
          // Error getting decks
          errorHandler(response, status, 1006);
        }
      });
    }
  }, [decksDidSet, setDecksDidSet]);

  // Loads next set of decks (pagination)
  const handleLoadNext = (event) => {
    event.preventDefault();
    if (nextUrl !== null) {
      apiDeckHome((response, status) => {
        if (status === 200) {
          setNextUrl(response.next);
          const newDecks = [...decks].concat(response.results)
          setDecks(newDecks);
        } else {
          // Error handling next set of decks (pagination)
          errorHandler(response, status, 1007);
        }
      }, nextUrl);
    }
  }

  if (decks === null) {
    return <p className='text-center'>Loading...</p>
  }

  return (
    <>{decks.length > 0 ? <>
      <div className='card-deck text-center mx-auto justify-content-center'>
        {decks.map((deck, index) => {
          return <Deck 
                    deck={deck}
                    currentUsername={username}
                    key={`${index}-${deck.id}`}
                    className='mb-3 mx-1 border bg-white text-dark'
                  />;
        })}
      </div>
      <div className='text-center mb-2'>
        {nextUrl !== null ?
          <Button
            onClick={handleLoadNext}
            variant='outline-primary'
            size='lg'
          >
            Load more decks
          </Button>
        : null}
      </div>
    </> : <>
        <p className='text-center mt-3'>
          You don't have any decks yet.
        </p>
        <Row className='text-center'>
          <Col md={6} xs={12}>
            <iframe
              width='90%' height='200%'
              title='Introduction to Decks'
              allowFullScreen='allowFullScreen'
              src="https://www.youtube.com/embed/T2jA--y0ggk"
              className='mx-auto mb-5'
            />
          </Col>
          <Col md={6} xs={12}>
            <iframe
              width='90%' height='200%'
              title="Ultimate Beginner's Guide to Premade Decks"
              allowFullScreen='allowFullScreen'
              src="https://www.youtube.com/embed/kymkOwUsui4"
              className='mx-auto mb-5'
            />
          </Col>
        </Row>
      </>
    }</>
  );
}
