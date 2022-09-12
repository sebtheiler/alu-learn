import type { Flashcard, ReviewInstance } from "./graphql";

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

export type { NonNullableKeys, Streak, PartialBy, ReviewInstanceWithFlashcard };
