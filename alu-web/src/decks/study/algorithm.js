// Adapted from https://gist.github.com/riceissa/1ead1b9881ffbb48793565ce69d7dbdd
export function getAnkiInterval(_card, grade) {
  if (!_card) {
    return {};
  };

  // "New Cards" tab
  const NEW_STEPS = [1, 10]; // in minutes
  const GRADUATING_INTERVAL = 1; // in days
  const EASY_INTERVAL = 4; // in days
  const STARTING_EASE = 250; // in percent

  // "Reviews" tab
  const EASY_BONUS = 130; // in percent
  const INTERVAL_MODIFIER = 100; // in percent
  const MAXIMUM_INTERVAL = 36500; // in days

  // "Lapses" tab
  const LAPSES_STEPS = [10]; // in days
  const NEW_INTERVAL = 70; // in percent
  const MINIMUM_INTERVAL = 1; // in days

  // Placeholder card
  const card = {
    learningStatus: "learning", // 'learning', 'learned', or 'relearning'
    stepsIndex: 0,
    easeFactor: STARTING_EASE,
    interval: null,
  };

  // Get variables we will be editing and returning
  var isMinute = false; // specifies that the interval is in minutes, not days
  var {learningStatus, stepsIndex, easeFactor, interval} = card;

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
    };
  } else if (learningStatus === 'relearning') {
    // "Hard" and "Easy" are not allowed
    if (grade === 1) {
      // Again
      stepsIndex = 0;
      interval = LAPSES_STEPS[0];
      isMinute = true;
    } else if (grade === 2) {
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
    };
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
    ease: easeFactor,
    interval: interval,
    minute: isMinute,
    learningStatus: learningStatus,
  };
};

export function getInterval(card, grade) {
  if (!card) {
    return {
      nextReviewDate: null,
      ease: -1,
      interval: -1,
      minute: -1,
      graduated: -1,
    };
  };
  const now = new Date();
  const intervalModifier = 1.0;
  const maximumInterval = 180; // 6 months
  // const lapseInterval = 0.0;
  const easyBonus = 1.50;
  var interval, minute;
  var ease = card.ease;
  var graduated = card.graduated;

  if (grade === 1) {
    // Again
    if (card.graduated) {
      ease -= 20;
      interval = 10; // card.interval * lapseInterval * intervalModifier;
      minute = true;
      graduated = false;
    } else {
      // 1 minute from now
      interval = 1;
      minute = true;
    };
  } else if (grade === 2) {
    // Hard
    if (card.graduated) {
      ease -= 15;
      interval = card.interval * 1.2 * intervalModifier;
    } else {
      // 10 minute from now
      // TODO: make customizable
      interval = 10;
      minute = true;
    };
  } else if (grade === 3) {
    // Good
    if (card.graduated) {
      interval = card.interval * (card.ease/100) * intervalModifier;
    } else {
      // 1 day from now
      interval = 1;
      graduated = true;
    };
  } else if (grade === 4) {
    // Easy
    if (card.graduated) {
      ease += 15;
      interval = card.interval * (card.ease/100) * easyBonus * intervalModifier;
    } else {
      // 2 days from now
      interval = 2;
      graduated = true;
    };
  };

  var nextReviewDate;
  if (minute) {
    nextReviewDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + interval, now.getSeconds());
  } else {
    interval = Math.ceil(Math.min(interval, maximumInterval));
    nextReviewDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + interval);
  };

  ease = Math.min(Math.max(ease, 130), 350);

  return {
    nextReviewDate: nextReviewDate,
    ease: ease,
    interval: interval,
    minute: minute,
    graduated: graduated,
  };
};