# 2020

## Aug
### Aug 28
- [X] Make log-in/register modal
- [X] Make global JS API request error handler
  - [X] Show log-in/register modal on 403
- [X] Fix bugs for anon users

### Aug 29
- [X] Make analytics tracking DJ app
- [X] Rename experiment ID to experiment parameters
- [X] Integrate analytics tracking with landing page

### Aug 30
- [X] Add welcome page
- [X] Merge 'landing' and 'pages' apps
- [X] Add real home page
  - [X] Move decks "feed" to sub-page
  - [X] Rename "feed" to better name
- [X] Add "Golden Rules"

### Aug 31
- [X] Make navbar in React
  - [X] Fix for mobile
  - [X] Improve notification icon + fix bugs
  - [X] Fix old and broken login/logout/register links
- [X] Make 'base.html' and 'base-landing.html' the same file

## Sep

### Sep 01
- [X] Add pagination for deck search
  - [X] Limit # of results with fuzzy-wuzzy threshold
  - [X] Add deck search caching
- [X] Add caching to more API views

### Sep 02
- [X] In custom-study:
  - [X] Allow min/max ease to go to +/- infinity
  - [X] Show the deck of flashcard when searching for flashcards
- [X] Freeze field for creating flashcards
- [X] Add daily random tips for the home page

### Sep 03
- [X] Review heatmap https://github.com/kevinsqi/react-calendar-heatmap
- [X] Add streaks
- [X] Add welcome page
- [ ] Add 404 custom page (this is half done)

### Sep 04
- [X] Add more options when studying flashcards
  - [X] Delete card
  - [X] Suspend card
  - [X] Mark as a leech
  - [X] Edit card
  - [X] Alert that card was marked as leech when done automatically

### Sep 05
- [X] Improve deck creation system
- [X] Add deck importing system

### Sep 06
- [ ] Add ToS
- [ ] Add Privacy Policy
- [ ] Flesh out legal structure

### Sep 07
- [X] Finish 20-30 TO-DO's

### Sep 08
- [X] Paginate notifications
  - [X] Make See older notifications work properly
    - [X] Make it left-aligned
    - [X] Align notif icon and profile icon
  - [X] Remove profile information from notification serializer
- [X] Redirect to login when logged out
- [X] Turn flashcard search into GET
  - [X] Optimize it
- [X] Check email availibility
  - [X] API view
  - [X] JS
- [X] Add options for converting imported decks to Alu format ([$$] -> $$)
- [X] Redirect to decks home page after deleting deck
- [X] Add React component for question-bubble tooltip
- [X] Improve code for updating flashcard review info

### Sep 09
- [X] Add Contact Page
  - [X] React
  - [X] API
  - [X] Integrate API into React
  - [X] Integrate React into Django
  - [X] Add Legal version
- [X] Separate functions for getting meta data about deck and for getting flashcard information
- [X] Fix login/register issue LOOK INTO DEV AUTHENTICATION

### Sep 10
- [X] Optimizing APIs
  - [X] Decks
  - [X] Analytics + explore
  - [X] Profiles
- [X] Make sure even if a hacker has access to the API, they cannot do anything they wouldn't normally be able to do

### Sep 11
- [X] Add help pages
  - [X] Tags
  - [X] Leech/suspend
  - [X] Freeze

### Sep 12
- [X] Clean up TODOs
  - [X] Create new TODOs
- [ ] Paginate flashcards list
  - [ ] API
  - [ ] React
    - [ ] Flashcard browse
    - [ ] Study
- [ ] Fix custom study
- [ ] Custom study: Add more options, e.g., review ahead days, increase new card limit, shuffle new cards

### Sep 13
- [ ] Make notification reading work properly in detail
- [ ] Calculate top/hot deck ids daily
- [ ] Break streaks daily
- [ ] Show number of unread notifs in "See Older Notifications"
- [ ] Basic settings page
  - [ ] "expert mode" - disabled tooltips
  - [ ] Add password change page

### Sep 14
- [ ] Add email authentication
  - [ ] Password reset
- [ ] Limit API requests per user
- [ ] Make numeric ids into string ids like "dad2Xadw#1". Look into https://pypi.org/project/shortuuid/
- [ ] Add legal pages
  - [ ] Simplify everything  
- [ ] favicon.ico + Logo

### Sep 15
- [ ] Note taking
  - [ ] Django Model base
    - [ ] Freeform Submodel
    - [ ] Hierarchical Submodel
    - [ ] Cornell Submodel
  - [ ] API
  - [ ] React
    - [ ] Freeform
  - [ ] Sharing

### Sep 16
- [ ] Spread the word