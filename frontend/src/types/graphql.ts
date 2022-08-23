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
};

export type Course = {
  __typename?: "Course";
  id?: Maybe<Scalars["String"]>;
  courseSections?: Maybe<Array<Maybe<CourseSection>>>;
  owners?: Maybe<Array<Maybe<User>>>;
  title?: Maybe<Scalars["String"]>;
  users?: Maybe<Array<Maybe<User>>>;
};

export enum DeckChoice {
  CopyExisting = "COPY_EXISTING",
  CreateOwn = "CREATE_OWN",
}

export enum JoinReason {
  Concept = "CONCEPT",
  Grades = "GRADES",
  Memory = "MEMORY",
  Students = "STUDENTS",
  Teacher = "TEACHER",
}

export type CourseSection = {
  __typename?: "CourseSection";
  id?: Maybe<Scalars["String"]>;
  subSections?: Maybe<Array<Maybe<SubSection>>>;
  title?: Maybe<Scalars["String"]>;
};

export type Mutation = {
  __typename?: "Mutation";
  createCourse?: Maybe<Course>;
  createCourseSection?: Maybe<CourseSection>;
  createNewUserSurveyResponse?: Maybe<NewUserSurveyResponse>;
  createSubSection?: Maybe<SubSection>;
  updateUser?: Maybe<User>;
};

export type MutationCreateCourseArgs = {
  title: Scalars["String"];
};

export type MutationCreateCourseSectionArgs = {
  courseId: Scalars["String"];
  title: Scalars["String"];
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
  courseId: Scalars["String"];
  courseSectionId: Scalars["String"];
  title: Scalars["String"];
};

export type MutationUpdateUserArgs = {
  name?: InputMaybe<Scalars["String"]>;
  sendMarketingResearch?: InputMaybe<Scalars["Boolean"]>;
  sendReminders?: InputMaybe<Scalars["Boolean"]>;
  targetNumCards?: InputMaybe<Scalars["Int"]>;
  timezoneOffset?: InputMaybe<Scalars["Int"]>;
  userType?: InputMaybe<UserType>;
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
  courses?: Maybe<Array<Maybe<Course>>>;
  me?: Maybe<User>;
  myCourses?: Maybe<Array<Maybe<Course>>>;
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
  id?: Maybe<Scalars["String"]>;
  title?: Maybe<Scalars["String"]>;
};

export type User = {
  __typename?: "User";
  email?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["String"]>;
  name?: Maybe<Scalars["String"]>;
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
