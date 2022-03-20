import Button from 'react-bootstrap/Button';
import RenderSubSection from '../decks/sub-section';
import Row from 'react-bootstrap/Row';
import { Assignment } from './types';
import { MainSection } from '../decks/types';

export default function StudentAssignment({ assignment }: { assignment: Assignment }) {
  return (
    <div className='main-section'>
      <div className='main-section-header text-center'>
        <h2>{assignment.title}</h2>
        <Button
          href={
            `study/assignment/${assignment.id}/` +
            (assignment.essential_only ? '?essentialOnly=true' : '')
          }
        >
          Study All
        </Button>
      </div>
      <div className='mt-2'>
        <Row className='main-section-body'>
          {assignment.sub_sections.sort((a, b) => a.order_num - b.order_num).map(subSection =>
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
