import {backendLookup} from './components';


// Creates a new deck with the title, `newDeck`
export function apiDeckCreate(newDeck, callback) {
  backendLookup('POST', 'decks/create/', callback, {title: newDeck});
};

// Creates a flashcard in a deck
export function apiFlashCardCreate(deckId, frontText, backText, callback) {
  backendLookup('POST', `decks/${deckId}/flashcards/create/`, callback, {front_text: frontText, back_text: backText})
};

// Deletes a flashcard in a deck
export function apiFlashCardDelete(deckId, flashcardId, callback) {
  backendLookup('POST', `decks/${deckId}/flashcards/${flashcardId}/delete/`, callback);
};

// Edit a flashcard
export function apiFlashCardEdit(deckId, flashcardId, frontText, backText, callback) {
  backendLookup('POST', `decks/${deckId}/flashcards/${flashcardId}/edit/`, callback, {front_text: frontText, back_text: backText});
};

// Update a flashcard's review date
export function apiFlashCardDateUpdate(deckId, flashcardId, date, interval, ease, graduated, callback) {
  backendLookup('POST', `decks/${deckId}/flashcards/${flashcardId}/changedate/`, callback, {
    date: date,
    interval: interval,
    ease: ease,
    graduated: graduated,
  });
};

export function apiFlashCardDetail(deckId, flashcardId, callback) {
  backendLookup('GET', `decks/${deckId}/flashcards/${flashcardId}/`, callback);
};

// Gets detail information on a deck with ID `deckId`
export function apiDeckDetail(deckId, callback) {
  backendLookup('GET', `decks/${deckId}/`, callback);
};

export function apiDeckDelete(deckId, callback) {
  backendLookup('POST', `decks/${deckId}/delete/`, callback);
};

export function apiDeckEdit(deckId, newTitle, newDescription, sharingSetting, callback) {
  backendLookup('POST', `decks/${deckId}/edit/`, callback, {
    new_title: newTitle,
    description: newDescription,
    sharing_setting: sharingSetting,
  });
};

// Gets a list of decks owned by a user with username `username`
export function apiDeckList(username, callback, nextUrl) {
  let endpoint = 'decks/decklist/';
  if (username) {
    endpoint = `decks/decklist/?username=${username}`;
  };
  if (nextUrl !== null && nextUrl !== undefined) {
    // TODO: The replace system will need to be redone
    endpoint = nextUrl.replace('http://127.0.0.1:8000/api/', '');
  };
  backendLookup('GET', endpoint, callback);
};


// Gets a feed of decks from the API
export function apiDeckFeed(callback, nextUrl) {
  let endpoint = 'decks/feed/';
  if (nextUrl !== null && nextUrl !== undefined) {
    // TODO: The replace system will need to be redone
    endpoint = nextUrl.replace('http://127.0.0.1:8000/api/', '');
  };
  backendLookup('GET', endpoint, callback);
};


// Gets detail information about a profile, such as bio, name, username, etc.
export function apiProfileDetail(username, callback) {
  backendLookup('GET', `profiles/${username}/detail/`, callback);
};


// Sends a friend/unfriend request to the backend
export function apiProfileFriendToggle(username, action, callback) {
  backendLookup('POST', `profiles/${username}/friend/`, callback, {action: action.toLowerCase()});
};

// Send a friend request
export function apiSendFriendReq(recipientUsername, callback) {
  backendLookup('POST', `profiles/${recipientUsername}/friendrequest/`, callback);
};

// Creates a notification
export function apiNotificationCreate(username, title, description, category, callback) {
  backendLookup('POST', `profiles/${username}/notifications/`, callback, {
    title: title,
    description: description,
    category: category,
  });
};

// Gets list of notifications for a user
export function apiNotificationList(username, callback) {
  backendLookup('GET', `profiles/${username}/notifications/`, callback);
};

// Gets list of unread notifications for a user
export function apiUnreadNotificationList(username, callback) {
  backendLookup('GET', `profiles/${username}/notifications/read/`, callback);
};

// Marks a user's notification as read
export function apiNotificationRead(username, notificationId, callback) {
  backendLookup('POST', `profiles/${username}/notifications/read/`, callback, {notification_id: notificationId});
};