import {backendLookup, baseUrl} from './components';


// Creates a new deck
export function apiDeckCreate(title, description, sharingSetting, shuffleUnseenCards, dailyNewCardLimit, schedulingAlgo, callback) {
  backendLookup('POST', 'decks/create/', callback, {
    title: title,
    description: description,
    sharing_setting: sharingSetting,
    shuffle_unseen_cards: shuffleUnseenCards,
    daily_new_card_limit: dailyNewCardLimit,
    scheduling_algorithm: schedulingAlgo,
  });
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
export function apiFlashCardReviewUpdate(deckId, flashcardId, nextReview, interval, ease, learningStatus, stepsIndex, leechIndex, isLeech, incrementNewCardsDoneToday, callback) {
  backendLookup('POST', `decks/${deckId}/flashcards/${flashcardId}/review_update/`, callback, {
    next_review: nextReview,
    interval: interval,
    ease: ease,
    learning_status: learningStatus,
    steps_index: stepsIndex,
    leech_index: leechIndex,
    is_leech: isLeech,
    increment_new_cards_done_today: incrementNewCardsDoneToday,
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
export function apiFlashCardSearch(deckIds, tags, contains, suspended, leech, learningStatus, minEase, maxEase, callback) {
  let endpoint = 'decks/flashcards/search/?';
  if (deckIds !== null && deckIds !== undefined) {endpoint += `&deckIds=${deckIds}`}
  if (tags !== null && tags !== undefined) {endpoint += `&tags=${tags}`}
  if (contains !== null && contains !== undefined) {endpoint += `&contains=${contains}`}
  if (suspended !== null && suspended !== undefined) {endpoint += `&suspended=${suspended}`}
  if (leech !== null && leech !== undefined) {endpoint += `&leech=${leech}`}
  if (learningStatus !== null && learningStatus !== undefined) {endpoint += `&learningStatus=${learningStatus}`}
  if (minEase !== null && minEase !== undefined) {endpoint += `&minEase=${minEase}`}
  if (maxEase !== null && maxEase !== undefined) {endpoint += `&maxEase=${maxEase}`}
  endpoint = endpoint.replace('&', ''); // get rid of first, arbitrary, &

  backendLookup('GET', endpoint, callback);
};

// Gets detail information on a deck with ID `deckId`
export function apiDeckDetail(deckId, callback) {
  backendLookup('GET', `decks/${deckId}/`, callback);
};

// Gets a deck's flashcards
export function apiDeckFlashcards(deckId, limit, callback, nextUrl) {
  let endpoint = `decks/${deckId}/flashcards/${limit ? `?limit=${limit}` : ''}`;
  if (nextUrl) {
    endpoint = nextUrl.replace(`${baseUrl}/api/`, '');
  };
  backendLookup('GET', endpoint, callback);
};

// Deletes a deck
export function apiDeckDelete(deckId, callback) {
  backendLookup('POST', `decks/${deckId}/delete/`, callback);
};

export function apiDeckEdit(deckId, newTitle, newDescription, sharingSetting, schedulingAlgo, shuffleUnseenCards, dailyNewCardLimit, callback) {
  backendLookup('POST', `decks/${deckId}/edit/`, callback, {
    new_title: newTitle,
    description: newDescription,
    sharing_setting: sharingSetting,
    scheduling_algorithm: schedulingAlgo,
    shuffle_unseen_cards: shuffleUnseenCards,
    daily_new_card_limit: dailyNewCardLimit,
  });
};


// Gets a list of decks owned by a user with username `username` that are shared with the given user
export function apiDeckSharedList(username, callback) {
  backendLookup('GET', `decks/detail/${username.toLowerCase()}/`, callback);
};


// Gets a page of decks from the API
export function apiDeckHome(callback, nextUrl) {
  let endpoint = 'decks/home/';
  if (nextUrl !== null && nextUrl !== undefined) {
    endpoint = nextUrl.replace(`${baseUrl}/api/`, '');
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
export function apiDeckSearch(query, callback, nextUrl) {
  let endpoint = `decks/search/?q=${query}`;
  if (nextUrl !== null && nextUrl !== undefined) {
    endpoint = nextUrl.replace(`${baseUrl}/api/`, '');
  };
  backendLookup('GET', endpoint, callback);
};

// Imports a deck from a text file
export function apiDeckTextImport(title, fileContents, convertFormatting, callback) {
  backendLookup('POST', 'decks/textupload/', callback, {
    deck_title: title,
    uploaded_file: fileContents,
    convert_formatting: convertFormatting,
  });
};

// Gets detail information about a profile, such as bio, name, username, etc.
export function apiProfileDetail(username, callback) {
  backendLookup('GET', `profiles/${username.toLowerCase()}/detail/`, callback);
};


// Sends a friend/unfriend request to the backend
export function apiProfileFriendToggle(username, action, callback) {
  backendLookup('POST', `profiles/${username.toLowerCase()}/friend/`, callback, {action: action.toLowerCase()});
};

// Checks if a username is available
export function apiCheckUsernameAvailable(username, email, callback) {
  backendLookup('GET', `profiles/available/?username=${username.toLowerCase()}&email=${email}`, callback);
};

// Creates a profile & user
export function apiProfileCreate(birthYear, birthMonth, birthDate, firstName, lastName, username, email, password, experimentParams, callback) {
  backendLookup('POST', 'profiles/create/', callback, {
    birthdate: {
      year: parseInt(birthYear),
      month: birthMonth,
      day: parseInt(birthDate),
    },
    first_name: firstName,
    last_name: lastName,
    username: username,
    email: email,
    password: password,
    experiment_params: experimentParams,
  });
};

// Logs a user in
export function apiProfileLogin(username, password, callback) {
  backendLookup('POST', 'profiles/login/', callback, {username: username.toLowerCase(), password: password});
};

// Logs a user out
export function apiProfileLogout(callback) {
  backendLookup('POST', 'profiles/logout/', callback);
};

// Gets a list of a user's friends
export function apiProfileFriends(username, callback) {
  backendLookup('GET', `profiles/${username.toLowerCase()}/friends/`, callback);
};

// Get's a profile's history
export function apiProfileHistory(username, callback) {
  backendLookup('GET', `profiles/${username.toLowerCase()}/history/`, callback);
};

// Send a friend request
export function apiSendFriendReq(recipientUsername, callback) {
  backendLookup('POST', `profiles/${recipientUsername.toLowerCase()}/friendrequest/`, callback);
};

// Creates a notification
export function apiNotificationCreate(username, title, description, category, callback) {
  backendLookup('POST', `profiles/${username.toLowerCase()}/notifications/`, callback, {
    title: title,
    description: description,
    category: category,
  });
};

// Gets list of notifications for a user
export function apiNotificationList(username, callback, nextUrl) {
  let endpoint = `profiles/${username.toLowerCase()}/notifications/`;
  if (nextUrl !== null && nextUrl !== undefined) { // TODO: replace this with just if (nextUrl) {}
    endpoint = nextUrl.replace(`${baseUrl}/api/`, '');
  };
  backendLookup('GET', endpoint, callback);
};

// Gets list of unread notifications for a user
export function apiUnreadNotificationList(username, callback) {
  backendLookup('GET', `profiles/${username.toLowerCase()}/notifications/read/`, callback);
};

// Marks a user's notification as read
export function apiNotificationRead(username, notificationId, callback) {
  backendLookup('POST', `profiles/${username.toLowerCase()}/notifications/read/`, callback, {notification_id: notificationId});
};

// Gets decks for explore component
export function apiExploreLists(callback) {
  backendLookup('GET', 'explore/lists/', callback);
};

// Create an empty data point
export function apiCreateBlankExperiment(controllerShortName, experimentParams, callback) {
  backendLookup('POST', 'analytics/createblank/', callback, {
    controller_short_name: controllerShortName,
    experiment_params: experimentParams,
  });
};

// Submit a piece of feedback
export function apiFeedbackSubmit(title, description, errorCode, urgency, email, contactAllowed, isLegalIssue, callback) {
  backendLookup('POST', 'pages/contactus/', callback, {
    title: title,
    description: description,
    error_code: errorCode,
    urgency: urgency,
    email: email,
    contact_allowed: contactAllowed,
    is_legal_issue: isLegalIssue,
  });
};