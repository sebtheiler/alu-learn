
-----


## ??? - May ?? - 0.6.4



* **Fixed Password Reset Case-Sensitivity:** Updated password resets to no longer be case-sensitive when asking for email addresses.


## Overflow Bucket - May 03 - 0.6.3
This update adds a key new feature: the "Overflow Bucket."


Before, if you missed a day of studying (or didn't study all of the flashcards in that day), all of those flashcards you missed would pile up for the next day.  This could quickly become overwhelming, detering you from studying.  The Overflow Bucket attempts to fix this.


Now, when you go to study a deck, you will _only_ see flashcards that are due that day.  After you finish all of the flashcards due that day, you will be able to review flashcards that were due before that day through the Overflow Bucket.  This ensures that (a) flashcards don't pile up too high and become overwhelming and (b) you keep remembering flashcards that are due, since it is assumed you have already forgotten many of the flashcards in the Overflow Bucket.


If you don't see the Overflow Bucket it means that you are completely caught-up on your reviews.


* **Added Overflow Bucket:**  After studying all of your flashcards, you will be able to review flashcards that were due previously but you didn't review.
* **Removed Flashcard Buttons on Shared Deck:** Removed buttons that existed when you were browsing the shared copy of a deck you owned, since they couldn't be used anyways.  Also added marginally more padding beneath the "tags" list.


## Moar Fixes 'n' Stuff - May 02 - 0.6.2
The long awaited sequel to Fixes 'n' Stuff: Moar Fixes 'n' Stuff!


Yeah, nothing too special today, just a couple of fixes.  It's my birthday, but no one reads the changelog so I guess that will stay unknown.  "What did you do for your birthday?  Make flashcards))"


* **Improved Automatic Image Pasting:** The ability to paste an image link and have it directly appear has been improved, as it now recognizes all-capital extensions as well (e.g., .PNG instead of just .png).
* **Fixed Issue With Friend Links:** Fixed a longstanding issue with friend links directing to a 404 page.  They now properly lead to the user's page.
* **Fixed Issue With Flashcard Editing Title:**  The title of the tab used when editing a flashcard was previously "Creating a new flashcard...", but has now been changed to "Editing flashcard..."
* **Added Lock to Deck Updating:** Added a lock to deck updating so that you can't accidentally initiate two updates at once.
* **Mandated Lowercase Tags:** Tags should always be lowercase, so that uppercase words are reserved as logical operators (AND/OR/NOT).  You can now no longer make tags lowercase when editing or creating flashcards.
* **Changed ToS (Extremely Minor):** Some of the information in the Terms of Service was outdated, like Alu's URL, so I've updated it.
* **Made Flashcard Search Results Distinct:** There was previously a chance that the same flashcard could appear multiple times when searching.  This has now been fixed.


## Fixes 'n' Stuff - Apr 11 - 0.6.1
A bunch of random fixes and improvements.  A huge number of improvements will come in Alu v0.7, so the rest of v0.6 will probably be slight fixes like this one.


* **Removed Strikethrough:**  There was absolutely no reason for strikethrough formatting to exist in creating flashcards or editing notes.  No one, including me, has ever used it.
* **Added Keyboard Shortcut for Inline Math:** You can now use ctrl+= (or command on MacOS) to toggle writing inline math equations.
* **Fixed a Bug In Studying:** Fixed a bug that caused studying to break if you studied a certain number of seen cards, then decreased your daily seen card limit to a number less than the number of seen cards you already studied.
* **Fixed a Bug With Seen Flashcards:** Fixed a bug that caused seen flashcards to not get properly reset every midnight.
* **Added a Couple Streak-based Easter Eggs:** See if you can find them...
* **Added Bulk Tag Renaming:** You can now rename flashcard tags in bulk, similar to how you could previously add or delete tags in bulk.  This system isn't perfect, but it works well enough for now.
* **Improved Quick Feedback Questions:**  I can now send out multiple choice feedback questions, as opposed to the previous Yes/No or Likert scales, helping you help me influence the future of Alu.
* **Fixed Deck Editing:** Fixed an issue that prevented you from editing a deck without displaying the "Advanced Options."


# Less Stress - Apr 05 - 0.6.0
Alu v0.6 is all about making studying easier, more enjoyable, and less stressful.  The next major version, v0.7, will be released sometime in April with massive changes to studying.  Until v0.7 is released, v0.6 will release a bunch of tiny and iterative changes improving studying.


In this update, I've added settings for controlling how many flashcards you see per day in assignments.  You can access these settings by clicking the cog/gear icon next to the class you want to edit.  If the amount of flashcards Alu gives you feels overwhelming, you can decrease the number of new flashcards per day, the maximum number of old flashcards per day, or change the deck to a simpler difficulty.


This update also adds "quick feedback questions."  Occasionally, you will find quick questions on the top of your homepage so that you can provide quick and easy feedback about Alu.


* **Added Settings for Classroom Studying:** You can now control the specifics of how many flashcards are shown to you when studying assignments for a classroom.  You can access these options by clicking the cog/gear icon next to the classroom title.  If you're feeling overwhelmed, lowering these values will make Alu give you fewer flashcards.  This feature was previously limited to just decks but has no been expanded to classrooms as well.
  * **Rearranged Deck-like Options:** The "advanced options" are now hidden by default when editing deck-likes to make it less confusing for new users.
  * **Added Option to Control Max Seen Flashcards per Day:** When editing decks/assignments/custom-studies, you can now change the maximum number of previously seen flashcards per day.  It defaults to 200, which is probably right for most people, but you can lower it if you have too many flashcards to review and get overwhelmed or increase it if you want to memorize with Alu better.
  * **Added Tooltips When Editing Decks:** There are now tooltips explaining all of the advanced options when editing a deck.
* **Fixed Tiny Studying Bug:** Fixed a slightly ridiculous bug that allowed you to press "zero" on your keyboard as a valid response when rating your performance on a flashcard instead of the usual 1, 2, 3, and 4.
* **Changed Reminder Email:** The reminder email's wording was a bit annoying, so I changed it.
* **Fixed Streak Icon For Long Streaks:** The icon for displaying your streak was overflown if you had a streak greater than 100.  It's now fixed to dynamically make the text smaller if your streak gets longer than 100.  It'll break again if anyone's streak surpasses 1,000, but I should have at least 2.5 years to fix that.
* **Added JSON Importing/Exporting:** Added the ability to export decks to downloadable JSON files and then import those JSON files back into useable decks.  This probably won't be a very widely used feature, but it is useful in some situations, and I need it for prototyping the next big update...
* **Added Quick Feedback Questions:** There will sometimes be quick questions on the top of your homepage designed to get feedback about a feature in Alu.  These are entirely optional, but I would really appreciate it if you could fill them out to help guide Alu's future development.


## Flashcard Rearranging Fixes - Mar 20 - 0.5.5
I've fixed a couple of tiny issues involving flashcards, the biggest one being a fix to an old bug that stopped flashcards from being rearranged if another flashcard was deleted.


* **Fixed Flashcard Rearranging:** Fixed a longstanding bug where deleting flashcards would break the ability to rearrange flashcards in a deck.
* **Fixed Flashcard Search Bug:**  Fixed a tiny bug that caused the "Load More Decks" button to appear even when there were no more decks to load or before any search had been made.
* **Fixed Flashcard Number Displaying:** Fixed a bug that caused flashcards displayed when searching (and on shared deck preview pages) to be inversed and count from zero downwards rather than one upwards.
* **Mobile Improvements:** The left sidebar on the homepage was getting cut off on mobile phones.  Due to the increasing number of people using Alu on mobile devices, I've decided to fix this so that it now displays as two separate rows.  It's definitely still not perfect, and I'd like to eventually release a dedicated mobile app, but it works well enough for now.


## Essential-Only Option and Various Fixes - Mar 15 - 0.5.4
Many teachers like to create two versions of every assignment: one with all of the flashcards for a unit and the other with only essential flashcards.  This update makes that process easier by introducing a simple checkbox that allows teachers to indicate if they want an essential-only copy of that assignment.


* **Added Essential-Only Option:** Added an option for teachers when creating assignments that creates two copies of the assignment: one with the regular tag query and another with an essential only ("AND essential") copy.  This is intended to make it easier for teachers who want to make the full flashcard deck optional but highly encourage doing the essential flashcards.
* **Reversed Order of Student Progress Bargraph:** Reversed the order of the student progress bar graph that teachers see for every assignment.  Now students that have made the most progress appear on top rather than the bottom.
* **Fixed Older Notifications:** Fixed the link to older notifications and fixed the page that displayed older notifications.  I'm aware the notification system still isn't perfect, but it currently isn't used enough to justify committing serious time to improve it.
* **Reversed Flashcard Browse Order:** Reversed the default flashcard browse order so that most recent flashcards are displayed first.  You can still reverse this order by clicking "Sort Ascending" at the top of the page.
* **Fixed Flashcard Rearranging:** Flashcard rearranging was broken when the browsing flashcard list was reversed.  I've fixed this now.
* **Removed Old Classroom Homepage:** Removed the old, deprecated classroom homepage from before Alu 0.5.0.
* **Added Temporary Feedback Survey:** A temporary feedback survey is now available to all students and will likely remain active until April.  Please fill it out to help improve Alu.


## Automatic Copied Deck Updates - Mar 10 - 0.5.3
Previously, to update a deck you copied from a shared/premade deck, you needed to press "Other > Edit > Check for Updates > Update."  This update simplifies that process so that whenever you study a deck, it automatically checks for updates and updates itself if it finds any.


* **Fixed Ordered List Centering:** Fixed a longstanding issue that would cause the numbers of an ordered list to be left-aligned instead of centered.
* **Autoupdating:** Your deck is now automatically updated whenever you study an assignment that has an updated shared deck.


## Shared Deck Fix - Mar 05 - 0.5.2
Shared deck updating has been disabled for quite some time due to various issues.  This update fixes the vast majority of those issues and re-enables the ability to update shared decks.


* **Fixed Shared Decks:** This update should fix almost everything broken with shared decks, including the ability to pull updates.
* **Some Remaining Issues:** There are a couple of incredibly minor issues remaining with shared decks.  These include: not pulling new flashcards review instances when the number of cloze-deletions on a cloze flashcard change and not pulling flashcard re-arrangements.  These issues will be fixed soon but are so uncommon that they have never impacted current usage.


## Tiny Rework Fixes - Mar 02 - 0.5.1
This update fixes a couple of tiny issues introduced in the previous update.


* **Fixed Flashcard Creating History:** I've fixed the history selection that allows you to edit the flashcards you just created.
* **Fixed Flashcard Editing from Study:** Fixed the button that allows you to edit a flashcard while studying.
* **Fixed Teacher Assignment Progress Chart:** Fixed the bar chart that displayed student progress: it was way too small before.
* **Fixed Extracurricular Decks:** The extracurricular decks list on the homepage was not including decks that had a shared deck attached to them.  I've fixed this now.


# Classrooms Rework & Homepage Redesign - Mar 02 - 0.5.0
Welcome to Alu's biggest update since launch!  In this update, you will find a completely redesigned homepage and the new assignments feature.


Having teachers suspend flashcards to assign you work didn't cut it: it was too unwieldy and annoying to both students and teachers.  This feature has been removed and replaced with the ability to add assignments.  You can find assignments on your redesigned homepage, where you can also track your progress as you complete them.  Teachers can easily create assignments from a simple tag query.


* **Redesigned Homepage:** I've completely redesigned the homepage to incorporate the new assignments feature.  In the center of your screen, you will see a list of the classes you are enrolled in and the assignments you have for those classes.  You can click an assignment to start studying it.  You can access the old decks/notes/tasks homepages by clicking their respective links on the left column.
* **Added Assignments to Classrooms:** Before, teachers would have to suspend individual flashcards to assign units to you.  This was annoying and inconvenient for both teachers and students.  Now, teachers can create an assignment based on a tag query that you will see on your redesigned homepage.  Furthermore, as you complete the assignment, you will see your percent complete continually update.
* **Changed Button Colors:** Changed the colors and order of deck study buttons.  Many users mistook the "Browse" option for "Study," so this change attempts to fix that.
* **Added Browse Button in Flashcard Creation:** There is now a "Browse" button when creating flashcards, right under the recently added "History" list.  It was common to open the flashcards list for reference when creating new flashcards, so this change attempts to make that easier.
* **Major Code Improvements:** A lot of Alu's backend code has been rewritten to be more efficient and more maintainable.  This will mean faster loading times and an even quicker rate of updates.
  * **Improved Shared Deck Code:** The code for shared decks and their functions (creating, copying, updating) is in the middle of being completely rewritten.  Creating and copying is much more efficient now, and operations that took up to 10 seconds before should now be completed in less than a single second.  Despite this, pulling updates is still disabled until it can be further tested.
  * **Code Tests:** I've added over 90 code tests using over 1000 assertments in almost 4500 lines of code.  Code tests are bits of code designed to make sure that Alu is working as intended and there aren't any bugs.  As I maintain and expand upon these code tests, any slight bugs remaining in Alu will be squashed as quickly as possible.


## Teacher Improvements - Feb 02 - 0.4.2
In this update, I've added a couple of new features that improve teachers' experience on Alu.


* **Added Bulk Suspending to Teacher View:** Teachers can now suspend their students' flashcards in bulk.  This allows teachers to "assign" specific units.
* **Added More Loading Buttons:** There are now more loading buttons, which prevent you from being able to double click by accident.
* **Fixed Bug with Student History Chart:** Student history charts are now correctly sorted.
* **Removed Brief Black Screen on Teachers Home:** Removed the annoying black box that appeared on the teacher's homepage for a brief second.
* **Removed Experiment Game:** The temporary psychology experiment has finished and will not be returned.


## Shared Deck Hotfix - Jan 29 0.4.1
This update fixes a massive bug that stopped shared decks from loading.


* **Fixed Shared Deck Bug:** Shared decks would not appear for all anonymous users.  This is fixed now.


# Teachers and Classes - Jan 25 - 0.4.0
This update introduces the ability for teachers to create classes for students.  Teachers can assign a deck to the class, which students can then study.  As students study the class deck, teachers can track their progress with statistics as they learn with Alu.  Each classroom gets a unique class code, which students can enter on the homepage to join a class.


* **Added Classrooms:** If your account type is set to "Teacher/Parent," you can now create classes.  Classes appear as a new, fourth option on the Alu homepage.
    * **Class Codes:** Each class gets a unique class code that students can enter to join the class.  A list of classes that students have joined now appears in a second column on their homepage.
    * **Copy/Attach Deck:** Teachers can attach a deck to the classroom, which students can then copy and study.  Alternatively, if the student has already started studying, they add their own deck, rather than copying the class one.
    * **Statistics Tracking:** Teachers can track their students' progress with a simple yet powerful table that gives information about how long each student has spent studying that day and how many flashcards they've reviewed.  Clicking a row in this table reveals more information about the student, such as a piechart of the types of flashcards in the student's deck and a graph of how much the student has studied over time.
* **Changed Default Scheduling Algorithm:** The default scheduling algorithm has been changed from Default Anki Settings to Optimized Anki Settings.
* **Added Notification for New Logins:** As part of a security enhancement, you are now notified when there is a new login to your account.  If you ever notice a new login that wasn't you, please change your password immediately.
* **Fixed Typos:** Various typos have been fixed.


## Deck Statistics - Jan 23 - 0.3.7
In this update, I've added a page for viewing statistics about your deck.  You can access this page through the "Other" button on your deck, and on it, you can see a piechart describing the types of flashcards in your deck.  Alu now also collects how long you've studied each day and displays this on your review heatmap.  Finally, I've added a feature where you get a notification when a shared deck you've copied is updated.


* **Added Statistics Page:** You can now see statistics about your deck, including the number of different types of flashcards (e.g., learning, learned, unseen, etc.).  This can help you track your progress over time and see how much you've learned.  You can find the statistics page under the "Other" button when viewing your decks.  I will add more graphs and charts to this page soon.
* **Time Tracking:** Alu now tracks the amount of time you spend studying each day.  You can see this information on your review heatmap, located on the homepage.
* **Notifications for Deck Updates:** You are now notified when a deck you've copied is updated.
* **Changed Leech Searching Behavior:** Searching by leeches had irregular behavior (using logical "or" instead of "and"), which has now been corrected.
* **Centered Bullet Points:** Bullet points are now correctly centered when studying flashcards.
* **Cleaned-up Homepage:** Removed the unused "total thanks received" count.  Also fixed a bug where the review heatmap would preemptively show the next day due to timezone conflicts.


## Email Hotfix - Jan 22 - 0.3.6
Tiny hotfix that now properly renders an error when it is provided with an invalid confirmation key.


* **Added Error on Invalid Email Confirmation:** Before, a server error occured when the user supplied an invalid confirmation key.  It now properly renders an error message.


## Flashcard Hotfix - Jan 18 - 0.3.5
This update is a tiny hotfix that fixes two issues with flashcards.


* **Stopped Invalid Flashcards from Being Created:** There is now an error message if you attempt to create a flashcard with a blank front/back, or a cloze flashcard without an instance of a cloze deletion.
* **Fixed Issue with Daily Card Limit:** Fixed an issue that would dump all unseen flashcards on a user if they had reached the maximum number of new flashcards for that day.


## Tag Searching - Jan 16 - 0.3.4
This update improves your ability to search for flashcards with specific tags.  It introduces three logical operators, AND, OR, and NOT that you can use when searching for tags.  If you'd like to search for flashcards with tags "unit 1" or "unit 2", you can use the query: unit 1 OR unit 2.  If you tried to use AND instead of OR, no results would be returned since no flashcard can be in both unit 1 and unit 2 at the same time.


* **Improved Flashcard Tag Searching:** Added the ability to use operators (AND/OR/NOT) in tag searches.
* **Changed Wording:** Changed wording on various buttons to make them more concise.
* **Improved Landing Page:** The landing page has been updated to match Alu's significant progress.


## Bulk Utilities - Jan 14 - 0.3.3
This update introduces a couple of minor utilities that make performing "bulk operations" on flashcards easier.  For example, you can now select multiple flashcards when browsing, and add/remove a tag to all those flashcards.  Furthermore, you can now suspend/delete all flashcards that return as the result of a search.  These features will be expanded upon and be made computationally quicker in the future.


* **Added Selection Mode:** Selection mode is a feature that allows you to "select" multiple flashcards when browsing a deck.  You can then perform bulk operations on the selected flashcards, like adding or removing a new tag to all of those flashcards.  You can learn more about selection mode [here](/help/selection-mode/).
* **Added Bulk Suspending/Unsuspending/Deleting:** You can now suspend, unsuspend, or delete flashcards in bulk when searching.  This allows you to suspend all flashcards of a certain tag, and perform other related actions.
* **Added Flashcard Sorting:** When browsing flashcards, you can now choose to sort the flashcards by ascending or descending order.
* **Changed Min New Card Limit:** You can now choose to not learn any new flashcards per day in a deck, instead of being forced to learn at least one.
* **Changed Update Deck Wording:** "Pull Changes" has been changed up "Update" for clarity.
* **Added More Autonote Options:** Added more options to autonote, about how to divide the input text.
* **Added Temporary Experiment Game:** There is a temporary experiment game available [here](/experiments/).  It is for a psychology project, and will be removed within a couple of weeks.  You can play it if you'd like, but your data will not be recorded.


## Math Equations & Rearranging Flashcards - Jan 06 - 0.3.2
While math isn't the best subject for flashcards, there are still definitely opportunities for flashcards to be used.  For example, you can memorize the steps required to solve a problem.  Some formulas just need rote-memorization (like the quadratic formula).


Writing equations in plain-text is frustrating and hard to read, which is why this update introduces LaTeX.  LaTeX is a math-language that allows you to write beautiful equations in the fancy, serif, and italic font we are all familiar with.


Furthermore, this update fixes an issue that caused the order of shared flashcards to get messed up while also giving you the ability to rearrange flashcards in your decks.


* **Added LaTeX Editing:** LaTeX is a math-language that allows you to write beautiful equations.  It is easy to learn and, you can pick up the basics in a [couple of minutes](https://www.overleaf.com/learn/latex/Learn_LaTeX_in_30_minutes#Adding_math_to_LaTeX).  You can now use LaTeX wherever Alu has a rich text editor, including both flashcards and notes.  There is also a mini-tutorial page available [here](/help/writing-latex/).
* **Fixed Flashcard Ordering:** Flashcard ordering was getting messed up when sharing/copying a deck.  This means that all units will be in proper order; however, you will need to pull the changes by clicking "Other" > "Check for Updates" on each affected deck.
* **Added Ability to Rearrange Flashcards:** Flashcards can now be rearranged when browsing using the two caret buttons.  This feature is still a work in progress and will be expanded upon soon.  For now, it gives you a simple way to move flashcards up/down.
* **Fixed Issue in Viewing Notes:** Viewing notes was linking to a broken page.  This is now fixed.
* **Replaced Broken Buttons on Shared Decks:** There were two broken buttons when viewing the flashcards of a shared deck that you owned.  These have now been replaced by a useful button that redirects you to the shared deck's page.
* **Fixed Issue in Searching:** Fixed an issue in searching that caused some flashcards to glitch after a search was performed for the second time.
* **Fixed Bug in Games:** Fixed a bug that caused the "All Flashcards" selection not to work.
* **Minor Changes to Explore Slider:** Some adblockers (e.g., uBlock) are blocking the explore slider's contents for decks.  This is affecting multiple websites that use these sliders and will most likely be patched by the adblockers soon.  For now, there is a little message alerting you what to do if the slider isn't working.


## Deck Updating - Jan 03 2020 - 0.3.1
This small update fixes some undetected issues in pulling deck changes.  You can now update the decks that you copied from shared decks properly.  There are unfortunately still a few minor issues with pulling deletes, but these will hopefully be resolved within the coming week.


* **Fixed Flashcard Pulling:**  Fixed a major issue that would cause pulled flashcards to appear in your deck, but not be able to be studied.


# Games! - Jan 02 2020 - 0.3.0
Flashcards don't just have to be work; they can be fun too!


This update introduces two new fun ways to study with your flashcards: the Matching and Quiz games (more details below).  You can customize the type of flashcards to review in these games, allowing you to preview new flashcards, review old flashcards, review a specific unit, or improve on the flashcards that are most difficult for you.


* **Games:** Games can be found after pressing the new "Other" button on your decks and then clicking "Games."  Games are currently not available for cloze flashcards.
    * **Matching Game:** The Matching Game gives you a 4x4, 6x6, or 8x8 grid of flashcards.  You are then asked to match which flashcard "front" corresponds to which flashcard "back".
    * **Quiz Game:** This game takes the form of a classical four-answer quiz.  It prompts you with a flashcard "front" and tasks you with figuring out the correct answer (I do see the irony in calling a quiz a game, but it's surprisingly fun).
* **Improved Deck Homepage Design:** The "Edit" and "Browse" buttons have now been moved to an "Other" dropdown on the deck homepage.  The "Other" dropdown also includes a way to access games in your deck.  This is intended to remove visual clutter and make way for future options.
* **Frozen Tags:** Since it is almost always useful to [freeze](/help/freezing-fields/) the "Tags" field, it is now frozen by default when creating flashcards.
* **Creating/Editing Flashcard Loading Display:** Before, it was hard to tell whether a flashcard had been saved after editing it.  It now briefly displays "Saving..." as it saves.  In the same vein, "Creating..." is also displayed right after you press "Create" to create a new flashcard.
* **Creating Flashcard History:** It can be a pain to edit the flashcards you've just created.  Now, you can access your recently created flashcards through a "History" dropdown.
* **Improved Profile Page:** Fixed a small issue that would display broken "Study" and "Edit" buttons on your profile page.
* **Fixed Studying Bug:** Fixed a bug that caused tomorrow's flashcards to appear today if you were studying past 10 PM.
* **Display Tags When Studying:** A big issue in flashcards is providing context: making sure each flashcard fits into a bigger picture, rather than memorizing individual facts. Now, the current flashcard's tags are displayed when studying to help provide more context.
* **Filtered Decks Tutorial:**  There is a tutorial for filtered decks available on the [help](/help/) page.  This tutorial has been out for a while, but it can now be found in the help section.


# Personalizing Alu & Better Study Habits - Dec 14 2020 - 0.2.0
Keeping to study habits is difficult.  This update seeks to make it easier.


When users join Alu, they are now asked to answer a few questions to help personalize Alu to them.  These questions include topics such as "How much time would you like to spend studying per day?"  If you already have an Alu account, you can manually change these settings [here](/settings/).


Ever forget to study one day?  You now have the option of enabling reminder emails.  These reminder emails are sent every day at 6 PM if you have a streak and haven't studied yet.  Reminder emails can help you build study habits and continue using Alu.  If you don't like the reminder emails, you can always disable them in settings.


* **Reminder Emails:** Reminder emails can be enabled in settings and will be sent to you at 6 PM every night if you haven't studied that day.
* **Study Goals:** When creating an Alu account or in settings, you can now specify how long you would like to spend studying.  Creating specific goals will help motivate you to continue studying.  In the future, Alu will automatically attempt to level out the number of cards you do every night to reach your study goal.
* **Teacher/Student:** You can now specify whether you are a teacher/parent or a student/learner.  In the future, this will be used to further personalize Alu, with features such as the ability to create classes of students.
* **Improved Page Loading:** There will no longer be a brief instant where the page style hasn't loaded.  This will remove the annoying black box that occurred when reloading the home page.
* **Changed Page Title:** All instances of "Alu Flashcards" have now been updated to "Alu Learn."
* **Improved Filtered Decks:** You can now specify a title when creating filtered decks.  Furthermore, the attribute of which decks to take flashcards from now correctly works and is editable through the deck edit modal.  There is now an expandable section for changing search sections, making it less overwhelming to view.  A bug that stopped "Daily New Card Limit" and "Shuffle Unseen Cards" from properly working in CSSMs has also been fixed.
* **Added Changelog Popup:** Users will now be greeted with a popup alerting them of new changes when they log in for the first time following an update.


## Improved Quizlet Importing - Dec 11 2020 - 0.1.1
This is a minor update that improves the Quizlet importing process.  It is now much easier to turn your Quizlet study sets into Alu decks.


* **Improved Deck Importing:** I've simplified the instructions for importing a Quizlet set to an Alu deck and added a new textbox that allows you to copy-paste your Quizlet export directly.  This is much easier than the old method of creating a file on your computer.
* **Added FAQ and Cloze Tutorial:** There is now an FAQ available [here](/help/faq/) and a tutorial for cloze deletion available [here](/help/cloze-deletion/).

# Deck Difficulty Selection - Dec 09 2020 - 0.1.0
This update introduces "deck difficulty selection." If the default Alu intervals are too short for you and you are being overwhelmed with flashcards, you can now choose to lower your deck's difficulty.


When first creating a deck, you are now given a new option: deck difficulty.  You can set this to either "Memorize Everything" (Hardest and default), "Memorize Most Things" (Medium), or "Get the Overview" (Easiest).  Easier difficulty settings will make it so flashcards are shown to you less often.  This aims to allow people who do not have as much time to study to still be able to get the full experience out of Alu.


Any decks that already exist will default to "Memorize Everything," but you can change this by clicking "Edit" on your deck.  If you have the time, I highly recommend keeping this setting (I will personally have all of my decks set to "Memorize Everything"), but if you are really pressed you can of course change it.  Alu's spaced repetition will always apply, no matter which option you choose.


* **Added Changelog:** This is the first official changelog.  You will be able to find all information about future updates on this page.  The navigation item "Search" has now been changed to "Changelog" for a link to this page (search is still available through explore).
* **Added Help Page:** There is now a help page with links to tutorials available [here](/help/).  Alternatively, you can click the profile icon in the top right, and click the "Help and Tutorials" option. More tutorials will be added to this page soon.
* **Improved Note Loading Speed:** Notes will now load faster and save more bandwidth.
* **Fixed Autoflashcard:** Autoflashcard was accidentally broken due to the multipage note update.  It has now been fixed and allows you to choose which page of your notes to create flashcards from.