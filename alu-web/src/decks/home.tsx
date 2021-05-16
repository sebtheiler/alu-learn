import React from 'react';
import { apiDeckHome } from '../lookup';
import { HomePageCards } from './detail';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useApiObjectHook } from '../utils';
import { Deck, CSSM } from './types';


// Paginated function for decks that should appear
// in the user's home page
export function DecksHomeList({ username }) {
  const [decks] = useApiObjectHook<(Deck | CSSM)[]>(apiDeckHome, 200, 1006);

  if (decks === undefined)
    return <p className='text-center'>Loading...</p>

  return (<>
    {decks.length > 0 ? <>
      <HomePageCards
        items={decks}
        currentUsername={username}
        type='deck'
      />
    </> : <>
      <p className='text-center mt-3'>
        You don't have any decks yet.
      </p>
      <Row className='text-center'>
        <Col md={6} xs={12}>
          <iframe
            width='90%' height='200%'
            title='Introduction to Decks'
            src="https://www.youtube.com/embed/T2jA--y0ggk"
            className='mx-auto mb-5'
            allowFullScreen
          />
        </Col>
        <Col md={6} xs={12}>
          <iframe
            width='90%' height='200%'
            title="Ultimate Beginner's Guide to Premade Decks"
            src="https://www.youtube.com/embed/kymkOwUsui4"
            className='mx-auto mb-5'
            allowFullScreen
          />
        </Col>
      </Row>
    </>}
  </>);
}
