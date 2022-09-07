import daysBetween from "@/helpers/daysBetween";
import type { PartialBy } from "@/types";
import { ReviewInstance } from "@prisma/client";

// const ANKI_SETTINGS = {
//   // "New Cards" tab
//   NEW_STEPS: [1, 10], // in minutes
//   GRADUATING_INTERVAL: 1, // in days
//   EASY_INTERVAL: 4, // in days

//   // "Reviews" tab
//   EASY_BONUS: 130, // in percent
//   INTERVAL_MODIFIER: 100, // in percent
//   MAXIMUM_INTERVAL: 36500, // in days

//   // "Lapses" tab
//   LAPSES_STEPS: [10], // in minutes
//   NEW_INTERVAL: 70, // in percent
//   MINIMUM_INTERVAL: 1, // in days

//   // Other
//   MIN_EASE_FACTOR: 130,
//   MAX_EASE_FACTOR: 350,
//   FUZZ: 0, // in percent
// }

// https://www.youtube.com/watch?v=wvF5Y2101Lk
const ANKING_SETTINGS = {
  // "New Cards" tab
  NEW_STEPS: [25, 1440], // in minutes
  GRADUATING_INTERVAL: 3, // in days
  EASY_INTERVAL: 4, // in days

  // "Reviews" tab
  EASY_BONUS: 150, // in percent
  INTERVAL_MODIFIER: 100, // in percent
  MAXIMUM_INTERVAL: 36500, // in days

  // "Lapses" tab
  LAPSES_STEPS: [30, 1440], // in minutes
  NEW_INTERVAL: 20, // in percent
  MINIMUM_INTERVAL: 1, // in days

  // Other
  MIN_EASE_FACTOR: 130,
  MAX_EASE_FACTOR: 350,
  FUZZ: 10, // in percent
};

const daysToMinutes = 24 * 60;

const inDays = (n: number) => {
  const date = new Date();
  date.setDate(date.getDate() + n);
  return date;
};

type PartialReviewInstance = PartialBy<
  ReviewInstance,
  "flashcardId" | "userId"
>;

export interface Interval {
  minutes: number;
  updatedReviewInstance: PartialReviewInstance;
}

/**
 * Calculate an interval for a review instance using Anki's algorithm
 * @param reviewInstance Review instance to calculate the interval for
 * @param grade How well the user rated their response
 * @returns The updated review instance and the number of minutes for the interval
 * @see https://gist.github.com/riceissa/1ead1b9881ffbb48793565ce69d7dbdd
 */
const calculateInterval = (
  reviewInstance: PartialReviewInstance,
  grade: "AGAIN" | "HARD" | "GOOD" | "EASY",
  settings = ANKING_SETTINGS
): Interval | null => {
  const updatedReviewInstance = reviewInstance;
  const daysSinceLastReview = daysBetween(
    reviewInstance.lastReview as Date,
    new Date()
  );

  switch (reviewInstance.learningStatus) {
    case "UNSEEN":
    case "LEARNING":
      updatedReviewInstance.learningStatus = "LEARNING";
      switch (grade) {
        case "AGAIN":
          updatedReviewInstance.stepsIndex = 0;
          return {
            minutes: settings.NEW_STEPS[0],
            updatedReviewInstance,
          };
        case "HARD":
          return null;
        case "GOOD":
          updatedReviewInstance.stepsIndex++;
          if (
            updatedReviewInstance.stepsIndex <
            settings.NEW_STEPS[updatedReviewInstance.stepsIndex]
          ) {
            return {
              minutes: settings.NEW_STEPS[updatedReviewInstance.stepsIndex],
              updatedReviewInstance,
            };
          } else {
            updatedReviewInstance.learningStatus = "LEARNED";
            updatedReviewInstance.nextReview = inDays(
              settings.GRADUATING_INTERVAL
            );
            return {
              minutes: settings.GRADUATING_INTERVAL * daysToMinutes,
              updatedReviewInstance,
            };
          }
        case "EASY":
          updatedReviewInstance.learningStatus = "LEARNED";
          updatedReviewInstance.nextReview = inDays(settings.EASY_INTERVAL);
          return {
            minutes: settings.EASY_INTERVAL * daysToMinutes,
            updatedReviewInstance,
          };
      }
      break;
    case "LEARNED":
      switch (grade) {
        case "AGAIN":
          updatedReviewInstance.learningStatus = "RELEARNING";
          updatedReviewInstance.stepsIndex = 0;
          updatedReviewInstance.ease = Math.max(
            settings.MIN_EASE_FACTOR,
            reviewInstance.ease - 20
          );
          updatedReviewInstance.nextReview = inDays(
            Math.max(
              settings.MINIMUM_INTERVAL,
              (daysSinceLastReview * settings.NEW_INTERVAL) / 100
            )
          );
          return {
            minutes: settings.LAPSES_STEPS[0],
            updatedReviewInstance,
          };
        case "HARD": {
          updatedReviewInstance.ease = Math.max(
            settings.MIN_EASE_FACTOR,
            reviewInstance.ease - 15
          );
          const interval = Math.min(
            settings.MAXIMUM_INTERVAL,
            (daysSinceLastReview * 1.2 * settings.INTERVAL_MODIFIER) / 100
          );
          updatedReviewInstance.nextReview = inDays(interval);
          return {
            minutes: interval * daysToMinutes,
            updatedReviewInstance,
          };
        }
        case "GOOD": {
          const interval = Math.min(
            settings.MAXIMUM_INTERVAL,
            (((daysSinceLastReview * reviewInstance.ease) / 100) *
              settings.INTERVAL_MODIFIER) /
              100
          );
          updatedReviewInstance.nextReview = inDays(interval);
          return {
            minutes: interval * daysToMinutes,
            updatedReviewInstance,
          };
        }
        case "EASY": {
          updatedReviewInstance.ease += 15;
          const interval = Math.min(
            settings.MAXIMUM_INTERVAL,
            (((((daysSinceLastReview * reviewInstance.ease) / 100) *
              settings.EASY_BONUS) /
              100) *
              settings.INTERVAL_MODIFIER) /
              100
          );
          updatedReviewInstance.nextReview = inDays(interval);
          return {
            minutes: interval * daysToMinutes,
            updatedReviewInstance,
          };
        }
      }
      break;
    case "RELEARNING":
      switch (grade) {
        case "AGAIN":
          updatedReviewInstance.stepsIndex = 0;
          return {
            minutes: settings.LAPSES_STEPS[0],
            updatedReviewInstance,
          };
        case "HARD":
          return null;
        case "GOOD":
          updatedReviewInstance.stepsIndex++;
          if (updatedReviewInstance.stepsIndex < settings.LAPSES_STEPS.length) {
            return {
              minutes: settings.LAPSES_STEPS[updatedReviewInstance.stepsIndex],
              updatedReviewInstance,
            };
          } else {
            updatedReviewInstance.learningStatus = "LEARNED";
            return {
              minutes: daysSinceLastReview * daysToMinutes,
              updatedReviewInstance,
            };
          }
        case "EASY":
          return null;
      }
  }
};

export default calculateInterval;
