import Chart from 'react-google-charts';
import { Assignment } from './types';
import { backendFetch, useAsyncState } from '../lookup/lookup';
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

export default function TeacherAssignment({ classroomId, assignment }: { classroomId: number, assignment: Assignment }) {
  const [showFullDetail, setShowFullDetail] = useState(false);
  const [studentsPercentComplete] = useAsyncState<StudentPercentComplete[]>(
    () => backendFetch('GET', `teachers/classroom/${classroomId}/assignments/${assignment.id}/percent-complete/`),
    [], undefined,
    showFullDetail,
  );

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
            <>{subSection.data.title}{i !== assignment.sub_sections.length - 1 && ', '}</>
          )}
        </p>
        <small>(click to {showFullDetail ? 'collapse' : 'expand'})</small>
      </div>
      {showFullDetail && <div>
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
    </div>
  );
}
