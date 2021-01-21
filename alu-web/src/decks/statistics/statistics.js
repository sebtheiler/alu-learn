import React, { useState, useEffect } from 'react';
import Chart from 'react-google-charts';
import { apiDeckStatistics } from '../../lookup';
import { errorHandler } from '../../utils';


export function StatisticsPage(props) {
  const {deckId} = props;
  const [data, setData] = useState([]);
  const [dataDidSet, setDataDidSet] = useState(false);

  useEffect(() => {
    if (!dataDidSet) {
      setDataDidSet(true);
      apiDeckStatistics(parseInt(deckId), (response, status) => {
        if (status === 200) {
          setData({
            flashcardTypes: [
              ['Flashcard Type', 'Percent'],
              ['Unseen', response.num_unseen],
              ['Learning', response.num_learning],
              ['Learned', response.num_learned],
              ['Suspended', response.num_suspended],
              ['Relearning', response.num_relearning],
            ],
            avgEase: response.avg_ease,
          });
        } else {
          // Error getting a deck's statistics
          errorHandler(response, status, 1028);
        }
      });
    }
  }, [data, dataDidSet, deckId]);

  return (<div className='ml-3'>
    <h1 className='my-5'>Statistics</h1>
    <div>
      <Chart 
        width={'600px'}
        height={'400px'}
        chartType='PieChart'
        loader={<p>Loading chart...</p>}
        data={data.flashcardTypes}
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
      <p>Average Ease (seen flashcards): {Math.round(data.avgEase*100)/100}</p>
    </div>
  </div>);
}
