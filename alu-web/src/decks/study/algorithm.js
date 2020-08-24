function minutesToDays(minutes) {
  return minutes / (60*24);
};

function generateConfig(method='ANKI') {
  if (method === 'ANKI') {
    // Default Anki settings
    return {
      // "New Cards" tab
      NEW_STEPS: [1, 10], // in minutes
      GRADUATING_INTERVAL: 1, // in days
      EASY_INTERVAL: 4, // in days
      STARTING_EASE: 250, // in percent
      // "Reviews" tab
      EASY_BONUS: 130, // in percent
      INTERVAL_MODIFIER: 100, // in percent
      MAXIMUM_INTERVAL: 36500, // in days
      // "Lapses" tab
      LAPSES_STEPS: [10], // in minutes
      NEW_INTERVAL: 70, // in percent
      MINIMUM_INTERVAL: 1, // in days
    };
  } else if (method === 'ANKING') {
    // Optimized Anki settings from https://www.youtube.com/watch?v=wvF5Y2101Lk
    return {
      // "New Cards" tab
      NEW_STEPS: [25, 1440], // in minutes
      GRADUATING_INTERVAL: 3, // in days
      EASY_INTERVAL: 4, // in days
      STARTING_EASE: 250, // in percent
      // "Reviews" tab
      EASY_BONUS: 150, // in percent
      INTERVAL_MODIFIER: 100, // in percent
      MAXIMUM_INTERVAL: 180, // in days
      // "Lapses" tab
      LAPSES_STEPS: [30, 1440], // in minutes
      NEW_INTERVAL: 20, // in percent
      MINIMUM_INTERVAL: 1, // in days
    };
  };
};


// Adapted from https://gist.github.com/riceissa/1ead1b9881ffbb48793565ce69d7dbdd
export function getAnkiInterval(card, grade, settingsAlgorithm='ANKI') {
  const errorResponse = {
    message: 'ERROR',
    nextReviewDate: new Date(),
    easeFactor: -1,
    interval: -1,
    isMinute: false,
    learningStatus: '',
    stepsIndex: -1,
  };
  if (!card || settingsAlgorithm === null) {
    // TODO: there has to be a better way to do this
    return {
      message: 'NULL',
      nextReviewDate: new Date(),
      easeFactor: -1,
      interval: -1,
      isMinute: false,
      learningStatus: '',
      stepsIndex: -1,
    };
  };
  
  // eslint-disable-next-line
  const {NEW_STEPS, GRADUATING_INTERVAL, EASY_INTERVAL, STARTING_EASE, EASY_BONUS, INTERVAL_MODIFIER, MAXIMUM_INTERVAL, LAPSES_STEPS, NEW_INTERVAL, MINIMUM_INTERVAL} = generateConfig(settingsAlgorithm);

  // Get variables we will be editing and returning
  var isMinute = false; // specifies that the interval is in minutes, not days
  var {learning_status: learningStatus, steps_index: stepsIndex, ease: easeFactor, interval} = card;
  learningStatus = learningStatus.toLowerCase();

  // Algorithm
  if (learningStatus === 'learning') {
    // For learning cards, there is no "hard" response available
    if (grade === 1) {
      // Again
      stepsIndex = 0;
      interval = NEW_STEPS[0];
      isMinute = true;
    } else if (grade === 3) {
      // Good
      stepsIndex++;
      if (stepsIndex < NEW_STEPS.length) {
        interval = NEW_STEPS[stepsIndex];
        isMinute = true;
      } else {
        // We have graduated!
        learningStatus = 'learned';
        interval = GRADUATING_INTERVAL;
      };
    } else if (grade === 4) {
      // Easy
      learningStatus = 'learned';
      interval = EASY_INTERVAL;
    } else {
      return errorResponse;
    };
  } else if (learningStatus === 'learned') {
    if (grade === 1) {
      // Again
      learningStatus = 'relearning';
      stepsIndex = 0;
      easeFactor = Math.max(130, easeFactor - 20);
      // TODO: the Anki manual says "the current interval is multiplied by the
      // value of new interval", but I have no clue what the "new interval" is
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
    } else {
      return errorResponse;
    };
  } else if (learningStatus === 'relearning') {
    // "Hard" and "Easy" are not allowed
    if (grade === 1) {
      // Again
      stepsIndex = 0;
      interval = LAPSES_STEPS[0];
      isMinute = true;
    } else if (grade === 3) {
      // Good
      stepsIndex++;
      if (stepsIndex < LAPSES_STEPS.length) {
        interval = LAPSES_STEPS[stepsIndex];
        isMinute = true;
      } else {
        // We have re-graduated!
        learningStatus = 'learned';
        interval = Math.max(MINIMUM_INTERVAL, interval * NEW_INTERVAL/100);
      };
    } else {
      return errorResponse;
    };
  };

  // If the minutes setting is like days, use that
  if (isMinute && interval >= 1440) {
    interval = minutesToDays(interval);
    isMinute = false;
  };

  // Put next review date into numbers
  var now = new Date();
  var nextReviewDate = new Date(
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
  };

  return {
    nextReviewDate: nextReviewDate,
    easeFactor: easeFactor,
    interval: Math.floor(interval),
    isMinute: isMinute,
    learningStatus: learningStatus,
    stepsIndex: stepsIndex,
    message: 'SUCCESS',
  };
};