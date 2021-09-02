import Alert from 'react-bootstrap/Alert';
import LoadingButton from './buttons/LoadingButton';
import { Deck } from '../types';
import { backendFetch } from '../../lookup/lookup';

export default function UpdateDeck({ deck }: { deck: Deck }) {
  const updateDeck = async () => {
    await backendFetch('POST', `sharing_system/deck/${deck.id}/pull/`);
    window.location.reload();
  }

  return (
    <Alert className='text-left' variant='primary'>
      <p>There is an update available for this deck</p>
      {/* TODO: give option to ignore update with localstorage */}
      {/* TODO: show actions and ask for confirmation */}
      <LoadingButton clickFunc={updateDeck}>
        Update
      </LoadingButton>
    </Alert>
  );
}