import React, { useMemo, useState } from 'react';
import { Habit, Routine } from './types';
import { CreateHabitButton, RoutineButtonGroup } from './buttons';
import { errorHandler, getCookie } from '../utils';
import { apiRoutineEdit } from '../lookup';
import { RenderHabit } from './habit';
// import { WalkthroughText, WalkthroughImage } from './tutorials';


interface EditRoutineOptions {
  title?: string | null;
  ordered?: boolean;
}
interface RenderRoutineProps {
  routine: Routine;
  numRoutines: number;
  createHabitCallback(habit: Habit): void;
  editHabitCallback(habit: Habit): void;
  editRoutineCallback(routine: Routine): void;
  deleteRoutineCallback(routineId: number): void;
  deleteHabitCallback(habitId: number): void;
  rearrangeRoutineCallback(routineId: number, direction: 'UP' | 'DOWN'): void;
  rearrangeHabitCallback(habitId: number, direction: 'UP' | 'DOWN'): void;
}
export function RenderRoutine(props: RenderRoutineProps) {
  const { routine, numRoutines, createHabitCallback, editHabitCallback, editRoutineCallback, deleteHabitCallback, deleteRoutineCallback, rearrangeRoutineCallback, rearrangeHabitCallback } = props;
  // const [tutorialPart, setTutorialPart] = useState(0);
  // const showTutorial = useMemo(() => getCookie('finishedTutorial') !== 'true', []);

  const editRoutine = (options: EditRoutineOptions) => {
    apiRoutineEdit(routine.id, options.title, options.ordered, (response, status) => {
      if (status === 200) {
        editRoutineCallback(response);
      } else {
        errorHandler(response, status, 9004);
      }
    });
  }

  return (<>
    <h3>
      <span
        role='button'
        className='underline-on-hover'
        onClick={() => editRoutine({ title: window.prompt(`Renaming routine "${routine.title}"`) })}
      >
        {routine.title}
      </span>
      <RoutineButtonGroup
        routine={routine}
        numRoutines={numRoutines}
        deleteRoutineCallback={deleteRoutineCallback}
        rearrangeRoutineCallback={rearrangeRoutineCallback}
      />
    </h3>
    <hr />
    {/* <WalkthroughText
      showTutorial={showTutorial && numRoutines === 1}
      tutorialPart={tutorialPart}
      increaseTutorialPart={() => setTutorialPart(tutorialPart + 1)}
    /> */}
    {(routine.habits.length === 0) && (numRoutines > 1) &&
      <p className='text-center'>Create some habits to get started!</p>
    }
    {routine.habits.map((habit) =>
      <RenderHabit
        routine={routine}
        habit={habit}
        editHabitCallback={editHabitCallback}
        deleteHabitCallback={deleteHabitCallback}
        rearrangeHabitCallback={rearrangeHabitCallback}
        key={`${routine.id}-${habit.id}`}
      />)
    }
    <hr />
    <CreateHabitButton
      createHabitCallback={createHabitCallback}
      routineId={routine.id}
    />
    <br />
    <hr />
    {/* <WalkthroughImage
      showTutorial={showTutorial && numRoutines === 1}
      tutorialPart={tutorialPart}
    /> */}
  </>);
}
