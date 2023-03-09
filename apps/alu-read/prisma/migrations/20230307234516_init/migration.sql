-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parentArticleId" TEXT,
    "parentTopicId" TEXT,
    CONSTRAINT "Topic_parentArticleId_fkey" FOREIGN KEY ("parentArticleId") REFERENCES "Article" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Topic_parentTopicId_fkey" FOREIGN KEY ("parentTopicId") REFERENCES "Topic" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "byline" TEXT,
    "originUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataPath" TEXT NOT NULL,
    "readingPoint" TEXT,
    "lastReview" DATETIME,
    "nextReview" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priority" INTEGER,
    "aFactor" REAL NOT NULL DEFAULT 2,
    "parentArticleId" TEXT,
    "parentTopicId" TEXT,
    CONSTRAINT "Article_parentArticleId_fkey" FOREIGN KEY ("parentArticleId") REFERENCES "Article" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Article_parentTopicId_fkey" FOREIGN KEY ("parentTopicId") REFERENCES "Topic" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Extract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "identifier" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReview" DATETIME,
    "nextReview" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priority" INTEGER,
    "aFactor" REAL NOT NULL DEFAULT 2,
    "parentArticleId" TEXT,
    "parentExtractId" TEXT,
    CONSTRAINT "Extract_parentArticleId_fkey" FOREIGN KEY ("parentArticleId") REFERENCES "Article" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Extract_parentExtractId_fkey" FOREIGN KEY ("parentExtractId") REFERENCES "Extract" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priority" INTEGER,
    "nextReview" DATETIME,
    "articleId" TEXT,
    "extractId" TEXT,
    CONSTRAINT "Review_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Review_extractId_fkey" FOREIGN KEY ("extractId") REFERENCES "Extract" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
