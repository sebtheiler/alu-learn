import Container from 'react-bootstrap/Container';
import LoadingButton from '../decks/skill-tree/buttons/LoadingButton';
import React from 'react';
import SharedDeckList from '../decks/skill-tree/shared-deck-list';
import { Button } from 'react-bootstrap';
import { Profile } from './types';
import { SharedDeck } from '../decks/skill-tree/types';
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
    {username === currentUsername ? <>
      <Button href='/profiles/edit/'>
        Edit Profile
      </Button>
    </> : <>
      <LoadingButton clickFunc={addFriend}>
        {profile.you_are_pending && 'Requested'}
        {profile.is_friend && 'Remove Friend'}
        {!(profile.you_are_pending || profile.is_friend) && 'Add Friend'}
      </LoadingButton>
    </>}
    <hr />
    {sharedDecks ? <SharedDeckList sharedDecks={sharedDecks} /> : <p>Loading decks…</p>}
  </Container>);
}
