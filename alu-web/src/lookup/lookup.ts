// TODO: Break this file up into a separate file for each "package"
// Each file should contain the lookups for just that package
import React, { useReducer, useEffect, useState, Dispatch } from 'react';
import { Assignment, Classroom, ClassroomAssignments, Student } from '../teachers/types';
import { Deck, ReviewInstance, SchedulingAlgorithm, SSMInterface, SharedDeck, ViewAccess, EditAccess } from '../decks/types';
import { Interval } from '../decks/study/algorithm';
import { Profile, ProfileHistory } from '../profiles/types';
import { Routine, Habit, HabitValue, Todo } from '../habits/types';
import { backendLookup, baseUrl } from './components';
import { getCookie } from '../utils/utils';

export type Message = { 'message': string };
export type PaginatedResponse<T = any> = {
  count: number;
  next: string;
  previous: string;
  results: T[];
}

const csrfToken = getCookie('csrftoken');
export async function backendFetch<T>(
  method: 'GET' | 'POST' | 'DELETE' | 'PUT',
  endpoint: string,
  data: Object = {},
): Promise<T> {
  let url = `${baseUrl}/api/${endpoint}`;
  if (method === 'GET' && !!data) {
    if (!url.includes('?')) url += '?';
    for (const [attr, val] of Object.entries(data)) {
      url += `&${encodeURIComponent(attr)}=${encodeURIComponent(val)}`;
    }
  }

  return fetch(url, {
    method: method,
    headers: {
      'content-type': 'application/json',
      'X-CSRFTOKEN': csrfToken ?? '',
    },
    body: method === 'GET' ? undefined : JSON.stringify(data),
  }).then(res => res.json());
}

export function apiObjectCreate<T>(
  appName: string,
  modelName: string,
  options: Object,
): Promise<T> {
  return backendFetch<T>(
    'POST',
    `${appName}/${modelName}/create/`,
    options,
  );
}

export async function apiObjectGet<T>(
  appName: string,
  modelName: string,
  objectId: number | string,
) {
  return backendFetch<T>(
    'GET',
    `${appName}/${modelName}/${objectId}/`,
  );
}

export async function apiObjectList<T>(
  appName: string,
  modelName: string,
  nextUrl?: string,
  data?: Object,
): Promise<T> {
  let endpoint = `${appName}/${modelName}/list/`;
  if (nextUrl) {
    const page = nextUrl.match(/page=\d*/);
    if (page) endpoint += `?${page[0]}`;
  }

  return backendFetch<T>(
    'GET',
    endpoint,
    data,
  );
}

interface DefaultEvent {
  action: any,
  payload?: any,
}
export function useAsyncDispatch<ObjType, Event extends DefaultEvent = never>(
  func: Function,
  args: any[] = [],
  reducer?: (
    state: ObjType | undefined,
    event: Event,
  ) => ObjType | undefined,
  callback?: (response: ObjType) => void,
  requirement: boolean = true,
): [ObjType | undefined, Dispatch<Event>] {
  const [obj, dispatch] = useReducer((state: ObjType | undefined, event: Event) => {
    if (event && event.action === 'INITIAL_SET')
      return event.payload as ObjType;
    return reducer ? reducer(state, event) : undefined;
  }, undefined);
  const [objDidFetch, setObjDidFetch] = useState(false);

  useEffect(() => {
    if (objDidFetch || !requirement) return;
    setObjDidFetch(true);
    func(...args).then((res: ObjType) => {
      dispatch({ action: 'INITIAL_SET', payload: res } as Event)
      if (callback) callback(res);
    });
  }, [func, args, callback, objDidFetch, requirement]);

  return [obj, dispatch];
}

export function useAsyncState<ObjType>(
  func: Function,
  args: any[] = [],
  callback?: (response: ObjType) => void,
  requirement: boolean = true,
): [ObjType | undefined, Dispatch<React.SetStateAction<ObjType | undefined>>] {
  const [obj, setObj] = useState<ObjType | undefined>(undefined);
  const [objDidFetch, setObjDidFetch] = useState(false);

  useEffect(() => {
    if (objDidFetch || !requirement) return;
    setObjDidFetch(true);
    func(...args).then((res: ObjType) => {
      setObj(res)
      if (callback) callback(res);
    });
  }, [func, args, callback, objDidFetch, requirement]);

  return [obj, setObj];
}

export function useObjectGet<ObjType, Event extends DefaultEvent = never>(
  appName: string,
  modelName: string,
  objectId: number | string,
  reducer?: (
    state: ObjType | undefined,
    event: Event,
  ) => ObjType | undefined,
  callback?: (response: ObjType) => void,
  requirement?: boolean,
): [ObjType | undefined, Dispatch<Event>] {
  return useAsyncDispatch<ObjType, Event>(
    apiObjectGet,
    [appName, modelName, objectId],
    reducer,
    callback,
    requirement,
  );
}

export function useObjectList<ObjType, Event extends DefaultEvent = never>(
  appName: string,
  modelName: string,
  reducer?: (
    state: ObjType[] | undefined,
    action: Event,
  ) => ObjType[] | undefined,
): [ObjType[] | undefined, Dispatch<Event>] {
  return useAsyncDispatch<ObjType[], Event>(
    apiObjectList,
    [appName, modelName],
    reducer,
  );
}

export function useObjectPaginatedList<ObjType, Event extends DefaultEvent = never>(
  appName: string,
  modelName: string,
  reducer?: (
    state: ObjType[] | undefined,
    action: Event,
  ) => ObjType[] | undefined,
  data?: Object,
  requirement: boolean = true,
): [
  ObjType[] | undefined,
  Dispatch<Event>,
  (() => void) | undefined,
  number | undefined,
] {
  type PaginatedObj = { next?: string, previous?: string, count: number, results: ObjType[] };
  const [objs, dispatch] = useReducer((state: ObjType[] | undefined, event: Event) => {
    if (event && event.action === 'INITIAL_SET')
      return event.payload as ObjType[];
    return reducer ? reducer(state, event) : undefined;
  }, undefined);
  const [objsDidFetch, setObjsDidFetch] = useState(false);
  const [count, setCount] = useState<number | undefined>(undefined);
  const [nextUrl, setNextUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (objsDidFetch || !requirement) return;
    setObjsDidFetch(true);
    apiObjectList<PaginatedObj>(appName, modelName, undefined, data).then(
      (res: PaginatedObj) => {
        dispatch({ action: 'INITIAL_SET', payload: res.results } as Event);
        setCount(res.count);
        setNextUrl(res.next);
      }
    );
  }, [appName, modelName, data, objsDidFetch, requirement]);

  const fetchNext = (nextUrl && objs) ? () => {
    apiObjectList<PaginatedObj>(appName, modelName, nextUrl, data).then(
      (res: PaginatedObj) => {
        dispatch({ action: 'INITIAL_SET', payload: [...objs, ...res.results] } as Event);
        setCount(res.count);
        setNextUrl(res.next);
      }
    );
  } : undefined;

  return [objs, dispatch, fetchNext, count];
}

export async function apiObjectEdit<T>(
  appName: string,
  modelName: string,
  objectId: number | string,
  edited_values: Object,
): Promise<T> {
  return backendFetch<T>(
    'PUT',
    `${appName}/${modelName}/${objectId}/edit/`,
    { edited_values: edited_values },
  );
}

export async function apiObjectRearrange<T>(
  appName: string,
  modelName: string,
  objectId: number | string,
  direction: 'UP' | 'DOWN',
): Promise<T> {
  return backendFetch<T>(
    'PUT',
    `${appName}/${modelName}/${objectId}/rearrange/`,
    { direction: direction },
  );
}

export async function apiObjectDelete<T>(
  appName: string,
  modelName: string,
  objectId: number | string,
): Promise<T> {
  return backendFetch<T>(
    'DELETE',
    `${appName}/${modelName}/${objectId}/delete/`,
  );
}

// Search for flashcards
export function apiFlashCardSearch(deckIds, tags, contains, suspended, leech, learningStatus, minEase, maxEase, callback) {
  let endpoint = 'decks/flashcard/search/?';
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

// Gets a deck's flashcards
export function apiDeckFlashcards(
  deckId: number,
  options: { limit: number, reverse: boolean },
  callback: (response, status: number) => void,
  nextUrl?: string,
) {
  const { limit, reverse } = options;
  let endpoint = `decks/deck/${deckId}/flashcards/?`;

  if (limit) endpoint += `&limit=${limit}`;
  if (reverse) endpoint += '&reverse=true';

  if (nextUrl) {
    endpoint = nextUrl.replace(`${baseUrl}/api/`, '');
  }
  backendLookup('GET', endpoint, callback);
}

// Gets a list of decks owned by a user with username `username` that are shared with the given user
export function apiDeckSharedList(
  username: string,
  callback: (response: SharedDeck[], status: number) => void,
) {
  backendLookup('GET', `decks/deck/list/user/${username.toLowerCase()}/`, callback);
}

export function apiDeckQuickList(
  calcPercentComplete: boolean,
  includeHasSharedDeck: boolean,
  callback: (response: Deck[], status: number) => void,
) {
  let endpoint = 'decks/deck/list/quick/?';
  if (calcPercentComplete) endpoint += 'calc_percent_complete=true&';
  if (includeHasSharedDeck) endpoint += 'include_has_shared_deck=true';
  backendLookup('GET', endpoint, callback);
}

// Copies a deck
export function apiDeckCopy(deckId, callback) {
  backendLookup('POST', `decks/${deckId}/copy/`, callback);
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
  backendLookup('POST', 'decks/deck/import/txt/', callback, {
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
  backendLookup('GET', `decks/deck/${deckId}/export/json/?export_review_instances=${exportReviewInstances}`, callback);
}

// Imports a deck from an exported JSON file
export function apiDeckJSONImport(
  jsonDeck: Object,
  callback: (response: Deck, status: number) => void,
) {
  backendLookup('POST', `decks/deck/import/json/`, callback, jsonDeck);
}

// Gets detail information about a profile, such as bio, name, username, etc.
export async function apiProfileDetail(username: string): Promise<Profile> {
  return backendFetch('GET', `profiles/${username.toLowerCase()}/detail/`);
}


// Sends a friend/unfriend request to the backend
export async function apiProfileFriendToggle(
  username: string,
  action: 'friend' | 'unfriend',
): Promise<void> {
  return backendFetch('POST', `profiles/${username.toLowerCase()}/friend/`, {
    action: action.toLowerCase(),
  });
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
  backendLookup('GET', 'profiles/friends/', callback);
}

// Get's a profile's history
export async function apiProfileHistory(): Promise<ProfileHistory[]> {
  return backendFetch('GET', 'profiles/history/');
}

// Update's a profiles settings
export function apiProfileSettingsUpdate(settings, callback) {
  backendLookup('POST', 'pages/settings/', callback, {
    settings: settings,
  });
}

// Send a friend request
export async function apiSendFriendReq(recipientUsername: string): Promise<void> {
  return backendFetch('POST', `profiles/${recipientUsername.toLowerCase()}/friendrequest/`);
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

// Gets flashcards to review now from an SSM
export function apiSSMFlashcards(
  studySessionmanagerId: number,
  reviewOverflowBucket: boolean,
  callback: (response: {
    flashcards: ReviewInstance[],
    num_overflow?: number,
  }, status: number) => void,
) {
  let endpoint = `decks/ssm/${studySessionmanagerId}/flashcards/`;
  if (reviewOverflowBucket) endpoint += '?from_overflow_bucket=true';
  backendLookup('GET', endpoint, callback);
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
export function apiSharedDeckDetail(
  sharedDeckId: number,
  callback: (reseponse: SharedDeck, status: number) => void,
) {
  backendLookup('GET', `decks/deck/shared/${sharedDeckId}/detail/`, callback);
}

// Creates a shared deck
export async function apiCreateSharedDeck(
  deckId: number,
  title: string,
  description: string,
  viewAccess: ViewAccess,
  editAccess: EditAccess,
  owners: string,
): Promise<SharedDeck> {
  return backendFetch('POST', `sharing_system/deck/${deckId}/share/`, {
    title: title,
    description: description,
    view_access: viewAccess,
    edit_access: editAccess,
    owners: owners,
  });
}

// Clones a shared deck
export function apiSharedDeckClone(
  sharedDeckId: number,
  destinationDeckTitle: string,
  callback: (response: SharedDeck | Message, status: number) => void,
) {
  backendLookup('POST', `decks/shared/${sharedDeckId}/clone/`, callback, {
    destination_deck_title: destinationDeckTitle,
  });
}

// Pushes changes to a shared deck (or checks diff)
export function apiSharedPushChanges(
  originDeckId: number,
  sharedDeckId: number,
  checkDiffOnly: boolean,
  callback: (response: any, status: number) => void,
) {
  backendLookup('POST', `decks/deck/shared/${sharedDeckId}/push-updates/`, callback, {
    origin_deck_id: originDeckId,
    check_diff_only: checkDiffOnly,
  });
}

// Gets required updates for a deck
export function apiDeckGetUpdates(
  deckId: number,
  callback: (response: { needs_updating: { title: string, id: number }[] }, status: number) => void,
) {
  backendLookup('GET', `decks/deck/${deckId}/get-updates/`, callback);
}

// Pulls specified updates for a deck
export function apiDeckPullUpdates(
  deckId: number,
  toPullFrom: number,
  callback: (response: Deck, status: number) => void,
) {
  backendLookup('POST', `decks/deck/${deckId}/pull-updates/`, callback, { to_pull_from: toPullFrom });
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
  callback: (response: ReviewInstance[], status: number) => void,
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

// Edits the tags of many flashcards at once
export function apiFlashcardEditTags(
  flashcardIds: number[],
  action: 'ADD' | 'REMOVE' | 'RENAME',
  tag: string,
  renameTo: string | null,
  callback: (response: Message, status: number) => void,
) {
  backendLookup('POST', `decks/flashcard/edit-tags/`, callback, {
    flashcard_ids: flashcardIds,
    action: action,
    tag: tag,
    rename_to: renameTo,
  });
}

// Edits multiple review instances at once (e.g., suspend/unsuspend/delete)
export function apiFlashcardReviewInstanceEdit(flashcardIds, action, callback) {
  backendLookup('POST', `decks/flashcard/edit-review-instances/`, callback, {
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
  backendLookup('GET', `decks/deck/${deckId}/statistics/`, callback);
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
export async function apiClassroomStudentJoin(
  classroomCode: string,
): Promise<Classroom | Message> {
  return backendFetch('POST', 'teachers/classroom/join/', { classroom_code: classroomCode });
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
export async function apiClassroomStudentsList(
  classroomId: number,
  tzOffset: number,
): Promise<Student[]> {
  return backendFetch('GET', `teachers/classroom/${classroomId}/students/?tz=${tzOffset}`);
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

export function apiStudyAssignment(
  classroomId: number,
  assignmentId: number,
  reviewOverflowBucket: boolean,
  callback: (response: ReviewInstance[], status: number) => void,
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
export interface HistoryAction {
  action: 'INCREMENT' | 'DECREMENT';
  utc_timezone_offset: number;  // in minutes
}
export function apiHabitEdit(
  routineId: number,
  habitId: number,
  newTitle: string | undefined | null,
  newCue: string | undefined,
  newCraving: string | undefined,
  newResponse: string | undefined,
  newReward: string | undefined,
  newNotes: string | undefined,
  historyAction: HistoryAction | undefined,
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
    history_action: historyAction,
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

// Creates a todo
export function apiTodoCreate(
  text: string,
  callback: (response: Todo, status: number) => void,
) {
  backendLookup('POST', 'habits/todos/create/', callback, {
    text: text,
  });
}

// Lists the user's todos
export function apiTodoList(
  callback: (response: Todo[], status: number) => void,
) {
  backendLookup('GET', 'habits/todos/', callback);
}

// Deletes a given todo
export function apiTodoDelete(
  todoId: number,
  callback: (response: Message, status: number) => void,
) {
  backendLookup('POST', `habits/todos/${todoId}/delete/`, callback);
}

// Marks a todo as completed or not completed
export function apiTodoComplete(
  todoId: number,
  completed: boolean,
  callback: (response: Message, status: number) => void,
) {
  backendLookup('POST', `habits/todos/${todoId}/complete/`, callback, {
    completed: completed,
  });
}

// Get review instances to study
export async function apiReviewInstanceStudy(
  deckId: number,
  section: string,
  studyAhead: boolean,
): Promise<ReviewInstance[]> {
  return backendFetch<ReviewInstance[]>('POST', `decks/reviewinstance/study/`, {
    deck_id: deckId,
    section: section,
    study_ahead: studyAhead,
  });
}

// Gets basic info about the user's streak and reviews
export interface StreakInfo {
  streak: number;
  cards_done: number;
  target_num_cards: number;
}
export async function apiStreakReviewInfo(
): Promise<StreakInfo> {
  const utcTimezoneOffset = new Date().getTimezoneOffset();
  return backendFetch<StreakInfo>(
    'GET',
    `profiles/streak-review-info/?utc_timezone_offset=${utcTimezoneOffset}`,
  );
}

// Studies a review instance, updating it with new info and increasing streak etc.
export async function apiReviewInstanceUpdate(
  deckId: number,
  reviewInstanceId: string,
  timeTaken: number,
  gradeResponse: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY',
  editedValues: Interval,
  section: string,
): Promise<Message> {
  const utcTimezoneOffset = new Date().getTimezoneOffset();
  return backendFetch<Message>(
    'PUT',
    `decks/reviewinstance/study/${reviewInstanceId}/`,
    {
      time_taken: Math.floor(timeTaken),
      utc_timezone_offset: utcTimezoneOffset,
      grade_response: gradeResponse,
      edited_values: editedValues,
      deck_id: deckId,
      section: section,
    },
  );
}

export interface PercentComplete {
  id: string;
  percent_complete: number;
  sub_sections: {
    id: string;
    percent_complete: number;
  }[];
}
export async function getDeckSectionsPercentComplete(
  deckId: number,
): Promise<PercentComplete[]> {
  return backendFetch('GET', `skill_tree/mainsection/${deckId}/percent-complete/`);
}
