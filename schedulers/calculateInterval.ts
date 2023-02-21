import calculateEbisuInterval from "./ebisu";
import calculateFSRSInterval from "./fsrs";
import calculateSM2Interval from "./sm2";
import type { Interval, SchedulerReviewInstance } from "@/types";

/**
 * Calculate an interval for a review instance using Anki's algorithm
 * @param reviewInstance Review instance to calculate the interval for
 * @param grade How well the user rated their response
 * @returns The updated review instance and the number of minutes for the interval
 * @see https://gist.github.com/riceissa/1ead1b9881ffbb48793565ce69d7dbdd
 */
const calculateInterval = (
  reviewInstance: SchedulerReviewInstance,
  grade: "AGAIN" | "HARD" | "GOOD" | "EASY",
  algorithm: "SM2" | "EBISU" | "SSP_MMC" | "NOT_SHOWN_CONTROL"
): Interval | null => {
  switch (algorithm) {
    case "SM2":
      return calculateSM2Interval(reviewInstance, grade);
    case "EBISU":
      return calculateEbisuInterval(reviewInstance, grade);
    case "SSP_MMC":
      return calculateFSRSInterval(reviewInstance, grade);
    case "NOT_SHOWN_CONTROL":
      throw new Error("Cannot study `NOT_SHOWN_CONTROL` review instance");
  }
};

export default calculateInterval;
