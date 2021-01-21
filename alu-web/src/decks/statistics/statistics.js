import React from 'react';
import Chart from 'react-google-charts';


export function StatisticsPage(props) {
  const data = [
    ['Flashcard Type', 'Percent'],
    ['Unseen', 0.6],
    ['Learning', 0.1],
    ['Learned', 0.24],
    ['Suspended', 0.05],
    ['Relearning', 0.01]
  ];
  const averageDifficulty = 270;

  return (<div className='ml-3'>
    <h1 className='my-5'>Statistics</h1>
    <div>
      <Chart 
        width={'600px'}
        height={'400px'}
        chartType='PieChart'
        loader={<p>Loading chart...</p>}
        data={data}
        options={{
          title: 'Flashcard Types',
          slices: {
            0: { color: '#3262db' }, // blue
            1: { color: '#41bf58' }, // light green
            2: { color: '#1f9133' }, // darker green
            3: { color: '#e3c032' }, // red
            4: { color: '#c72222' },
          }
        }}
      />
    </div>
    <div>
      <p>Average Difficulty: {averageDifficulty}</p>
    </div>
  </div>);
}
