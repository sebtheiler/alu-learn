import StudentAssignment from './student-assignment';
import useMountEffect from '../utils/useMountEffect';
import { Classroom, ClassroomAssignments } from './types';
import { getClassroomAssignmentsPercentComplete, SubSectionPercentComplete, useAsyncDispatch, useObjectGet } from '../lookup/lookup';

export default function StudentClassroom({ classroom }: { classroom: Classroom }) {
  const [fullClassroom, setFullClassroom, , setClassroomDidSet] = useObjectGet<ClassroomAssignments>(
    'teachers', 'classroom', classroom?.id ?? 0,
    undefined,
    !!classroom,
  );
  const [, , , setPercentCompleteDidSet] = useAsyncDispatch<SubSectionPercentComplete[]>(
    getClassroomAssignmentsPercentComplete,
    [classroom?.id],
    undefined,
    sectionsPercentComplete => updateWithPercentComplete(sectionsPercentComplete),
    !!fullClassroom,
  );

  const updateWithPercentComplete = (sectionsPercentComplete: SubSectionPercentComplete[]) => {
    if (!fullClassroom) return;
    let classroomCopy = fullClassroom;
    for (let assignment of classroomCopy.assignments) {
      for (let subSection of assignment.sub_sections) {
        for (let percentComplete of sectionsPercentComplete) {
          if (subSection.universal_sub_section_id === percentComplete.universal_sub_section_id) {
            subSection.percent_complete = percentComplete.percent_complete;
            subSection.total_percent_complete = percentComplete.total_percent_complete;
            break;
          }
        }
      }
    }

    setFullClassroom({ ...classroomCopy });
  }

  useMountEffect(() => {
    setClassroomDidSet(false);
    setPercentCompleteDidSet(false);
  }, [classroom?.id]);

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
          <StudentAssignment
            key={assignment.id}
            assignment={assignment}
          />
        )}
        {fullClassroom && fullClassroom.assignments.length === 0 && <p>You have no assignments due!  Hurrah!</p>}
      </div>
    </div>
  );
}
