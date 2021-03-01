import React from 'react';
import Button from 'react-bootstrap/Button';

export function MainHook({ onClick }) {
  return (
    <>
      <h1>Learn Anything.  Remember Everything.</h1>
      <p>
        Flashcards that automatically optimize when you should review them<br />
        Spend less time studying, and get more out of it
      </p>
      <Button
        type='submit'
        className='mt-1'
        style={{ width: '250px' }}
        onClick={onClick}
        id='main-signup-btn'
      >
        Sign Up
      </Button>
      <div className='mt-5'>
        <p className='text-secondary mb-1'>Already have an account? Log-in instead</p>
        <Button
          variant='outline-primary'
          href='/login/'
          className='px-4'
        >
          Login
        </Button>
      </div>
    </>
  );
}

export function IntroductionVideo() {
  return (
    <iframe width="80%" height="120%"
      title='Alu Introduction Video'
      src="https://www.youtube.com/embed/maoqzbPv4jg"
      className='mx-auto'
      allowFullScreen
    />
  );
}

export function LandingArticle(props) {
  return (<>
    <h1>Boosting Your Memory and Grades With Alu</h1>
    <p>I’m sure you’ve felt that horrible feeling: you’re taking a test, and some word pops up that you don’t quite remember. You remember learning it, it feels so familiar, it’s right on the tip of your tongue, but you can’t get a hold of what it means. </p>
    <p>It’s one of the worst feelings, knowing you would have done just a little bit better had you spent an extra ten seconds reviewing the word beforehand.  Alu seeks to help eliminate that feeling, boosting your memory, and therefore your grades, with just a couple of minutes every day. </p>
    <p>Alu is a website that I’ve built over the past few months that uses spaced repetition to help you learn and remember more effectively.  You can sign up for free today.</p>

    <p>There are currently pre-made flashcards for: </p>
    <ul>
      <li><a href='https://www.alulearn.com/decks/2/'>AP World History</a></li>
      <li><a href='https://www.alulearn.com/decks/7/'>AP Biology</a></li>
      <li><a href='https://www.alulearn.com/decks/6/'>AP Psychology</a></li>
    </ul>

    <h2>The Forgetting Curve</h2>
    <p>John has 37 apples.</p>
    <p>If I ask you to close your eyes, count to ten, and tell me how many apples John has, you’ll probably remember pretty well.  But what if I ask you tomorrow?  The day after?  In a year?  The longer it has been since you learn a fact, the less likely you will remember that fact.</p>
    <p>This effect is known as the “forgetting curve.”</p>

    <img
      src='https://www.growthengineering.co.uk/wp-content/uploads/2016/11/the-forgetting-curve.png'
      alt='visual representation of the forgetting curve'
      width='100%'
    />
 
    <p>You can easily remember facts that you’ve learned recently, while you will have a much harder time remembering facts that you learned a while ago.</p>
    <p>Are we destined, then, to keep forgetting everything we learn?</p>
    <p>No.  Using a technique known as “spaced-repetition,” we can train our brains to hold on to information for much longer.</p>

    <h2>Spaced Repetition</h2>
    <p>Spaced repetition is the process of reviewing some piece of information or technique in spaced intervals.  For example, suppose you wanted to remember that allopatric speciation occurs when two groups of the same species become isolated due to geography, which causes them to diverge into different species. In that case, you could first review that fact tomorrow, then in a couple of days, then in a month, and so on.</p>
    <p>Every time you force your brain to remember a fact, that fact becomes slightly easier to remember.</p>
    <p>In terms of the forgetting curve, this means the rate at which the forgetting curve decreases gets smaller with each review.</p>

    <img
      src='https://elitemedicalprep.com/wp-content/uploads/2020/06/Osmosis-Spaced-Repetition-Graph.png'
      alt='visual representation of the forgetting curve'
      width='100%'
    />

    <p>Over a long period of time, spaced repetition allows you to remember a huge amount of information that you would have otherwise forgotten.</p>
    <p>But how do you know the best time to review information?</p>
    <p>This is where Alu comes in.  In Alu’s flashcard system, you are shown a flashcard’s front, then asked to remember its back.  Depending on how easily you remember the information, Alu automatically determines when you should next see the flashcard.</p>
    <p>Flashcards you remember better are shown to you more often, while flashcards that you have difficulty remembering are shown to you less often.</p>
    <p>This saves massive amounts of time compared to the traditional flashcard approach.  Instead of wasting time reviewing flashcards that you already remember correctly and not spending enough time on flashcards that you don’t remember well, Alu prioritizes the flashcards you have difficulty remembering.</p>
    <p>Some other flashcard programs, notably Quizlet, make you pay for this functionality, while Alu offers an improved version for free.</p>

    <h2>Why Memorize?</h2>
    <p>It is often seen as bad practice to simply memorize everything.</p>
    <p>While this is absolutely true, and you should always seek to understand a topic before turning it into flashcards and memorizing it, you can’t undermine the importance of memory.</p>
    <p>When taking a test, you don’t always have time to deduce a fact; you have to remember it as quickly as possible.  Furthermore, without remembering foundational information, you don’t have the tools required to solve more complex problems.</p>
    <p>Rote memorization will hurt your learning, but memory serves as the basis of problem-solving.</p>

    <h2>Notes</h2>
    <p>Alu isn’t just a flashcards program; it’s designed to make all parts of studying and learning easier.</p>
    <p>If you’re like me, you’ve probably been in a situation where you’re faced with a massive document of text.  It can be intimidating to see a wall of text staring at you, which is why I developed the “autonote” feature of Alu.</p>
    <p>Autonote breaks a long document into short and digestible pieces.  You can take notes on these individual pieces, and it will semi-automatically organize them into the appropriate section.  This allows you to turn a complex document into organized and detailed notes with little effort.</p>

    <img
      src='/static/images/autonote.png'
      alt='The Alu Autonote System in action'
      width='100%'
    />

    <p>Another problem I face when taking notes is that I don’t review them very often, if ever.  Alu allows you to have multiple “pages” in a single note document.  These aren’t simply the Google Doc-like pages where if you type enough, it forms a new page—Alu note pages act as entirely separate documents that allow you to organize your notes better.</p>
    <p>In a future update, you will even be able to search for information in your notes using a simple interface, making it much easier to find your notes for a topic when you are studying.</p>
    <p>Having all of your notes in one place using Alu makes it easier to study, review, and turn into flashcards.</p>

    <h2>Tasks</h2>
    <p>Some topics are too broad or too ability-based to be turned into flashcards.  This is where “tasks” come in.</p>
    <p>Tasks allow you to schedule an assignment, such as reviewing some notes or doing some practice problems on a spaced-repetition basis.  Like flashcards, tasks you perform well on will be shown less often, while tasks you need extra help with will be shown to you more often.</p>
    <p>Tasks offer you a powerful way to review the content you need most without having to manually figure out what you are struggling with.</p>

    <h2>Why Alu?</h2>
    <p>Alu isn’t the first program with spaced repetition flashcards, and it certainly won’t be the last.</p>
    <p>So why use Alu instead of an established brand like Quizlet or Anki?</p>

    <h2>Features and Design Philosophy</h2>
    <p>Neither Quizlet nor Anki have the notes and tasks systems—those are entirely unique to Alu.</p>
    <p>While Quizlet and Anki are centered around flashcards, Alu is centered around learning.  Alu uses flashcards since they are a powerful way to memorize information but is open to building new types of learning systems.</p>
    <p>Alu also has an improved flashcard sharing system.  While Anki requires that you download decks, Alu only requires a simple button press for an even more powerful sharing system.  Alu’s sharing system makes it easy to get the latest updates in shared flashcards when they are released, as well as share flashcards with your friends.</p>
    <p>Alu is also in the process of combining the best features of both Quizlet and Anki, with more types of studying and “click the location” flashcards from Quizlet, while also having “fill in the blank” flashcards from Anki.</p>

    <h2>Interface</h2>
    <p>Quizlet has a pretty interface, while Anki appears to be stuck in the 90s.  Anki’s interface is ugly and challenging to navigate, making it difficult for beginners to learn.  Alu has a slick, modern, and intuitive interface, along with several tutorial videos to make it as easy as possible to use.</p>
    <p>Furthermore, Anki is a desktop program that you need to download, while Alu works in any web browser.</p>

    <img
      src='/static/images/anki-vs-alu.png'
      alt='Comparison of Anki and Alu interfaces'
      width='100%'
    />
    <p className='text-center text-secondary'>Left: Anki; Right: Alu</p>

    <h2>Price</h2>
    <p>To get spaced repetition in Quizlet, you need to buy their $50-per-year pro mode—both Alu and Anki offer this for free.</p>
    <p>Anki’s iOS app, however, costs a hefty $25 to even download.  While Alu doesn’t yet have a dedicated mobile app, the website works perfectly on mobile, giving you a free and easy way to study while traveling.</p>

    <h2>Rate of Updates</h2>
    <p>Quizlet and Anki are both mostly set in stone.  While still receiving occasional updates, these updates are far in-between.  Alu, on the other hand, is updated every few weeks.</p>
    <p>Alu’s latest update includes the ability to have multiple pages in your notes, making it easier to organize the pages and find information when you need it.  On top of that, if you ever have an idea that could help revolutionize studying or learning, you can simply let me know, and we can work together to make it real—you can’t expect that from Quizlet and Anki.</p>

    <h2>Conclusion</h2>
    <p>Alu is a powerful tool to help you learn and study.  No matter what class you’re taking, Alu can help you remember what you learn.</p>
    <p>While it is always recommended to make your own flashcards, there are currently pre-made flashcards for:</p>
    <ul>
      <li><a href='https://www.alulearn.com/decks/2/'>AP World History</a></li>
      <li><a href='https://www.alulearn.com/decks/7/'>AP Biology</a></li>
      <li><a href='https://www.alulearn.com/decks/6/'>AP Psychology</a></li>
    </ul>

    <p>Multiple teachers that I’ve spoken with are interested in using Alu in the classroom. You can get a headstart by signing up today; your grades will thank you later.</p>
    <p>All WESS emails are currently allowed; if you would like to use a different, non-WESS email, please fill out the form on the landing page so that I can add it to the allow-list.  If you ever have any questions, please reach out to me, and I will get back to you as soon as possible.</p>
    <p>Happy <em>Aluing!</em></p>
  </>);
}