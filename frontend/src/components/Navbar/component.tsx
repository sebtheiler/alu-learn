import logoUrl from 'assets/logo.svg';
import proBannerUrl from 'assets/pro-banner.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { faBars, faCompass, faStar, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { Suspense, useState, lazy } from 'react';
import './style.scss';

const LoggedIn = lazy(() => import('./LoggedIn'));
const LoggedOut = lazy(() => import('./LoggedOut'));

interface NavbarProps {
  /**
   * Is the user currently logged in?
   */
  isLoggedIn: boolean;
  /**
   * Information about the user's streak
   */
  streak?: {
    currentStreak: number;
    doneReviewsToday: boolean;
  };
  /**
   * Username of the user (if logged in)
   */
  username?: string;
  /**
   * Is the user a pro user?
   */
  isPro?: boolean;
}

/**
 * Render a navbar
 */
export default function Navbar({
  isLoggedIn,
  streak,
  username,
  isPro,
}: NavbarProps) {
  const [expandedMenu, setExpandedMenu] = useState(false);

  return (
    <nav className='fixed top-0 left-0 w-screen flex items-center bg-alu-dark-purple p-3 flex-wrap shadow-lg'>
      <Link to='/' className='p-2 mr-2 inline-flex items-center'>
        <img
          src={logoUrl}
          alt='Alu Learn Logo'
          className='h-8 w-8 mr-2 hover:scale-x-[-1] transition duration-700'
        />
        <span className='text-xl font-bold text-white'>Alu Learn</span>
        {isPro && <img
          src={proBannerUrl}
          alt='Pro Banner'
          className='w-14 ml-1 hover:rotate-360 transition duration-700'
        />}
      </Link>
      <button className='inline-flex p-3 bg-white text-white bg-opacity-0
                         hover:bg-opacity-20 rounded-full lg:hidden ml-auto'
              onClick={() => setExpandedMenu(!expandedMenu)}
      >
        <FontAwesomeIcon icon={faBars} />
      </button>
      <div className={'w-full lg:inline-flex lg:flex-grow lg:w-auto' + (expandedMenu ? ' block' : ' hidden')} id='navigation'>
        <div className='lg:inline-flex lg:flex-row flex flex-col flex-grow'>
          <Link to='/explore' className='nav-item'>
            <FontAwesomeIcon icon={faCompass} />
            <span>Explore</span>
          </Link>
          <Link to='/pro' className='nav-item'>
            <FontAwesomeIcon icon={faStar} />
            <span>Pro</span>
          </Link>
          <Link to='/about' className='nav-item'>
            <FontAwesomeIcon icon={faInfoCircle} />
            <span>About</span>
          </Link>
          <Suspense fallback={<></>}>
            {isLoggedIn ? <LoggedIn streak={streak} username={username} /> : <LoggedOut />}
          </Suspense>
        </div>
      </div>
    </nav>
  );
}
