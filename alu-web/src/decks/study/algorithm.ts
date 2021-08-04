import { dateDiff, errorHandler } from '../../utils';
import { ReviewInstance, SchedulingAlgorithm, DeckDifficulty } from '../types';

const minutesToDays = (minutes: number) => minutes / (60*24);
const daysToMinutes = (days: number) => days * 60*24;

interface Config {
  NEW_STEPS: number[];
  GRADUATING_INTERVAL: number;
  EASY_INTERVAL: number;
  EASY_BONUS: number;
  INTERVAL_MODIFIER: number;
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
        // "Lapses" tab
        LAPSES_STEPS: [1440, 4320], // in minutes
        NEW_INTERVAL: 40, // in percent
        MINIMUM_INTERVAL: 2, // in days
        LEECH_THRESHOLD: 8, // number wrong
      } as Config;
    case 'CRAM':
      // Settings for cramming a deck before a test
      // Not saved on a deck itself: only used in the "Cram" mode
      return {
        // "New Cards" tab
        NEW_STEPS: [1, 5, 10, 20, 40, 60, 90], // in minutes
        GRADUATING_INTERVAL: 1, // in days
        EASY_INTERVAL: 1, // in days
        // "Reviews" tab
        EASY_BONUS: 130, // in percent
        INTERVAL_MODIFIER: INTERVAL_MODIFIER, // in percent
        // "Lapses" tab
        LAPSES_STEPS: [10], // in minutes
        NEW_INTERVAL: 70, // in percent
        MINIMUM_INTERVAL: 1, // in days
        LEECH_THRESHOLD: 8, // number wrong
      } as Config;
    default:
      // Invalid deck config
      console.error('Invalid deck config');
      errorHandler({}, 0, 4001);
  }
}


// Adapted from https://gist.github.com/riceissa/1ead1b9881ffbb48793565ce69d7dbdd
export interface Interval {
  next_review: Date;
  last_review: Date;
  ease: number;
  learning_status: 'UNSEEN' | 'LEARNING' | 'LEARNED' | 'RELEARNING';
  steps_index: number;
  leech_index: number;
}
export function getAnkiInterval(
  card: ReviewInstance,
  grade: 1 | 2 | 3 | 4,
  settingsAlgorithm: SchedulingAlgorithm = 'ANKING',
  deckDifficulty: ('NONE' | DeckDifficulty) = 'NONE',
) {
  const config = generateConfig(settingsAlgorithm, deckDifficulty);
  if (!config) console.error(config);

  // eslint-disable-next-line
  const {NEW_STEPS, GRADUATING_INTERVAL, EASY_INTERVAL, EASY_BONUS, INTERVAL_MODIFIER, LAPSES_STEPS, NEW_INTERVAL, MINIMUM_INTERVAL, LEECH_THRESHOLD}
    = config as Config;

  // Get variables we will be editing and returning
  let {
    last_review,
    learning_status: learningStatus,
    steps_index: stepsIndex,
    ease,
  } = card;
  let minutesInterval = daysToMinutes(dateDiff(new Date(last_review), new Date()));

  // Algorithm
  if (learningStatus === 'LEARNING' || learningStatus === 'UNSEEN') {
    // For learning cards, there is no "hard" response available (if this is changed `handleKeyDown` also needs to be changed in components.js)
    if (grade === 1) {
      // Again
      stepsIndex = 0;
      minutesInterval = NEW_STEPS[0];
    } else if (grade === 2) {
      minutesInterval = -1;
    } else if (grade === 3) {
      // Good
      stepsIndex++;
      if (stepsIndex < NEW_STEPS.length) {
        minutesInterval = NEW_STEPS[stepsIndex];
      } else {
        // We have graduated!
        learningStatus = 'LEARNED';
        minutesInterval = daysToMinutes(GRADUATING_INTERVAL);
      }
    } else if (grade === 4) {
      // Easy
      learningStatus = 'LEARNED';
      minutesInterval = daysToMinutes(EASY_INTERVAL);
    }
    if (learningStatus === 'UNSEEN') {
      learningStatus = 'LEARNING';
    }
  } else if (learningStatus === 'LEARNED') {
    if (grade === 1) {
      // Again
      learningStatus = 'RELEARNING';
      stepsIndex = 0;
      ease = Math.max(130, ease - 20);

      // The reason we don't need to check that if the card has already
      // been done that day, is because this automatically sets it to
      // 'relearning', which doesn't increase the leech index
      // leechIndex++;
      // if (leechIndex >= LEECH_THRESHOLD) {
      //   isLeech = true;
      // }
      minutesInterval = LAPSES_STEPS[0];
    } else if (grade === 2) {
      // Hard
      ease = Math.max(130, ease - 15);
      minutesInterval = daysToMinutes(minutesToDays(minutesInterval) * 1.2 * INTERVAL_MODIFIER/100);
    } else if (grade === 3) {
      // Good
      minutesInterval = daysToMinutes(minutesToDays(minutesInterval) * ease/100 * INTERVAL_MODIFIER/100);
    } else if (grade === 4) {
      // Easy
      ease = Math.min(350, ease + 15);
      minutesInterval = daysToMinutes(minutesToDays(minutesInterval) * ease/100 * INTERVAL_MODIFIER/100 * EASY_BONUS/100);
    }
  } else if (learningStatus === 'RELEARNING') {
    // "Hard" and "Easy" are not allowed (if this is changed `handleKeyDown` also needs to be changed in components.js)
    if (grade === 1) {
      // Again
      stepsIndex = 0;
      minutesInterval = LAPSES_STEPS[0];
    } else if (grade === 2) {
      minutesInterval = -1;
    } else if (grade === 3) {
      // Good
      stepsIndex++;
      if (stepsIndex < LAPSES_STEPS.length) {
        minutesInterval = LAPSES_STEPS[stepsIndex];
      } else {
        // We have re-graduated!
        learningStatus = 'LEARNED';
        minutesInterval = daysToMinutes(Math.max(MINIMUM_INTERVAL, minutesToDays(minutesInterval) * NEW_INTERVAL/100));
      }
    } else if (grade === 4) {
      minutesInterval = -1;
    }
  } else {
    console.error('Invalid learning status', learningStatus);
  }

  // If the minutes setting is like days, use that
  let isMinute = true;
  if (minutesInterval >= 1440) {
    minutesInterval = minutesToDays(minutesInterval);
    isMinute = false;
  }

  // Put next review date into numbers
  let now = new Date();
  let nextReview = new Date(now.getTime());
  if (isMinute) {
    // In a couple minutes
    nextReview.setMinutes(nextReview.getMinutes() + minutesInterval);
  } else {
    // Exact start of next day
    nextReview.setDate(nextReview.getDate() + minutesInterval);
    nextReview.setHours(0);
    nextReview.setMinutes(0);
    nextReview.setSeconds(0);
    nextReview.setMilliseconds(0);
  }

  return {
    next_review: nextReview,
    last_review: new Date(),
    ease: ease,
    learning_status: learningStatus,
    steps_index: stepsIndex,
  } as Interval;
}
