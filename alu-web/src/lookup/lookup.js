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
export function apiFlashCardCreate(deckId, fields, tags, flashcardType, callback) {
  backendLookup('POST', `decks/${deckId}/flashcards/create/`, callback, {
    fields: fields,
    tags: tags,
    flashcard_type: flashcardType,
  });
};

// Deletes a flashcard in a deck
export function apiFlashCardDelete(deckId, flashcardId, callback) {
  backendLookup('POST', `decks/${deckId}/flashcards/${flashcardId}/delete/`, callback);
};

// Edit a flashcard
export function apiFlashCardEdit(deckId, flashcardId, fields, tags, callback) {
  backendLookup('POST', `decks/${deckId}/flashcards/${flashcardId}/edit/`, callback, {
    fields: fields,
    tags: tags,
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
export function apiDeckDetail(deckId, options, callback) {
  const {getFullDetail} = options;
  let endpoint = `decks/${deckId}/`;
  if (getFullDetail) {
    endpoint += '?fullDetail=true';
  };
  backendLookup('GET', endpoint, callback);
};

// Gets a deck's flashcards
export function apiDeckFlashcards(deckId, options, callback, nextUrl) {
  const {limit} = options;
  let endpoint = `decks/${deckId}/flashcards/?`;

  if (limit) {endpoint += `&limit=${limit}`}

  if (nextUrl) {
    endpoint = nextUrl.replace(`${baseUrl}/api/`, '');
  };
  backendLookup('GET', endpoint, callback);
};

// Deletes a deck
export function apiDeckDelete(deckId, callback) {
  backendLookup('POST', `decks/${deckId}/delete/`, callback);
};

export function apiDeckEdit(deckId, newTitle, newDescription, sharingSetting, schedulingAlgo, shuffleUnseenCards, dailyNewCardLimit, reviewAheadMinutes, callback) {
  backendLookup('POST', `decks/${deckId}/edit/`, callback, {
    new_title: newTitle,
    description: newDescription,
    sharing_setting: sharingSetting,
    scheduling_algorithm: schedulingAlgo,
    shuffle_unseen_cards: shuffleUnseenCards,
    daily_new_card_limit: dailyNewCardLimit,
    review_ahead_minutes: reviewAheadMinutes,
  });
};


// Gets a list of decks owned by a user with username `username` that are shared with the given user
export function apiDeckSharedList(username, callback) {
  backendLookup('GET', `decks/detail/${username.toLowerCase()}/`, callback);
};


// Gets a page of decks from the API
export function apiDeckHome(callback, nextUrl) {
  let endpoint = 'decks/home/';
  if (nextUrl) {
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
  if (nextUrl) {
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

// Update's a profiles settings
export function apiProfileSettingsUpdate(disableTooltips, callback) {
  backendLookup('POST', 'pages/settings/', callback, {
    disable_all_tooltips: disableTooltips,
  });
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
  if (nextUrl) {
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
  // Note: notificationId can also be a list or notification ids
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

// Gets metadata about an SSM
export function apiSSMDetail(studySessionmanagerId, callback) {
  backendLookup('GET', `decks/ssm/${studySessionmanagerId}/`, callback);
};

// Gets flashcards to review now from an SSM
export function apiSSMFlashcards(studySessionmanagerId, callback) {
  backendLookup('GET', `decks/ssm/${studySessionmanagerId}/flashcards/`, callback);
};

// Updates a flashcard in an SSM's database
export function apiSSMFlashcardUpdate(studySessionmanagerId, currentCardId, nextReviewDate, interval, easeFactor, learningStatus, stepsIndex, leechIndex, isLeech, incrementNewCardsDoneToday, callback) {
  backendLookup('POST', `decks/ssm/${studySessionmanagerId}/flashcards/${currentCardId}/update/`, callback, {
    next_review: nextReviewDate,
    interval: interval,
    ease: easeFactor,
    learning_status: learningStatus,
    steps_index: stepsIndex,
    leech_index: leechIndex,
    is_leech: isLeech,
    increment_new_cards_done_today: incrementNewCardsDoneToday,
  });
};

// Updates a study session manager
export function apiSSMEdit(studySessionmanagerId, title, schedulingAlgo, shuffleUnseenCards, dailyNewCardLimit, reviewAheadMinutes, deckIds, tags, contains, leech, learningStatus, minEase, maxEase, callback) {
  backendLookup('POST', `decks/ssm/${studySessionmanagerId}/edit/`, callback, {
    title: title,
    scheduling_algorithm: schedulingAlgo,
    shuffle_unseen_cards: shuffleUnseenCards,
    daily_new_card_limit: dailyNewCardLimit,
    review_ahead_minutes: reviewAheadMinutes,
    deck_ids: deckIds,
    tags: tags,
    contains: contains,
    leech: leech,
    learning_status: learningStatus,
    min_ease: minEase,
    max_ease: maxEase,
  });
};

// Deletes a study session manager
export function apiSSMDelete(studySessionmanagerId, callback) {
  backendLookup('POST', `decks/ssm/${studySessionmanagerId}/delete/`, callback);
};

// Creates a study session manager
export function apiSSMCreate(deckIds, tags, contains, leech, learningStatus, minEase, maxEase, callback) {
  backendLookup('POST', `decks/ssm/create/`, callback, {
    deck_ids: deckIds,
    tags: tags,
    contains: contains,
    leech: leech,
    learning_status: learningStatus,
    min_ease: minEase,
    max_ease: maxEase,
  });
};

// Creates a note
export function apiNoteCreate(title, version, callback) {
  backendLookup('POST', 'notes/create/', callback, {title: title, version: version});
};

// Gets info about a note
export function apiNoteDetail(noteId, callback) {
  backendLookup('GET', `notes/detail/${noteId}/`, callback);
};

// Updates a note
export function apiNoteUpdate(noteId, newTitle, newContent, callback) {
  backendLookup('POST', `notes/update/${noteId}/`, callback, {new_title: newTitle, new_content: newContent});
};

// Deletes a note
export function apiNoteDelete(noteId, callback) {
  backendLookup('POST', `notes/delete/${noteId}/`, callback);
};

// Gets all of the user's notes
export function apiNoteHome(callback) {
  backendLookup('GET', 'notes/list/', callback);
};

// Changes a user's password
export function apiPasswordChange(oldPassword, newPassword, callback) {
  backendLookup('POST', 'profiles/changepassword/', callback, {
    old_password: oldPassword,
    new_password: newPassword,
  });
};

// Resets a user's password
export function apiPasswordReset(email, resetKey, newPassword, callback) {
  backendLookup('POST', 'profiles/changepassword/', callback, {
    email: email,
    reset_key: resetKey,
    new_password: newPassword,
  });
};

// Sends a password reset email
export function apiSendPasswordReset(email, callback) {
  backendLookup('POST', `profiles/resetpassword/${email}/`, callback);
};

// Confirm user's email
export function apiEmailConfirm(username, confirmationKey, email, callback) {
  backendLookup('POST', `profiles/confirmemail/${username}/`, callback, {
    confirmation_key: confirmationKey,
    email: email,
  });
};

// Sends a confirmation email to the specified email
export function apiEmailChange(password, newEmail, callback) {
  backendLookup('POST', 'profiles/changeemail/', callback, {
    password: password,
    new_email: newEmail,
  });
};

// Gets the current user's Manual SR Tasks
export function apiManualSRTaskList(callback, nextUrl) {
  let endpoint = 'manual-sr/list/';
  if (nextUrl) {
    endpoint = nextUrl.replace(`${baseUrl}/api/`, '');
  };
  backendLookup('GET', endpoint, callback);
};

// Creates a new Manual SR Task
export function apiManualSRTaskCreate(title, description, callback) {
  backendLookup('POST', 'manual-sr/create/', callback, {
    title: title,
    description: description,
  });
};

// Deletes a Manual SR Task
export function apiManualSRTaskDelete(id, callback) {
  backendLookup('POST', 'manual-sr/delete/', callback, {
    manual_sr_id: id,
  });
};

// Updates a Manual SR Task's review information
export function apiManualSRTaskUpdate(id, nextReviewDate, learningStatus, ease, interval, callback) {
  backendLookup('POST', `manual-sr/update/${id}/`, callback, {
    next_review: nextReviewDate,
    learning_status: learningStatus,
    ease: ease,
    interval: interval,
  });
};