-----

## Math Equations & TK TK TK - Jan ?? - 0.3.2


* **Added LaTeX Editing:** LaTeX is a math-language that allows you to write beautiful equations.  It is easy to learn and you can pick up the basics in a [couple minutes](https://www.overleaf.com/learn/latex/Learn_LaTeX_in_30_minutes#Adding_math_to_LaTeX).  You can now use LaTeX where ever Alu has a rich text editor, including both flashcards and notes.  There is also a mini-tutorial page available [here](/help/writing-latex/).


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