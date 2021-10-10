import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import IconTooltip from './buttons/IconTooltip';
import LoadingButton from './buttons/LoadingButton';
import Modal from 'react-bootstrap/Modal';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import RenderActions, { Actions } from './render-actions';
import Row from 'react-bootstrap/Row';
import { Deck } from './types';
import { QuestionBubble } from '../utils';
import { ReactElement, useMemo, useState } from 'react';
import { SharedDeck } from './types';
import { apiCreateSharedDeck, apiObjectEdit, backendFetch, Message, useAsyncDispatch, useAsyncState, useObjectGet } from '../lookup/lookup';

// NOTE: This is required so that the default will change based on
// whether or not there is an attached share deck
const genDefault = (sharedDeck: SharedDeck | undefined, deck: Deck, attr: string, defaultVal?: string) => {
  if (sharedDeck)
    return sharedDeck[attr];
  else
    if (deck.equivalent_to_snapshot)
      return undefined;  // makes it so that the `defaultValue` is undefined until the `sharedDeck` loads
    else
      return defaultVal;
}

export default function ShareDeck({ deckId, username }: { deckId: string, username: string }) {
  const [deck] = useObjectGet<Deck>('decks', 'deck', deckId);
  const [actions] = useAsyncDispatch<Actions>(
    async () => backendFetch('GET', `sharing_system/deck/${deckId}/actions/`),
  );
  const [sharedDeck] = useAsyncDispatch<SharedDeck>(
    async () => backendFetch(
      'GET', `sharing_system/snapshot/${deck?.equivalent_to_snapshot}/shareddeck/`,
    ),
    [], undefined,
    sharedDeck => {
      setViewAccess(sharedDeck.view_access);
      setEditAccess(sharedDeck.edit_access);
    },
    !!deck?.equivalent_to_snapshot,
  );
  const numTotalChanges = useMemo(() => (
    (actions?.flashcard_actions?.length ?? 0) +
    (actions?.main_section_actions?.length ?? 0) +
    (actions?.sub_section_actions?.length ?? 0)
  ), [actions]);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState<ReactElement | string | undefined>(undefined);

  const [viewAccess, setViewAccess] = useState('EVERYBODY');
  const [editAccess, setEditAccess] = useState('PERSONAL');

  const isOwner = !sharedDeck || sharedDeck.is_owner;
  const hasEditAccess = !sharedDeck || sharedDeck.has_edit_access;

  const shareDeck = async () => {
    const form = document.getElementById('share-form') as any;
    if (!form) return;

    if (sharedDeck)
    await apiObjectEdit<SharedDeck>('sharing_system', 'shareddeck', sharedDeck.id, {
      title: form.elements.title.value,
      description: form.elements.description.value,
      view_access: form.elements.viewAccess.value,
      edit_access: form.elements.editAccess.value,
      owners: form.elements.owners.value,
    });
    else
      await apiCreateSharedDeck(
        parseInt(deckId),
        form.elements.title.value,
        form.elements.description.value,
        form.elements.viewAccess.value,
        form.elements.editAccess.value,
        form.elements.owners.value,
      ).then(
        sharedDeck => window.location.href = `/community/deck/${sharedDeck.id}/`,
      );
  }

  const pushUpdates = async () => {
    if (!sharedDeck) return;
    await backendFetch('POST', `sharing_system/shareddeck/${sharedDeck.id}/push/`, {
      origin_deck_id: deckId,
      message: message,
    }).then(
      (resp: any) => {
        switch (resp.message) {
          case 'Deck is not up to date':
            setErrorMsg(<>Your deck isn't up to date.  Please <a href={`/deck/${deckId}/`}>pull the new updates</a>, then try again.</>);
            break;
          case 'You are not authorized to edit this deck':
            setErrorMsg('You are not authorized to edit this deck.  Please contact the owners if you think this is a mistake.');
            break;
          case 'Pushed changes':
            window.location.href = `/community/deck/${sharedDeck.id}/`;
            break;
          case 'Submitted changes':
            window.location.href = `/community/deck/${sharedDeck.id}/submitted/${resp.submitted_changes_id}/`;
            break;
          default:
            setErrorMsg(resp.message);
            break;
        }
      },
    );
  }

  if (!deck) return <p className='text-center'>Loading</p>
  return (
    <Container>
      <h1 className='text-center mt-3'>
        {sharedDeck ? <>Updating
          "<a href={`/community/deck/${sharedDeck.id}`}>{sharedDeck.title}</a>"
        </> : `Sharing "${deck.title}"`}
        {sharedDeck && sharedDeck.is_owner && <MergeButton sharedDeck={sharedDeck} />}
        {sharedDeck && <RemixButton deckId={parseInt(deckId)} sharedDeck={sharedDeck} />}
      </h1>
      <Row>
        <Col md={6} xs={12}>
          <Form className='mt-4' id='share-form'>
            <Form.Group>
              <Form.Label>Title</Form.Label>
              <Form.Control
                type='text'
                name='title'
                defaultValue={genDefault(sharedDeck, deck, 'title', deck.title)}
                readOnly={!isOwner}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                as='textarea'
                name='description'
                rows={5}
                required
                defaultValue={sharedDeck?.description}
                readOnly={!isOwner}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label className='mb-0'>View Access</Form.Label><br />
              <small className='text-secondary'>
                Who can see and study the deck?
              </small>
              <Form.Control
                as='select'
                name='viewAccess'
                value={viewAccess}
                onChange={e => isOwner && setViewAccess(e.target.value)}
                custom
              >
                <option value='PUBLIC'>Everybody can view this deck</option>
                <option value='FRIENDS'>Only friends can view this deck</option>
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label className='mb-0'>Edit Access</Form.Label><br />
              <small className='text-secondary'>
                Who can submit edits to the deck?  Only "Owners" can approve edits
              </small>
              <Form.Control
                as='select'
                name='editAccess'
                value={editAccess}
                onChange={e => isOwner && setEditAccess(e.target.value)}
                custom
              >
                <option value='PERSONAL'>Only owners can submit edits</option>
                <option value='FRIENDS'>Only friends can submit edits</option>
                <option value='PUBLIC'>Everybody can submit edits</option>
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label className='mb-0'>Owners</Form.Label><br />
              <small className='text-secondary'>
                Who can approve edits to this deck? (separate with commas: "{`${username}, janedoe, johndoe`}")
              </small>
              <Form.Control
                type='text'
                name='owners'
                required
                readOnly={!isOwner}
                defaultValue={
                  sharedDeck ?
                    // Default is the existing owners
                    sharedDeck.owners.map(owner => owner.username).join(', ')
                  : (
                    deck.equivalent_to_snapshot ?
                      // Wait for shared deck to load
                      undefined
                    :
                      // Default is current user
                      username
                  )}
              />
            </Form.Group>
          </Form>
        </Col>
        <Col md={6} xs={12}>
          {actions && <RenderActions actions={actions} />}
          <p>
            {deck.equivalent_to_snapshot && (numTotalChanges === 0 ?
              'You\'ve made no changes to your deck, so you can\'t push an update.'
              :
              'Press "Push Updates" to apply these changes to the shared deck'
            )}
          </p>
        </Col>
      </Row>
      <Row>
        <Col md={numTotalChanges > 0 && deck.equivalent_to_snapshot ? 6 : 12} xs={12}>
          {!isOwner && <p className='text-center'>
            You don't have permission to change this deck's meta info.
          </p>}
          {isOwner && <LoadingButton clickFunc={shareDeck} className='mb-3' block>
            {sharedDeck ? 'Save Changes' : 'Share'}
          </LoadingButton>}
        </Col>
        {sharedDeck && numTotalChanges > 0 && <Col md={6} xs={12}>
          {!hasEditAccess && <p className='text-center'>
            You don't have permission to push updates to this deck.
          </p>}
          {hasEditAccess && <OverlayTrigger
            trigger='click'
            rootClose
            overlay={<Popover id='push-updates-popover p-3'>
              <Popover.Title as='h3'>Push Updates</Popover.Title>
              <Popover.Content>
                <p className='text-center'>Give a brief title to your changes</p>
                <Form.Control
                  type='text'
                  placeholder='e.g., Added Unit 3 flashcards'
                  maxLength={50}
                  onChange={e => setMessage(e.target.value)}
                />
                {!isOwner && <p className='mt-2'>
                  Your edit will be reviewed by an owner before being pushed into the shared deck.
                </p>}
                {errorMsg && <p className='text-danger mt-2'>{errorMsg}</p>}
                {message.length > 0 && <LoadingButton clickFunc={pushUpdates} className='mt-3' block>
                  Push Updates
                </LoadingButton>}
              </Popover.Content>
            </Popover>}
          >
            <Button className='mb-3' block>
              Push Updates{' '}
              <QuestionBubble isWhite>
                <i>"Save Changes"</i> edits the shared deck's title, description, view access, etc.<br />
                <i>"Push Updates"</i> applies any flashcard/main-section/sub-section changes you have done.
              </QuestionBubble>
            </Button>
          </OverlayTrigger>}
        </Col>}
      </Row>
    </Container>
  );
}

function RemixButton({ deckId, sharedDeck }: { deckId: number, sharedDeck: SharedDeck }) {
  const [remixModalIsOpen, setRemixModalIsOpen] = useState(false);
  const [remixTitle, setRemixTitle] = useState(`Remix of "${sharedDeck.title}"`);

  const createRemix = async () => {
    await backendFetch<SharedDeck>('POST', `sharing_system/deck/${deckId}/remix/`, {
      title: remixTitle,
      description: `Remix of "${sharedDeck.title}"`,
      view_access: 'PUBLIC',
      edit_access: 'PERSONAL',
    }).then(sharedDeck => window.location.href = `/community/deck/${sharedDeck.id}/`);
  }

  return (<>
    <IconTooltip
      tooltip='Remix this shared deck'
      onClick={async () => setRemixModalIsOpen(true)}
      faClass='fas fa-code-branch'
      className='float-right'
      id='remix-tooltip'
    />
    <Modal show={remixModalIsOpen} onHide={() => setRemixModalIsOpen(false)}>
      <Modal.Header>
        <Modal.Title>Remixing "{sharedDeck.title}"</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Remixing allows you to create a new shared deck from this copied deck, rather than pushing your changes to the current shared deck.</p>
        <p>This is useful when you want to make an entirely new shared deck without updating the original.</p>
        <hr />
        <Form.Group>
          <Form.Label>
            Remix Title{' '}
            <QuestionBubble>This will be the title of the new shared deck</QuestionBubble>
          </Form.Label>
          <Form.Control
            type='text'
            name='remixTitle'
            onChange={e => setRemixTitle(e.target.value)}
            defaultValue={`Remix of "${sharedDeck.title}"`}
            required
          />
        </Form.Group>
        {remixTitle.length > 0 && <LoadingButton
          clickFunc={createRemix}
          block
        >
          Create Remix
        </LoadingButton>}
      </Modal.Body>
    </Modal>
  </>);
}

function MergeButton({ sharedDeck }: { sharedDeck: SharedDeck }) {
  const [mergeModalIsOpen, setMergeModalIsOpen] = useState(false);
  const [remixedFrom] = useAsyncState<SharedDeck[]>(
    () => backendFetch('GET', `sharing_system/shareddeck/${sharedDeck.id}/remixed-from/`),
    [], undefined,
    mergeModalIsOpen,
  );
  const [errorMsg, setErrorMsg] = useState('');

  const mergeDeck = async (e, sharedDeckToMerge: SharedDeck) => {
    e.stopPropagation();
    const message = await backendFetch<Message>('POST', `sharing_system/shareddeck/${sharedDeck.id}/merge/`, {
      shared_deck_to_merge_id: sharedDeckToMerge.id,
    });

    if (message.message === 'Nothing to merge') {
      setErrorMsg('Nothing to merge.  You are up to date with this shared deck.');
      return;
    }

    window.location.href = `/community/deck/${sharedDeck.id}/`;
  }

  return (<>
    <IconTooltip
      tooltip='Merge this shared deck'
      onClick={async () => setMergeModalIsOpen(true)}
      faClass='fas fa-code-branch fa-flip-vertical'
      className='float-right ml-2'
      id='merge-tooltip'
    />
    <Modal show={mergeModalIsOpen} onHide={() => setMergeModalIsOpen(false)}>
      <Modal.Header>
        <Modal.Title>Merging "{sharedDeck.title}"</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>When you remix a shared deck, you split it into multiple shared decks.  When you merge a shared deck, you take the updates from two shared decks and combine them.</p>
        <p>If this deck was remixed from another shared deck, you can merge the new updates from that original deck into this one.</p>
        <hr />
        <div>
          <p>
            Merge with:
          </p>
          {remixedFrom?.map(remixedSharedDeck =>
            <div
              className='searched-item text-right p-3'
              onClick={() => window.open(`/community/deck/${remixedSharedDeck.id}/`)}
              key={remixedSharedDeck.id}
            >
              <h4 className='float-left mt-1'>{remixedSharedDeck.title}</h4>
              <LoadingButton
                className='ml-auto'
                clickFunc={e => mergeDeck(e, remixedSharedDeck)}
              >
                Merge
              </LoadingButton>
            </div>
          )}
          {remixedFrom?.length === 0 && <p>This deck wasn't remixed from anything, so it can't be merged</p>}
          {remixedFrom === undefined && <p>Loading…</p>}
        </div>
        <p className='text-center text-danger mt-3'>{errorMsg}</p>
      </Modal.Body>
    </Modal>
  </>);
}
