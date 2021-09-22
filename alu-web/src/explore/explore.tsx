import Container from 'react-bootstrap/Container';
import React from 'react';
import { DisplayProfileInline } from '../profiles';
import { SharedDeck } from '../decks/skill-tree/types';
import { apiExploreLists } from '../lookup';
import { useApiObjectHook } from '../utils';
import './explore.scss';
import ReactMarkdown from 'react-markdown';


interface ExploreDecks {
  EDITOR: SharedDeck[];
  HOT: SharedDeck[];
  TOP: SharedDeck[];
}
export function ExploreComponent(props: null) {
  const [decks] = useApiObjectHook<ExploreDecks>(apiExploreLists, 200, 1010);

  return (<Container className='mt-5'>
    <div>
      <h1>Explore</h1>
      <p>Find decks created by others to help you study</p>
    </div>
    {/* <ExploreButtonGroup /> */}
    <hr />
    {decks ? <div className='mb-5'>
      {decks.EDITOR.map(sharedDeck => <div className='shared-deck' key={sharedDeck.id}>
        <div className='title'>
          <p className='owners'>
            Created by {sharedDeck.owners.map((owner, i) => <React.Fragment key={i}>
              <DisplayProfileInline profile={owner} />
              {i !== sharedDeck.owners.length - 1 && ','}
            </React.Fragment>)}
          </p>
          <h1>
            <a href={`/community/deck/${sharedDeck.id}/`}>
              {sharedDeck.title}
            </a>
          </h1>
          <hr />
        </div>
        <div className='body'>
          {sharedDeck.description.length > 0
            ? <ReactMarkdown source={sharedDeck.description} />
            : <p>This deck has no description</p>
          }
        </div>
      </div>)}
    </div> : <p>Loading...</p>}
  </Container>);
}
