import { MinifiedProfile } from './types';

export default function DisplayProfileInline({ profile }: { profile: MinifiedProfile }) {
  return (
    <span>
      <a href={`/profiles/u/${profile.username}/`}>
        {profile.first_name} {profile.last_name}
      </a>
    </span>
  );
}
