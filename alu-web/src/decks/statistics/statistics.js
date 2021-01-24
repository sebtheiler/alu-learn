import React from 'react';
import Chart from 'react-google-charts';
import { apiDeckStatistics } from '../../lookup';
import { useApiObjectHook } from '../../utils';


export function StatisticsPage(props) {
  const {deckId} = props;
  const [data] = useApiObjectHook(
    apiDeckStatistics,
    200,
    1028,
    [parseInt(deckId)],
    null,
    response => parseStats(response),
  );

  return (<div className='ml-3'>
    <h1 className='my-5'>Statistics</h1>
    <div>
      <FlashcardTypesPiechart flashcardTypes={data?.flashcardTypes} />
      <p>Average Ease (seen flashcards): {Math.round(data?.avgEase*100)/100}</p>
    </div>
  </div>);
}


export function FlashcardTypesPiechart({ flashcardTypes }) {
  return (
    <div>
      <Chart 
        width='600px'
        height='400px'
        chartType='PieChart'
        loader={<p>Loading chart...</p>}
        data={flashcardTypes}
        options={{
          title: 'Flashcard Types',
          slices: {
            0: { color: '#3262db' }, // blue
            1: { color: '#41bf58' }, // light green
            2: { color: '#1f9133' }, // darker green
            3: { color: '#e3c032' }, // yellow
            4: { color: '#c72222' }, // red
          }
        }}
      />
    </div>
  );
}


export function parseStats(response) {
  return {
    flashcardTypes: [
      ['Flashcard Type', 'Percent'],
      ['Unseen', response.num_unseen],
      ['Learning', response.num_learning],
      ['Learned', response.num_learned],
      ['Suspended', response.num_suspended],
      ['Relearning', response.num_relearning],
    ],
    avgEase: response.avg_ease,
  };
}
