import Jdenticon from '@components/Jdenticon';
import { Link } from 'react-router-dom';

interface DisplayProfileInlineProps {
  /**
   * Profile to display inline
   */
  profile;
}

/**
 * Displays a profile inline, including a Jdenticon and a link to the user's profile
 */
export default function DisplayProfileInline({ profile }: DisplayProfileInlineProps) {
  return (
    <span className='inline'>
      <Jdenticon
        value={profile.username}
        size={15}
        style={{ transform: 'translateY(-1px)' }}
        className='inline'
      />
      <Link to={`/profiles/u/${profile.username}`} className='inline text-blue-500 hover:text-blue-600'>
        {profile.firstName} {profile.lastName}
      </Link>
    </span>
  );
}
