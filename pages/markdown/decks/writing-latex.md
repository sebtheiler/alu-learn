## Writing LaTeX
LaTeX is a mathematical language that allows you to write beautiful equations. It has a simple syntax that makes it easy to learn, yet still powerful. You can write LaTeX where ever Alu has a rich text editor, including both flashcards and notes.


There are two types of math equations: block equations and inline equations.  Block equations are the equivalent of a new paragraph, they have an entire space dedicated to them.  Inline equations can be written within a regular text paragraph, allowing you to give quick references to variables or render short mathematical statements.  Some "big" functions (e.g., summation, integration, limits, etc.) are squished in inline equations so that they don't overflow the line.


You can create a block equation by pressing the button that looks like "square root of x."  On the other hand, inline equations are created by selecting some text and pressing the symbol that looks like a division sign.  When editing, LaTeX is a slight shade of gray, has a monospace font, and is always italicized.  When you switch your note to "View Mode" or study/browse your flashcard, you LaTeX string is converted into a math equation.


### Examples
Here are some basic examples to get you started writing LaTeX:
If you wish to quickly test them out, you can copy-paste them into [this website](https://latexeditor.lagrida.com/).


* Fraction 1/2: `\frac{1}{2}`
* Pythagorean theorem: `a^2 + b^2 = c^2`
* Quadratic formula: `\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}`
* General quadratic equation: `ax^2 + bx + c`
* Log multiplication identity: `\log xy = \log x + \log y`
* Pythagorean identity: `\sin^2(x) + \cos^2(x) = 1`
* Derivative Definition: `\frac{df}{dt} = \lim_{h \to 0} \frac{f(t+h) - f(t)}{h}`
* Fundamental Theorem of Calculus: `\int_a^b f(x) dx = F(b) - F(a)`


### Cloze
LaTeX in Alu is compatible with [cloze deletion](/help/cloze-deletion/).  Although it may appear funky when browsing flashcards, cloze deletion works perfectly when you are studying.


Some equations have distinct "parts" that are best memorized separately.  For example, if you keep forgetting the quadratic formula, you could break it up like this: `\frac{ {{c1::-b}}  \pm \sqrt{ {{c2::b^2 - 4ac}} }}{ {{c3::2a}} }`


As with regular cloze flashcards, this would create three separate flashcards.


### Technical Note
Alu's LaTeX is KaTeX (what Khan Academy uses), instead of full LaTeX.  This should make practically zero difference, and if you don't understand what this means you don't need to worry about it.
