export function errorHandler(response, status, errorCode) {
  if (status === 403) {
    window.location.href = `/?showLoginRequired=true&returnUrl=${window.location.href}`;
  } else if (status === 429) {
    alert(
`
You have exceeded the number of requests authorized by your account.
We do this to prevent hackers and malicious users from slowing down your experience.
Please try again in a few minutes.
`
    );
  } else {
    console.log(response, status);

    const host = window.location.host === 'localhost:3000' ? '127.0.0.1:8000' : window.location.host;
    const baseUrl = `${window.location.protocol}//${host}` // http://127.0.0.1:8000
    alert(
`
Something went wrong trying to perform that action.
Please reload the page and try again.

If this problem persists, please contact the developer
here: ${baseUrl}/contactus/
With the error code: ${errorCode.toString(16)}-${status.toString(16)}
`
    );
  }
}


/*
===================
=== Error Codes ===
===================
Note: Codes are displayed to the user in base-16/hexadecimal
to convert to base 10 (which this list uses) use the
following functions:

JavaScript:
parseInt(hexadecimalString, 16)

Python:
int(hexadecimal_string, 16)

=== Deck related errors ===
1000: Error updating deck through apiDeckEdit in alu-web/src/decks/button.js
1001: Error deleting deck through apiDeckDelete in alu-web/src/decks/button.js
1002: Error copying deck through apiDeckCopy in alu-web/src/decks/button.js
1003: Error getting deck detail through apiDeckDetail in alu-web/src/decks/components.js
1004: Error creating deck through apiDeckCreate in alu-web/src/decks/create.js
1005: Error thanking deck through apiDeckThank in alu-web/src/decks/detail.js
1006: Error getting deck through apiDeckHome in alu-web/src/decks/home.js
1007: Error handling next set of decks (pagination, decks home page) through apiDeckHome in alu-web/src/decks/home.js
1008: Error getting shared decks through apiDeckSharedList in alu-web/src/decks/list.js
1009: Error getting a profile's list of decks for autoflashcard through apiDeckHome in alu-web/src/notes/autonote/autoflashcard/autoflashcard.js
1010: Error getting explore deck lists through apiExploreLists in alu-web/src/explore/base.js
1011: Error performing deck search through apiDeckSearch in alu-web/src/explore/search.js
1012: Error handling next set of decks (pagination, decks search) through apiDeckSearch in alu-web/src/explore/search.js
1013: Error importing deck from .txt file through apiDeckTextImport in alu-web/src/decks/import.js
1014: Error getting a deck's flashcards through apiDeckFlashcards in alu-web/src/decks/components.js
1015: Error looking up deck through apiDeckDetail in alu-web/src/decks/flashcards/list.js
1016: Error getting a deck's flashcards through apiDeckFlashcards in alu-web/src/decks/flashcards/list.js
1017: Error getting deck detail for sharing through apiDeckDetail in alu-web/src/decks/share.js
1018: Error handling next set of deck's flashcards (pagination) through apiDeckFlashcards in alu-web/src/decks/flashcards/list.js
1019: Error creating shared deck through apiCreateShareddeck in alu-web/src/decks/share.js
1020: Error checking diff between shared and origin deck through apiSharedPushChanges in alu-web/src/decks/push.js
1021: Error getting deck detail for sharing through apiDeckDetail in alu-web/src/decks/push.js
1022: Error pushing changes to new deck through apiSharedPushChanges in alu-web/src/decks/push.js
1023: Error getting deck detail for updating through apiDeckDetail in alu-web/src/decks/update.js
1024: Error getting deck updates through apiDeckGetUpdates in alu-web/src/decks/update.js
1024: Error pulling deck updates through apiDeckPullUpdates in alu-web/src/decks/update.js
1025: Error getting list of private decks for searching through apiDeckPrivateList in alu-web/src/flashcards/search.js
1026: Error getting private decks for CSSM edit modal through apiDeckPrivateList in alu-web/src/decks/buttons.js
1027: Error getting flashcards for matching game through TODO in alu-web/src/decks/games/matching.js

=== Flashcard related errors ===
2000: Error getting flashcard detail through apiFlashCardDetail in alu-web/src/decks/flashcards/create.js
2001: Error creating or editing flashcard through apiFlashCardEdit or apiFlashCardCreate in alu-web/src/decks/flashcards/create.js
2002: Error marking flashcard as leech or suspending while studying through apiFlashCardSuspendLeech in alu-web/src/decks/study/components.js
2003: Error suspending/leeching flashcard through apiFlashCardSuspendLeech in alu-web/src/decks/flashcards/list.js
2004: Error deleting flashcard through apiFlashCardDelete in alu-web/src/decks/flashcards/detail.js
2005: Error searching for flashcards through apiFlashCardSearch in alu-web/src/decks/flashcards/search.js
2006: Error updating flashcard tags in bulk
2007: Error searching for flashcards in custom study through apiFlashCardSearch in alu-web/src/decks/study/components.js
2008: Error deleting flashcard while studying through apiFlashCardDelete in alu-web/src/decks/study/components.js
2009: Error moving flashcard up through apiRearrangeFlashcard
2010: Error moving flashcard down through apiRearrangeFlashcard

=== Profile related errors ===
3000: Error getting profile details through apiProfileDetail in alu-web/src/profiles/information.js
3001: Error sending friend request through apiSendFriendReq in alu-web/src/profiles/information.js
3002: Error getting notification list through apiNotificationList in alu-web/src/profiles/notifications/components.js
3003: Error marking notification as read through apiNotificationRead in alu-web/src/profiles/notifications/components.js
3004: Error getting profile detail for checking if friends through apiProfileDetail in alu-web/src/profiles/notifications/detail.js
3005: Error accepting friend request through apiProfileFriendToggle in alu-web/src/profiles/notifications/detail.js
3006: Error logging-in the user through apiProfileLogin in alu-web/src/landing/forms/login.js
3007: Error checking username availability through apiCheckUsernameAvailable in alu-web/src/landing/forms/register.js
3008: Error creating the user profile through apiProfileCreate in alu-web/src/landing/forms/register.js
3009: Error logging-in the user through apiProfileLogin in alu-web/src/landing/forms/register.js
3010: Error getting profile details through apiProfileDetail in alu-web/src/home/home.js
3011: Error getting list of friends through apiProfileFriends in alu-web/src/home/home.js
3012: Error logging out the user through apiProfileLogout in alu-web/src/home/navbar.js
3013: Error getting user history through apiProfileHistory in alu-web/src/home/home.js
3014: Error handling next set of notifications (pagination) through apiNotificationList in alu-web/src/profiles/notifications/components.js
3015: Error getting profile in settings through apiProfileDetail in alu-web/src/home/settings/settings.js
3016: Error updating profile settings through apiProfileSettingsUpdate in alu-web/src/home/settings/settings.js
3017: Error confirming email through apiEmailConfirm in alu-web/src/home/settings/confirmEmail.js
3018: Error resetting password through apiPasswordReset in alu-web/src/home/settings/change.js
3019: Error sending password reset through apiSendPasswordReset in alu-web/src/home/settings/sendPasswordReset.js
3020: Error changing email through apiEmailChange in alu-web/src/home/settings/change.js
3021: Error setting user preferences through apiProfileSettingsUpdate in alu-web/src/home/customization.js
3022: Error marking the profile popup as read through apiProfileReadPopup in alu-web/src/home/navbar-popup.js
3023: Error logging staff into user account through apiStaffForceLogin in alu-web/src/profiles/staff-force-login.js

=== Misc ===
4000: Error submitting feedback through apiFeedbackSubmit in alu-web/src/home/contactus.js
4001: Invalid scheduling algorithm through generateConfig in alu-web/src/decks/study/algorithm.js

=== Study Session Manager ===
5000: Error getting SSM through apiSSMDetail in alu-web/src/decks/study/components.js
5001: Error getting flashcards from SSM through apiSSMFlashcards in alu-web/src/decks/study/components.js
5002: Error updating flashcard with information returned from studying through apiSSMFlashcardUpdate in alu-web/src/decks/study/components.js
5003: Error updating SSM through apiSSMEdit in alu-web/src/decks/buttons.js
5004: Error deleting SSM through apiSSMDelete in alu-web/src/decks/buttons.js
5005: Error creating SSM through apiSSMCreate in alu-web/src/decks/flashcards/search.js

=== Note related errors ===
6000: Error getting note detail through apiNoteDetail in alu-web/src/notes/standard/editor.js
6001: Error updating note through apiNoteUpdate in alu-web/src/notes/standard/editor.js
6002: Error getting notes home through apiNoteHome in alu-web/src/notes/home.js
6003: Error getting note detail through apiNoteDetail in alu-web/src/notes/autonote/autoflashcard/autoflashcard.js
6004: Error creating note through apiNoteCreate in alu-web/src/notes/buttons.js
6005: Error deleting note through apiNoteDelete in alu-web/src/notes/buttons.js
6006: Error creating new page through apiCreateNewNotePage in alu-web/src/notes/editor.js
6007: Error deleting note page through apiDeleteNotePage in alu-web/src/notes/editor.js
6008: Error getting note page detail through apiNotePageDetail in alu-web/src/notes/editor.js

=== Manual SR Task related errors ===
7000: Error getting list of manual sr tasks through apiManualSRTaskList in alu-web/src/manual-sr/home.js
7001: Error getting next set of tasks (pagination) through apiManualSRTaskList in alu-web/src/manual-sr/home.js
7002: Error creating manual SR task through apiManualSRTaskCreate in alu-web/src/manual-sr/home.js
7003: Error updating manual SR task's review information through apiManualSRTaskUpdate in alu-web/src/manual-sr/task.js
7004: Error deleting manual SR task through apiManualSRTaskDelete in alu-web/src/manual-sr/task.js
7005: Error editing manual SR task through apiManualSRTaskEdit in alu-web/src/manual-sr/task.js
*/