import { gql } from "@apollo/client";

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSONObject: any;
  /** The `Upload` scalar type represents a file upload. */
  Upload: any;
};

export type Course = {
  __typename?: "Course";
  bannerImage?: Maybe<Scalars["String"]>;
  courseSections?: Maybe<Array<Maybe<CourseSection>>>;
  id?: Maybe<Scalars["String"]>;
  /** Users who have full privileges on this course */
  owners?: Maybe<Array<Maybe<User>>>;
  title?: Maybe<Scalars["String"]>;
  /** Users who have studying or teaching this course */
  users?: Maybe<Array<Maybe<User>>>;
};

export type CourseSection = {
  __typename?: "CourseSection";
  id?: Maybe<Scalars["String"]>;
  subSections?: Maybe<Array<Maybe<SubSection>>>;
  title?: Maybe<Scalars["String"]>;
};

export enum DeckChoice {
  CopyExisting = "COPY_EXISTING",
  CreateOwn = "CREATE_OWN",
}

export type Flashcard = {
  __typename?: "Flashcard";
  fields?: Maybe<Scalars["JSONObject"]>;
  id?: Maybe<Scalars["String"]>;
  tags?: Maybe<Scalars["String"]>;
  type?: Maybe<FlashcardType>;
};

export enum FlashcardType {
  Cloze = "CLOZE",
  Normal = "NORMAL",
}

export enum JoinReason {
  Concept = "CONCEPT",
  Grades = "GRADES",
  Memory = "MEMORY",
  Students = "STUDENTS",
  Teacher = "TEACHER",
}

export type Mutation = {
  __typename?: "Mutation";
  /** Creates a course and populates it with an initial main and sub section */
  createCourse?: Maybe<Course>;
  /** Creates a new course section and populates it with a default subsection */
  createCourseSection?: Maybe<CourseSection>;
  /** Creeates a new flashcard */
  createFlashcard?: Maybe<Flashcard>;
  /** Creates a new NewUserSurveyResponse from a set of responses */
  createNewUserSurveyResponse?: Maybe<NewUserSurveyResponse>;
  /** Creates a new sub section */
  createSubSection?: Maybe<SubSection>;
  /** Removes the current user from a course if the course has other users.  If the course has no other users, deletes the course. */
  deleteCourse?: Maybe<Course>;
  /** Deletes a course section */
  deleteCourseSection?: Maybe<CourseSection>;
  /** Deletes a sub section */
  deleteSubSection?: Maybe<SubSection>;
  /** Change a course's settings */
  updateCourse?: Maybe<Course>;
  /** Change a course section's settings */
  updateCourseSection?: Maybe<CourseSection>;
  /** Change a sub section's settings */
  updateSubSection?: Maybe<SubSection>;
  /** Change the user's settings */
  updateUser?: Maybe<User>;
  /** Upload a banner image for a course */
  uploadCourseBannerImage?: Maybe<Course>;
};

export type MutationCreateCourseArgs = {
  title: Scalars["String"];
};

export type MutationCreateCourseSectionArgs = {
  courseId: Scalars["String"];
  title: Scalars["String"];
};

export type MutationCreateFlashcardArgs = {
  courseSectionSlug: Scalars["String"];
  fields: Scalars["JSONObject"];
  flashcardType?: InputMaybe<FlashcardType>;
  subSectionSlug: Scalars["String"];
  tags?: InputMaybe<Scalars["String"]>;
};

export type MutationCreateNewUserSurveyResponseArgs = {
  deckChoice: DeckChoice;
  joinReason: JoinReason;
  referrer: Referrer;
  sendReminders: Scalars["Boolean"];
  targetNumCards: Scalars["Int"];
  timezoneOffset: Scalars["Int"];
  userType: UserType;
};

export type MutationCreateSubSectionArgs = {
  courseSectionId: Scalars["String"];
  title: Scalars["String"];
};

export type MutationDeleteCourseArgs = {
  courseId: Scalars["String"];
};

export type MutationDeleteCourseSectionArgs = {
  courseSectionId: Scalars["String"];
};

export type MutationDeleteSubSectionArgs = {
  subSectionId: Scalars["String"];
};

export type MutationUpdateCourseArgs = {
  courseId: Scalars["String"];
  title?: InputMaybe<Scalars["String"]>;
};

export type MutationUpdateCourseSectionArgs = {
  courseSectionId: Scalars["String"];
  title?: InputMaybe<Scalars["String"]>;
};

export type MutationUpdateSubSectionArgs = {
  subSectionId: Scalars["String"];
  title?: InputMaybe<Scalars["String"]>;
};

export type MutationUpdateUserArgs = {
  name?: InputMaybe<Scalars["String"]>;
  sendMarketingResearch?: InputMaybe<Scalars["Boolean"]>;
  sendReminders?: InputMaybe<Scalars["Boolean"]>;
  targetNumCards?: InputMaybe<Scalars["Int"]>;
  timezoneOffset?: InputMaybe<Scalars["Int"]>;
  userType?: InputMaybe<UserType>;
};

export type MutationUploadCourseBannerImageArgs = {
  bannerImage?: InputMaybe<Scalars["Upload"]>;
  courseId: Scalars["String"];
};

export type NewUserSurveyResponse = {
  __typename?: "NewUserSurveyResponse";
  deckChoice?: Maybe<DeckChoice>;
  id?: Maybe<Scalars["String"]>;
  joinReason?: Maybe<JoinReason>;
  referrer?: Maybe<Referrer>;
  sendReminders?: Maybe<Scalars["Boolean"]>;
  targetNumCards?: Maybe<Scalars["Int"]>;
  timezoneOffset?: Maybe<Scalars["Int"]>;
  user?: Maybe<User>;
  userId?: Maybe<Scalars["String"]>;
  userType?: Maybe<UserType>;
};

export type Query = {
  __typename?: "Query";
  /** Gets all available courses */
  courses?: Maybe<Array<Maybe<Course>>>;
  /** Get information on the current user */
  me?: Maybe<User>;
  /** Get the current user's courses */
  myCourses?: Maybe<Array<Maybe<Course>>>;
  /** List all users */
  users?: Maybe<Array<Maybe<User>>>;
};

export enum Referrer {
  Friends = "FRIENDS",
  Insta = "INSTA",
  News = "NEWS",
  Reddit = "REDDIT",
  Search = "SEARCH",
  Teacher = "TEACHER",
  Tiktok = "TIKTOK",
  Youtube = "YOUTUBE",
}

export enum Role {
  Admin = "ADMIN",
  Staff = "STAFF",
  User = "USER",
}

export type SubSection = {
  __typename?: "SubSection";
  flashcards?: Maybe<Array<Maybe<Flashcard>>>;
  id?: Maybe<Scalars["String"]>;
  title?: Maybe<Scalars["String"]>;
};

export type User = {
  __typename?: "User";
  email?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["String"]>;
  name?: Maybe<Scalars["String"]>;
  /** The user's response to the survey launched on sign-up */
  newUserSurveyResponse?: Maybe<NewUserSurveyResponse>;
  role?: Maybe<Role>;
  sendMarketingResearch?: Maybe<Scalars["Boolean"]>;
  sendReminders?: Maybe<Scalars["Boolean"]>;
  targetNumCards?: Maybe<Scalars["Int"]>;
  timezoneOffset?: Maybe<Scalars["Int"]>;
  userType?: Maybe<UserType>;
  username?: Maybe<Scalars["String"]>;
};

export enum UserType {
  Mixed = "MIXED",
  Student = "STUDENT",
  Teacher = "TEACHER",
}

export interface PossibleTypesResultData {
  possibleTypes: {
    [key: string]: string[];
  };
}
const result: PossibleTypesResultData = {
  possibleTypes: {},
};
export default result;
