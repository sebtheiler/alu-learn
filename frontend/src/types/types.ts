/**
 * Make each key of a type NonNullable
 */
type NonNullableKeys<Type> = {
  [Key in keyof Type]-?: NonNullableKeys<NonNullable<Type[Key]>>;
};

interface Streak {
  currentStreak: number;
  doneReviewsToday: boolean;
}

export type { NonNullableKeys, Streak };
