import Button from 'react-bootstrap/Button';
import Chart from 'react-google-charts';
import { Assignment, Classroom } from './types';
import { CreateEditAssignmentModal } from './buttons/create-assignment';
import { apiObjectDelete, apiObjectEdit, backendFetch, useAsyncState } from '../lookup/lookup';
import { useState } from 'react';
import './teacher-assignment.scss';

interface StudentPercentComplete {
  username: string;
  first_name: string;
  last_name: string;
  percent_complete: number;
}

const parseStudentPercentComplete = (
  studentsPercentComplete: StudentPercentComplete[] | undefined,
) => {
  if (!studentsPercentComplete) return undefined;
  const sorted = studentsPercentComplete.sort(
    (a, b) => b.percent_complete - a.percent_complete,
  );
  const mapped = sorted.map(
    data => [`${data.first_name} ${data.last_name}`, Math.round(data.percent_complete*100)],
  ); 
  const parsed = [['Student', 'Percent Complete'], ...mapped];

  return parsed;
}

interface TeacherAssignmentProps {
  classroom: Classroom;
  assignment: Assignment;
  assignments: Assignment[];
  setAssignments(assignments: Assignment[]): void;
}
export default function TeacherAssignment({ classroom, assignment, assignments, setAssignments }: TeacherAssignmentProps) {
  const [showFullDetail, setShowFullDetail] = useState(false);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false)
  const [studentsPercentComplete] = useAsyncState<StudentPercentComplete[]>(
    () => backendFetch('GET', `teachers/classroom/${classroom.id}/assignments/${assignment.id}/percent-complete/`),
    [], undefined,
    showFullDetail,
  );

  const editAssignment = async () => {
    const form = document.getElementById('assignment-form') as any;
    const assignment_title = form.elements.assignmentTitle.value;
    const section_ids = Array.from(form.elements.sections).filter((section: any) => section.selected).map((section: any) => section.value);
    const classroom_ids = Array.from(form.elements.classrooms).filter((classroom: any) => classroom.selected).map((classroom: any) => parseInt(classroom.value));
    const essential_only = form.elements.essentialOnly.checked;

    await apiObjectEdit<Assignment>('teachers', 'assignment', assignment.id, {
      assignment_title,
      section_ids,
      classroom_ids,
      essential_only,
    }).then(
      (editedAssignment: Assignment) => {
        let newAssignments = assignments;
        let index = newAssignments.map(a => a.id).indexOf(assignment.id);
        newAssignments[index] = editedAssignment;

        setAssignments(newAssignments);
        setEditModalIsOpen(false);
        window.location.reload();
      }
    );
  }

  const deleteAssignment = async () => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;

    await apiObjectDelete('teachers', 'assignment', assignment.id)
      .then(() => window.location.reload());
  }

  return (
    <div
      className='assignment-row'
      onClick={() => setShowFullDetail(!showFullDetail)}
    >
      <div>
        <h4 className='text-center'>{assignment.title}</h4>
      </div>
      <div>
        <p>
          Assigned sections: {assignment.sub_sections.map((subSection, i) =>
            <span key={i}>{subSection.data.title}{i !== assignment.sub_sections.length - 1 && ', '}</span>
          )}
        </p>
        <Button onClick={() => setEditModalIsOpen(true)}>Edit</Button><br />
        <CreateEditAssignmentModal
          modalIsOpen={editModalIsOpen}
          setModalIsOpen={setEditModalIsOpen}
          classroom={classroom}
          editAssignment={editAssignment}
          deleteAssignment={deleteAssignment}
          assignment={assignment}
        />
        <small>(click to {showFullDetail ? 'collapse' : 'expand'})</small>
      </div>
      {showFullDetail && (studentsPercentComplete?.length ?? 0) > 0 && <div>
        <br />
        <Chart
          width={'100%'}
          height={`${100 + (studentsPercentComplete?.length ?? 0) * 40}px`}
          chartType='BarChart'
          loader={<div>Loading student data…</div>}
          data={parseStudentPercentComplete(studentsPercentComplete)}
          options={{
            title: 'Student Percent Complete',
            chartArea: { width: '40%' },
            hAxis: {
              title: 'Percent Complete',
              minValue: 0,
              maxValue: 100,
            },
            vAxis: {
              title: 'Student',
            },
          }}
        />
      </div>}
      {showFullDetail && studentsPercentComplete?.length === 0 && <p className='mt-2'>
        You'll be able to track your students' progress here after you invite them to this class
      </p>}
    </div>
  );
}
