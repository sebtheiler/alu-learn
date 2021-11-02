import Container from 'react-bootstrap/Container';
import { SharedDeck } from '../decks/types';
import { apiExploreLists } from '../lookup';
import { useApiObjectHook } from '../utils';
import { SharedDeckList } from '../decks';


interface ExploreDecks {
  EDITOR: SharedDeck[];
  HOT: SharedDeck[];
  TOP: SharedDeck[];
}
export default function ExploreComponent(props: null) {
  const [decks] = useApiObjectHook<ExploreDecks>(apiExploreLists, 200, 1010);

  return (<Container className='mt-5'>
    <div>
      <h1>Explore</h1>
      <p>Find top decks created by others to help you study</p>
    </div>
    {/* <ExploreButtonGroup /> */}
    <hr />
    {decks ? <SharedDeckList sharedDecks={decks.EDITOR} /> : <p>Loading...</p>}
  </Container>);
}
