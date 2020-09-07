export function errorHandler(response, status, errorCode) {
  if (status === 403) {
    window.location.href = `/?showLoginRequired=true&returnUrl=${window.location.href}`;
  } else {
    console.log(response, status);
    alert(
`
Something went wrong trying to perform that action.
Please reload the page and try again.

If this problem persists, please contact the developer
here: TODO:.
With the error code: ${errorCode.toString(16)}-${status.toString(16)}
`
    );
  };
};


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
1009: Error getting deck to study through apiDeckDetail in alu-web/src/decks/study/components.js
1010: Error getting explore deck lists through apiExploreLists in alu-web/src/explore/base.js
1011: Error performing deck search through apiDeckSearch in alu-web/src/explore/search.js
1012: Error handling next set of decks (pagination, decks search) through apiDeckSearch in alu-web/src/explore/search.js
1013: Error importing deck from .txt file through apiDeckTextImport in alu-web/src/decks/import.js

=== Flashcard related errors ===
2000: Error getting flashcard detail through apiFlashCardDetail in alu-web/src/decks/flashcards/create.js
2001: Error creating or editing flashcard through apiFlashCardEdit or apiFlashCardCreate in alu-web/src/decks/flashcards/create.js
2002: Error looking up deck through apiDeckDetail in alu-web/src/decks/flashcards/list.js
2003: Error suspending/leeching flashcard through apiFlashCardSuspendLeech in alu-web/src/decks/flashcards/list.js
2004: Error deleting flashcard through apiFlashCardDelete in alu-web/src/decks/flashcards/list.js
2005: Error searching for flashcards through apiFlashCardSearch in alu-web/src/decks/flashcards/search.js
2006: Error updating flashcard with information returned from studying through apiFlashCardDateUpdate alu-web/src/decks/study/components.js
2007: Error searching for flashcards in custom study through apiFlashCardSearch in alu-web/src/decks/study/components.js
2008: Error deleting flashcard while studying through apiFlashCardDelete in alu-web/src/decks/study/components.js
2009: Error marking flashcard as leech or suspending while studying through apiFlashCardSuspendLeech in alu-web/src/decks/study/components.js

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

*/