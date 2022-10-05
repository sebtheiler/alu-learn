import { gql } from "@apollo/client";

const CreateNewUserSurveyResponse = gql`
  mutation CreateNewUserSurveyResponse(
    $timezoneOffset: Int!
    $userType: UserType!
    $referrer: Referrer!
    $joinReason: JoinReason!
    $targetNumReviews: Int!
    $sendReminders: Boolean!
  ) {
    createNewUserSurveyResponse(
      timezoneOffset: $timezoneOffset
      userType: $userType
      referrer: $referrer
      joinReason: $joinReason
      targetNumReviews: $targetNumReviews
      sendReminders: $sendReminders
    ) {
      id
    }
  }
`;

export default CreateNewUserSurveyResponse;
