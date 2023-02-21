import { daysToMinutes, inDays } from "./helpers";
import calculateSM2Interval from "./sm2";
import daysBetween from "@/helpers/daysBetween";
import { GradeRating, Interval, SchedulerReviewInstance } from "@/types";
import { updateRecall, defaultModel, modelToPercentileDecay } from "ebisu-js";

const DEFAULT_SETTINGS = {
  REQUEST_RETENTION: 0.5, // recommended setting: 0.8 ~ 0.9
  INIT_HALFLIFE_DAYS: 2, // default assumed half-life of two-days
  INIT_ALPHA: 1,
  INIT_BETA: 1,
  MINIMUM_REMEMBERED_DAYS_INTERVAL: 1.25,
};

const calculateEbisuInterval = (
  reviewInstance: SchedulerReviewInstance,
  grade: GradeRating,
  settings: typeof DEFAULT_SETTINGS = DEFAULT_SETTINGS
): Interval | null => {
  switch (reviewInstance.learningStatus) {
    case "UNSEEN":
    case "LEARNING":
    case "RELEARNING": // Ebisu scheduled RIs should never be in relearning stage
      if (reviewInstance.learningStatus === "RELEARNING")
        console.error("Ebisu should not be in relearning state");
      return calculateSM2Interval(reviewInstance, grade);
    case "LEARNED": {
      const daysSinceLastReview = reviewInstance.lastReview
        ? daysBetween(reviewInstance.lastReview, new Date())
        : 30; // necessary to give Ebisu a start, for some reason. Chosen arbitrarily
      const model =
        reviewInstance.customData?.model ?? // attempt to load saved
        defaultModel(
          settings.INIT_HALFLIFE_DAYS,
          settings.INIT_ALPHA,
          settings.INIT_BETA
        );

      if (grade === "HARD" || grade === "GOOD") return null;

      const newModel = updateRecall(
        model,
        grade === "AGAIN" ? 0 : 1,
        1,
        daysSinceLastReview
      );
      const daysInterval = modelToPercentileDecay(
        newModel,
        settings.REQUEST_RETENTION
      );
      const minAdjustedDaysInterval =
        grade === "EASY"
          ? Math.max(daysInterval, settings.MINIMUM_REMEMBERED_DAYS_INTERVAL)
          : daysInterval;

      return {
        minutes: minAdjustedDaysInterval * daysToMinutes,
        updatedReviewInstance: {
          customData: {
            model: newModel,
          },
          nextReview: inDays(minAdjustedDaysInterval),
        },
      };
    }
  }

  return null;
};

export default calculateEbisuInterval;
