import RenderSubSection from '../decks/sub-section';
import { Assignment } from './types';
import { MainSection } from '../decks/types';
import { Row } from 'react-bootstrap';

export default function StudentAssignment({ assignment }: { assignment: Assignment }) {
  return (
    <div className='main-section'>
      <div className='main-section-header text-center'>
        <h2>{assignment.title}</h2>
      </div>
      <div className='mt-2'>
        <Row className='main-section-body'>
          {assignment.sub_sections.map(subSection =>
            <RenderSubSection
              subSection={subSection}
              mainSection={subSection.main_section as MainSection}
              key={subSection.id}
              essentialOnly={assignment.essential_only}
              readOnly
              studyable
            />
          )}
        </Row>
      </div>
    </div>
  );
}
