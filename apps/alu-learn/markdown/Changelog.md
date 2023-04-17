---
title: "Changelog"
path: "changelog"
description: "Alu Learn Changelog"
---

## AI Improvements - Mon Apr 17 - 2.6.1

Made some minor improvements to auto-flashcards and auto-grader to make them more accurate and consistent.

# Auto-Everything - Tue Apr 11 - 2.6.0

Behind all the hype, AI has legitimate potential to help students learn more effectively, and I wanted to exploit some of that in this update. In the future, I would like to create a completely personalized study assistant who has long term memory of your strengths and weaknesses and can provide targeted support to help you learn new content.

- **Autocomplete Flashcard Back:** Automatically write the back of your flashcard with a single button press
- Fixed subsection ordering when moving flashcard to different subsection
- **Auto-Grader:** Get instant feedback on your essays with auto-grader. Input a rubric and your essay, and see how well your essay would score on that rubric
- **Auto-Flashcards Improvements:** Auto-flashcards is now much quicker and creates higher quality flashcards

## Bug Squashing Galore - Wed Mar 8 - 2.5.1

As the title would suggest, this update cleans up a lot of bugs that have been plaguing Alu for quite some time.

- **Insert Cloze Hotkey:** You may now press Ctrl + Shift + C to insert a cloze deletion
- **Sign-in with Google:** Everyone can now use Google sign-in, even if you created your account before October, 2022, when the option was introduced.
- Various flashcard fixes:
  - Fixed an issue where autosave would cause the editor to lose focus when saving an edited flashcard
  - Fixed an issue where changes when editing subsections would not show the changes until the page was reloaded and an issue where clicking on the subsection edit modal would cause it to close
  - Fixed an issue where flashcards would not appear to be rearranged after moving them
- Studying fixes
  - Fixed a bug where the reviews done indicator would not properly increase after studying a batch of flashcards
  - Fixed a bug where pressing one of the four buttons to self-rate your recall of a flashcard, rather than using the number keys 1-4, would not allow you to select flashcards for the rest of the study session
  - Fixed a bug where the back of flashcards would temporarily display the very first flashcard studied in a session after a self-rated response was selected
- Improved landing page on mobile devices

# Technical Changes & Bug Fixes - Feb 21 - 2.5.0

Alu has undergone some major technical changes in this update in preparation for something _big_. This includes rewriting Alu to function as a monorepo, so that I can develop "sibling" applications that re-use Alu's UI components and other features, updating various outdated packages, and beginning to transition to Next.js 13.

- **Added Student Preview for Teachers:** Teachers can now view their classroom as students do by clicking the "Student Preview" tab on their classroom homepage
- **Fixed Assignment Sub-section Sorting Order:** Sub-sections in assignments are now sorted properly
- **Improved Assignment Display on Mobile:** Assignments are now more responsive and display better on smaller screens
- **Fixed Sub-sections with Essential-only Assignments:** If a teacher assigned a sub-section as not essential only, but you clicked on it through the course's skill tree, it would erroneously only have you study essential flashcards for that sub-section. This has now been fixed.
- **Brought Back Streak Easter Eggs:** Want to know what they are? Better get a high enough streak :)

## Auto-Flashcards in Other Languages - Feb 15 - 2.4.2

Automatic flashcard creation now works in other languages. The display is also now cleaner and no longer includes its former "tabs" that allowed you to select different, rather useless modes.

## Minor Fixes - Feb 13 - 2.4.1

- Ordered students by their last names in teachers' views
- Fixed ordering of sub-sections in the sidebar when creating and moving flashcards
- Weekly summaries against your friends now hard-reset weekly, rather than having a rolling cut off of one week
  - Fixed formatting for long names and flashcard amounts
- Independent courses are no longer shown when you are also enrolled in a class for that course. This should ideally reduce confusion for students
- Studying an assigned sub-section will now only show essential flashcards from that sub-section

# Evaluating New Spaced Repetition Algorithms - Feb 2 - 2.4.0

I'm working on a study to evaluate several new spaced repetition algorithms for Alu, including FSRS and Ebisu. The changes are mostly hidden for now, but will soon be available to everyone.

# Auto Flashcards - Dec 15 - 2.3.0

Alu now has the power to automatically transform your notes into flashcards! Navigate to Alu's auto-flashcards page in the navbar, then simply paste your notes into its generator.

# Better Sharing, Friends, & Referrals - Nov 13 - 2.2.0

Alu is more social now! It's easier to share courses, keep track of your friends, and invite new users.

- **Improved Sharing System:** Reworked the sharing system to be much simpler and allow for easier collaboration when working on courses. Click the "Share" icon on the left of a course that you own to start sharing it.
- **Friends:** You may now add friends on Alu and compete against them in a weekly leaderboard. If you choose, you can also share your courses with only your friends.
- **Referrals:** Want pro mode but don't want to pay? Invite new users using your referral link and earn a free week of pro mode for each user who signs up.
- **Autosave When Editing Flashcards:** Changes made to flashcards when editing are now saved automatically. You may still press the check to save manually, but this is no longer required.
- **View & Study Starred Flashcards:** You can now view and study starred flashcards. Click "Tools > Starred Flashcards" from a course page. As before, star a flashcard by pressing the star button when studying.
- **Fixed "Study Again":** Fixed a bug that caused responding to flashcards to break after you press "study again"
- **Fixed Username Bug on Sign-up:** Fixed a bug that caused Alu to not properly infer a username from one's email on sign-up
- **Added Reviews Done Display to Course Sidebar:** The "reviews done" display and other elements of the home sidebar now appear on course pages

## Studying Hotfix - Nov 8 - 2.1.1

Fixed a bug that caused client-side crashes when studying some flashcards

- Fixed bug in studying
- Changed the save icon when editing flashcards from an eye to a check
- Fixed an unintentionally disabled spell check when creating flashcards

## Emails - Oct 31 - 2.1.0

- **More Emails:** Alu now sends more emails in an attempt to increase user retention
  - Each week you will now receive a progress report of how much you used Alu that week
  - Alu now sends a series of emails to new sign-ups to showcase the full extent of its power
  - Alu will also send you a _long-term_ reminder if you haven't used it in two weeks. This will only be sent a maximum of once per six months, as not to spam you.
- **Cloze Hints:** You can now add "hints" to clozes that appear when studying
- **Added Flashcard Reporting:** If you find an error in a flashcard in a shared course, you can now click the report button in the bottom left to report it
- **Fixed Cloze Deletion Bold:** Fixed a bug that caused inactive cloze deletions to still appear as bold
- **Fixed Numbered List Display**
- **Moved Sharing Button**
- **Added Ability to Move Flashcards Between Subsections**

## Minor Fixes - Oct 18 - 2.0.5

- Fixed text slugs in sections
- Fixed SVGs in flashcards
- Added error message when there's a failure to upload an image
- Fixed the link in the reminder email
- Fixed a bug that caused some flashcards to crash when viewing them in a list
- Fixed a bug that caused some courses to not load properly

## Essential-only Assignments - Oct 14 - 2.0.4

- Teachers can now create assignments for flashcards only tagged as "essential"
- Fixed a bug where pressing "again" when studying would not move a flashcard to the end of the current rotation
- Fixed a bug with flashcard content overflowing the flashcard

## Tiny Fixes - Oct 08 - 2.0.3

- Added an error message for users who try to join a classroom with an invalid code
- Improved landing page display on mobile
- Fixed scheduled based tasks (e.g., resetting streak, sending reminder emails)

## Search for Flashcards - Oct 06 - 2.0.2

Added a search flashcards page where you can search for flashcards in a course. You access the search page by clicking "More > Search Flashcards" for a course.

- Added search flashcards page
- Fixed ordering of courses on home pages
- Fixed bug in creating sub sections. There is still a bug in deleting/editing sub sections, which I'm working on resolving soon.
- Fixed flashcard link insertion dropdown to show previews of flashcard fronts, not backs
- Fixed explore page on mobile
- Fixed sign in infinite redirect bug
- Fixed review heatmap message for when you haven't studied any flashcards
- Fixed flashcard edit options erroneously appearing when you could not edit a flashcard
- Re-added bottom margin to paragraphs in the rich text editor

## Minor Sign-in Fixes - Oct 05 - 2.0.1

A couple of quick fixes for Alu 2.0, with a focus on signing in/up.

- Fixed social media images in emails
- Fixed back button on course pages when the user is signed out
- Fixed name entry when a user signs up with their email
- Fixed redirecting on sign-up
- Fixed explore page and user page course ordering
- Fixed most instances of image width overflow
- Automatically redirected logged-in users on the sign-in page to the home page
- Improved sign-in email sending to have date in subject line

# Alu 2.0 - Oct 04

The biggest update in Alu's history has arrived!

Alu's codebase has been entirely rewritten from Django to Next.js, improving performance, SEO, ease of updates and reducing common bugs. This update features a complete UI overhaul, including newly designed buttons, modals, and more. Flashcard studying has also been improved, with better animations and a satisfying noise for each flashcard you get correct.

Decks are now referred to as courses and will soon have the ability to contain more than just flashcards...

Here's a (mostly) full list of changes:

- **Skill Tree Redesign:** Alu's skill tree has been redesigned to feel more fun and modern. All flashcard progress is transferred to the new skill tree
- **Course Page Redesign:** The course page has been redesigned to have a more modern feel
- **Changed Paragraph Breaks:** Paragraph no longer have a bottom margin. This makes the editor more consistent with other editors, such as Google Docs.
- **Custom Styled Components:** Alu now has more beautiful, custom UI components
- **Alu Bot Game:** Study the fun way by "texting" Alu Bot with your flashcards
- **Switched to Next.js:** Alu's code base is now completely written in Next.js + React. This was a monumental undertaking, but should pave the way for a better Alu
- **Switched to Lexical:** Alu's rich text editor is now built using Lexical, rather than Slate. This should greatly reduce the number of errors that occur when creating flashcards.
  - **Improved Images:** You can now attach multiple images to each flashcard. Old images that were previously broken have now been fixed
  - **Share with Institution:** You can now share courses
  - **Improved Equations:** Alu now has a built-in equation preview feature, making it much easier to write LaTeX equations
  - **Improved Cloze:** Cloze flashcards now have a modern, colorful editor that makes it easier for beginners and advanced users alike to use cloze. Numerical cloze (e.g., {{c1::example}}) is still supported, but not recommended
- **Automatic TTS:** You can click the audio button when studying flashcards to hear a TTS narration of that flashcardA
- **Creation Sidebar:** There is now a sidebar that allows you to easily switch between sub sections when creating flashcards.
- **Simplified Sharing System:** The old sharing system was ridiculously complicated, leading to a constant source of bugs. The new sharing system has been designed to be as easy as possible for everyone to use. Some of the old sharing system's capabilities are no longer available (e.g., remixing decks), but will be re-added shortly
  - You no longer need to fully copy a deck to study it; rather, multiple review instances from different users can be attached to a single flashcard
- **Improved Mobile Responsiveness:** Improved Alu's responsiveness to mobile devices, improving the mobile experience
- **New Landing Page:** Alu has a new landing page, complete with an interactive demo and testimonials from real Alu users
- **Improved Teacher's Interface:** Teachers now have more information about how their students are using Alu; the classrooms UI has been redesigned to simplify the process of setting up a classroom
  - **Join Classroom Link:** Teachers can post a join classroom link that allows students to join their classroom without manually entering the join code
- **No More Passwords:** Alu no longer stores passwords in its database. This is more secure and eliminates the chance of you forgetting your password. You can now sign-in with Google authentication or with "magic" email links. One less password to remember!
- **Improved Welcome Info:** Improved the welcome info collection upon sign-up.
  - Added multiple options to type of social media (Instagram, Reddit, TikTok)
  - Changed interface to display large buttons with icons rather than a list
  - Removed timezone question (Alu automatically figures this out)
  - Added choice between creating your own deck or copying an existing one
- **Fixed Logo:** Fixed the Instagram logo under the "Follow Alu" section
- **Fixed Partnered Organizations Pro-mode:** Fixed a bug that caused users from partnered organizations not to receive pro-mode when signing up

# Marketing Research - May 18 - 1.0.5

Added the option to opt-out of marketing research emails (e.g., feedback surveys). Everyone who studied flashcards for a past AP exam will also receive a quick feedback survey about how Alu has impacted them.

# Fixed Playing Games with Tags - May 05 - 1.0.4

Good luck on your AP Exams!

- **Fixed Playing Games with Tags:** Fixed a bug that caused an error when attempting to play games (Deck > Games) with flashcards from a tag search.

# Minor Fixes - Apr 30 - 1.0.3

- **Email Bugs:** Fixed some bugs regarding emails and capitalization
- **Fixed Email Color Scheme:** Fixed the color scheme of emails to now be up to date with the rest of Alu

# Added Tags Display - Apr 25 - 1.0.2

- **Flashcard Tags:** Flashcard tags now display when studying.
- **Fixed Adblock Bug:** Fixed a bug caused by some adblockers on sign-up.

# Tiny Display Fixes - Apr 15 - 1.0.1

Tiny fixes and improvements to the display.

- **Changed Color of Tip:** Changes the color of the tip on the home screen to be light purple instead of light blue
- **Improved Social Media Icons:** Improved the social media icons to display better on small screens

# Launch - Apr 14 - 1.0.0

Alu has launched! We look forward to new users from around the world.

To celebrate the occasion, we've revamped the color scheme

- **Added Editing Button When Studying:** There is now a button to easily edit flashcards when studying.
- **Added Essential Only Toggle to List:** Added a toggle to only view essential flashcards in a list. This adds to the essential only feature in the last update that allowed you to study essential only flashcards.
- **Fixed Bug with Long Image URLs:** Fixed a bug when trying to upload images from a source with a very long URL.
- **Fixed Markdown Rendering:** Fixed markdown rendering, including shared deck descriptions
- **Fixed Section Order in Shared Decks:** Fixed a bug that screwed up section order in shared decks
- **Added "Study All" to Assignments:** You can now study all sections in an assignment at once
- **Changed Page Title Scheme:** Page titles are now slightly fancier, with bars "|" instead of "at"
- **Login With Email:** You can now login with your email instead of your username
- **Improved Login Error Messages:** Improved the error message when a login fails to help users who have forgotten their passwords or usernames.
- **Added Mini-Tutorials:** Added a series of popups that serve as mini-tutorials for new users, and as guides to new/advanced features for returning users
- **Center-Aligned Shared Deck Subsections:** Center aligned subsection titles in shared decks.
- **Revamped Color Scheme:** Purple.

# Final Fixes - Mar 02 - 0.8.14

Next update is launch. Finally.

- **Share Imported Decks:** You can now share decks that you've imported. This previously did not work due to a bug.
- **Alphabetically Ordered Decks:** Decks are now ordered alphabetically on the homepage
- **Scheduler Fuzz:** There is now a slight _fuzz_ to the flashcard scheduler for long intervals. This will decrease the probability of flashcards all lumping up on a single day.
- **Essential Only:** Added an "Essential Only" option to assignments.
- **Made Assignments Editable:** Teachers can now edit the assignments they create.

## Streak & Reminder Email Fix - Feb 13 - 0.8.13

...

- **Fixed Streak Resets:** Streaks will now properly reset at midnight.
- **Fixed Reminder Emails:** Reminder emails will now be properly sent at 6 PM to everyone signed up.
- **Fixed Settings:** Fixed a bug that broke settings changes.

## Final Fixes - Dec 29 - 0.8.12

New Year's.

- **Fixed Habits Streak Display:** Fixed habits streak display to no longer show streak icons on neutral habits
- **Fixed Flashcard Divider Line:** Fixed the line that divides the left and right of flashcards in a list to be the full height
- **Fixed Flashcard Number Display:** Fixed flashcards' displayed numbers to now properly increment with each flashcard
- **Fixed Flashcard List Order:** Fixed flashcard list order to be based on the flashcards' subsection and mainsection, rather than simply the order number
- **Improved Registering:** Improved autocomplete functionality and added a strength bar to the password field
- **Added Report Buttons:** Added buttons for reporting harmful shared decks and users
- **Fixed Profile Deck Order:** Decks on a profile-page are now properly ordered number of clones

## Shared Deck Hotfix - Dec 08 - 0.8.11

Quick hotfix for shared decks.

- **Fixed Image Sharing in Flashcards:** Fixed a bug that caused sharing a deck to fail if flashcards contained images
- **Fixed Friends Sharing Setting:** Fixed a bug that caused sharing a deck with friends to not allow the owner themselves to edit the deck

## Still Getting There - Dec 05 - 0.8.10

I promise we're getting closer to launch this time. Close now. For real.

- **Fixed Percent Complete Caching:** Fixed a bug that caused percent complete caching to not be properly cleared
- **Added Image Descriptions & Original URLs:** Added an optional field to add descriptions for images and their original URLs. This is useful for adding clarification, and for legal copyright purposes.
- **Shuffled Flashcard Order:** Shuffled the order of flashcards when studying to avoid repeats
- **Improved Quizlet Importing:** Improved Quizlet import to allow for flashcards with multiple lines (Quizlet _oddly_ exports flashcards with return-breaks as multiple lines rather than escaping the character with `\n`). Also added a short demonstration video.

## Reversed Flashcards Hotfix - Nov 10 - 0.8.9

- **Fixed Titles with Dashes:** You can now use dashes in titles for main sections and sub sections.
- **Fixed Reversed Flashcards:** Fixed a bug that caused basic-and-reversed flashcards to only display in a single direction

## Getting There - Nov 07 - 0.8.8

Launch? We'll get there.

- **Fixed Flashcard Rendering:** Fixed a couple of issues with flashcard rendering in lists
  - **Whitespace:** Fixed a slight bug that caused some whitespace on the tops of flashcards
  - **Divider:** Fixed a bug that caused the divider for flashcard sides not to reach the bottom if the right side was longer than the left side
- **Fixed Cloze Editing:** Fixed a bug that caused both fields of the flashcard to appear when editing clozes
- **Added Study/View Buttons:** Added more obvious study/view buttons for main sections and entire decks, to clarify possible actions
- **Fixed Image Uploading:** Fixed image uploading. It also uses a CDN now, making it significantly faster and more efficient
- **Fixed Deck Title Overflow:** Fixed a bug that allowed a deck's title to overflow its selector on the left side of the screen
- **Added Number of Copies Counter:** Added a number of copies counter for shared decks
- **Changed Explore Page Mechanism:** Changed the Explore Page's backend to automatically display the most copied deck
- **Fixed Studying Timezone Issues:** Fixed various issues regarding studying and timezone
- **Changed Default Flashcards per Day:** Changed the default flashcards per day to 20

## More Small Bug Fixes - Oct 26 - 0.8.7

More fixes. That's it. More features (and public launch announcements!) coming soon. For real this time...

- One month ago: Alu is publically launching in 3 days!
- Today: Alu is publically launching in 5 days!

- **Improved 404 Page:** Improved the 404 page with an easier link to get back home
- **Fixed Review Heatmap:** The date wasn't correctly appearing when hovering a square on the review heatmap
- **Fixed Studying Repeat Bug:** Fixed a bug where pressing "Again" sometimes caused the same card to be displayed twice
- **Improved Studying Order:** Improved the studying order of flashcards when studying an entire deck. Now, new flashcards are always shown in order of main section and sub section, rather than displaying them all at once.

## Scheduling Algorithm Fix - Oct 18 - 0.8.6

Small fix to the scheduling algorithm.

- **Fixed Late-night Studying:** Fixed a bug that caused studying to break after 10 PM.

## Small Bug Fixes - Oct 17 - 0.8.5

Fixes. That's it.

- **Fixed Flashcard Editing:** Fixed a bug that caused the flashcard editor to redirect to creating a new flashcard
- **Fixed Assignments Uncaching:** Fixed a bug that caused teachers' assignments to not uncache when they changed the selected classroom
- **Fixed a Bug in the Scheduling Algorithm:** Fixed a slight bug in the scheduling algorithm
- **Improved Email Changing:** Improved error handling for email changing, so you get more descriptive messages when you take an invalid action (like changing your email to an email that is already in use)
- **Slight Improvement to Studying Backend:** You can now technically have multiple copies of a deck attached to a classroom, which will at least suppress some errors

## Assignments, Merging Decks, & More Features - Oct 12 - 0.8.4

Getting closer to final launch!

You can now **merge** a deck that remixed from another deck with the original deck, pulling all changes that have been made since the deck was remixed. This is an essential feature for Alu's continually developing sharing system, as it allows remixes to work more effectively.

- **Assignments Students Frontend:** There is now a pretty interface for students to study assignments, as well as a percent complete tracker
- **Added Progress Tracker for Teachers:** Teachers can now see students' progress in assignments
- **Fixed Caching Assignments:** Fixed assignments and students caching, so that it now properly resets when you click on a different classroom
- **Fixed Settings Bug:** Fixed a bug that allowed you to submit a blank value in settings
- **Added Total Percent Complete:** In compliment to the blue percent complete tracker that shows how many flashcards you currently have memorized, there is now a green percent complete tracker that shows how many flashcards have memorized in total
- **Added Deck Archiving:** You can now archive decks that you are no longer using
- **Fixed Games:** Games now work again!
- **Removed Outdated Help Pages:** The majority of the help pages were outdated and have been removed
- **Added "Mixed" User Type:** You can now set yourself to the "Mixed" user type to be able to both create and join classrooms
- **Added Shared Deck Merging:** You can now merge a shared deck with the deck it was remixed from, getting the new set of changes
- **Added Spinner for Studying Loading:** There is now a spinner that activates when you click study, preventing you from accidentally clicking the button multiple times

## Classroom Fixes & Identicons - Oct 05 - 0.8.3

Classrooms are getting closer to final release with a bunch of improvements and fixes to the current system. This update is mostly just fixes, but also introduces "remixing" shared decks to create a totally new "branch," and gives everyone a unique identicon for their profile picture.

- **Added Assignments:** Teachers can now assign sub sections to their classes
- **Improved Student List:** Improved teachers' displays for students in their class
- **Added Identicons:** You now have a slightly more personalized profile picture in the top right. This is completely unique and based on your username. In the future, you will be able to further customize your profile picture.
- **Added Deck Remixing:** You can now **remix** decks, allowing you to create a new shared deck from a copied deck, rather than updating the original deck. This allows you to create a completely new copy of a shared deck, that others can independently contribute to, rather than everything being tied to the original shared deck. Classrooms also use this feature to allow teachers to "reshare" shared decks.
- **Added Flashcard Delete Button:** Added a trash can icon to flashcards when viewing them as a list. This makes deleting multiple flashcards much easier.
- **Fixed Flashcard Deleting:** Fixed an error message that occured when trying to delete flashcards in a local copy of a shared deck
- **Fixed Special Characters in Titles:** You can now have special characters (like ampersands) in the titles of sub sections and main sections
- **Fixed Image Loading from URLs:** You can now load images directly from a URL, rather than having to download the file manually
- **Fixed Issue with Flashcard Links:** Fixed an issue where Alu would crash if a flashcard link linked to a deleted flashcard.

## Flashcard Links - Sep 28 - 0.8.2

Flashcard links! You can now format text in a flashcard to provide a link to another flashcard. When hovering over this text, you will be able to see a preview of the linked flashcard.

- **Added Tooltips to Editor Options:** There are now tooltips for each formatting option in any rich text editor.
- **Flashcard Links:** Flashcard links allow you to preview other flashcards when studying, filling in context and skipping the need to repeat text.
- **Improved Landing SR Image:** Improved the landing page's spaced reptition image to use one that I personally made and matches the general art style.
- **Classroom Fixes:** Classrooms are still mostly broken, but as Alu hurdles towards official launch I am doing everything I possibly can to get them wroking again.
  - **Fixed Classroom Deck Attaching:** Teachers can now attach decks to classrooms again.
  - **Fixed Student List Rendering:** There is now a list of students in a classroom for teachers. This list is extremely rudimentary and I'll improve it in a few days.

## Explore and Profiles Fix - Sep 23 - 0.8.1

Minor fixes.

- **Fixed Explore Page:** The explore page now properly shows a list of shared decks.
- **Fixed Profile Page:** Users' profile pages now properly show a list of their shared decks.
- **Fixed Flashcards Progress Indicator:** Before, if you studied too many flashcards, the bar indicating your progress would leave the ground (lol). Now the y-range scales to show all the flashcards you've done today.

# Skill Tree, Sharing System, and Other Words that Start with "S" - Sep 21 - 0.8.0

I've completely revamped Alu in this update, redoing the way that decks are organized and the way you study them.

Decks are now organized into **skill trees** which contain sections for each unit. Each section contains sub sections, which correspond to different sub units. You can study and view flashcards for each section and sub section individually, giving you more control over how you study your deck. Each section also has a "percent-complete" indicator that shows you how much of that section Alu estimates you have memorized.

I've also completely changed the way that studying works: instead of studying all the flashcards due for a deck at once, studying is now broken up into digestible **bites** of 20 flashcards at a time. With this new method of studying, you can now study in small bits multiple times, rather than having to review a huge number of flashcards in a single sitting. At the end of every study session, you can see an increase in the number of flashcards you've done that day as you work towards your new, customizable **daily goal**.

To accomodate for these huge changes, I've completely redesigned Alu's home page. You will now have a list of your decks and classes on the left-hand side, rather than them being isolated in a different page. On the right-hand side, you will see your specified daily goal and how much progress you've made towards reaching it.

Last (and probably least), the navbar is black instead of blue.

Other changes:

- **Revamped flashcard fields:** Flashcards have been redesigned to be faster to load and easier for me to develop.
- **Revamped deck editing:** Removed all the arbitrary options from deck editing and streamlined the process of both editing and creating new decks.
- **Removed Notes and Tasks:** It's sad, but no one ever used either and they were always broken. Farewell notes! Tasks _might_ come back in some form in the future, but don't count on it.
- **Removed notification about login:** It was literally just spam. In the future, notifications will be reserved for more important things.

---

## To-dos & Revamped Tutorial (DEVELOPMENT) - Jul 13 - 0.7.3b

The tutorial for _Habits_ has been completely revamped to be less confusing, easier to use, and more instructive. On top of this, _Habits_ now has a subfeature: To-dos. To-dos is automatically populated with a couple of starting points after finishing the _Habits_ tutorial to give you an idea of what to do next.

Note that 0.7 has progressed from alpha to beta, as I am now beginning to share it with some of you (not that "you" are reading this, because no one reads the changelog, so I'm essentially writing to myself).

- **Revamped Habits Tutorial:** Completely redid the _Habits_ tutorial to be more in-depth, and give clearer instructions. It is now "full-screen" instead of an "embed."
- **Added To-dos:** There is now a to-do list on the right side of the _Habits_ page with, well, to-dos! Four to-dos are automatically populated after you finish the tutorial, giving you a place to go.
- **Added Habits Mobile Support:** _Habits_ now supports mobile devices, including phones and tablets. It isn't perfect, but it's usable now.
- **Added Close Button to Habits:** Added a simple close button to the bottom of each habit, for clarity's sake. You could already close habits by clicking their top bar (and still can), but this is another option.
- **Moved Re-arrange Habit Buttons:** There are now up/down arrows to click on the habit's top area, instead of the old gray buttons.
- **Moved Rename Habit Button:** Rename is now a separate button (where re-arrange used to be), rather than being activated by clicking on its title.

## Slight Habit Changes (DEVELOPMENT) - July 08 - 0.7.2a

A couple of minor wording changes and loading button improvements.

- **Wording Changes:** Slight wording changes to the _Habits_ tutorial
- **Internal Code Refactoring:** The code for _Habits_ is more clean and tested now. This might contribute to saving a couple of milliseconds every time you load the page. If it saves 3 milliseconds per refresh and you open _Habits_ an average of once per day for the next 10,000 years, this will save 30 seconds in total (thank me later).

## Habit Tutorial & Streaks (DEVELOPMENT) - July 03 - 0.7.1a

This update introduces two major features: a tutorial for _Habits_ and the ability to mark habits as completed for a day.

If you haven't already started with Habits, there is now a welcome tutorial when you first open it. This guides you through the goals, methodology, and philosophy of _Habits_. You can also now mark a habit as completed/avoided for the day by clicking the circle icon on its right.

Note that _Habits_ is still heavily under development, and there are plenty of improvements to be made.

- **Added Habit Tutorial:** Added a tutorial for _Habits_ that guides you through what it does and how to set up your first routine and habits.
- **Added Habit Streaks:** You can now mark a habit as complete/avoided for the day. This increments the habits streaks count, which you can view in its details. It also contributes towards your user streak, and you can now see the number of habits you completed on a given day using the review heatmap.
- **Added Tooltips:** Added a couple of tooltips to the four stages of the habit cycle and to the strategies for building/breaking the habit, for ease of reference.

# Habits (DEVELOPMENT) - June 01 - 0.7.0a

Note: this is a highly experimental feature and is only available if you opt-in to it. Also note that this is version 0.7a, not 0.7.

Habits aims to be an easy way to build good habits and break bad ones. I'm honestly not going to elaborate any further, because (a) no one reads the changelog, and (b) it is still under development.

- **Added Habits:** If _opted in_, there will be another option on the home sidebar to access Habits.
- **Added Dev-Opt-In Setting:** You can opt into development features by checking this in settings.

## End of Line - June 01 - 0.6.6

In the final minor version of Alu v0.6, I've made the hard decision to deprecate Notes.

Notes has been a feature of Alu for quite some time, but it never gained the same sort of traction that Decks did. As of today, you can no longer create new notes, however, you can still access all existing notes. Sometime during the summer, all notes will be deleted.

The next major release of Alu, v0.7, will introduce an entirely new feature to fill the lacuna: Habits.

- **Deprecated Notes:** Notes has officially been deprecated - you can no longer create any new notes. Only a handful of people ever used Notes, it's always been riddled with bugs, and it's just no match for a full text editor like Google Docs or Obsidian. If you currently have any notes, they are still available, but please back them up soon. Notes will officially be deleted sometime in the summer.
- **Removed Undo/Redo Buttons:** In the interest of making Alu more slick, I've removed the undo/redo _buttons_ from all rich text editors. Note that you can obviously still undo and redo with Ctrl+Z and Ctrl+Y, it's only the buttons that are gone.
- **Fixed Custom Study Editing:** Fixed a bug that prevented Custom Studies from being edited.
- **Fixed Selected Decks Editing Bug:** Fixed an issue that prevented you from being able to edit which decks were selected on a custom study.
- **Fixed Flashcard Create Freezing:** Fixed an issue that caused the flashcard create editor to crash if you enabled the freezing of the front/back field. There's still another issue with when the backside has a bulleted list, but I can't figure that one out at the moment

## Running Out of Quirky Names - May 21 - 0.6.5

I'm running out of names for minor updates.

- **Links in Flashcards Open in New Tabs:** Links in flashcards/notes now open in new tabs.
- **Fixed Flashcard Buttons Not Appearing in Browse:** Fixed an issue where flashcard edit buttons didn't appear when browsing. (first there was an issue where buttons incorrectly appeared on shared decks, then there was an issue where they didn't appear when searching, and now there's an issue of them not appearing when browsing - this is the last one, I promise).
- **Improved Deck Already Updating Error:** A while ago, I introduced a feature that prevented you from accidentally triggering two updates at once for a deck. This succesfully prevented quite a few errors, but the error message it produced was quite ugly. It now produces a much more appealing error, instead of literally crashing.
- **Fixed Username In Password Reset:** Fixed an issue where your username didn't properly render in password resets.

## Cram - May 16 - 0.6.4

With the AP tests approaching, I decided it might be nice to have an easy way to "cram" before the tests. You can access this new "game" (it's only considered a game because I have nothing better to label it as), by going to your decks homepage, then clicking "Other > Games" and changing the game type to "Cram".

When cramming, you are shown flashcards as usual, however, the reviews are much shorter in duration (only takes a few minutes instead of multiple days) and they won't affect your regular scheduling. You can cram flashcards as much as you'd like, without any limits.

Note about Alu v0.7: I had originally planned for v0.7 to be a huge rework of studying, but the AP exams are so soon there's no point in adding it now. What was planned for v0.7 will be moved to v0.8 and I'll implement it over the summer. The new v0.7, though, will be just as huge a new feature. Something to do with habits...

- **Added Cram Game:** Added a cramming "game" that allows you to study as many flashcards as you want. This is intended to help people study outside of normal schedules, especially as we approach the AP Tests.
- **Fixed Password Reset Case-Sensitivity:** Updated password resets to no longer be case-sensitive when asking for email addresses.
- **Improved Autocomplete for Assignments:** Improved autocomplete for when teachers are creating assignments. If the assignment title contains "essential" in it, Alu will now automatically fill the tag query to be: "Unit # AND essential".
- **Unfriend Confirmation:** Added confirmation before removing a user as a friend, to prevent accidentally unfriending someone.
- **Removed Unnecessary API Request:** Fixed a bug that caused Alu to look for a list of your friends every time you opened the homepage, rather than just when you clicked the friends dropdown. This will marginally increase loading speeds.
- **Added Formatting Shortcuts:** When writing flashcards/notes, you can now use shortcuts to automatically format the text. You can use "\*", "-", or "+" to automatically create a bulleted list, "1." to create a numbered list, "$$" to create a math block, and 1-6 "#"s to enter that level of heading.
- **Fixed Search Button Bug:** Fixed a bug that caused buttons on flashcards that appeared when searching to not appear.
- **Prevented Multiple Clones of Decks:** You can no longer clone a deck multiple times (the only times people ever did were by accident).
- **Fixed Issue With Flashcard Searching Decks:** The links to flashcards' decks when searching were broken.

## Overflow Bucket - May 03 - 0.6.3

This update adds a key new feature: the "Overflow Bucket."

Before, if you missed a day of studying (or didn't study all of the flashcards in that day), all of those flashcards you missed would pile up for the next day. This could quickly become overwhelming, detering you from studying. The Overflow Bucket attempts to fix this.

Now, when you go to study a deck, you will _only_ see flashcards that are due that day. After you finish all of the flashcards due that day, you will be able to review flashcards that were due before that day through the Overflow Bucket. This ensures that (a) flashcards don't pile up too high and become overwhelming and (b) you keep remembering flashcards that are due, since it is assumed you have already forgotten many of the flashcards in the Overflow Bucket.

If you don't see the Overflow Bucket it means that you are completely caught-up on your reviews.

- **Added Overflow Bucket:** After studying all of your flashcards, you will be able to review flashcards that were due previously but you didn't review.
- **Removed Flashcard Buttons on Shared Deck:** Removed buttons that existed when you were browsing the shared copy of a deck you owned, since they couldn't be used anyways. Also added marginally more padding beneath the "tags" list.

## Moar Fixes 'n' Stuff - May 02 - 0.6.2

The long awaited sequel to Fixes 'n' Stuff: Moar Fixes 'n' Stuff!

Yeah, nothing too special today, just a couple of fixes. It's my birthday, but no one reads the changelog so I guess that will stay unknown. "What did you do for your birthday? Make flashcards))"

- **Improved Automatic Image Pasting:** The ability to paste an image link and have it directly appear has been improved, as it now recognizes all-capital extensions as well (e.g., .PNG instead of just .png).
- **Fixed Issue With Friend Links:** Fixed a longstanding issue with friend links directing to a 404 page. They now properly lead to the user's page.
- **Fixed Issue With Flashcard Editing Title:** The title of the tab used when editing a flashcard was previously "Creating a new flashcard...", but has now been changed to "Editing flashcard..."
- **Added Lock to Deck Updating:** Added a lock to deck updating so that you can't accidentally initiate two updates at once.
- **Mandated Lowercase Tags:** Tags should always be lowercase, so that uppercase words are reserved as logical operators (AND/OR/NOT). You can now no longer make tags lowercase when editing or creating flashcards.
- **Changed ToS (Extremely Minor):** Some of the information in the Terms of Service was outdated, like Alu's URL, so I've updated it.
- **Made Flashcard Search Results Distinct:** There was previously a chance that the same flashcard could appear multiple times when searching. This has now been fixed.

## Fixes 'n' Stuff - Apr 11 - 0.6.1

A bunch of random fixes and improvements. A huge number of improvements will come in Alu v0.7, so the rest of v0.6 will probably be slight fixes like this one.

- **Removed Strikethrough:** There was absolutely no reason for strikethrough formatting to exist in creating flashcards or editing notes. No one, including me, has ever used it.
- **Added Keyboard Shortcut for Inline Math:** You can now use ctrl+= (or command on MacOS) to toggle writing inline math equations.
- **Fixed a Bug In Studying:** Fixed a bug that caused studying to break if you studied a certain number of seen cards, then decreased your daily seen card limit to a number less than the number of seen cards you already studied.
- **Fixed a Bug With Seen Flashcards:** Fixed a bug that caused seen flashcards to not get properly reset every midnight.
- **Added a Couple Streak-based Easter Eggs:** See if you can find them...
- **Added Bulk Tag Renaming:** You can now rename flashcard tags in bulk, similar to how you could previously add or delete tags in bulk. This system isn't perfect, but it works well enough for now.
- **Improved Quick Feedback Questions:** I can now send out multiple choice feedback questions, as opposed to the previous Yes/No or Likert scales, helping you help me influence the future of Alu.
- **Fixed Deck Editing:** Fixed an issue that prevented you from editing a deck without displaying the "Advanced Options."

# Less Stress - Apr 05 - 0.6.0

Alu v0.6 is all about making studying easier, more enjoyable, and less stressful. The next major version, v0.7, will be released sometime in April with massive changes to studying. Until v0.7 is released, v0.6 will release a bunch of tiny and iterative changes improving studying.

In this update, I've added settings for controlling how many flashcards you see per day in assignments. You can access these settings by clicking the cog/gear icon next to the class you want to edit. If the amount of flashcards Alu gives you feels overwhelming, you can decrease the number of new flashcards per day, the maximum number of old flashcards per day, or change the deck to a simpler difficulty.

This update also adds "quick feedback questions." Occasionally, you will find quick questions on the top of your homepage so that you can provide quick and easy feedback about Alu.

- **Added Settings for Classroom Studying:** You can now control the specifics of how many flashcards are shown to you when studying assignments for a classroom. You can access these options by clicking the cog/gear icon next to the classroom title. If you're feeling overwhelmed, lowering these values will make Alu give you fewer flashcards. This feature was previously limited to just decks but has no been expanded to classrooms as well.
  - **Rearranged Deck-like Options:** The "advanced options" are now hidden by default when editing deck-likes to make it less confusing for new users.
  - **Added Option to Control Max Seen Flashcards per Day:** When editing decks/assignments/custom-studies, you can now change the maximum number of previously seen flashcards per day. It defaults to 200, which is probably right for most people, but you can lower it if you have too many flashcards to review and get overwhelmed or increase it if you want to memorize with Alu better.
  - **Added Tooltips When Editing Decks:** There are now tooltips explaining all of the advanced options when editing a deck.
- **Fixed Tiny Studying Bug:** Fixed a slightly ridiculous bug that allowed you to press "zero" on your keyboard as a valid response when rating your performance on a flashcard instead of the usual 1, 2, 3, and 4.
- **Changed Reminder Email:** The reminder email's wording was a bit annoying, so I changed it.
- **Fixed Streak Icon For Long Streaks:** The icon for displaying your streak was overflown if you had a streak greater than 100. It's now fixed to dynamically make the text smaller if your streak gets longer than 100. It'll break again if anyone's streak surpasses 1,000, but I should have at least 2.5 years to fix that.
- **Added JSON Importing/Exporting:** Added the ability to export decks to downloadable JSON files and then import those JSON files back into useable decks. This probably won't be a very widely used feature, but it is useful in some situations, and I need it for prototyping the next big update...
- **Added Quick Feedback Questions:** There will sometimes be quick questions on the top of your homepage designed to get feedback about a feature in Alu. These are entirely optional, but I would really appreciate it if you could fill them out to help guide Alu's future development.

## Flashcard Rearranging Fixes - Mar 20 - 0.5.5

I've fixed a couple of tiny issues involving flashcards, the biggest one being a fix to an old bug that stopped flashcards from being rearranged if another flashcard was deleted.

- **Fixed Flashcard Rearranging:** Fixed a longstanding bug where deleting flashcards would break the ability to rearrange flashcards in a deck.
- **Fixed Flashcard Search Bug:** Fixed a tiny bug that caused the "Load More Decks" button to appear even when there were no more decks to load or before any search had been made.
- **Fixed Flashcard Number Displaying:** Fixed a bug that caused flashcards displayed when searching (and on shared deck preview pages) to be inversed and count from zero downwards rather than one upwards.
- **Mobile Improvements:** The left sidebar on the homepage was getting cut off on mobile phones. Due to the increasing number of people using Alu on mobile devices, I've decided to fix this so that it now displays as two separate rows. It's definitely still not perfect, and I'd like to eventually release a dedicated mobile app, but it works well enough for now.

## Essential-Only Option and Various Fixes - Mar 15 - 0.5.4

Many teachers like to create two versions of every assignment: one with all of the flashcards for a unit and the other with only essential flashcards. This update makes that process easier by introducing a simple checkbox that allows teachers to indicate if they want an essential-only copy of that assignment.

- **Added Essential-Only Option:** Added an option for teachers when creating assignments that creates two copies of the assignment: one with the regular tag query and another with an essential only ("AND essential") copy. This is intended to make it easier for teachers who want to make the full flashcard deck optional but highly encourage doing the essential flashcards.
- **Reversed Order of Student Progress Bargraph:** Reversed the order of the student progress bar graph that teachers see for every assignment. Now students that have made the most progress appear on top rather than the bottom.
- **Fixed Older Notifications:** Fixed the link to older notifications and fixed the page that displayed older notifications. I'm aware the notification system still isn't perfect, but it currently isn't used enough to justify committing serious time to improve it.
- **Reversed Flashcard Browse Order:** Reversed the default flashcard browse order so that most recent flashcards are displayed first. You can still reverse this order by clicking "Sort Ascending" at the top of the page.
- **Fixed Flashcard Rearranging:** Flashcard rearranging was broken when the browsing flashcard list was reversed. I've fixed this now.
- **Removed Old Classroom Homepage:** Removed the old, deprecated classroom homepage from before Alu 0.5.0.
- **Added Temporary Feedback Survey:** A temporary feedback survey is now available to all students and will likely remain active until April. Please fill it out to help improve Alu.

## Automatic Copied Deck Updates - Mar 10 - 0.5.3

Previously, to update a deck you copied from a shared/premade deck, you needed to press "Other > Edit > Check for Updates > Update." This update simplifies that process so that whenever you study a deck, it automatically checks for updates and updates itself if it finds any.

- **Fixed Ordered List Centering:** Fixed a longstanding issue that would cause the numbers of an ordered list to be left-aligned instead of centered.
- **Autoupdating:** Your deck is now automatically updated whenever you study an assignment that has an updated shared deck.

## Shared Deck Fix - Mar 05 - 0.5.2

Shared deck updating has been disabled for quite some time due to various issues. This update fixes the vast majority of those issues and re-enables the ability to update shared decks.

- **Fixed Shared Decks:** This update should fix almost everything broken with shared decks, including the ability to pull updates.
- **Some Remaining Issues:** There are a couple of incredibly minor issues remaining with shared decks. These include: not pulling new flashcards review instances when the number of cloze-deletions on a cloze flashcard change and not pulling flashcard re-arrangements. These issues will be fixed soon but are so uncommon that they have never impacted current usage.

## Tiny Rework Fixes - Mar 02 - 0.5.1

This update fixes a couple of tiny issues introduced in the previous update.

- **Fixed Flashcard Creating History:** I've fixed the history selection that allows you to edit the flashcards you just created.
- **Fixed Flashcard Editing from Study:** Fixed the button that allows you to edit a flashcard while studying.
- **Fixed Teacher Assignment Progress Chart:** Fixed the bar chart that displayed student progress: it was way too small before.
- **Fixed Extracurricular Decks:** The extracurricular decks list on the homepage was not including decks that had a shared deck attached to them. I've fixed this now.

# Classrooms Rework & Homepage Redesign - Mar 02 - 0.5.0

Welcome to Alu's biggest update since launch! In this update, you will find a completely redesigned homepage and the new assignments feature.

Having teachers suspend flashcards to assign you work didn't cut it: it was too unwieldy and annoying to both students and teachers. This feature has been removed and replaced with the ability to add assignments. You can find assignments on your redesigned homepage, where you can also track your progress as you complete them. Teachers can easily create assignments from a simple tag query.

- **Redesigned Homepage:** I've completely redesigned the homepage to incorporate the new assignments feature. In the center of your screen, you will see a list of the classes you are enrolled in and the assignments you have for those classes. You can click an assignment to start studying it. You can access the old decks/notes/tasks homepages by clicking their respective links on the left column.
- **Added Assignments to Classrooms:** Before, teachers would have to suspend individual flashcards to assign units to you. This was annoying and inconvenient for both teachers and students. Now, teachers can create an assignment based on a tag query that you will see on your redesigned homepage. Furthermore, as you complete the assignment, you will see your percent complete continually update.
- **Changed Button Colors:** Changed the colors and order of deck study buttons. Many users mistook the "Browse" option for "Study," so this change attempts to fix that.
- **Added Browse Button in Flashcard Creation:** There is now a "Browse" button when creating flashcards, right under the recently added "History" list. It was common to open the flashcards list for reference when creating new flashcards, so this change attempts to make that easier.
- **Major Code Improvements:** A lot of Alu's backend code has been rewritten to be more efficient and more maintainable. This will mean faster loading times and an even quicker rate of updates.
  - **Improved Shared Deck Code:** The code for shared decks and their functions (creating, copying, updating) is in the middle of being completely rewritten. Creating and copying is much more efficient now, and operations that took up to 10 seconds before should now be completed in less than a single second. Despite this, pulling updates is still disabled until it can be further tested.
  - **Code Tests:** I've added over 90 code tests using over 1000 assertments in almost 4500 lines of code. Code tests are bits of code designed to make sure that Alu is working as intended and there aren't any bugs. As I maintain and expand upon these code tests, any slight bugs remaining in Alu will be squashed as quickly as possible.

## Teacher Improvements - Feb 02 - 0.4.2

In this update, I've added a couple of new features that improve teachers' experience on Alu.

- **Added Bulk Suspending to Teacher View:** Teachers can now suspend their students' flashcards in bulk. This allows teachers to "assign" specific units.
- **Added More Loading Buttons:** There are now more loading buttons, which prevent you from being able to double click by accident.
- **Fixed Bug with Student History Chart:** Student history charts are now correctly sorted.
- **Removed Brief Black Screen on Teachers Home:** Removed the annoying black box that appeared on the teacher's homepage for a brief second.
- **Removed Experiment Game:** The temporary psychology experiment has finished and will not be returned.

## Shared Deck Hotfix - Jan 29 0.4.1

This update fixes a massive bug that stopped shared decks from loading.

- **Fixed Shared Deck Bug:** Shared decks would not appear for all anonymous users. This is fixed now.

# Teachers and Classes - Jan 25 - 0.4.0

This update introduces the ability for teachers to create classes for students. Teachers can assign a deck to the class, which students can then study. As students study the class deck, teachers can track their progress with statistics as they learn with Alu. Each classroom gets a unique class code, which students can enter on the homepage to join a class.

- **Added Classrooms:** If your account type is set to "Teacher/Parent," you can now create classes. Classes appear as a new, fourth option on the Alu homepage.
  - **Class Codes:** Each class gets a unique class code that students can enter to join the class. A list of classes that students have joined now appears in a second column on their homepage.
  - **Copy/Attach Deck:** Teachers can attach a deck to the classroom, which students can then copy and study. Alternatively, if the student has already started studying, they add their own deck, rather than copying the class one.
  - **Statistics Tracking:** Teachers can track their students' progress with a simple yet powerful table that gives information about how long each student has spent studying that day and how many flashcards they've reviewed. Clicking a row in this table reveals more information about the student, such as a piechart of the types of flashcards in the student's deck and a graph of how much the student has studied over time.
- **Changed Default Scheduling Algorithm:** The default scheduling algorithm has been changed from Default Anki Settings to Optimized Anki Settings.
- **Added Notification for New Logins:** As part of a security enhancement, you are now notified when there is a new login to your account. If you ever notice a new login that wasn't you, please change your password immediately.
- **Fixed Typos:** Various typos have been fixed.

## Deck Statistics - Jan 23 - 0.3.7

In this update, I've added a page for viewing statistics about your deck. You can access this page through the "Other" button on your deck, and on it, you can see a piechart describing the types of flashcards in your deck. Alu now also collects how long you've studied each day and displays this on your review heatmap. Finally, I've added a feature where you get a notification when a shared deck you've copied is updated.

- **Added Statistics Page:** You can now see statistics about your deck, including the number of different types of flashcards (e.g., learning, learned, unseen, etc.). This can help you track your progress over time and see how much you've learned. You can find the statistics page under the "Other" button when viewing your decks. I will add more graphs and charts to this page soon.
- **Time Tracking:** Alu now tracks the amount of time you spend studying each day. You can see this information on your review heatmap, located on the homepage.
- **Notifications for Deck Updates:** You are now notified when a deck you've copied is updated.
- **Changed Leech Searching Behavior:** Searching by leeches had irregular behavior (using logical "or" instead of "and"), which has now been corrected.
- **Centered Bullet Points:** Bullet points are now correctly centered when studying flashcards.
- **Cleaned-up Homepage:** Removed the unused "total thanks received" count. Also fixed a bug where the review heatmap would preemptively show the next day due to timezone conflicts.

## Email Hotfix - Jan 22 - 0.3.6

Tiny hotfix that now properly renders an error when it is provided with an invalid confirmation key.

- **Added Error on Invalid Email Confirmation:** Before, a server error occured when the user supplied an invalid confirmation key. It now properly renders an error message.

## Flashcard Hotfix - Jan 18 - 0.3.5

This update is a tiny hotfix that fixes two issues with flashcards.

- **Stopped Invalid Flashcards from Being Created:** There is now an error message if you attempt to create a flashcard with a blank front/back, or a cloze flashcard without an instance of a cloze deletion.
- **Fixed Issue with Daily Card Limit:** Fixed an issue that would dump all unseen flashcards on a user if they had reached the maximum number of new flashcards for that day.

## Tag Searching - Jan 16 - 0.3.4

This update improves your ability to search for flashcards with specific tags. It introduces three logical operators, AND, OR, and NOT that you can use when searching for tags. If you'd like to search for flashcards with tags "unit 1" or "unit 2", you can use the query: unit 1 OR unit 2. If you tried to use AND instead of OR, no results would be returned since no flashcard can be in both unit 1 and unit 2 at the same time.

- **Improved Flashcard Tag Searching:** Added the ability to use operators (AND/OR/NOT) in tag searches.
- **Changed Wording:** Changed wording on various buttons to make them more concise.
- **Improved Landing Page:** The landing page has been updated to match Alu's significant progress.

## Bulk Utilities - Jan 14 - 0.3.3

This update introduces a couple of minor utilities that make performing "bulk operations" on flashcards easier. For example, you can now select multiple flashcards when browsing, and add/remove a tag to all those flashcards. Furthermore, you can now suspend/delete all flashcards that return as the result of a search. These features will be expanded upon and be made computationally quicker in the future.

- **Added Selection Mode:** Selection mode is a feature that allows you to "select" multiple flashcards when browsing a deck. You can then perform bulk operations on the selected flashcards, like adding or removing a new tag to all of those flashcards. You can learn more about selection mode [here](/help/selection-mode/).
- **Added Bulk Suspending/Unsuspending/Deleting:** You can now suspend, unsuspend, or delete flashcards in bulk when searching. This allows you to suspend all flashcards of a certain tag, and perform other related actions.
- **Added Flashcard Sorting:** When browsing flashcards, you can now choose to sort the flashcards by ascending or descending order.
- **Changed Min New Card Limit:** You can now choose to not learn any new flashcards per day in a deck, instead of being forced to learn at least one.
- **Changed Update Deck Wording:** "Pull Changes" has been changed up "Update" for clarity.
- **Added More Autonote Options:** Added more options to autonote, about how to divide the input text.
- **Added Temporary Experiment Game:** There is a temporary experiment game available [here](/experiments/). It is for a psychology project, and will be removed within a couple of weeks. You can play it if you'd like, but your data will not be recorded.

## Math Equations & Rearranging Flashcards - Jan 06 - 0.3.2

While math isn't the best subject for flashcards, there are still definitely opportunities for flashcards to be used. For example, you can memorize the steps required to solve a problem. Some formulas just need rote-memorization (like the quadratic formula).

Writing equations in plain-text is frustrating and hard to read, which is why this update introduces LaTeX. LaTeX is a math-language that allows you to write beautiful equations in the fancy, serif, and italic font we are all familiar with.

Furthermore, this update fixes an issue that caused the order of shared flashcards to get messed up while also giving you the ability to rearrange flashcards in your decks.

- **Added LaTeX Editing:** LaTeX is a math-language that allows you to write beautiful equations. It is easy to learn and, you can pick up the basics in a [couple of minutes](https://www.overleaf.com/learn/latex/Learn_LaTeX_in_30_minutes#Adding_math_to_LaTeX). You can now use LaTeX wherever Alu has a rich text editor, including both flashcards and notes. There is also a mini-tutorial page available [here](/help/writing-latex/).
- **Fixed Flashcard Ordering:** Flashcard ordering was getting messed up when sharing/copying a deck. This means that all units will be in proper order; however, you will need to pull the changes by clicking "Other" > "Check for Updates" on each affected deck.
- **Added Ability to Rearrange Flashcards:** Flashcards can now be rearranged when browsing using the two caret buttons. This feature is still a work in progress and will be expanded upon soon. For now, it gives you a simple way to move flashcards up/down.
- **Fixed Issue in Viewing Notes:** Viewing notes was linking to a broken page. This is now fixed.
- **Replaced Broken Buttons on Shared Decks:** There were two broken buttons when viewing the flashcards of a shared deck that you owned. These have now been replaced by a useful button that redirects you to the shared deck's page.
- **Fixed Issue in Searching:** Fixed an issue in searching that caused some flashcards to glitch after a search was performed for the second time.
- **Fixed Bug in Games:** Fixed a bug that caused the "All Flashcards" selection not to work.
- **Minor Changes to Explore Slider:** Some adblockers (e.g., uBlock) are blocking the explore slider's contents for decks. This is affecting multiple websites that use these sliders and will most likely be patched by the adblockers soon. For now, there is a little message alerting you what to do if the slider isn't working.

## Deck Updating - Jan 03 2020 - 0.3.1

This small update fixes some undetected issues in pulling deck changes. You can now update the decks that you copied from shared decks properly. There are unfortunately still a few minor issues with pulling deletes, but these will hopefully be resolved within the coming week.

- **Fixed Flashcard Pulling:** Fixed a major issue that would cause pulled flashcards to appear in your deck, but not be able to be studied.

# Games! - Jan 02 2020 - 0.3.0

Flashcards don't just have to be work; they can be fun too!

This update introduces two new fun ways to study with your flashcards: the Matching and Quiz games (more details below). You can customize the type of flashcards to review in these games, allowing you to preview new flashcards, review old flashcards, review a specific unit, or improve on the flashcards that are most difficult for you.

- **Games:** Games can be found after pressing the new "Other" button on your decks and then clicking "Games." Games are currently not available for cloze flashcards.
  - **Matching Game:** The Matching Game gives you a 4x4, 6x6, or 8x8 grid of flashcards. You are then asked to match which flashcard "front" corresponds to which flashcard "back".
  - **Quiz Game:** This game takes the form of a classical four-answer quiz. It prompts you with a flashcard "front" and tasks you with figuring out the correct answer (I do see the irony in calling a quiz a game, but it's surprisingly fun).
- **Improved Deck Homepage Design:** The "Edit" and "Browse" buttons have now been moved to an "Other" dropdown on the deck homepage. The "Other" dropdown also includes a way to access games in your deck. This is intended to remove visual clutter and make way for future options.
- **Frozen Tags:** Since it is almost always useful to [freeze](/help/freezing-fields/) the "Tags" field, it is now frozen by default when creating flashcards.
- **Creating/Editing Flashcard Loading Display:** Before, it was hard to tell whether a flashcard had been saved after editing it. It now briefly displays "Saving..." as it saves. In the same vein, "Creating..." is also displayed right after you press "Create" to create a new flashcard.
- **Creating Flashcard History:** It can be a pain to edit the flashcards you've just created. Now, you can access your recently created flashcards through a "History" dropdown.
- **Improved Profile Page:** Fixed a small issue that would display broken "Study" and "Edit" buttons on your profile page.
- **Fixed Studying Bug:** Fixed a bug that caused tomorrow's flashcards to appear today if you were studying past 10 PM.
- **Display Tags When Studying:** A big issue in flashcards is providing context: making sure each flashcard fits into a bigger picture, rather than memorizing individual facts. Now, the current flashcard's tags are displayed when studying to help provide more context.
- **Filtered Decks Tutorial:** There is a tutorial for filtered decks available on the [help](/help/) page. This tutorial has been out for a while, but it can now be found in the help section.

# Personalizing Alu & Better Study Habits - Dec 14 2020 - 0.2.0

Keeping to study habits is difficult. This update seeks to make it easier.

When users join Alu, they are now asked to answer a few questions to help personalize Alu to them. These questions include topics such as "How much time would you like to spend studying per day?" If you already have an Alu account, you can manually change these settings [here](/settings/).

Ever forget to study one day? You now have the option of enabling reminder emails. These reminder emails are sent every day at 6 PM if you have a streak and haven't studied yet. Reminder emails can help you build study habits and continue using Alu. If you don't like the reminder emails, you can always disable them in settings.

- **Reminder Emails:** Reminder emails can be enabled in settings and will be sent to you at 6 PM every night if you haven't studied that day.
- **Study Goals:** When creating an Alu account or in settings, you can now specify how long you would like to spend studying. Creating specific goals will help motivate you to continue studying. In the future, Alu will automatically attempt to level out the number of cards you do every night to reach your study goal.
- **Teacher/Student:** You can now specify whether you are a teacher/parent or a student/learner. In the future, this will be used to further personalize Alu, with features such as the ability to create classes of students.
- **Improved Page Loading:** There will no longer be a brief instant where the page style hasn't loaded. This will remove the annoying black box that occurred when reloading the home page.
- **Changed Page Title:** All instances of "Alu Flashcards" have now been updated to "Alu Learn."
- **Improved Filtered Decks:** You can now specify a title when creating filtered decks. Furthermore, the attribute of which decks to take flashcards from now correctly works and is editable through the deck edit modal. There is now an expandable section for changing search sections, making it less overwhelming to view. A bug that stopped "Daily New Card Limit" and "Shuffle Unseen Cards" from properly working in CSSMs has also been fixed.
- **Added Changelog Popup:** Users will now be greeted with a popup alerting them of new changes when they log in for the first time following an update.

## Improved Quizlet Importing - Dec 11 2020 - 0.1.1

This is a minor update that improves the Quizlet importing process. It is now much easier to turn your Quizlet study sets into Alu decks.

- **Improved Deck Importing:** I've simplified the instructions for importing a Quizlet set to an Alu deck and added a new textbox that allows you to copy-paste your Quizlet export directly. This is much easier than the old method of creating a file on your computer.
- **Added FAQ and Cloze Tutorial:** There is now an FAQ available [here](/help/faq/) and a tutorial for cloze deletion available [here](/help/cloze-deletion/).

# Deck Difficulty Selection - Dec 09 2020 - 0.1.0

This update introduces "deck difficulty selection." If the default Alu intervals are too short for you and you are being overwhelmed with flashcards, you can now choose to lower your deck's difficulty.

When first creating a deck, you are now given a new option: deck difficulty. You can set this to either "Memorize Everything" (Hardest and default), "Memorize Most Things" (Medium), or "Get the Overview" (Easiest). Easier difficulty settings will make it so flashcards are shown to you less often. This aims to allow people who do not have as much time to study to still be able to get the full experience out of Alu.

Any decks that already exist will default to "Memorize Everything," but you can change this by clicking "Edit" on your deck. If you have the time, I highly recommend keeping this setting (I will personally have all of my decks set to "Memorize Everything"), but if you are really pressed you can of course change it. Alu's spaced repetition will always apply, no matter which option you choose.

- **Added Changelog:** This is the first official changelog. You will be able to find all information about future updates on this page. The navigation item "Search" has now been changed to "Changelog" for a link to this page (search is still available through explore).
- **Added Help Page:** There is now a help page with links to tutorials available [here](/help/). Alternatively, you can click the profile icon in the top right, and click the "Help and Tutorials" option. More tutorials will be added to this page soon.
- **Improved Note Loading Speed:** Notes will now load faster and save more bandwidth.
- **Fixed Autoflashcard:** Autoflashcard was accidentally broken due to the multipage note update. It has now been fixed and allows you to choose which page of your notes to create flashcards from.
