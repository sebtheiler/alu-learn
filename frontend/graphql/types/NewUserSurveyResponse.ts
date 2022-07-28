import { UserType } from ".";
import { objectType, extendType } from "nexus";

const NewUserSurveyResponse = objectType({
  name: "NewUserSurveyResponse",
  definition(t) {
    // id     String @id @default(uuid())
    // user   User   @relation(fields: [userId], references: [id])
    // userId String @unique

    t.int("timezoneOffset");
    t.field("userType", { type: UserType });
    // t.field('referrer', { type: Referrer })
    // t.field('joinReason')
    // timezoneOffset   Int
    // userType         UserType
    // referrer         Referrer
    // joinReason       JoinReason
    // targetFlashcards Int
    // sendReminders    Boolean
    // deckChoice       DeckChoice
  },
});
