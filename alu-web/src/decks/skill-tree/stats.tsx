import React, { useState, useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import Container from 'react-bootstrap/Container';
import ReactTooltip from 'react-tooltip';
import { errorHandler, shiftDate, range, timezoneToISOString, stringDate } from '../../utils';
import { randomTip } from '../../home/randomtips';
import { Profile, ProfileHistory } from '../../profiles/types';
import { apiProfileHistory } from '../../lookup';


const today = new Date();
const blankValues = range(0, 366).map(i => {
  return {
    date: shiftDate(today, -i),
    cardsDone: 0,
    timeSpent: 0,
    habitsDone: 0,
  } as ProfileHistory;
});
const calcWorkDone = hist => {
  if (hist.cards_done !== undefined) {
    return hist.cards_done + hist.habits_done * 10;
  } else {
    return hist.cardsDone + hist.habitsDone * 10;
  }
}
export default function StatsComponent({ profile, username }: { profile?: Profile, username: string }) {
  const [userHistory, setUserHistory] = useState<ProfileHistory[]>(blankValues);
  const [gotHistory, setGotHistory] = useState(false);
  const [maxWorkDone, setMaxWorkDone] = useState(0);

  // Get profile history
  useEffect(() => {
    if (!gotHistory) {
      setGotHistory(true);
      // TODO: make async, don't user `username`
      apiProfileHistory(username, (response, status) => {
        if (status === 200) {
          setMaxWorkDone(Math.max(...response.map(
            hist => calcWorkDone(hist),
          )));
          const gottenDates = response.map(hist => hist.date);
          const historyValues = userHistory.map(hist => {
            // Check if we have that date in history
            if (gottenDates.includes(timezoneToISOString(hist.date).slice(0, 10))) {
              // Get the date that matches
              const date = response.filter(subHist => subHist.date === timezoneToISOString(hist.date).slice(0, 10))[0];
              return {
                ...hist,
                cardsDone: date.cards_done,
                timeSpent: date.time_spent,
                habitsDone: date.habits_done,
              };
            } else {
              // Return the standard/blank value
              return hist;
            }
          });
          setUserHistory(historyValues);
        } else {
          // Error getting user history
          errorHandler(response, status, 3013);
        }
      });
    }
  }, [profile, gotHistory, setGotHistory, userHistory, setUserHistory, username]);

  return (
    <div className='text-center mb-3'>
      <h4>{profile?.first_name} {profile?.last_name}</h4>
      <h5 className='text-secondary'>@{profile?.username}</h5>
      <Container className='mx-auto mb-3'>
        <CalendarHeatmap
          startDate={shiftDate(today, -366)}
          endDate={today}
          values={userHistory}
          tooltipDataAttrs={(value: ProfileHistory) => {
            if (!value || !value.date)
              return {'data-tip': 'Error, please report this'};

            let dataTip = '';
            if (value.cardsDone) {
              dataTip += `You reviewed ${value.cardsDone} flashcard`;
              if (value.cardsDone > 1)
                dataTip += 's';
            }
            if (value.habitsDone) {
              if (dataTip === '')
                dataTip += `You did ${value.habitsDone} habit`;
              else
                dataTip += ` and did ${value.habitsDone} habit`;
              
                if (value.habitsDone > 1)
                  dataTip += 's';
            }
            if (dataTip !== '')
              dataTip += ` on ${stringDate()}`
            if (value.timeSpent)
              dataTip += ` in ${Math.round(value.timeSpent/1000/60)} minutes`;

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
        Reviews today: {userHistory.sort(hist => hist.date.getTime())[0].cardsDone} |{' '}
        Time studying today: {Math.round(userHistory.sort(hist => hist.date.getTime())[0].timeSpent/1000/60)}m |{' '}
        Longest streak: {profile?.longest_streak} |{' '}
        Current streak: {profile?.current_streak}
        <div className='text-center mx-auto alert alert-info my-3'>
          {randomTip}
        </div>
      </Container>
    </div>
  );
}

