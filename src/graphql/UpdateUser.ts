import { gql } from "@apollo/client";

const UpdateUser = gql`
  mutation UpdateUser(
    $name: String
    $timezoneOffset: Int
    $targetNumReviews: Int
    $userType: UserType
    $sendReminders: Boolean
    $sendGeneral: Boolean
    $sendWeeklyReports: Boolean
    $sendMarketingResearch: Boolean
    $unsubscribeAll: Boolean
  ) {
    updateUser(
      name: $name
      timezoneOffset: $timezoneOffset
      targetNumReviews: $targetNumReviews
      userType: $userType
      sendReminders: $sendReminders
      sendGeneral: $sendGeneral
      sendWeeklyReports: $sendWeeklyReports
      sendMarketingResearch: $sendMarketingResearch
      unsubscribeAll: $unsubscribeAll
    ) {
      id
    }
  }
`;

export default UpdateUser;
