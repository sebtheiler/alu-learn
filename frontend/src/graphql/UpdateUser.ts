import { gql } from "@apollo/client";

const UpdateUser = gql`
  mutation Mutation(
    $name: String
    $timezoneOffset: Int
    $targetNumCards: Int
    $sendReminders: Boolean
    $userType: UserType
    $sendMarketingResearch: Boolean
  ) {
    updateUser(
      name: $name
      timezoneOffset: $timezoneOffset
      targetNumCards: $targetNumCards
      sendReminders: $sendReminders
      userType: $userType
      sendMarketingResearch: $sendMarketingResearch
    ) {
      id
    }
  }
`;

export default UpdateUser;
