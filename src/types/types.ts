import type {
  Assignment,
  Flashcard,
  ReviewInstance,
  SubSection,
  User,
} from "./graphql";
import type {
  FlashcardType,
  HistorySegment,
  ReviewInstance as PrismaReviewInstance,
} from "@prisma/client";

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

type FlashcardWithId = Flashcard & { id: string };

type UserWithHistory = User & {
  history: Partial<HistorySegment>[];
};

type AssignmentWithSubSections = Assignment & {
  assignedSubSections: SubSection[];
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

type GeneratedFlashcard = {
  front: string;
  back: string;
  flashcardType: FlashcardType;
};

export type {
  NonNullableKeys,
  Streak,
  PartialBy,
  ReviewInstanceWithFlashcard,
  Interval,
  Intervals,
  Option,
  UserWithHistory,
  AssignmentWithSubSections,
  FlashcardWithId,
  GeneratedFlashcard,
};
