import { Assignment, Classroom, ClassroomAssignments } from '../teachers/types';
import { useObjectGet } from '../lookup/lookup';
import { Row } from 'react-bootstrap';
import RenderSubSection from './sub-section';
import { MainSection } from './types';

export default function RenderStudentClassroom({ classroom }: { classroom?: Classroom }) {
  const [fullClassroom] = useObjectGet<ClassroomAssignments>(
    'teachers', 'classroom', classroom?.id ?? 0,
    undefined, undefined,
    !!classroom,
  );

  if (!classroom) return <p>Loading…</p>;
  return (
    <div className='mb-3'>
      <h1 className='text-center'>{classroom.title}</h1>
      {classroom.shared_deck
        ? <p>Teacher's Deck: <a href={`/community/deck/${classroom.shared_deck.id}/`}>{classroom.shared_deck.title}</a></p>
        : <p>Your teacher hasn't attached a deck to this classroom yet</p>
      }
      <div>
        <h3>Assignments</h3>
        {!fullClassroom && <p>Loading…</p>}
        {fullClassroom && fullClassroom.assignments.map(assignment =>
          <RenderAssignment
            key={assignment.id}
            assignment={assignment}
          />
        )}
        {fullClassroom && fullClassroom.assignments.length === 0 && <p>You have no assignments due!  Hurrah!</p>}
      </div>
    </div>
  );
}

function RenderAssignment({ assignment }: { assignment: Assignment }) {
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
              readOnly
              studyable
            />
          )}
        </Row>
      </div>
    </div>
  );
}
