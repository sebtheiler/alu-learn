import { useState } from 'react';
import { Classroom } from '../../teachers/types';
import './deck-selection.scss';  // TODO: rename this to be more general; remove `deck`

interface ClassroomSelectionProps {
  classroom: Classroom;
  onClick(): void;
  selected: boolean;
}
export default function ClassroomSelection(props: ClassroomSelectionProps) {
  const { classroom, onClick, selected } = props;
  const [dropdownExpanded, setDropdownExpanded] = useState(false);

  return (
    <div className='deck-selection-item'>
      <div
        className={'deck-selection-main mb-0' + (selected ? ' selected' : '')}
        role='button'
        onClick={() => selected ? setDropdownExpanded(!dropdownExpanded) : onClick()}
      >
        <p>
          <span className='title-text'>{classroom.title}</span>
          <span
            role='button'
            onClick={e => {e.stopPropagation(); setDropdownExpanded(!dropdownExpanded);}}
            aria-controls={`collapse-classroom-selection-${classroom.id}`}
            aria-expanded={dropdownExpanded}
          >
            <i className='fas fa-cog fa-2x float-left mt-2 ml-2' />
          </span>
        </p>
      </div>
      {/* <DeckSelectionButtons
        collapse={dropdownExpanded}
        deck={deck}
      /> */}
    </div>
  );
}

