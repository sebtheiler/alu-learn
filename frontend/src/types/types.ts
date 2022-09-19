import type { Flashcard, ReviewInstance } from "./graphql";
import type { ReviewInstance as PrismaReviewInstance } from "@prisma/client";

/**
 * Make each key of a type NonNullable
 */
type NonNullableKeys<Type> = {
  [Key in keyof Type]-?: NonNullableKeys<NonNullable<Type[Key]>>;
};

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

interface Streak {
  currentStreak: number;
  doneReviewsToday: boolean;
}

type ReviewInstanceWithFlashcard = NonNullableKeys<ReviewInstance> & {
  flashcard: Flashcard;
};

interface Interval {
  minutes: number;
  updatedReviewInstance: Partial<PrismaReviewInstance>;
}

/**
 * Intervals for each review instance.
 * In the form of a dictionary (reviewInstanceId: interval)
 */
interface Intervals {
  [reviewInstanceId: string]: {
    AGAIN: Interval | null;
    HARD: Interval | null;
    GOOD: Interval | null;
    EASY: Interval | null;
  };
}

/**
 * Option for use in various `atoms`
 */
interface Option {
  /**
   * Value of the option
   */
  value: string | number;
  /**
   * Label to display for the option
   */
  label: string;
  /**
   * Is the option disabled?
   */
  disabled?: boolean;
}

export type {
  NonNullableKeys,
  Streak,
  PartialBy,
  ReviewInstanceWithFlashcard,
  Interval,
  Intervals,
  Option,
};
