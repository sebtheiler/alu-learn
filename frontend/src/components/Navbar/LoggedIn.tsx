import Dropdown from '@components/Dropdown';
import Jdenticon from '@components/Jdenticon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faBook, faCogs, faEnvelope, faSignOut, faUserCircle, faFire } from '@fortawesome/free-solid-svg-icons';

const profileDropdownOptions = [
  { text: 'My Profile', href: '/profile', faIcon: faUserCircle },
  { text: 'Settings', href: '/settings', faIcon: faCogs },
  { text: 'Notifications', href: '/notifications', faIcon: faBell },
  { divider: true },
  { text: 'Changelog', href: '/changelog', faIcon: faBook },
  { text: 'Log-out', href: '/logout', faIcon: faSignOut },
  { text: 'Contact Us', href: '/contactus', faIcon: faEnvelope },
];

interface LoggedInProps {
  username: string;
  streak: {
    currentStreak: number;
    doneReviewsToday: boolean;
  };
}

export default function LoggedIn({ username, streak }: LoggedInProps) {
  return (
    <div className='ml-auto'>
      <div className='inline-flex px-3 py-2 items-center justify-center mr-12'>
        <FontAwesomeIcon
          icon={faFire} size='2x'
          className={'absolute w-10 h-10' + (streak.doneReviewsToday ? ' text-alu-streak-lit' : ' text-alu-streak-unlit')}
        />
        <p
          className='text-center w-6 h-6 mx-auto rounded-full'
          style={{
            background: streak.doneReviewsToday ? '#fd9626' : '#e5e5e5',
            color: streak.doneReviewsToday ? 'white' : 'black',
            fontSize: streak.currentStreak < 100 ? '16px' : '15px',
            transform: 'translateY(3px)',
          }}
        >
          {streak.currentStreak}
        </p>
      </div>
      <div className='inline-flex px-3 py-2 items-center justify-center'>
        <Dropdown options={profileDropdownOptions}>
          <Jdenticon
            value={username} size={32}
            className='absolute top-0 right-0 mt-3 mr-6 rounded-full w-12 h-12 p-1
                     bg-white bg-opacity-5 hover:bg-opacity-10'
          />
        </Dropdown>
      </div>
    </div>
  );
}