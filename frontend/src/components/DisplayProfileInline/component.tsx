import Jdenticon from '@components/Jdenticon';

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
      <a href={`/profiles/u/${profile.username}`} className='inline'>
        {profile.firstName} {profile.lastName}
      </a>
    </span>
  );
}
