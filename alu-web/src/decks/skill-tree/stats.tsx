import React, { useState, useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import Container from 'react-bootstrap/Container';
import ReactTooltip from 'react-tooltip';
import { shiftDate, range, timezoneToISOString, stringDate } from '../../utils';
import { randomTip } from '../../home/randomtips';
import { ProfileHistory } from '../../profiles/types';
import { apiProfileHistory } from '../../lookup';


const today = new Date();
const blankValues = range(0, 366).map(i => {
  return {
    date: shiftDate(today, -i).toISOString(),
    cards_done: 0,
    time_spent: 0,
    habits_done: 0,
    id: -1,
  } as ProfileHistory;
});
const calcWorkDone = (hist: ProfileHistory) => hist.cards_done + hist.habits_done * 10;
export default function StatsComponent() {
  const [userHistory, setUserHistory] = useState<ProfileHistory[]>(blankValues);
  const [gotHistory, setGotHistory] = useState(false);
  const [maxWorkDone, setMaxWorkDone] = useState(0);

  // Get profile history
  useEffect(() => {
    if (!gotHistory) {
      setGotHistory(true);
      apiProfileHistory().then(history => {
        setMaxWorkDone(Math.max(...history.map(hist => calcWorkDone(hist))));
        const gottenDates = history.map(hist => hist.date);
        const historyValues = userHistory.map(hist => {
          // Check if we have that date in history
          if (gottenDates.includes(timezoneToISOString(new Date(hist.date)).slice(0, 10))) {
            // Get the date that matches
            const date = history.filter(
              subHist => subHist.date === timezoneToISOString(new Date(hist.date)
            ).slice(0, 10))[0];
            return {
              ...hist,
              cards_done: date.cards_done,
              time_spent: date.time_spent,
              habits_done: date.habits_done,
            };
          } else {
            // Return the standard/blank value
            return hist;
          }
        });
        setUserHistory(historyValues);
      });
    }
  }, [gotHistory, setGotHistory, userHistory, setUserHistory]);

  return (
    <div className='text-center mb-3'>
      <Container className='mx-auto mb-3'>
        <CalendarHeatmap
          startDate={shiftDate(today, -366)}
          endDate={today}
          values={userHistory.map(history => ({ ...history, date: new Date(history.date)}))}
          tooltipDataAttrs={(value: ProfileHistory) => {
            if (!value || !value.date)
              return {'data-tip': 'Error, please report this'};

            let dataTip = '';
            if (value.cards_done) {
              dataTip += `You reviewed ${value.cards_done} flashcard`;
              if (value.cards_done > 1)
                dataTip += 's';
            }
            if (value.habits_done) {
              if (dataTip === '')
                dataTip += `You did ${value.habits_done} habit`;
              else
                dataTip += ` and did ${value.habits_done} habit`;
              
                if (value.habits_done > 1)
                  dataTip += 's';
            }
            if (dataTip !== '')
              dataTip += ` on ${stringDate()}`
            if (value.time_spent)
              dataTip += ` in ${Math.round(value.time_spent/1000/60)} minutes`;

            return { 'data-tip': dataTip };
          }}
          classForValue={(value) => {
            let colorValue: number;
            if (!value) {
              colorValue = 0;
            } else {
              const unit = maxWorkDone / 7; // 7 = number of colors that aren't zero
              const workDone = calcWorkDone(value);
              if (workDone === 0) {colorValue = 0} else
              if (workDone > maxWorkDone - unit*1) {colorValue = 7} else
              if (workDone > maxWorkDone - unit*2) {colorValue = 6} else
              if (workDone > maxWorkDone - unit*3) {colorValue = 5} else
              if (workDone > maxWorkDone - unit*4) {colorValue = 4} else
              if (workDone > maxWorkDone - unit*5) {colorValue = 3} else
              if (workDone > maxWorkDone - unit*6) {colorValue = 2} else
              {colorValue = 1}
            }
            return `color-scale-${Math.min(colorValue, 7)}`;
          }}
        />
        <ReactTooltip />
        Reviews today: {userHistory.sort(hist => new Date(hist.date).getTime())[0].cards_done} |{' '}
        Time studying today: {Math.round(userHistory.sort(hist => new Date(hist.date).getTime())[0].time_spent/1000/60)}m
        <div className='text-center mx-auto alert alert-info my-3'>
          {randomTip}
        </div>
      </Container>
    </div>
  );
}

