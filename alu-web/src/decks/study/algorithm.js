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