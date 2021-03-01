import React from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';


export function ExploreButtonGroup(_props) {
  return (
    <ButtonGroup>
      <Button href='/explore/decks/search/'>
        Search for Decks
      </Button>
    </ButtonGroup>
  );
}
