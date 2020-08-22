import React from 'react';
import {Button, ButtonGroup} from 'react-bootstrap';


export function ExploreButtonGroup(_props) {
  return (
    <div>
      <ButtonGroup>
        <Button href='/explore/decks/search/'>
          Search for Decks
        </Button>
      </ButtonGroup>
    </div>
  );
};