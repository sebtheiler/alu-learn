Cloze deletion is a powerful technique that lets you obscure one or more phrases from a flashcard.  When studying, the specified phrase will be hidden from you and when you reveal the answer it will be shown.

To create cloze flashcards, select the "Cloze" option as the flashcard type when creating the flashcard.  Next, follow a simple syntax: "words words words {{c1::hidden words}} words words words"

For example, you could take the sentence, "Kaleida was funded to the tune of $40 million by Apple Computer and IBM in 1991," and obscure the word "Kaleida" by using
"{{c1::Kaleida}} was funded to the tune of $40 million by Apple Computer and IBM in 1991."


You could also obscure two different phrases with:
"{{c1::Kaleida}} was funded to the tune of {{c2::$40 million}} by Apple Computer and IBM in 1991."
The above example would create two different flashcards - one where Kaleida is hidden and another where $40 million is hidden.  Note that the first cloze uses the number "1", while the second cloze uses the number "2".


If you'd like to hide two separate phrases in the same flashcard you could use:
"{{c1::Kaleida}} was funded to the tune of {{c2::$40 million}} by {{c3::Apple Computer}} and {{c3::IBM}} in 1991."
Note that the last two clozes in this example use the same number, which means they are shown at the same time.  This example would create three, not four, unique flashcards.


### More examples:
* "{{c1::Mitochondria}} are the {{c2::powerhouse}} of the {{c3::cell}}"

This would create three separate flashcards that look like this:
* "[ ... ] are the powerhouse of the cell"
* "Mitochondria are the [ ... ] of the cell"
* "Mitochondria are the powerhouse of the [ ... ]"

You can use repeats of the same number to hide multiple words or phrases in a single flashcard:
* "{{c1::Mitochondria}} are the {{c1::powerhouse}} of the {{c1::cell}}"

When studying, this would appear as:
* "[ ...] are the [ ... ] of the [ ... ]"
