import { Classroom, ClassroomAssignments } from '../teachers/types';
import { useEffect } from 'react';
import { useObjectGet } from '../lookup/lookup';

export default function RenderStudentClassroom({ classroom }: { classroom?: Classroom }) {
  const [fullClassroom, , , setClassroomDidSet] = useObjectGet<ClassroomAssignments>(
    'teachers', 'classroom', classroom?.id ?? 0,
    undefined, undefined,
    !!classroom,
  );

  useEffect(() => {
    setClassroomDidSet(false);
  }, [classroom?.id, setClassroomDidSet]);

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
