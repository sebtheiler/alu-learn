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
  /** Date scalar type */
  Date: any;
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSONObject: any;
  /** The `Upload` scalar type represents a file upload. */
  Upload: any;
};

export type Assignment = {
  __typename?: "Assignment";
  essentialOnly?: Maybe<Scalars["Boolean"]>;
  id?: Maybe<Scalars["String"]>;
  title?: Maybe<Scalars["String"]>;
};

export enum AutoFlashcardsMode {
  Cloze = "CLOZE",
  Multi = "MULTI",
  Notes = "NOTES",
  Single = "SINGLE",
}

export type Classroom = {
  __typename?: "Classroom";
  courseId?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["String"]>;
  joinCode?: Maybe<Scalars["String"]>;
  title?: Maybe<Scalars["String"]>;
};

export type Course = {
  __typename?: "Course";
  bannerImage?: Maybe<Scalars["String"]>;
  courseSections?: Maybe<Array<Maybe<CourseSection>>>;
  description?: Maybe<Scalars["String"]>;
  editingAccess?: Maybe<EditingAccess>;
  id?: Maybe<Scalars["String"]>;
  isPublic?: Maybe<Scalars["Boolean"]>;
  /** Users who have full privileges on this course */
  owners?: Maybe<Array<Maybe<User>>>;
  privacySetting?: Maybe<PrivacySetting>;
  seoDescription?: Maybe<Scalars["String"]>;
  seoSubject?: Maybe<Scalars["String"]>;
  title?: Maybe<Scalars["String"]>;
  /** Users who have studying or teaching this course */
  users?: Maybe<Array<Maybe<User>>>;
};

export type CourseSection = {
  __typename?: "CourseSection";
  color?: Maybe<Scalars["String"]>;
  description?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["String"]>;
  slug?: Maybe<Scalars["String"]>;
  subSections?: Maybe<Array<Maybe<SubSection>>>;
  title?: Maybe<Scalars["String"]>;
};

export enum EditingAccess {
  All = "ALL",
  Friends = "FRIENDS",
  Institution = "INSTITUTION",
  Owners = "OWNERS",
}

export type Flashcard = {
  __typename?: "Flashcard";
  courseId?: Maybe<Scalars["String"]>;
  fields?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["String"]>;
  tags?: Maybe<Scalars["String"]>;
  type?: Maybe<FlashcardType>;
};

export type FlashcardReport = {
  __typename?: "FlashcardReport";
  flashcardId?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["String"]>;
  reasons?: Maybe<Scalars["String"]>;
  timestamp?: Maybe<Scalars["String"]>;
  userId?: Maybe<Scalars["String"]>;
};

export enum FlashcardType {
  Cloze = "CLOZE",
  Normal = "NORMAL",
}

export enum Grade {
  Again = "AGAIN",
  Easy = "EASY",
  Good = "GOOD",
  Hard = "HARD",
}

export enum JoinReason {
  Concept = "CONCEPT",
  Grades = "GRADES",
  Memory = "MEMORY",
  Students = "STUDENTS",
  Teacher = "TEACHER",
}

export enum LearningStatus {
  Learned = "LEARNED",
  Learning = "LEARNING",
  Relearning = "RELEARNING",
  Unseen = "UNSEEN",
}

export type Mutation = {
  __typename?: "Mutation";
  /** Adds a user as a course owner */
  addCourseOwner?: Maybe<User>;
  /** Sends a friend request or accepts an existing friend request */
  addFriend?: Maybe<Scalars["Boolean"]>;
  /** Archives a course for the current user. Does not affect ownership */
  archiveCourse?: Maybe<Course>;
  /** Cancels the Stripe subscription for the current user */
  cancelStripeSubscription?: Maybe<Scalars["Boolean"]>;
  /** Creates an assignment */
  createAssignment?: Maybe<Assignment>;
  /** Creates a classroom */
  createClassroom?: Maybe<Classroom>;
  /** Creates a course and populates it with an initial main and sub section */
  createCourse?: Maybe<Course>;
  /** Creates a new course section and populates it with a default subsection */
  createCourseSection?: Maybe<CourseSection>;
  /** Creates a new flashcard */
  createFlashcard?: Maybe<Flashcard>;
  /** Creates a new flashcard report */
  createFlashcardReport?: Maybe<FlashcardReport>;
  /** Creates a new NewUserSurveyResponse from a set of responses */
  createNewUserSurveyResponse?: Maybe<NewUserSurveyResponse>;
  /** Creates a Stripe session for purchasing an item */
  createStripeSession?: Maybe<Scalars["String"]>;
  /** Creates a new sub section */
  createSubSection?: Maybe<SubSection>;
  /** Removes the current user from a course if the course has other users.  If the course has no other users, deletes the course. */
  deleteCourse?: Maybe<Course>;
  /** Deletes a course section */
  deleteCourseSection?: Maybe<CourseSection>;
  /** Deletes the given flashcard */
  deleteFlashcard?: Maybe<Flashcard>;
  /** Deletes a sub section */
  deleteSubSection?: Maybe<SubSection>;
  /** Generates a flashcard automatically from some source text. Returns ["front", "back"] */
  generateAutoFlashcard?: Maybe<Array<Maybe<Scalars["JSONObject"]>>>;
  /** Joins the current user as a student to a classroom */
  joinClassroom?: Maybe<Classroom>;
  /** Joins the current user to a course */
  joinCourse?: Maybe<Course>;
  /** Moves a course section from a position to another */
  moveCourseSection?: Maybe<CourseSection>;
  /** Moves a flashcard from a position to another */
  moveFlashcard?: Maybe<Flashcard>;
  /** Move a flashcard from one sub section to another */
  moveFlashcardToSubSection?: Maybe<Scalars["String"]>;
  /** Moves a sub section from a position to another */
  moveSubSection?: Maybe<SubSection>;
  /** Removes a user as a course owner */
  removeCourseOwner?: Maybe<User>;
  /** Removes a friend */
  removeFriend?: Maybe<Scalars["Boolean"]>;
  /** Removes a given user as a student to a classroom */
  removeStudentFromClassroom?: Maybe<Classroom>;
  /** Renews the Stripe subscription for the current user */
  renewStripeSubscription?: Maybe<Scalars["Boolean"]>;
  /** Change the user's settings */
  studyReviewInstance?: Maybe<ReviewInstance>;
  /** Updates an assignment */
  updateAssignment?: Maybe<Assignment>;
  /** Updates a classrooms values */
  updateClassroom?: Maybe<Classroom>;
  /** Change a course's settings */
  updateCourse?: Maybe<Course>;
  /** Change a course section's settings */
  updateCourseSection?: Maybe<CourseSection>;
  /** Change a flashcard's data */
  updateFlashcard?: Maybe<Flashcard>;
  /** Update metadata for the review instance (not for studying) */
  updateReviewInstance?: Maybe<ReviewInstance>;
  /** Change a sub section's settings */
  updateSubSection?: Maybe<SubSection>;
  /** Change the user's settings */
  updateUser?: Maybe<User>;
  /** Upload a banner image for a course */
  uploadCourseBannerImage?: Maybe<Course>;
  /** Upload an image */
  uploadImage?: Maybe<UploadedImage>;
  /** Upload an image from a URL */
  uploadImageFromUrl?: Maybe<UploadedImage>;
};

export type MutationAddCourseOwnerArgs = {
  courseId: Scalars["String"];
  username: Scalars["String"];
};

export type MutationAddFriendArgs = {
  userId: Scalars["String"];
};

export type MutationArchiveCourseArgs = {
  archive: Scalars["Boolean"];
  courseId: Scalars["String"];
};

export type MutationCreateAssignmentArgs = {
  classroomIds: Array<Scalars["String"]>;
  essentialOnly: Scalars["Boolean"];
  subSectionIds: Array<Scalars["String"]>;
  title: Scalars["String"];
};

export type MutationCreateClassroomArgs = {
  courseId: Scalars["String"];
  title: Scalars["String"];
};

export type MutationCreateCourseArgs = {
  title: Scalars["String"];
};

export type MutationCreateCourseSectionArgs = {
  courseId: Scalars["String"];
  title: Scalars["String"];
};

export type MutationCreateFlashcardArgs = {
  courseId: Scalars["String"];
  courseSectionSlug: Scalars["String"];
  fields: Scalars["String"];
  flashcardType?: InputMaybe<FlashcardType>;
  subSectionSlug: Scalars["String"];
  tags?: InputMaybe<Scalars["String"]>;
};

export type MutationCreateFlashcardReportArgs = {
  flashcardId: Scalars["String"];
  reasons: Scalars["String"];
};

export type MutationCreateNewUserSurveyResponseArgs = {
  joinReason: JoinReason;
  referrer: Referrer;
  sendReminders: Scalars["Boolean"];
  targetNumReviews: Scalars["Int"];
  timezoneOffset: Scalars["Int"];
  userType: UserType;
};

export type MutationCreateStripeSessionArgs = {
  item: StripeItem;
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

export type MutationDeleteFlashcardArgs = {
  flashcardId: Scalars["String"];
};

export type MutationDeleteSubSectionArgs = {
  subSectionId: Scalars["String"];
};

export type MutationGenerateAutoFlashcardArgs = {
  mode: AutoFlashcardsMode;
  numFlashcards?: InputMaybe<Scalars["Int"]>;
  sourceText: Scalars["String"];
};

export type MutationJoinClassroomArgs = {
  joinCode: Scalars["String"];
};

export type MutationJoinCourseArgs = {
  courseId: Scalars["String"];
};

export type MutationMoveCourseSectionArgs = {
  courseId: Scalars["String"];
  from: Scalars["Int"];
  to: Scalars["Int"];
};

export type MutationMoveFlashcardArgs = {
  courseId: Scalars["String"];
  from: Scalars["Int"];
  subSectionSlug: Scalars["String"];
  to: Scalars["Int"];
};

export type MutationMoveFlashcardToSubSectionArgs = {
  flashcardId: Scalars["String"];
  subSectionId: Scalars["String"];
};

export type MutationMoveSubSectionArgs = {
  courseSectionId: Scalars["String"];
  from: Scalars["Int"];
  to: Scalars["Int"];
};

export type MutationRemoveCourseOwnerArgs = {
  courseId: Scalars["String"];
  username: Scalars["String"];
};

export type MutationRemoveFriendArgs = {
  userId: Scalars["String"];
};

export type MutationRemoveStudentFromClassroomArgs = {
  classroomId: Scalars["String"];
  studentId: Scalars["String"];
};

export type MutationStudyReviewInstanceArgs = {
  grade: Grade;
  reviewInstanceId: Scalars["String"];
  timeTaken: Scalars["Float"];
};

export type MutationUpdateAssignmentArgs = {
  assignmentId: Scalars["String"];
  essentialOnly?: InputMaybe<Scalars["Boolean"]>;
  title?: InputMaybe<Scalars["String"]>;
};

export type MutationUpdateClassroomArgs = {
  classroomId: Scalars["String"];
  courseId?: InputMaybe<Scalars["String"]>;
  title?: InputMaybe<Scalars["String"]>;
};

export type MutationUpdateCourseArgs = {
  courseId: Scalars["String"];
  description?: InputMaybe<Scalars["String"]>;
  editingAccess?: InputMaybe<EditingAccess>;
  isPublic?: InputMaybe<Scalars["Boolean"]>;
  privacySetting?: InputMaybe<PrivacySetting>;
  seoDescription?: InputMaybe<Scalars["String"]>;
  seoSubject?: InputMaybe<Scalars["String"]>;
  title?: InputMaybe<Scalars["String"]>;
};

export type MutationUpdateCourseSectionArgs = {
  color?: InputMaybe<Scalars["String"]>;
  courseSectionId: Scalars["String"];
  description?: InputMaybe<Scalars["String"]>;
  title?: InputMaybe<Scalars["String"]>;
};

export type MutationUpdateFlashcardArgs = {
  fields?: InputMaybe<Scalars["String"]>;
  flashcardId: Scalars["String"];
  tags?: InputMaybe<Scalars["String"]>;
};

export type MutationUpdateReviewInstanceArgs = {
  isStarred?: InputMaybe<Scalars["Boolean"]>;
  reviewInstanceId: Scalars["String"];
};

export type MutationUpdateSubSectionArgs = {
  subSectionId: Scalars["String"];
  title?: InputMaybe<Scalars["String"]>;
};

export type MutationUpdateUserArgs = {
  name?: InputMaybe<Scalars["String"]>;
  sendGeneral?: InputMaybe<Scalars["Boolean"]>;
  sendMarketingResearch?: InputMaybe<Scalars["Boolean"]>;
  sendReminders?: InputMaybe<Scalars["Boolean"]>;
  sendWeeklyReports?: InputMaybe<Scalars["Boolean"]>;
  targetNumReviews?: InputMaybe<Scalars["Int"]>;
  timezoneOffset?: InputMaybe<Scalars["Int"]>;
  unsubscribeAll?: InputMaybe<Scalars["Boolean"]>;
  userType?: InputMaybe<UserType>;
};

export type MutationUploadCourseBannerImageArgs = {
  bannerImage?: InputMaybe<Scalars["Upload"]>;
  courseId: Scalars["String"];
};

export type MutationUploadImageArgs = {
  image: Scalars["Upload"];
};

export type MutationUploadImageFromUrlArgs = {
  url: Scalars["String"];
};

export type NewUserSurveyResponse = {
  __typename?: "NewUserSurveyResponse";
  id?: Maybe<Scalars["String"]>;
  joinReason?: Maybe<JoinReason>;
  referrer?: Maybe<Referrer>;
  sendReminders?: Maybe<Scalars["Boolean"]>;
  targetNumReviews?: Maybe<Scalars["Int"]>;
  timezoneOffset?: Maybe<Scalars["Int"]>;
  user?: Maybe<User>;
  userId?: Maybe<Scalars["String"]>;
  userType?: Maybe<UserType>;
};

export enum PrivacySetting {
  All = "ALL",
  Friends = "FRIENDS",
  Institution = "INSTITUTION",
  Private = "PRIVATE",
}

export type Query = {
  __typename?: "Query";
  /** Calculates %-complete data for a list of sub sections */
  calculateSubSectionsPercentComplete?: Maybe<Scalars["JSONObject"]>;
  /** Find review instances sorted by difficulty */
  findHardestReviewInstances?: Maybe<Array<Maybe<ReviewInstance>>>;
  /** Find subsections sorted by difficulty. Returns subsections with custom `avgEase` and `courseSectionSlug` attributes */
  findHardestSubSections?: Maybe<Array<Maybe<Scalars["JSONObject"]>>>;
  /** Get all the sub sections in a course */
  getCourseSubSections?: Maybe<Array<Maybe<SubSection>>>;
  /** Gets a flashcard by its ID */
  getFlashcard?: Maybe<Flashcard>;
  /** Gets the Stripe subscription and product for the current user */
  getStripeSubscription?: Maybe<Scalars["JSONObject"]>;
  /** Get information on the current user */
  me?: Maybe<User>;
  /** Get the current user's courses */
  myCourses?: Maybe<Array<Maybe<Course>>>;
  /** Get a list of the user's friends and the number of flashcards they've studied this week. Also includes the current user */
  myFriends?: Maybe<Array<Maybe<Scalars["JSONObject"]>>>;
  /** Search for shared courses based on their title */
  searchCourses?: Maybe<Array<Maybe<Course>>>;
  /** Finds flashcards based on some criteria */
  searchFlashcards?: Maybe<Array<Maybe<Flashcard>>>;
  /** Search for users */
  searchUsers?: Maybe<Array<Maybe<User>>>;
  /** List all users */
  users?: Maybe<Array<Maybe<User>>>;
};

export type QueryCalculateSubSectionsPercentCompleteArgs = {
  subSectionIds: Array<Scalars["String"]>;
};

export type QueryFindHardestReviewInstancesArgs = {
  courseId: Scalars["String"];
  skip?: InputMaybe<Scalars["Int"]>;
};

export type QueryFindHardestSubSectionsArgs = {
  courseId: Scalars["String"];
  skip?: InputMaybe<Scalars["Int"]>;
};

export type QueryGetCourseSubSectionsArgs = {
  courseId: Scalars["String"];
};

export type QueryGetFlashcardArgs = {
  flashcardId: Scalars["String"];
};

export type QuerySearchCoursesArgs = {
  title: Scalars["String"];
};

export type QuerySearchFlashcardsArgs = {
  courseId: Scalars["String"];
  text: Scalars["String"];
};

export type QuerySearchUsersArgs = {
  name: Scalars["String"];
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

export type ReviewInstance = {
  __typename?: "ReviewInstance";
  ease?: Maybe<Scalars["Int"]>;
  flashcard?: Maybe<Flashcard>;
  id?: Maybe<Scalars["String"]>;
  isStarred?: Maybe<Scalars["Boolean"]>;
  lastReview?: Maybe<Scalars["Date"]>;
  learningStatus?: Maybe<LearningStatus>;
  name?: Maybe<Scalars["String"]>;
  nextReview?: Maybe<Scalars["Date"]>;
  stepsIndex?: Maybe<Scalars["Int"]>;
};

export enum Role {
  Admin = "ADMIN",
  Staff = "STAFF",
  User = "USER",
}

/** A purchasable item to buy with Stripe */
export enum StripeItem {
  ProMonthly = "proMONTHLY",
  ProYearly = "proYEARLY",
}

export type SubSection = {
  __typename?: "SubSection";
  flashcards?: Maybe<Array<Maybe<Flashcard>>>;
  id?: Maybe<Scalars["String"]>;
  slug?: Maybe<Scalars["String"]>;
  title?: Maybe<Scalars["String"]>;
};

export type UploadedImage = {
  __typename?: "UploadedImage";
  height?: Maybe<Scalars["Int"]>;
  id?: Maybe<Scalars["String"]>;
  uploadedBy?: Maybe<User>;
  url?: Maybe<Scalars["String"]>;
  width?: Maybe<Scalars["Int"]>;
};

export type User = {
  __typename?: "User";
  currentStreak?: Maybe<Scalars["Int"]>;
  doneReviewsToday?: Maybe<Scalars["Boolean"]>;
  email?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["String"]>;
  image?: Maybe<Scalars["String"]>;
  isPro?: Maybe<Scalars["Boolean"]>;
  name?: Maybe<Scalars["String"]>;
  /** The user's response to the survey launched on sign-up */
  newUserSurveyResponse?: Maybe<NewUserSurveyResponse>;
  numReviewsDoneToday?: Maybe<Scalars["Int"]>;
  role?: Maybe<Role>;
  sendMarketingResearch?: Maybe<Scalars["Boolean"]>;
  sendReminders?: Maybe<Scalars["Boolean"]>;
  targetNumReviews?: Maybe<Scalars["Int"]>;
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
