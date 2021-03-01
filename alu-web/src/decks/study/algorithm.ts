import { ManualSRTask } from '../../manual-sr/types';
import { errorHandler } from '../../utils';
import { FlashCard, SchedulingAlgorithm, DeckDifficulty } from '../types';

function minutesToDays(minutes) {
  return minutes / (60*24);
}

interface Config {
  NEW_STEPS: number[];
  GRADUATING_INTERVAL: number;
  EASY_INTERVAL: number;
  EASY_BONUS: number;
  INTERVAL_MODIFIER: number;
  MAXIMUM_INTERVAL: number;
  LAPSES_STEPS: number[];
  NEW_INTERVAL: number;
  MINIMUM_INTERVAL: number;
  LEECH_THRESHOLD: number;
}
function generateConfig(
  method: SchedulingAlgorithm = 'ANKI',
  deckDifficulty: ('NONE' | DeckDifficulty) = 'NONE',
) {
  // Easier settings have longer spaces between reviews
  const INTERVAL_MODIFIER = (() => {
    switch (deckDifficulty) {
      case 'EASY':
        return 150;
      case 'NORM':
        return 120;
      case 'HARD': default:
        return 100;
    }
  })();

  switch (method) {
    case 'ANKI':
      // Default Anki settings
      return {
        // "New Cards" tab
        NEW_STEPS: [1, 10], // in minutes
        GRADUATING_INTERVAL: 1, // in days
        EASY_INTERVAL: 4, // in days
        // "Reviews" tab
        EASY_BONUS: 130, // in percent
        INTERVAL_MODIFIER: INTERVAL_MODIFIER, // in percent
        MAXIMUM_INTERVAL: 36500, // in days
        // "Lapses" tab
        LAPSES_STEPS: [10], // in minutes
        NEW_INTERVAL: 70, // in percent
        MINIMUM_INTERVAL: 1, // in days
        LEECH_THRESHOLD: 8, // number wrong
      } as Config;
    case 'ANKING':
      // Optimized Anki settings from https://www.youtube.com/watch?v=wvF5Y2101Lk
      return {
        // "New Cards" tab
        NEW_STEPS: [25, 1440], // in minutes
        GRADUATING_INTERVAL: 3, // in days
        EASY_INTERVAL: 4, // in days
        // "Reviews" tab
        EASY_BONUS: 150, // in percent
        INTERVAL_MODIFIER: INTERVAL_MODIFIER, // in percent
        MAXIMUM_INTERVAL: 180, // in days
        // "Lapses" tab
        LAPSES_STEPS: [30, 1440], // in minutes
        NEW_INTERVAL: 20, // in percent
        MINIMUM_INTERVAL: 1, // in days
        LEECH_THRESHOLD: 8, // number wrong
      } as Config;
    case 'MANUAL-SR':
      // Settings for Manual SR Tasks
      return {
        // "New Cards" tab
        NEW_STEPS: [1440, 4320], // in minutes
        GRADUATING_INTERVAL: 3, // in days
        EASY_INTERVAL: 7, // in days
        // "Reviews" tab
        EASY_BONUS: 150, // in percent
        INTERVAL_MODIFIER: 200, // in percent
        MAXIMUM_INTERVAL: 730, // in days
        // "Lapses" tab
        LAPSES_STEPS: [1440, 4320], // in minutes
        NEW_INTERVAL: 40, // in percent
        MINIMUM_INTERVAL: 2, // in days
        LEECH_THRESHOLD: 8, // number wrong
      } as Config;
    default:
      // Invalid deck config
      console.error('Invalid deck config');
      errorHandler({}, 0, 4001);
  }
}


// Adapted from https://gist.github.com/riceissa/1ead1b9881ffbb48793565ce69d7dbdd
interface Interval {
  message: string;
  nextReviewDate: Date;
  easeFactor: number;
  interval: number;
  isMinute: boolean;
  learningStatus: 'UNSEEN' | 'LEARNING' | 'LEARNED' | 'RELEARNING';
  stepsIndex: number;
  leechIndex: number;
  isLeech: boolean;
}
export function getAnkiInterval(
  card: FlashCard | ManualSRTask,
  grade: 1 | 2 | 3 | 4,
  settingsAlgorithm: SchedulingAlgorithm = 'ANKING',
  deckDifficulty: ('NONE' | DeckDifficulty) = 'NONE',
) {
  const config = generateConfig(settingsAlgorithm, deckDifficulty);
  if (!config) {
    console.error(config);
  }

  // eslint-disable-next-line
  const {NEW_STEPS, GRADUATING_INTERVAL, EASY_INTERVAL, EASY_BONUS, INTERVAL_MODIFIER, MAXIMUM_INTERVAL, LAPSES_STEPS, NEW_INTERVAL, MINIMUM_INTERVAL, LEECH_THRESHOLD}
    = config as Config;

  // Get variables we will be editing and returning
  let isMinute = false; // specifies that the interval is in minutes, not days
  let {
    learning_status: learningStatus,
    steps_index: stepsIndex,
    ease: easeFactor,
    interval,
    // is_leech: isLeech,
    // leech_index: leechIndex,
  } = card;
  // TODO: fix leeches for everything
  let isLeech = false;
  let leechIndex = 0;

  if (!learningStatus) {
    // This has only happened once in production (to my knowledge) and I can't figure out why
    console.error(card);
  }

  // Algorithm
  if (learningStatus === 'LEARNING' || learningStatus === 'UNSEEN') {
    // For learning cards, there is no "hard" response available (if this is changed `handleKeyDown` also needs to be changed in components.js)
    if (grade === 1) {
      // Again
      stepsIndex = 0;
      interval = NEW_STEPS[0];
      isMinute = true;
    } else if (grade === 2) {
      interval = -1;
    } else if (grade === 3) {
      // Good
      stepsIndex++;
      if (stepsIndex < NEW_STEPS.length) {
        interval = NEW_STEPS[stepsIndex];
        isMinute = true;
      } else {
        // We have graduated!
        learningStatus = 'LEARNED';
        interval = GRADUATING_INTERVAL;
      }
    } else if (grade === 4) {
      // Easy
      learningStatus = 'LEARNED';
      interval = EASY_INTERVAL;
    }
    if (learningStatus === 'UNSEEN') {
      learningStatus = 'LEARNING';
    }
  } else if (learningStatus === 'LEARNED') {
    if (grade === 1) {
      // Again
      learningStatus = 'RELEARNING';
      stepsIndex = 0;
      easeFactor = Math.max(130, easeFactor - 20);

      // The reason we don't need to check that if the card has already
      // been done that day, is because this automatically sets it to
      // 'relearning', which doesn't increase the leech index
      // leechIndex++;
      // if (leechIndex >= LEECH_THRESHOLD) {
      //   isLeech = true;
      // }
      interval = LAPSES_STEPS[0];
      isMinute = true;
    } else if (grade === 2) {
      // Hard
      easeFactor = Math.max(130, easeFactor - 15);
      interval = interval * 1.2 * INTERVAL_MODIFIER/100;
      interval = Math.min(MAXIMUM_INTERVAL, interval);
    } else if (grade === 3) {
      // Good
      interval = interval * easeFactor/100 * INTERVAL_MODIFIER/100;
      interval = Math.min(MAXIMUM_INTERVAL, interval);
    } else if (grade === 4) {
      // Easy
      easeFactor = Math.min(350, easeFactor + 15);
      interval = interval * easeFactor/100 * INTERVAL_MODIFIER/100 * EASY_BONUS/100;
      interval = Math.min(MAXIMUM_INTERVAL, interval);
    }
  } else if (learningStatus === 'RELEARNING') {
    // "Hard" and "Easy" are not allowed (if this is changed `handleKeyDown` also needs to be changed in components.js)
    if (grade === 1) {
      // Again
      stepsIndex = 0;
      interval = LAPSES_STEPS[0];
      isMinute = true;
    } else if (grade === 2) {
      interval = -1;
    } else if (grade === 3) {
      // Good
      stepsIndex++;
      if (stepsIndex < LAPSES_STEPS.length) {
        interval = LAPSES_STEPS[stepsIndex];
        isMinute = true;
      } else {
        // We have re-graduated!
        learningStatus = 'LEARNED';
        interval = Math.max(MINIMUM_INTERVAL, interval * NEW_INTERVAL/100);
      }
    } else if (grade === 4) {
      interval = -1;
    }
  } else {
    console.error('Invalid learning status', learningStatus);
  }

  // If the minutes setting is like days, use that
  if (isMinute && interval >= 1440) {
    interval = minutesToDays(interval);
    isMinute = false;
  }

  // Put next review date into numbers
  let now = new Date();
  let nextReviewDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
  );
  if (isMinute) {
    // In a couple minutes
    nextReviewDate.setMinutes(nextReviewDate.getMinutes() + interval);
    nextReviewDate.setSeconds(now.getSeconds());
  } else {
    // Exact start of next day
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);
    nextReviewDate.setHours(0);
    nextReviewDate.setMinutes(0);
  }

  return {
    nextReviewDate: nextReviewDate,
    easeFactor: easeFactor,
    interval: Math.floor(interval),
    isMinute: isMinute,
    learningStatus: learningStatus,
    stepsIndex: stepsIndex,
    leechIndex: leechIndex,
    isLeech: isLeech,
    message: 'SUCCESS',
  } as Interval;
}
