import { Jdenticon } from '../utils';
import { MinifiedProfile } from './types';

export default function DisplayProfileInline({ profile }: { profile: MinifiedProfile }) {
  return (
    <span>
      <Jdenticon value={profile.username} size={15} style={{ transform: 'translateY(-1px)' }} />
      <a href={`/profiles/u/${profile.username}/`}>
        {profile.first_name} {profile.last_name}
      </a>
    </span>
  );
}
