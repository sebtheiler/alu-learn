import { gql } from "@apollo/client";

const UpdateUser = gql`
  mutation Mutation(
    $name: String
    $timezoneOffset: Int
    $targetNumReviews: Int
    $sendReminders: Boolean
    $userType: UserType
    $sendMarketingResearch: Boolean
  ) {
    updateUser(
      name: $name
      timezoneOffset: $timezoneOffset
      targetNumReviews: $targetNumReviews
      sendReminders: $sendReminders
      userType: $userType
      sendMarketingResearch: $sendMarketingResearch
    ) {
      id
    }
  }
`;

export default UpdateUser;
