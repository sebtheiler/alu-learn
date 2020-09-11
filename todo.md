Fixes and patches
- [X] Fix bugs for Anonymous users
- [X] Make sure even if a hacker has access to the API, they cannot do anything they wouldn't normally be able to do
- [ ] Protect API

Landing:
- [X] Add statistic tracking
- [X] Prettify registration and sign-in page

Spaced repetition
- [ ] In custom-study: allow min and max ease to go to +- 
- [ ] In custom-study: add more options, e.g., shuffle, lookahead, increase new card limit, etc.

Improvements
- [X] Add pagination for deck search
- [ ] Infinite scroll for browsing flashcards
- [ ] Make numeric ids into string ids like "dad2Xadw#1"
- [X] Fix navbar on mobile
- [X] Make NavBar 100% React
- [X] Improve notification icon
- [X] Make 'base-landing.html' and 'base.html' the same file

Features
- [X] Freeze field in create
- [ ] Pop-up dictionary?
- [ ] Review heatmap
- [ ] Speed focus mode
- [ ] Deck comments


# Current Plan
## Aug 28
- [X] Make log-in/register modal
- [X] Make global JS API request error handler
  - [X] Show log-in/register modal on 403
- [X] Fix bugs for anon users

## Aug 29
- [X] Make analytics tracking DJ app
- [X] Rename experiment ID to experiment parameters
- [X] Integrate analytics tracking with landing page

## Aug 30
- [X] Add welcome page
- [X] Merge 'landing' and 'pages' apps
- [X] Add real home page
  - [X] Move decks "feed" to sub-page
  - [X] Rename "feed" to better name
- [X] Add "Golden Rules"

## Aug 31
- [X] Make navbar in React
  - [X] Fix for mobile
  - [X] Improve notification icon + fix bugs
  - [X] Fix old and broken login/logout/register links
- [X] Make 'base.html' and 'base-landing.html' the same file

## Sep 01
- [X] Add pagination for deck search
  - [X] Limit # of results with fuzzy-wuzzy threshold
  - [X] Add deck search caching
- [X] Add caching to more API views

## Sep 02
- [X] In custom-study:
  - [X] Allow min/max ease to go to +/- infinity
  - [X] Show the deck of flashcard when searching for flashcards
- [X] Freeze field for creating flashcards
- [X] Add daily random tips for the home page

## Sep 03
- [X] Review heatmap https://github.com/kevinsqi/react-calendar-heatmap
- [X] Add streaks
- [X] Add welcome page
- [ ] Add 404 custom page (this is half done)

## Sep 04
- [X] Add more options when studying flashcards
  - [X] Delete card
  - [X] Suspend card
  - [X] Mark as a leech
  - [X] Edit card
  - [X] Alert that card was marked as leech when done automatically

## Sep 05
- [X] Improve deck creation system
- [X] Add deck importing system

## Sep 06
- [ ] Add ToS
- [ ] Add Privacy Policy
- [ ] Flesh out legal structure

## Sep 07
- [X] Finish 20-30 TO-DO's

## Sep 08
- [X] Paginate notifications
  - [X] Make See older notifications work properly
    - [X] Make it left-aligned
    - [X] Align notif icon and profile icon
  - [X] Remove profile information from notification serializer
- [X] Redirect to login when logged out
- [X] Turn flashcard search into GET
  - [X] Optimize it
  - [ ] Cache?
- [X] Check email availibility
  - [X] API view
  - [X] JS
- [X] Add options for converting imported decks to Alu format ([$$] -> $$)
- [X] Redirect to decks home page after deleting deck
- [X] Add React component for question-bubble tooltip
- [X] Improve code for updating flashcard review info

## Sep 09
- [X] Add Contact Page
  - [X] React
  - [X] API
  - [X] Integrate API into React
  - [X] Integrate React into Django
  - [X] Add Legal version
- [X] Separate functions for getting meta data about deck and for getting flashcard information
- [X] Fix login/register issue LOOK INTO DEV AUTHENTICATION

## Sep 10
- [X] Make sure even if a hacker has access to the API, they cannot do anything they wouldn't normally be able to do
- [ ] Limit API requests per user
- [ ] Make numeric ids into string ids like "dad2Xadw#1". Look into UUID
- [ ] Paginate flashcards list

## Sep 11
- [ ] Add password change page
- [ ] Basic settings page
- [ ] Fix custom study
- [ ] Custom study: Add more options, e.g., review ahead days, increase new card limit, shuffle new cards
- [ ] Fix notification issues
  - [X] Error when clicking
  - [ ] Display number of unread in that too
  - [ ] Make notification reading work properly in detail
  - [ ] Make icon display properly

## Sep 12
- [ ] favicon.ico + Logo
- [X] Add help pages
  - [ ] Tutorial
  - [ ] Features
  - [ ] Creating good flashcards
  - [X] Tags
  - [X] Leech/suspend
  - [X] Freeze
- [ ] Add legal pages
  - [ ] Finish privacy policy
  
## Sep 13
- [ ] Deck comments
  - [ ] Model
  - [ ] API
  - [ ] React

## Sep 15
- [ ] Spread the word