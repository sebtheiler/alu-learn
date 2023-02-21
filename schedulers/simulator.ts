import calculateInterval from "./calculateInterval";
import daysBetween from "@/helpers/daysBetween";
import type {
  GradeRating,
  SchedulerReviewInstance,
  LearningStatus,
} from "@/types";

const gradeRatings: GradeRating[] = ["EASY", "EASY", "EASY", "EASY", "EASY"];
// const gradeRatings: GradeRating[] = ['EASY', 'EASY', 'AGAIN', 'EASY', 'EASY'];

export default function simulator() {
  function simulateAlgorithm(algorithm: "SM2" | "EBISU" | "SSP_MMC") {
    const now = new Date();
    let reviewInstance: SchedulerReviewInstance = {
      lastReview: null,
      nextReview: now,
      learningStatus: "UNSEEN" as LearningStatus,
      stepsIndex: 0,
      ease: 250,
      customData: null,
    };

    const diffs: number[] = [];
    for (const grade of gradeRatings) {
      const interval = calculateInterval(reviewInstance, grade, algorithm);
      if (interval) {
        reviewInstance = {
          ...reviewInstance,
          ...interval.updatedReviewInstance,
        } as SchedulerReviewInstance;
        const diff = daysBetween(now, reviewInstance.nextReview);
        diffs.push(diff);
        reviewInstance.nextReview = now;
        const updatedLastReview = new Date(now.getTime());
        updatedLastReview.setDate(updatedLastReview.getDate() - diff);
        reviewInstance.lastReview = updatedLastReview;
      }
    }

    return diffs;
  }

  const sm2Diffs = simulateAlgorithm("SM2");
  const ebisuDiffs = simulateAlgorithm("EBISU");
  const fsrsDiffs = simulateAlgorithm("SSP_MMC");

  for (let i = 0; i < gradeRatings.length; i++) {
    console.log(
      `${i}\tSM-2: ${round(sm2Diffs[i])}\tEbisu: ${round(
        ebisuDiffs[i]
      )}\tFSRS: ${round(fsrsDiffs[i])}`
    );
  }
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
