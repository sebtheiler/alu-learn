// TODO: Break this file up into a separate file for each "package"
// Each file should contain the lookups for just that package
import { Node } from 'slate';
import { CSSM, Deck, DeckDifficulty, FlashCard, FlashCardCreator, FlashCardTypes, LearningStatus, SchedulingAlgorithm, SharedDeck, SSMInterface } from '../decks/types';
import { Routine, Habit, HabitValue } from '../habits/types';
import { Profile } from '../profiles/types';
import { Assignment, Classroom, ClassroomAssignments } from '../teachers/types';
import { backendLookup, baseUrl } from './components';

type Message = { 'message': string };
type PaginatedResponse = {
  count: number;
  next: string;
  previous: string;
  results: any[];
}

// Creates a new deck
export function apiDeckCreate(
  title: string,
  shuffleUnseenCards: boolean,
  dailyNewCardLimit: number,
  dailySeenCardLimit: number,
  schedulingAlgo: SchedulingAlgorithm,
  deckDifficulty: DeckDifficulty,
  reviewAheadMinutes: number,
  callback: (response: Deck, status: number) => void,
) {
  backendLookup('POST', 'decks/create/', callback, {
    title: title,
    shuffle_unseen_cards: shuffleUnseenCards,
    daily_new_card_limit: dailyNewCardLimit,
    daily_seen_card_limit: dailySeenCardLimit,
    scheduling_algorithm: schedulingAlgo,
    difficulty: deckDifficulty,
    review_ahead_minutes: reviewAheadMinutes,
  });
}

// Creates a flashcard in a deck
export function apiFlashCardCreate(
  deckId: number,
  fields: Node[][],
  tags: string,
  flashcardType: FlashCardTypes,
  callback: (response: FlashCardCreator, status: number) => void,
) {
  backendLookup('POST', `decks/${deckId}/flashcards/create/`, callback, {
    fields: fields,
    tags: tags,
    flashcard_type: flashcardType,
  });
}

// Deletes a flashcard in a deck
export function apiFlashCardDelete(
  deckId: number,
  flashcardNum: number,
  callback: (response: Message, status: number) => void,
) {
  backendLookup('POST', `decks/${deckId}/flashcards/${flashcardNum}/delete/`, callback);
}

// Edit a flashcard
export function apiFlashCardEdit(deckId, flashcardId, fields, tags, callback) {
  backendLookup('POST', `decks/${deckId}/flashcards/${flashcardId}/edit/`, callback, {
    fields: fields,
    tags: tags,
  });
}

// Gets specific information about a flashcard
export function apiFlashCardDetail(deckId, flashcardId, callback) {
  backendLookup('GET', `decks/${deckId}/flashcards/${flashcardId}/`, callback);
}

// Marks a flashcard as suspended or as a leech
export function apiFlashCardSuspendLeech(deckId, flashcardId, action, callback) {
  backendLookup('POST', `decks/${deckId}/flashcards/${flashcardId}/suspend_or_leech/`, callback, {action: action});
}

// Search for flashcards
export function apiFlashCardSearch(deckIds, tags, contains, suspended, leech, learningStatus, minEase, maxEase, callback) {
  let endpoint = 'decks/flashcards/search/?';
  if (deckIds !== null && deckIds !== undefined) {endpoint += `&deckIds=${deckIds}`}
  if (tags !== null && tags !== undefined) {endpoint += `&tags=${tags}`}
  if (contains !== null && contains !== undefined) {endpoint += `&contains=${contains}`}
  if (suspended !== null && suspended !== undefined) {endpoint += `&suspended=${suspended}`}
  if (leech !== null && leech !== undefined) {endpoint += `&leech=${leech}`}
  if (learningStatus !== null && learningStatus !== undefined) {endpoint += `&learningStatus=${learningStatus}`}
  if (minEase !== null && minEase !== undefined && minEase > 130) {endpoint += `&minEase=${minEase}`}
  if (maxEase !== null && maxEase !== undefined && maxEase < 350) {endpoint += `&maxEase=${maxEase}`}
  endpoint = endpoint.replace('&', ''); // get rid of first, arbitrary, &

  backendLookup('GET', endpoint, callback);
}

// Gets detail information on a deck with ID `deckId`
export function apiDeckDetail(
  deckId: number,
  options: { getFullDetail?: boolean },
  callback: (response: Deck | SharedDeck, status: number) => void,
) {
  const {getFullDetail} = options;
  let endpoint = `decks/${deckId}/`;
  if (getFullDetail) {
    endpoint += '?fullDetail=true';
  }
  backendLookup('GET', endpoint, callback);
}

// Gets a deck's flashcards
export function apiDeckFlashcards(deckId, options, callback, nextUrl='') {
  const {limit, reverse} = options;
  let endpoint = `decks/${deckId}/flashcards/?`;

  if (limit) endpoint += `&limit=${limit}`;
  if (reverse) endpoint += '&reverse=true';

  if (nextUrl) {
    endpoint = nextUrl.replace(`${baseUrl}/api/`, '');
  }
  backendLookup('GET', endpoint, callback);
}

// Deletes a deck
export function apiDeckDelete(deckId, callback) {
  backendLookup('POST', `decks/${deckId}/delete/`, callback);
}

export function apiDeckEdit(
  deckId: number,
  newTitle: string,
  schedulingAlgo: SchedulingAlgorithm,
  shuffleUnseenCards: boolean,
  dailyNewCardLimit: number,
  dailySeenCardLimit: number,
  reviewAheadMinutes: number,
  deckDifficulty: DeckDifficulty,
  callback: (response: Deck, status: number) => void,
) {
  backendLookup('POST', `decks/${deckId}/edit/`, callback, {
    new_title: newTitle,
    scheduling_algorithm: schedulingAlgo,
    shuffle_unseen_cards: shuffleUnseenCards,
    daily_new_card_limit: dailyNewCardLimit,
    daily_seen_card_limit: dailySeenCardLimit,
    review_ahead_minutes: reviewAheadMinutes,
    difficulty: deckDifficulty,
  });
}


// Gets a list of decks owned by a user with username `username` that are shared with the given user
export function apiDeckSharedList(username, callback) {
  backendLookup('GET', `decks/detail/${username.toLowerCase()}/`, callback);
}

// Gets a list of the current user's decks
export function apiDeckPrivateList(callback) {
  backendLookup('GET', 'decks/list/', callback);
}

// Gets a page of decks from the API
export function apiDeckHome(
  callback: (response: (Deck | CSSM)[], status: number) => void,
) {
  backendLookup('GET', 'decks/list/?include_cssms=true', callback);
}

// Copies a deck
export function apiDeckCopy(deckId, callback) {
  backendLookup('POST', `decks/${deckId}/copy/`, callback);
}

// Creates a thank for a deck
export function apiDeckThank(deckId, callback) {
  backendLookup('POST', `decks/${deckId}/thank/`, callback);
}

// Searches for decks based on a query
export function apiDeckSearch(query, callback, nextUrl='') {
  let endpoint = `decks/search/?q=${query}`;
  if (nextUrl) {
    endpoint = nextUrl.replace(`${baseUrl}/api/`, '');
  }
  backendLookup('GET', endpoint, callback);
}

// Imports a deck from a text file
export function apiDeckTextImport(
  title: string,
  fileContents: string,
  convertFormatting: boolean,
  callback: (response: Deck, status: number) => void,
) {
  backendLookup('POST', 'decks/textupload/', callback, {
    deck_title: title,
    uploaded_file: fileContents,
    convert_formatting: convertFormatting,
  });
}

// Exports a deck to a JSON file
export function apiDeckJSONExport(
  deckId: number,
  exportReviewInstances: boolean,
  callback: (response: Object, status: number) => void,
) {
  backendLookup('GET', `decks/${deckId}/export/json/?export_review_instances=${exportReviewInstances}`, callback);
}

// Imports a deck from an exported JSON file
export function apiDeckJSONImport(
  jsonDeck: Object,
  callback: (response: Deck, status: number) => void,
) {
  backendLookup('POST', `decks/upload/json/`, callback, jsonDeck);
}

// Gets detail information about a profile, such as bio, name, username, etc.
export function apiProfileDetail(
  username: string,
  callback: (response: Profile, status: number) => void,
) {
  backendLookup('GET', `profiles/${username.toLowerCase()}/detail/`, callback);
}


// Sends a friend/unfriend request to the backend
export function apiProfileFriendToggle(
  username: string,
  action: 'friend' | 'unfriend',
  callback: (response: Profile, status: number) => void,
) {
  backendLookup('POST', `profiles/${username.toLowerCase()}/friend/`, callback, {action: action.toLowerCase()});
}

// Checks if a username is available
export function apiCheckUsernameAvailable(
  username: string,
  email: string,
  callback: (response: { username_is_available: boolean, email_is_available: boolean }, status: number) => void,
) {
  backendLookup('GET', `profiles/available/?username=${username.toLowerCase()}&email=${email}`, callback);
}

// Creates a profile & user
export function apiProfileCreate(
  birthYear: string,
  birthMonth: string,
  birthDate: string,
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  password: string,
  callback: (response: Profile | Message, status: number) => void,
) {
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
  });
}

// Logs a user in
export function apiProfileLogin(
  username: string,
  password: string,
  callback: (response: Message, status: number) => void,
) {
  backendLookup('POST', 'profiles/login/', callback, {username: username.toLowerCase(), password: password});
}

// Logs a user out
export function apiProfileLogout(callback) {
  backendLookup('POST', 'profiles/logout/', callback);
}

// Gets a list of a user's friends
export function apiProfileFriends(callback) {
  backendLookup('GET', `profiles/friends/`, callback);
}

// Get's a profile's history
export function apiProfileHistory(username, callback) {
  backendLookup('GET', `profiles/${username.toLowerCase()}/history/`, callback);
}

// Update's a profiles settings
export function apiProfileSettingsUpdate(settings, callback) {
  backendLookup('POST', 'pages/settings/', callback, {
    settings: settings,
  });
}

// Send a friend request
export function apiSendFriendReq(
  recipientUsername: string,
  callback: (response: Message, status: number) => void,
) {
  backendLookup('POST', `profiles/${recipientUsername.toLowerCase()}/friendrequest/`, callback);
}

// Creates a notification
export function apiNotificationCreate(username, title, description, category, callback) {
  backendLookup('POST', `profiles/${username.toLowerCase()}/notifications/`, callback, {
    title: title,
    description: description,
    category: category,
  });
}

// Gets list of notifications for a user
export function apiNotificationList(
  callback: (response: PaginatedResponse, status: number) => void,
  nextUrl='',
) {
  let endpoint = `profiles/notifications/`;
  if (nextUrl) {
    console.log(nextUrl);
    endpoint = nextUrl.replace(`${baseUrl}/api/`, '');
  }
  backendLookup('GET', endpoint, callback);
}

// Gets list of unread notifications for a user
export function apiUnreadNotificationList(
  callback: (response: Notification[], status: number) => void,
) {
  backendLookup('GET', `profiles/notifications/read/`, callback);
}

// Marks a user's notification as read
export function apiNotificationRead(
  notificationId: number | number[],
  callback: (response: Notification | Notification[], status: number) => void,
) {
  backendLookup('POST', `profiles/notifications/read/`, callback, {notification_id: notificationId});
}

// Gets decks for explore component
export function apiExploreLists(callback) {
  backendLookup('GET', 'pages/explore/lists/', callback);
}

// Submit a piece of feedback
export function apiFeedbackSubmit(
  title: string,
  description: string,
  errorCode: string,
  urgency: number,
  email: string,
  contactAllowed: boolean,
  isLegalIssue: boolean,
  callback: (response: Message, status: number) => void,
) {
  backendLookup('POST', 'pages/contactus/', callback, {
    title: title,
    description: description,
    error_code: errorCode,
    urgency: urgency,
    email: email,
    contact_allowed: contactAllowed,
    is_legal_issue: isLegalIssue,
  });
}

// Gets metadata about an SSM
export function apiSSMDetail(
  studySessionmanagerId: number,
  callback: (response: SSMInterface, status: number) => void,
) {
  backendLookup('GET', `decks/ssm/${studySessionmanagerId}/`, callback);
}

// Gets flashcards to review now from an SSM
export function apiSSMFlashcards(
  studySessionmanagerId: number,
  reviewOverflowBucket: boolean,
  callback: (response: {
    flashcards: FlashCard[],
    num_overflow?: number,
  }, status: number) => void,
) {
  let endpoint = `decks/ssm/${studySessionmanagerId}/flashcards/`;
  if (reviewOverflowBucket) endpoint += '?from_overflow_bucket=true';
  backendLookup('GET', endpoint, callback);
}

// Updates a flashcard in an SSM's database
export function apiSSMFlashcardUpdate(
  studySessionmanagerId: number,
  flashcardId: string, /** UUID of the flashcard to update */
  nextReviewDate: string | Date,
  interval: number,
  easeFactor: number,
  learningStatus: LearningStatus,
  stepsIndex: number,
  leechIndex: number,
  isLeech: boolean,
  incrementNewCardsDoneToday: boolean,
  timezoneOffset: number,
  timeTaken: number,
  callback: (response: FlashCard, status: number) => void,
) {
  backendLookup('POST', `decks/ssm/${studySessionmanagerId}/flashcards/${flashcardId}/update/`, callback, {
    next_review: nextReviewDate,
    interval: interval,
    ease: easeFactor,
    learning_status: learningStatus,
    steps_index: stepsIndex,
    leech_index: leechIndex,
    is_leech: isLeech,
    increment_new_cards_done_today: incrementNewCardsDoneToday,
    utc_timezone_offset: timezoneOffset,
    time_taken: timeTaken,
  });
}

// Updates a study session manager
export function apiSSMEdit(
  studySessionmanagerId: number,
  title?: string,
  schedulingAlgo?: SchedulingAlgorithm,
  shuffleUnseenCards?: boolean,
  dailyNewCardLimit?: number,
  dailySeenCardLimit?: number,
  reviewAheadMinutes?: number,
  deckIds?: number[],
  tags?: string,
  contains?: string,
  leech?: boolean | null,
  learningStatus?: LearningStatus,
  minEase?: number,
  maxEase?: number,
  callback?: (reponse: SSMInterface, status: number) => void,
) {
  if (!callback) {
    console.error('Must provide `callback`');
    return;
  }

  backendLookup('POST', `decks/ssm/${studySessionmanagerId}/edit/`, callback, {
    title: title,
    scheduling_algorithm: schedulingAlgo,
    shuffle_unseen_cards: shuffleUnseenCards,
    daily_new_card_limit: dailyNewCardLimit,
    daily_seen_card_limit: dailySeenCardLimit,
    review_ahead_minutes: reviewAheadMinutes,
    deck_ids: deckIds,
    tags: tags,
    contains: contains,
    leech: leech,
    learning_status: learningStatus,
    min_ease: minEase,
    max_ease: maxEase,
  });
}

// Deletes a study session manager
export function apiSSMDelete(
  studySessionmanagerId: number,
  callback: (reponse: Message, status: number) => void,
) {
  backendLookup('POST', `decks/ssm/${studySessionmanagerId}/delete/`, callback);
}

// Creates a study session manager
export function apiSSMCreate(
  title: string,
  deckIds?: number[],
  tags?: string,
  contains?: string,
  leech?: boolean,
  learningStatus?: LearningStatus,
  minEase?: number,
  maxEase?: number,
  callback?: (reponse: CSSM, status: number) => void,
) {
  if (!callback) {
    console.error('Must provide `callback`');
    return;
  }

  backendLookup('POST', `decks/ssm/create/`, callback, {
    title: title,
    deck_ids: deckIds,
    tags: tags,
    contains: contains,
    leech: leech,
    learning_status: learningStatus,
    min_ease: minEase,
    max_ease: maxEase,
  });
}

// Creates a note
export function apiNoteCreate(title, callback) {
  backendLookup('POST', 'notes/create/', callback, {title: title});
}

// Gets info about a note
export function apiNoteDetail(noteId, getPages, callback) {
  let backend = `notes/detail/${noteId}/`;
  if (getPages) {
    backend += '?getPages=true';
  }
  backendLookup('GET', backend, callback);
}

// Gets a note page's content
export function apiNotePageDetail(noteId, pageNumber, callback) {
  backendLookup('GET', `notes/page-detail/${noteId}/${pageNumber}/`, callback);
}

// Updates a note's metadata
export function apiNoteUpdate(noteId, newTitle, callback) {
  backendLookup('POST', `notes/update/${noteId}/`, callback, { new_title: newTitle });
}

// Updates the content of a single note page
export function apiNotePageUpdate(noteId, pageId, newContent, callback) {
  backendLookup('POST', `notes/page-update/${noteId}/${pageId}/`, callback, { new_content: newContent });
}

// Deletes a note
export function apiNoteDelete(noteId, callback) {
  backendLookup('POST', `notes/delete/${noteId}/`, callback);
}

// Gets all of the user's notes
export function apiNoteHome(callback) {
  backendLookup('GET', 'notes/list/', callback);
}

// Creates a new page in a note
export function apiCreateNewNotePage(pageTitle, noteId, version, pagePosition, callback) {
  backendLookup('POST', 'notes/create-page/', callback, {
    note_id: noteId,
    title: pageTitle,
    version: version,
    page_position: pagePosition,
  });
}

// Deletes a page in a note
export function apiDeleteNotePage(noteId, pageId, callback) {
  backendLookup('POST', `notes/delete-page/${noteId}/${pageId}/`, callback);
}

// Changes a user's password
export function apiPasswordChange(oldPassword, newPassword, callback) {
  backendLookup('POST', 'profiles/changepassword/', callback, {
    old_password: oldPassword,
    new_password: newPassword,
  });
}

// Resets a user's password
export function apiPasswordReset(email, resetKey, newPassword, callback) {
  backendLookup('POST', 'profiles/changepassword/', callback, {
    email: email,
    reset_key: resetKey,
    new_password: newPassword,
  });
}

// Sends a password reset email
export function apiSendPasswordReset(email, callback) {
  backendLookup('POST', `profiles/resetpassword/${email}/`, callback);
}

// Confirm user's email
export function apiEmailConfirm(username, confirmationKey, email, callback) {
  backendLookup('POST', `profiles/confirmemail/${username}/`, callback, {
    confirmation_key: confirmationKey,
    email: email,
  });
}

// Sends a confirmation email to the specified email
export function apiEmailChange(password, newEmail, callback) {
  backendLookup('POST', 'profiles/changeemail/', callback, {
    password: password,
    new_email: newEmail,
  });
}

// Gets the current user's Manual SR Tasks
export function apiManualSRTaskList(callback, nextUrl='') {
  let endpoint = 'manual-sr/list/';
  if (nextUrl) {
    endpoint = nextUrl.replace(`${baseUrl}/api/`, '');
  }
  backendLookup('GET', endpoint, callback);
}

// Creates a new Manual SR Task
export function apiManualSRTaskCreate(title, description, callback) {
  backendLookup('POST', 'manual-sr/create/', callback, {
    title: title,
    description: description,
  });
}

// Deletes a Manual SR Task
export function apiManualSRTaskDelete(id, callback) {
  backendLookup('POST', 'manual-sr/delete/', callback, {
    manual_sr_id: id,
  });
}

// Updates a Manual SR Task's review information
export function apiManualSRTaskUpdate(id, nextReviewDate, learningStatus, ease, interval, callback) {
  backendLookup('POST', `manual-sr/update/${id}/`, callback, {
    next_review: nextReviewDate,
    learning_status: learningStatus,
    ease: ease,
    interval: interval,
  });
}

// Edits the title and description of a Manual SR Task
export function apiManualSRTaskEdit(id, newTitle, newDescription, callback) {
  backendLookup('POST', `manual-sr/edit/${id}/`, callback, {
    new_title: newTitle,
    new_description: newDescription,
  });
}

// Gets detail information for a shared deck
export function apiSharedDeckDetail(id, callback) {
  backendLookup('GET', `decks/shared/detail/${id}/`, callback);
}

// Creates a shared deck
export function apiCreateSharedDeck(originDeckId, title, description, sharingSetting, callback) {
  backendLookup('POST', 'decks/shared/create/', callback, {
    origin_deck_id: originDeckId,
    title: title,
    description: description,
    sharing_setting: sharingSetting,
  });
}

// Clones a shared deck
export function apiSharedDeckClone(sharedDeckId, destinationDeckTitle, callback) {
  backendLookup('POST', `decks/shared/clone/${sharedDeckId}/`, callback, {
    destination_deck_title: destinationDeckTitle,
  });
}

// Edits a shared deck's metadata
export function apiSharedDeckEdit(sharedDeckId, newTitle, newDescription, newSharingSetting, callback) {
  backendLookup('POST', `decks/shared/edit/${sharedDeckId}/`, callback, {
    new_title: newTitle,
    new_description: newDescription,
    new_sharing_setting: newSharingSetting,
  });
}

// Pushes changes to a shared deck (or checks diff)
export function apiSharedPushChanges(
  originDeckId: number,
  sharedDeckId: number,
  checkDiffOnly: boolean,
  callback: (response: any, status: number) => void,
) {
  backendLookup('POST', `decks/shared/update/`, callback, {
    origin_deck_id: originDeckId,
    shared_deck_id: sharedDeckId,
    check_diff_only: checkDiffOnly,
  });
}

// Gets required updates for a deck
export function apiDeckGetUpdates(
  deckId: number,
  callback: (response: { needs_updating: { title: string, id: number }[] }, status: number) => void,
) {
  backendLookup('GET', `decks/get-updates/${deckId}/`, callback);
}

// Pulls specified updates for a deck
export function apiDeckPullUpdates(
  deckId: number,
  toPullFrom: number,
  callback: (response: Deck, status: number) => void,
) {
  backendLookup('POST', `decks/pull-updates/${deckId}/`, callback, {to_pull_from: toPullFrom});
}

// Marks the changelog popup as read
export function apiProfileReadPopup(callback) {
  backendLookup('POST', 'profiles/read-popup/', callback);
}

// Gets flashcards for playing a game
export type gameFlashcardTypes = 'SEEN' | 'UNSEEN' | 'ALL' | 'TAG' | 'PERSONAL';
export function apiGameFlashcards(
  deckId: number,
  type: gameFlashcardTypes,
  amount: number,
  randomOrder: boolean,
  options: { tag?: string | null },
  callback: (response: FlashCard[], status: number) => void,
) {
  backendLookup('POST', 'decks/games/flashcards/', callback, {
    deck_id: deckId,
    type: type,
    amount: amount,
    random_order: randomOrder,
    options: options,
  });
}

// Allows a staff to login to a user's account for emergency support
// You can't use this if you're not a staff, so don't both trying
export function apiStaffForceLogin(username, callback) {
  backendLookup('POST', 'profiles/staff-force-login/', callback, { username: username });
}

// Rearranges a flashcard
export function apiRearrangeFlashcard(
  deckId: number,
  flashcardNum: number,
  rearrangeType: 'UP' | 'DOWN',
  callback: (response: Message | FlashCardCreator, status: number) => void,
) {
  backendLookup('POST', `decks/${deckId}/flashcards/${flashcardNum}/rearrange/`, callback, {
    rearrange_type: rearrangeType,
  });
}

// Edits the tags of many flashcards at once
export function apiFlashcardEditTags(
  flashcardIds: number[],
  action: 'ADD' | 'REMOVE' | 'RENAME',
  tag: string,
  renameTo: string | null,
  callback: (response: Message, status: number) => void,
) {
  backendLookup('POST', `decks/edit-tags/`, callback, {
    flashcard_ids: flashcardIds,
    action: action,
    tag: tag,
    rename_to: renameTo,
  });
}

// Edits multiple review instances at once (e.g., suspend/unsuspend/delete)
export function apiFlashcardReviewInstanceEdit(flashcardIds, action, callback) {
  backendLookup('POST', `decks/edit-review-instances/`, callback, {
    flashcard_ids: flashcardIds,
    action: action,
  });
}

// Gets the statistics for a deck
interface Statistics {
  num_unseen: number;
  num_learning: number;
  num_learned: number;
  num_relearning: number;
  num_suspended: number;
  avg_ease: number;
}
export function apiDeckStatistics(
  deckId: number,
  callback: (response: Statistics, status: number) => void,
) {
  backendLookup<Statistics>('GET', `decks/${deckId}/statistics/`, callback);
}

// Gets a teacher's classes for the homepage
export function apiClassroomsHomepage(
  callback: (response: Classroom[], status: number) => void,
) {
  backendLookup('GET', 'teachers/classroom/homepage/', callback);
}

// Creates a classroom
export function apiClassroomCreate(title, callback) {
  backendLookup('POST', 'teachers/classroom/create/', callback, { title: title });
}

// Edits a classroom
export function apiClassroomEdit(classroomId, newTitle, callback) {
  backendLookup('POST', 'teachers/classroom/edit/', callback, {
    classroom_id: classroomId,
    new_title: newTitle,
  });
}

// Deletes a classroom
export function apiClassroomDelete(classroomId, callback) {
  backendLookup('POST', 'teachers/classroom/delete/', callback, { classroom_id: classroomId });
}

// Allows a student to join a classroom
export function apiClassroomStudentJoin(
  classroomCode: string,
  callback: (response: Message, status: number) => void,
) {
  backendLookup('POST', 'teachers/classroom/student-join/', callback, { classroom_code: classroomCode });
}

// Gets a list of the classes a student has joined
export function apiClassroomsStudentJoined(callback) {
  backendLookup('GET', 'teachers/classroom/joined/', callback);
}

// Gets basic details for a specific classroom
export function apiClassroomDetail(classroomId, callback) {
  backendLookup('GET', `teachers/classroom/detail/${classroomId}/`, callback);
}

// Gets a list of students that have joined a classroom
export function apiClassroomStudentsList(classroomId, tzOffset, callback) {
  backendLookup('GET', `teachers/classroom/students/${classroomId}/?tz=${tzOffset}`, callback);
}

// Attaches a deck to a classroom
export function apiClassroomAttachDeck(classroomId, deckId, callback) {
  backendLookup('POST', `teachers/classroom/attach-deck/${classroomId}/`, callback, { deck_id: deckId });
}

// Gets a list of students that have joined a classroom
export function apiClassroomStudentStats(classroomId, studentId, callback) {
  backendLookup('GET', `teachers/classroom/${classroomId}/student/${studentId}/stats/`, callback);
}

// Attaches a deck to a classroom for a student
export function apiClassroomStudentAttachDeck(classroomId, deckId, callback) {
  backendLookup('POST', `teachers/classroom/students/attach-deck/${classroomId}/`, callback, { deck_id: deckId });
}

// Gets a student's attached deck for a classroom
export function apiClassroomGetStudentDeck(classroomId, studentId, callback) {
  backendLookup('GET', `teachers/classroom/${classroomId}/student/${studentId}/attached-deck/`, callback);
}

// Suspends students flashcards in a deck attached to a classroom
export function apiClassroomSuspendFlashCards(classroomId, tagQuery, action, callback) {
  backendLookup('POST', `teachers/classroom/${classroomId}/students/suspend-flashcards/`, callback, {
    tag_query: tagQuery,
    action: action,
  });
}

export function apiCreateAssignment(
  classroomId: number,
  title: string,
  tagQuery: string,
  dueDate: string | Date,
  createEssentialCopy: boolean,
  callback: (response: Assignment, status: number) => void,
) {
  backendLookup('POST', `teachers/classroom/${classroomId}/assignments/create/`, callback, {
    title: title,
    tag_query: tagQuery,
    due_date: dueDate,
    create_essential_copy: createEssentialCopy,
  });
}

export function apiTeacherAssignmentsList(
  classroomId: number,
  callback: (response: Assignment[], status: number) => void,
) {
  backendLookup('GET', `teachers/classroom/${classroomId}/assignments/`, callback);
}

export function apiStudentAssignmentsList(
  callback: (response: ClassroomAssignments[], status: number) => void,
) {
  backendLookup('GET', `teachers/classroom/student/assignments/`, callback);
}

export function apiEditAssignment(
  classroomId: number,
  assignmentId: number,
  newTitle: string,
  newTagQuery: string,
  newDueDate: string | Date,
  callback: (response: Message, status: number) => void,
) {
  backendLookup('POST', `teachers/classroom/${classroomId}/assignments/${assignmentId}/edit/`, callback, {
    new_title: newTitle,
    new_tag_query: newTagQuery,
    new_due_date: newDueDate,
  });
}

export function apiDeleteAssignment(
  classroomId: number,
  assignmentId: number,
  callback: (response: Message, status: number) => void,
) {
  backendLookup('POST', `teachers/classroom/${classroomId}/assignments/${assignmentId}/delete/`, callback);
}

export function apiStudentPercentCompleteList(
  classroomId: number,
  assignmentId: number,
  callback: (response: { name: string, percent_complete: number }[], status: number) => void,
) {
  backendLookup('GET', `teachers/classroom/${classroomId}/assignments/${assignmentId}/progress/`, callback);
}

export function apiQuickDeckList(
  calcPercentComplete: boolean,
  includeHasSharedDeck: boolean,
  callback: (response: Deck[], status: number) => void,
) {
  let endpoint = 'decks/quick/?';
  if (calcPercentComplete) endpoint += 'calc_percent_complete=true&';
  if (includeHasSharedDeck) endpoint += 'include_has_shared_deck=true';
  backendLookup('GET', endpoint, callback);
}

export function apiStudyAssignment(
  classroomId: number,
  assignmentId: number,
  reviewOverflowBucket: boolean,
  callback: (response: FlashCard[], status: number) => void,
) {
  let endpoint = `teachers/classroom/${classroomId}/assignments/${assignmentId}/study/`;
  if (reviewOverflowBucket) endpoint += '?from_overflow_bucket=true';
  backendLookup('GET', endpoint, callback);
}

export function apiAssignmentDetail(
  classroomId: number,
  assignmentId: number,
  callback: (response: Assignment, status: number) => void,
) {
  backendLookup('GET', `teachers/classroom/${classroomId}/assignments/${assignmentId}/`, callback);
}

export function apiClassroomGetSSM(
  classroomId: number,
  callback: (response: SSMInterface, status: number) => void,
) {
  backendLookup('GET', `teachers/classroom/${classroomId}/ssm/`, callback);
}

export function apiClassroomEditSSM(
  classroomId: number,
  schedulingAlgo: SchedulingAlgorithm,
  shuffleUnseenCards: boolean,
  dailyNewCardLimit: number,
  dailySeenCardLimit: number,
  reviewAheadMinutes: number,
  callback: (response: SSMInterface, status: number) => void,
) {
  backendLookup('POST', `teachers/classroom/${classroomId}/ssm/edit/`, callback, {
    scheduling_algorithm: schedulingAlgo,
    shuffle_unseen_cards: shuffleUnseenCards,
    daily_new_card_limit: dailyNewCardLimit,
    daily_seen_card_limit: dailySeenCardLimit,
    review_ahead_minutes: reviewAheadMinutes,
  });
}

// Gets a possible feedback question to display to the user
export function apiFeedbackGetQuestion(
  callback: (response: Object, status: number) => void,
) {
  backendLookup('GET', 'pages/feedback/get-question/', callback);
}

// Responds to a feedback question
export function apiFeedbackRespondQuestion(
  quickFeedbackId: number,
  questionResponse: string,
  callback: (response: Message, status: number) => void,
) {
  backendLookup('POST', `pages/feedback/${quickFeedbackId}/respond/`, callback, {
    response: questionResponse,
  });
}

// Creates a new routine
export function apiRoutineCreate(
  title: string,
  ordered: boolean,
  callback: (response: Routine, status: number) => void,
) {
  backendLookup('POST', `habits/routines/create/`, callback, {
    title: title,
    ordered: ordered,
  });
}

// Lists all the user's existing routines
export function apiRoutineList(callback: (response: Routine[], status: number) => void) {
  backendLookup('GET', 'habits/routines/', callback);
}

// Edits a routine
export function apiRoutineEdit(
  routineId: number,
  newTitle: string | undefined | null,
  newOrdered: boolean | undefined | null,
  callback: (response: Routine, status: number) => void,
) {
  backendLookup('POST', `habits/routines/edit/${routineId}/`, callback, {
    new_title: newTitle,
    new_ordered: newOrdered,
  });
}

// Deletes a routine
export function apiRoutineDelete(
  routineId: number,
  callback: (response: Message, status: number) => void,
) {
  backendLookup('POST', `habits/routines/delete/${routineId}/`, callback, {});
}

// Rearranges a routine
export function apiRoutineRearrange(
  routineId: number,
  direction: 'UP' | 'DOWN',
  callback: (response: Message, status: number) => void,
) {
  backendLookup('POST', `habits/routines/rearrange/${routineId}/`, callback, {
    direction: direction,
  });
}

// Creates a new habit
export function apiHabitCreate(
  routineId: number,
  title: string,
  cue: string,
  craving: string,
  response: string,
  reward: string,
  notes: string,
  value: HabitValue,
  callback: (response: Habit, status: number) => void,
) {
  backendLookup('POST', `habits/routines/${routineId}/habits/create/`, callback, {
    title: title,
    cue: cue,
    craving: craving,
    response: response,
    reward: reward,
    notes: notes,
    value: value,
  });
}

// Edits a habit
export function apiHabitEdit(
  routineId: number,
  habitId: number,
  newTitle: string | undefined | null,
  newCue: string | undefined,
  newCraving: string | undefined,
  newResponse: string | undefined,
  newReward: string | undefined,
  newNotes: string | undefined,
  newValue: HabitValue | undefined,
  callback: (response: Habit, status: number) => void
) {
  backendLookup('POST', `habits/routines/${routineId}/habits/edit/${habitId}/`, callback, {
    new_title: newTitle,
    new_cue: newCue,
    new_craving: newCraving,
    new_response: newResponse,
    new_reward: newReward,
    new_notes: newNotes,
    new_value: newValue,
  });
}

// Deletes a habit
export function apiHabitDelete(
  routineId: number,
  habitId: number,
  callback: (response: Message, status: number) => void,
) {
  backendLookup('POST', `habits/routines/${routineId}/habits/delete/${habitId}/`, callback);
}

// Rearranges a routine
export function apiHabitRearrange(
  routineId: number,
  habitId: number,
  direction: 'UP' | 'DOWN',
  callback: (response: Message, status: number) => void,
) {
  backendLookup('POST', `habits/routines/${routineId}/habits/rearrange/${habitId}/`, callback, {
    direction: direction,
  });
}
