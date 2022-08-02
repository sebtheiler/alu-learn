import { gql } from "@apollo/client";

const CreateNewUserSurveyResponse = gql`
  mutation CreateNewUserSurveyResponse(
    $timezoneOffset: Int!
    $userType: UserType!
    $referrer: Referrer!
    $joinReason: JoinReason!
    $targetNumCards: Int!
    $sendReminders: Boolean!
    $deckChoice: DeckChoice!
  ) {
    createNewUserSurveyResponse(
      timezoneOffset: $timezoneOffset
      userType: $userType
      referrer: $referrer
      joinReason: $joinReason
      targetNumCards: $targetNumCards
      sendReminders: $sendReminders
      deckChoice: $deckChoice
    ) {
      id
    }
  }
`;

export default CreateNewUserSurveyResponse;
