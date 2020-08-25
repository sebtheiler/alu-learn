import {backendLookup} from './components';


// Creates a new deck with the title, `newDeck`
export function apiDeckCreate(newDeck, callback) {
  backendLookup('POST', 'decks/create/', callback, {title: newDeck});
};

// Creates a flashcard in a deck
export function apiFlashCardCreate(deckId, frontText, backText, tags, callback) {
  backendLookup('POST', `decks/${deckId}/flashcards/create/`, callback, {front_text: frontText, back_text: backText, tags: tags})
};

// Deletes a flashcard in a deck
export function apiFlashCardDelete(deckId, flashcardId, callback) {
  backendLookup('POST', `decks/${deckId}/flashcards/${flashcardId}/delete/`, callback);
};

// Edit a flashcard
export function apiFlashCardEdit(deckId, flashcardId, frontText, backText, tags, callback) {
  backendLookup('POST', `decks/${deckId}/flashcards/${flashcardId}/edit/`, callback, {front_text: frontText, back_text: backText, tags: tags});
};

// Update a flashcard's review date
export function apiFlashCardDateUpdate(deckId, flashcardId, nextReview, interval, ease, learningStatus, stepsIndex, leechIndex, isLeech, callback) {
  backendLookup('POST', `decks/${deckId}/flashcards/${flashcardId}/changedate/`, callback, {
    next_review: nextReview,
    interval: interval,
    ease: ease,
    learning_status: learningStatus,
    steps_index: stepsIndex,
    leech_index: leechIndex,
    is_leech: isLeech,
  });
};

// Gets specific information about a flashcard
export function apiFlashCardDetail(deckId, flashcardId, callback) {
  backendLookup('GET', `decks/${deckId}/flashcards/${flashcardId}/`, callback);
};

// Marks a flashcard as suspended or as a leech
export function apiFlashCardSuspendLeech(deckId, flashcardId, action, callback) {
  backendLookup('POST', `decks/${deckId}/flashcards/${flashcardId}/suspend_or_leech/`, callback, {action: action});
};

// Search for flashcards
export function apiFlashCardSearch(deckIds, tags, contains, suspended, leech, learningStatus, min_ease, max_ease, callback) {
  backendLookup('POST', `decks/flashcards/search/`, callback, {
    deck_ids: deckIds,
    tags: tags,
    contains: contains,
    suspended: suspended,
    leech: leech,
    learning_status: learningStatus,
    min_ease: min_ease,
    max_ease: max_ease,
  });
};

// Gets detail information on a deck with ID `deckId`
export function apiDeckDetail(deckId, callback) {
  backendLookup('GET', `decks/${deckId}/`, callback);
};

export function apiDeckDelete(deckId, callback) {
  backendLookup('POST', `decks/${deckId}/delete/`, callback);
};

export function apiDeckEdit(deckId, newTitle, newDescription, sharingSetting, schedulingAlgo, shuffleUnseenCards, callback) {
  backendLookup('POST', `decks/${deckId}/edit/`, callback, {
    new_title: newTitle,
    description: newDescription,
    sharing_setting: sharingSetting,
    scheduling_algorithm: schedulingAlgo,
    shuffle_unseen_cards: shuffleUnseenCards,
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

// Gets a list of decks owned by a user with username `username` that are shared with the given user
export function apiDeckSharedList(username, callback) {
  backendLookup('GET', `decks/detail/${username}/`, callback);
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

// Copies a deck
export function apiDeckCopy(deckId, callback) {
  backendLookup('POST', `decks/${deckId}/copy/`, callback);
};

// Creates a thank for a deck
export function apiDeckThank(deckId, callback) {
  backendLookup('POST', `decks/${deckId}/thank/`, callback);
};

// Searches for decks based on a query
export function apiDeckSearch(query, callback) {
  backendLookup('GET', `decks/search/?q=${query}/`, callback);
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

// Gets decks for explore component
export function apiExploreLists(callback) {
  backendLookup('GET', 'explore/lists/', callback);
};