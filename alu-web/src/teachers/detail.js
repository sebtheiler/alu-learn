import React from 'react';
import DataTable from 'react-data-table-component';
import { apiClassroomDetail, apiClassroomStudentsList } from '../lookup';
import { useApiObjectHook } from '../utils';


const columns = [
  {
    name: 'First Name',
    selector: 'first_name',
    sortable: true,
  },
  {
    name: 'Last Name',
    selector: 'last_name',
    sortable: true,
  },
  {
    name: 'Streak',
    selector: 'current_streak',
    format: row => `${row.current_streak} day${row.current_streak === 1 ? '' : 's'}`,
    sortable: true,
  },
  {
    name: 'Flashcards done today',
    selector: 'today_stats.cards_done_today',
    sortable: true,
  },
  {
    name: 'Time spent today',
    selector: 'today_stats.time_spent_today',
    format: row => `${Math.round(row.today_stats.time_spent_today/1000/60)} minutes`,
    sortable: true,
  },
];

function ExpandableStudentDetailComponent({ data }) {
  return (<>
    <p>{data.first_name} {data.last_name}</p>
    <p>More info...</p>
  </>);
}

export function ClassroomDetail({ classroomId }) {
  const [classroom] = useApiObjectHook(apiClassroomDetail, 200, 8006, [classroomId]);
  const [students] = useApiObjectHook(apiClassroomStudentsList, 200, 8007, [classroomId, new Date().getTimezoneOffset()]);

  return (<div className='container-fluid text-center'>
    <h1 className='mt-5'>{classroom?.title}</h1>
    <p className='mb-0'>Class Code: <strong>{classroom?.code}</strong></p>
    <small className='text-muted'>Give the class code to your students so that they can join your class.</small>
    {students && <DataTable
      title='Students'
      columns={columns}
      data={students}
      expandableRows
      expandOnRowClicked
      expandableRowsComponent={<ExpandableStudentDetailComponent />}
      striped
    />}
  </div>);
}