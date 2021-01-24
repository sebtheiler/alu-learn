import React from 'react';
import DataTable from 'react-data-table-component';


const columns = [
  {
    name: 'First',
    selector: 'first_name',
    sortable: true,
  },
  {
    name: 'Last',
    selector: 'last_name',
    sortable: true,
  },
  {
    name: 'Streak',
    selector: 'streak',
    sortable: true,
  },
  {
    name: 'Flashcards done today',
    selector: 'cards_done_today',
    sortable: true,
  },
  {
    name: 'Time spent today',
    selector: 'time_spent_today',
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
  const classroom = {
    title: "my first class",
    code: "VxwMR8Wt",
    id: parseInt(classroomId),
  };
  const students = [
    {
      first_name: 'Student', last_name: '1',
      streak: 5,
      cards_done_today: 100,
      time_spent_today: 600000,
    },
    {
      first_name: 'Student', last_name: '2',
      streak: 5,
      cards_done_today: 100,
      time_spent_today: 600000,
    },
    {
      first_name: 'Student', last_name: '3',
      streak: 5,
      cards_done_today: 100,
      time_spent_today: 600000,
    },
  ];

  return (<div className='container-fluid'>
    <h1 className='text-center mt-5'>{classroom.title}</h1>
    <DataTable
      title='Students'
      columns={columns}
      data={students}
      expandableRows
      expandOnRowClicked
      expandableRowsComponent={<ExpandableStudentDetailComponent />}
      striped
    />
  </div>);
}