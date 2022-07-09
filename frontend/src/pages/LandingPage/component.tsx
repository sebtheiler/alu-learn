import Button from 'components/Button'
import GlobalContext from '@global';
import globalSharingSystemUrl from 'assets/global-sharing-system.png';
import skillTreeUrl from 'assets/skill-tree.png';
import spacedRepetitionUrl from 'assets/spaced-repetition.png';
import useWindowDimensions from 'hooks/useWindowDimensions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain, faDna, faLandmarkDome, faMonument, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useContext, useMemo } from 'react';
import './style.scss';

/**
 * Shuffled list of testimonials from users
 */
const testimonials = [
  'Alu has been a tool that has made studying much less of a burden for me since it is so engaging and straightforward. When studying with Alu, it always truly feels like I am able to take in and understand the material and not just memorize content.',// I completely owe the success I have had on the AP exams I have taken to Alu.',
  'With Alu, I\'m able to remember the content [better than with cramming], and it really sticks in your brain after',
  'This is an amazing website. Truly helped me more than I would have been able to do by myself on regular flashcards.',
  'Really useful. Learned a lot of stuff that we didn\'t cover in class.'
].sort(() => 0.5 - Math.random());

/**
 * Renders the landing page
 */
export default function LandingPage() {
  const { height } = useWindowDimensions();
  const { setSignUpModalOpen, setLogInModalOpen } = useContext(GlobalContext);

  const exampleDecks = useMemo(() => [
    { title: 'AP World History', link: '/l/world', icon: faMonument },
    { title: 'AP Psychology', link: '/l/psych', icon: faBrain },
    { title: 'AP US Government', link: '/l/usgov', icon: faLandmarkDome },
    { title: 'AP Biology', link: '/l/bio', icon: faDna },
    { title: 'Create Your Own!', onClick: () => setSignUpModalOpen(true), icon: faPlus },
  ], [setSignUpModalOpen]);

  return (<div>
    <div style={{ height: `${height - 100}px` }} className='bg-alu-dark-purple w-100'>
      <div className='grid md:grid-cols-1 text-center lg:grid-cols-2 lg:text-left h-full items-center'>
        <div className='bg-white py-10 rounded-2xl mx-6 md:mx-16 text-alu-dark-purple shadow-lg shadow-violet-400/40'>
          <div className='sm:px-5 md:px-6 xl:px-9'>
            <h1 className='text-2xl md:text-4xl xl:text-5xl font-medium mb-3 md:mb-8'>
              Learn Anything.<br />
              Remember Everything.
            </h1>
          </div>
          <div className='px-10'>
            <p className='text-md xl:text-xl 2xl:text-2xl mb-10'>
              Flashcards that automatically optimize when you should review them.<br />
              Spend less time studying and get more out of it.
            </p>
            <div className='text-center'>
              <Button block onClick={() => setSignUpModalOpen(true)} className='max-w-2xl text-lg'>
                Get Started
              </Button>
              <p className='mt-4 text-sm md:text-base'>
                Already have an account?{' '}
                <span
                  className='text-blue-400 hover:text-blue-500 underline cursor-pointer'
                  onClick={() => setLogInModalOpen(true)}
                >
                  Log-in
                </span>{' '}
                instead
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className='w-100 bg-alu-dark-purple flex' style={{ height: '100px' }}>
      <div className='w-full bg-white/10 hidden lg:block'>
        <div className='relative text-center top-1/2 -translate-y-1/2 text-lg'>
          <ul>
            {exampleDecks.map((exampleDeck, i) =>
              <li
                key={i}
                className='inline-block rounded-full mx-2 p-0
                         text-white text-opacity-60 bg-white bg-opacity-20
                         hover:text-opacity-100 hover:bg-opacity-30 cursor-pointer'
              >
                <a href={exampleDeck.link} onClick={exampleDeck.onClick} className='px-4 py-2 block'>
                  <FontAwesomeIcon icon={exampleDeck.icon} className='mr-2' />
                  {exampleDeck.title}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
    <div className='px-2 container mx-auto mt-10'>
      <div className='text-center mb-5'>
        <h1 className='text-2xl font-semibold mb-5'>What People Are Saying</h1>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4'>
          {testimonials.map((testimonial, i) =>
            <div key={i} className='border-4 border-alu-primary-purple rounded-xl p-4 mx-4 mb-4 items-center flex'>
              <p className='italic'>"{testimonial}"</p>
            </div>
          )}
        </div>
      </div>
      <hr />
      <div className='mt-5'>
        <h1 className='text-center text-2xl font-bold'>How Alu Can Help You</h1>
        <div className='help-section'>
          <div className='help-section-text'>
            <div>
              <h2>Spaced Repetition</h2>
              <p>Spaced repetition enables you to memorize more effectively by automatically putting intervals between when you review material</p>
            </div>
          </div>
          <div className='help-section-image'>
            <img
              src={spacedRepetitionUrl}
              alt='Graph depicting how memory decays over time, and how spaced repetition can be used to combat that'
            />
          </div>
        </div>
        <div className='help-section'>
          <div className='help-section-image'>
            <img
              src={globalSharingSystemUrl}
              alt="Illustration of Alu's sharing system, and how people from around the world can contribute to a deck"
              className='ml-auto'
            />
          </div>
          <div className='help-section-text'>
            <div>
              <h2>Global Sharing System</h2>
              <p>Easily share and collaborate on flashcard decks</p>
            </div>
          </div>
        </div>
        <div className='help-section'>
          <div className='help-section-text'>
            <div>
              <h2>Skill Tree</h2>
              <p>Organize decks into units and subunits that make it easy to review specific content, or an entire course</p>
            </div>
          </div>
          <div className='help-section-image'>
            <img
              src={skillTreeUrl}
              alt='Illustration of an example skill tree'
            />
          </div>
        </div>
      </div>
    </div>
    <div className='text-center max-w-xl mx-auto mb-10 px-3'>
      <p className='text-xl font-bold'>
        Ready to memorize more of what you learn?
      </p>
      <Button
        className='mt-1 mx-auto text-center'
        onClick={() => setSignUpModalOpen(true)}
        block
      >
        Get Started
      </Button>
    </div>
  </div>);
}
