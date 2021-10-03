import { useObjectGet } from '../lookup/lookup';
import { Classroom, ClassroomAssignments } from '../teachers/types';

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
        {fullClassroom && fullClassroom.assignments.map(assignment => <div key={assignment.id}>
          <p>{assignment.title} | Due {new Date(assignment.due_date).toDateString()}</p>
        </div>)}
        {fullClassroom && fullClassroom.assignments.length === 0 && <p>You have no assignments due!  Hurrah!</p>}
      </div>
    </div>
  );
}
