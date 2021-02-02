import React, { useMemo } from 'react';
import Chart from 'react-google-charts';
import { apiDeckStatistics } from '../../lookup';
import { stripTime, useApiObjectHook } from '../../utils';


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


export function HistoryLineChart({ studentHistory }) {
  const processedStudentHistory = useMemo(() => studentHistory.map(hist => 
          [stripTime(new Date(hist.date)), hist.cards_done, hist.time_spent/1000/60]
  ).sort((a, b) => a.date - b.date), [studentHistory]);

  return (
    <Chart
      width={'100%'}
      height={'500'}
      chartType='Line'
      loader={<div>Loading...</div>}
      data={studentHistory && [
        [
          { type: 'date', label: 'Date' },
          'Flashcards done',
          'Time spent',
        ],
        ...processedStudentHistory,
      ]}
      options={{
        chart: {
          title:
            'Flashcards Done and Time Spent Studying',
        },
        width: 900,
        height: 500,
        series: {
          // Gives each series an axis name that matches the Y-axis below.
          0: { axis: 'Reviews' },
          1: { axis: 'Time Spent (minutes)' },
        },
        axes: {
          // Adds labels to each axis; they don't have to match the axis names.
          y: {
            'Reviews': { label: 'Reviews' },
            'Time Spent (minutes)': { label: 'Time Spent' },
          },
        },
      }}
    />
  );
}


export function parseStats(response, isTeacher=false) {
  const deckStats = isTeacher ? response.deck_stats : response;

  return {
    flashcardTypes: [
      ['Flashcard Type', 'Percent'],
      ['Unseen', deckStats.num_unseen],
      ['Learning', deckStats.num_learning],
      ['Learned', deckStats.num_learned],
      ['Suspended', deckStats.num_suspended],
      ['Relearning', deckStats.num_relearning],
    ],
    avgEase: deckStats.avg_ease,
    studentHistory: isTeacher ? response.student_history : null,
  };
}
