import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Container from 'react-bootstrap/Container';
import LoadingButton from '../decks/buttons/LoadingButton';
import SharedDeckList from '../decks/shared-deck-list';
import { Button } from 'react-bootstrap';
import { Profile } from './types';
import { SharedDeck } from '../decks/types';
import { apiProfileDetail, backendFetch, apiSendFriendReq, useAsyncState, apiProfileFriendToggle } from '../lookup/lookup';

export default function ProfileDetail({ username, currentUsername }: { username: string, currentUsername: string }) {
  const [profile, setProfile] = useAsyncState<Profile>(apiProfileDetail, [username]);
  const [sharedDecks] = useAsyncState<SharedDeck[]>(
    () => backendFetch('GET', `profiles/profile/${username}/decks/`),
    [username],
  );

  const addFriend = async () => {
    if (!profile) return;
    if (profile.is_friend) {
      if (!window.confirm(`Are you sure you want to remove ${profile.first_name} as a friend?`)) return;
      await apiProfileFriendToggle(username, 'unfriend').then(() => setProfile({
        ...profile,
        is_friend: false,
      }));
    } else if (!profile.you_are_pending) {
      await apiSendFriendReq(username).then(() => setProfile({
        ...profile,
        you_are_pending: true,
      }));
    }
  }

  if (!profile) return <p className='text-center mt-5'>Loading…</p>
  return (<Container className='mt-5'>
    <h1>{profile.first_name} {profile.last_name}</h1>
    {currentUsername.length > 0 && (username === currentUsername ? <ButtonGroup>
      <Button href='/profiles/edit/'>
        Edit Profile
      </Button>
      <Button href='/profiles/archived/' className='ml-1'>
        Archived Decks
      </Button>
    </ButtonGroup> : <>
      <LoadingButton clickFunc={addFriend}>
        {profile.you_are_pending && 'Requested'}
        {profile.is_friend && 'Remove Friend'}
        {!(profile.you_are_pending || profile.is_friend) && 'Add Friend'}
      </LoadingButton>
    </>)}
    <hr />
    {sharedDecks ? <SharedDeckList sharedDecks={sharedDecks} /> : <p>Loading decks…</p>}
  </Container>);
}
