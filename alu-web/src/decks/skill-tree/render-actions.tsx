import { MainSectionAction, SubSectionAction, FlashCardAction } from './types';

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
        {actions[attr].length > 0 ? <ul>
          {actionTypes.map(([actionVerb, actionAttr, textClass]) =>
            actions[attr].filter(action => action.action === actionAttr).length > 0
            &&
            <li className={textClass} key={`${title}-${actionAttr}`}>
              {actionVerb} <strong>
              {actions[attr].filter(action => action.action === actionAttr).length}
              </strong> {title.toLowerCase()}
            </li>
          )}
        </ul> : <p>No actions</p>}
      </div>
    )}
  </>);
}
