import Alert from 'react-bootstrap/Alert';
import Col from 'react-bootstrap/Col';
import RenderFlashcard from './render-flashcard';
import Row from 'react-bootstrap/Row';
import { MainSectionAction, SubSectionAction, FlashCardAction, MainSection, SubSection } from './types';
import { flattenNodes } from '../text-editor';
import './shared.scss';

const sectionActionTypes = [
  ['Flashcards', 'flashcard_actions'],
  ['Main sections', 'main_section_actions'],
  ['Sub sections', 'sub_section_actions'],
];

const actionTypes = [
  ['Created', 'CREATE', 'text-success'],
  ['Edited', 'EDIT', 'text-primary'],
  ['Rearranged', 'REARRANGE', 'text-info'],
  ['Deleted', 'DELETE', 'text-danger'],
];

export interface Actions {
  main_section_actions: MainSectionAction[];
  sub_section_actions: SubSectionAction[];
  flashcard_actions: FlashCardAction[];
}

export default function RenderActions({ actions }: { actions: Actions }) {
  return (<>
    {sectionActionTypes.map(([title, attr]) =>
      <div className='mt-4' key={attr}>
        <h3>{title}</h3>
        {actions[attr].length > 0 ? <>
          <ul>
            {actionTypes.map(([actionVerb, actionAttr, textClass]) =>
              actions[attr].filter(action => action.action === actionAttr).length > 0
              &&
              <li className={textClass} key={`${title}-${actionAttr}`}>
                {actionVerb} <strong>
                {actions[attr].filter(action => action.action === actionAttr).length}
                </strong> {title.toLowerCase()}
              </li>
            )}
          </ul>
          {!!actions[attr][0].live_counterpart && actions[attr].map(action =>
            <RenderAction action={action} key={action.pk} />
          )}
        </>: <p>No actions</p>}
      </div>
    )}
  </>);
}

function RenderSection({ section }: { section: MainSection | SubSection }) {
  return (<>
    <p>Title: {section.data.title}</p>
    <p>Description: {section.data.description}</p>
  </>);
}

function RenderAction({ action }: { action: MainSectionAction | SubSectionAction | FlashCardAction }) {
  const isMainSection = 'main_section' in action;
  const isSubSection = 'sub_section' in action;
  const isFlashCard = 'flashcard' in action;
  let objTitle: string;
  let changeRendering: JSX.Element;
  let currentRendering: JSX.Element | undefined;
  if (isMainSection) {
    const mainSection = action.main_section;
    objTitle = mainSection.data.title;
    changeRendering = <RenderSection section={mainSection} />;
    currentRendering = action.live_counterpart && <RenderSection section={action.live_counterpart.main_section} />;
  } else if (isSubSection) {
    const subSection = action.sub_section;
    objTitle = subSection.data.title;
    changeRendering = <RenderSection section={subSection} />;
    currentRendering = action.live_counterpart && <RenderSection section={action.live_counterpart.sub_section} />;
  } else if (isFlashCard) {
    const flashcard = action.flashcard;
    objTitle = flattenNodes(flashcard.data.fields[0]);
    changeRendering = <RenderFlashcard flashcard={flashcard} />
    currentRendering = action.live_counterpart && <RenderFlashcard flashcard={action.live_counterpart.flashcard} />;
  } else {
    objTitle = 'ERROR';
    changeRendering = <>ERROR</>;
  }


  switch (action.action) {
    case 'CREATE':
      return (
        <Alert variant='success'>
          <Alert.Heading className='text-center'>Creating "{objTitle}"</Alert.Heading>
          <hr />
          <Row>
            <Col md={12}>
              <p className='text-center'><strong>Incoming Submitted Create</strong></p>
              {changeRendering}
            </Col>
          </Row>
        </Alert>
      );
    case 'EDIT':
      return (
        <Alert variant='primary'>
          <Alert.Heading className='text-center'>Editing "{objTitle}"</Alert.Heading>
          <hr />
          <Row>
            <Col md={6} xs={12} className='right-separator'>
              <p className='text-center'><strong>Incoming Submitted Edit</strong></p>
              {changeRendering}
            </Col>
            <Col md={6} xs={12}>
              <p className='text-center'><strong>Current Version</strong></p>
              {currentRendering}
            </Col>
          </Row>
        </Alert>
      );
    case 'DELETE':
      return (
        <Alert variant='danger'>
          <Alert.Heading className='text-center'>Deleting "{objTitle}"</Alert.Heading>
          <hr />
          <Row>
            <Col md={12}>
              <p className='text-center'><strong>Incoming Submitted Deletion</strong></p>
              {changeRendering}
            </Col>
          </Row>
        </Alert>
      );
    default:
      return null;
  }
}
