-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'STAFF', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('STUDENT', 'TEACHER', 'MIXED');

-- CreateEnum
CREATE TYPE "Referrer" AS ENUM ('FRIENDS', 'TEACHER', 'INSTA', 'REDDIT', 'TIKTOK', 'YOUTUBE', 'NEWS', 'SEARCH');

-- CreateEnum
CREATE TYPE "JoinReason" AS ENUM ('MEMORY', 'GRADES', 'CONCEPT', 'TEACHER', 'STUDENTS');

-- CreateEnum
CREATE TYPE "PrivacySetting" AS ENUM ('ALL', 'FRIENDS', 'INSTITUTION', 'PRIVATE');

-- CreateEnum
CREATE TYPE "EditingAccess" AS ENUM ('OWNERS', 'ALL', 'FRIENDS', 'INSTITUTION');

-- CreateEnum
CREATE TYPE "FlashcardType" AS ENUM ('NORMAL', 'CLOZE');

-- CreateEnum
CREATE TYPE "LearningStatus" AS ENUM ('UNSEEN', 'LEARNING', 'LEARNED', 'RELEARNING');

-- CreateEnum
CREATE TYPE "GradeResponse" AS ENUM ('AGAIN', 'HARD', 'GOOD', 'EASY');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refreshToken" TEXT,
    "accessToken" TEXT,
    "expiresAt" INTEGER,
    "tokenType" TEXT,
    "scope" TEXT,
    "idToken" TEXT,
    "sessionState" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "OLD_ID" INTEGER,
    "OLD_PROFILE_ID" INTEGER,
    "id" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referredById" TEXT,
    "isPro" BOOLEAN NOT NULL DEFAULT false,
    "isProFromOrg" BOOLEAN NOT NULL DEFAULT false,
    "proTrialExpires" TIMESTAMP(3),
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isSuperUser" BOOLEAN NOT NULL DEFAULT false,
    "isStaff" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "doneReviewsToday" BOOLEAN NOT NULL DEFAULT false,
    "userType" "UserType" NOT NULL DEFAULT 'STUDENT',
    "targetNumReviews" INTEGER NOT NULL DEFAULT 20,
    "numReviewsDoneToday" INTEGER NOT NULL DEFAULT 0,
    "timezoneOffset" INTEGER NOT NULL DEFAULT 300,
    "sendReminders" BOOLEAN NOT NULL DEFAULT false,
    "sendMarketingResearch" BOOLEAN NOT NULL DEFAULT true,
    "sendWeeklyReports" BOOLEAN NOT NULL DEFAULT true,
    "sendGeneral" BOOLEAN NOT NULL DEFAULT true,
    "unsubscribeAll" BOOLEAN NOT NULL DEFAULT false,
    "sentReengagement" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewUserSurveyResponse" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "timestamp" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "timezoneOffset" INTEGER NOT NULL,
    "userType" "UserType" NOT NULL,
    "referrer" "Referrer" NOT NULL,
    "joinReason" "JoinReason" NOT NULL,
    "targetNumReviews" INTEGER NOT NULL,
    "sendReminders" BOOLEAN NOT NULL,

    CONSTRAINT "NewUserSurveyResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserVisit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "remoteAddr" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShortUrl" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "destination" TEXT NOT NULL,

    CONSTRAINT "ShortUrl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UrlHit" (
    "id" TEXT NOT NULL,
    "shortUrlId" TEXT NOT NULL,
    "userId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" TEXT,
    "remoteAddr" TEXT,
    "referer" TEXT,

    CONSTRAINT "UrlHit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlashcardReport" (
    "id" TEXT NOT NULL,
    "flashcardId" TEXT,
    "userId" TEXT,
    "reasons" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlashcardReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "OLD_ID" INTEGER,
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bannerImage" TEXT,
    "description" TEXT,
    "seoDescription" TEXT,
    "seoSubject" TEXT,
    "privacySetting" "PrivacySetting" NOT NULL DEFAULT 'ALL',
    "editingAccess" "EditingAccess" NOT NULL DEFAULT 'OWNERS',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseSection" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT 'BLUE',
    "courseId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,

    CONSTRAINT "CourseSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubSection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "courseSectionId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,

    CONSTRAINT "SubSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flashcard" (
    "OLD_ID" TEXT,
    "OLD_UNIVERSAL_ID" TEXT,
    "id" TEXT NOT NULL,
    "fields" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '',
    "subSectionId" TEXT NOT NULL,
    "type" "FlashcardType" NOT NULL DEFAULT 'NORMAL',
    "index" INTEGER NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "Flashcard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewInstance" (
    "OLD_ID" TEXT,
    "id" TEXT NOT NULL,
    "flashcardId" TEXT NOT NULL,
    "name" TEXT,
    "userId" TEXT NOT NULL,
    "learningStatus" "LearningStatus" NOT NULL DEFAULT 'UNSEEN',
    "stepsIndex" INTEGER NOT NULL DEFAULT 0,
    "ease" INTEGER NOT NULL DEFAULT 250,
    "nextReview" TIMESTAMP(3) NOT NULL,
    "lastReview" TIMESTAMP(3),
    "isStarred" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ReviewInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewInstanceHistory" (
    "id" TEXT NOT NULL,
    "reviewInstanceId" TEXT,
    "backupReviewInstanceId" TEXT,
    "gradeResponse" "GradeResponse" NOT NULL,
    "timeTaken" DOUBLE PRECISION NOT NULL,
    "ease" INTEGER NOT NULL,
    "learningStatus" "LearningStatus" NOT NULL,
    "stepsIndex" INTEGER NOT NULL,
    "nextReview" TIMESTAMP(3) NOT NULL,
    "lastReview" TIMESTAMP(3),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewInstanceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadedImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedById" TEXT,
    "width" INTEGER,
    "height" INTEGER,

    CONSTRAINT "UploadedImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorySegment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "reviewsStudied" INTEGER NOT NULL DEFAULT 0,
    "timeTaken" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "HistorySegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeCustomer" (
    "id" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "StripeCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Classroom" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "joinCode" VARCHAR(8) NOT NULL,
    "courseId" TEXT,

    CONSTRAINT "Classroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "essentialOnly" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Friends" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_FriendsRequested" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CourseUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CourseArchivedUsers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CourseOwners" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ClassroomTeachers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ClassroomStudents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AssignmentToSubSection" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_AssignmentToClassroom" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_OLD_ID_key" ON "User"("OLD_ID");

-- CreateIndex
CREATE UNIQUE INDEX "User_OLD_PROFILE_ID_key" ON "User"("OLD_PROFILE_ID");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_referredById_key" ON "User"("referredById");

-- CreateIndex
CREATE UNIQUE INDEX "NewUserSurveyResponse_userId_key" ON "NewUserSurveyResponse"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ShortUrl_code_key" ON "ShortUrl"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Course_OLD_ID_key" ON "Course"("OLD_ID");

-- CreateIndex
CREATE UNIQUE INDEX "Flashcard_OLD_ID_key" ON "Flashcard"("OLD_ID");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewInstance_OLD_ID_key" ON "ReviewInstance"("OLD_ID");

-- CreateIndex
CREATE UNIQUE INDEX "StripeCustomer_stripeCustomerId_key" ON "StripeCustomer"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "StripeCustomer_userId_key" ON "StripeCustomer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Classroom_joinCode_key" ON "Classroom"("joinCode");

-- CreateIndex
CREATE UNIQUE INDEX "_Friends_AB_unique" ON "_Friends"("A", "B");

-- CreateIndex
CREATE INDEX "_Friends_B_index" ON "_Friends"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FriendsRequested_AB_unique" ON "_FriendsRequested"("A", "B");

-- CreateIndex
CREATE INDEX "_FriendsRequested_B_index" ON "_FriendsRequested"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CourseUsers_AB_unique" ON "_CourseUsers"("A", "B");

-- CreateIndex
CREATE INDEX "_CourseUsers_B_index" ON "_CourseUsers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CourseArchivedUsers_AB_unique" ON "_CourseArchivedUsers"("A", "B");

-- CreateIndex
CREATE INDEX "_CourseArchivedUsers_B_index" ON "_CourseArchivedUsers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CourseOwners_AB_unique" ON "_CourseOwners"("A", "B");

-- CreateIndex
CREATE INDEX "_CourseOwners_B_index" ON "_CourseOwners"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ClassroomTeachers_AB_unique" ON "_ClassroomTeachers"("A", "B");

-- CreateIndex
CREATE INDEX "_ClassroomTeachers_B_index" ON "_ClassroomTeachers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ClassroomStudents_AB_unique" ON "_ClassroomStudents"("A", "B");

-- CreateIndex
CREATE INDEX "_ClassroomStudents_B_index" ON "_ClassroomStudents"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AssignmentToSubSection_AB_unique" ON "_AssignmentToSubSection"("A", "B");

-- CreateIndex
CREATE INDEX "_AssignmentToSubSection_B_index" ON "_AssignmentToSubSection"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AssignmentToClassroom_AB_unique" ON "_AssignmentToClassroom"("A", "B");

-- CreateIndex
CREATE INDEX "_AssignmentToClassroom_B_index" ON "_AssignmentToClassroom"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewUserSurveyResponse" ADD CONSTRAINT "NewUserSurveyResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVisit" ADD CONSTRAINT "UserVisit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UrlHit" ADD CONSTRAINT "UrlHit_shortUrlId_fkey" FOREIGN KEY ("shortUrlId") REFERENCES "ShortUrl"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UrlHit" ADD CONSTRAINT "UrlHit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashcardReport" ADD CONSTRAINT "FlashcardReport_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES "Flashcard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashcardReport" ADD CONSTRAINT "FlashcardReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseSection" ADD CONSTRAINT "CourseSection_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubSection" ADD CONSTRAINT "SubSection_courseSectionId_fkey" FOREIGN KEY ("courseSectionId") REFERENCES "CourseSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_subSectionId_fkey" FOREIGN KEY ("subSectionId") REFERENCES "SubSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewInstance" ADD CONSTRAINT "ReviewInstance_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES "Flashcard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewInstance" ADD CONSTRAINT "ReviewInstance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewInstanceHistory" ADD CONSTRAINT "ReviewInstanceHistory_reviewInstanceId_fkey" FOREIGN KEY ("reviewInstanceId") REFERENCES "ReviewInstance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadedImage" ADD CONSTRAINT "UploadedImage_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorySegment" ADD CONSTRAINT "HistorySegment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StripeCustomer" ADD CONSTRAINT "StripeCustomer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classroom" ADD CONSTRAINT "Classroom_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Friends" ADD CONSTRAINT "_Friends_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Friends" ADD CONSTRAINT "_Friends_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FriendsRequested" ADD CONSTRAINT "_FriendsRequested_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FriendsRequested" ADD CONSTRAINT "_FriendsRequested_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseUsers" ADD CONSTRAINT "_CourseUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseUsers" ADD CONSTRAINT "_CourseUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseArchivedUsers" ADD CONSTRAINT "_CourseArchivedUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseArchivedUsers" ADD CONSTRAINT "_CourseArchivedUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseOwners" ADD CONSTRAINT "_CourseOwners_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseOwners" ADD CONSTRAINT "_CourseOwners_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassroomTeachers" ADD CONSTRAINT "_ClassroomTeachers_A_fkey" FOREIGN KEY ("A") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassroomTeachers" ADD CONSTRAINT "_ClassroomTeachers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassroomStudents" ADD CONSTRAINT "_ClassroomStudents_A_fkey" FOREIGN KEY ("A") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassroomStudents" ADD CONSTRAINT "_ClassroomStudents_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssignmentToSubSection" ADD CONSTRAINT "_AssignmentToSubSection_A_fkey" FOREIGN KEY ("A") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssignmentToSubSection" ADD CONSTRAINT "_AssignmentToSubSection_B_fkey" FOREIGN KEY ("B") REFERENCES "SubSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssignmentToClassroom" ADD CONSTRAINT "_AssignmentToClassroom_A_fkey" FOREIGN KEY ("A") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssignmentToClassroom" ADD CONSTRAINT "_AssignmentToClassroom_B_fkey" FOREIGN KEY ("B") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
