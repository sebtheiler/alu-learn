import React from 'react';
import ReactMarkdown from 'react-markdown';
import { DisplayProfileInline } from '../profiles';
import { SharedDeck } from './types';
import './shared-deck-list.scss';

export default function SharedDeckList({ sharedDecks }: { sharedDecks: SharedDeck[] }) {
  return (
    <div className='mb-5'>
      {sharedDecks.map(sharedDeck => <div className='shared-deck' key={sharedDeck.id}>
        <div className='title'>
          <p className='owners'>
            Created by {sharedDeck.owners.map((owner, i) => <React.Fragment key={i}>
              <DisplayProfileInline profile={owner} />
              {i !== sharedDeck.owners.length - 1 && ', '}
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
    </div>
  );
}
