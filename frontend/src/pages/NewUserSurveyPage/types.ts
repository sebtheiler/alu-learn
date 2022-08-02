export interface Answers {
  timezoneOffset?: number;
  userType?: "STUDENT" | "TEACHER";
  referrer?:
    | "FRIENDS"
    | "TEACHER"
    | "INSTA"
    | "REDDIT"
    | "TIKTOK"
    | "YOUTUBE"
    | "NEWS"
    | "SEARCH";
  joinReason?: "MEMORY" | "GRADES" | "CONCEPT" | "TEACHER" | "STUDENTS";
  targetNumCards?: 10 | 25 | 50 | 100;
  sendReminders?: boolean;
  deckChoice?: "CREATE_OWN" | "COPY_EXISTING";
}

export type Question = keyof Answers;
