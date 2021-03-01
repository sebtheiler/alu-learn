import React, { useMemo } from 'react';
import { has } from '../utils';
import { BadgeComponent } from './badges';
import { MinifiedProfile, Profile } from './types';


// Component for displaying a user's first and last name, and a clickable username
interface UserLinkProps {
  user: Profile | MinifiedProfile;
  hideFullName?: boolean;
  noLink?: boolean;
  showAllBadges?: boolean;
  hideBadges?: boolean;
  small?: boolean;
}
export function UserLink(props: UserLinkProps) {
  const { user, hideFullName=false, noLink=false, showAllBadges=false, hideBadges=false, small=false } = props;

  const main = useMemo(() => (
    <>
      {hideFullName && `${user.first_name} ${user.last_name} `}
      {/* eslint-disable-next-line */ /* This is so it doesn't complain about an undefined href*/}
      <a href={noLink ? undefined : `/profiles/u/${user.username}`}>
        @{user.username}
      </a>{' '}
      {!hideBadges && has(user, 'badges') &&
        <BadgeComponent
          profile={user}
          showAll={showAllBadges}
        />
      }
    </>
  ), [hideBadges, hideFullName, noLink, showAllBadges, user]);

  return (
    <div>
      {small ? <small className='text-secondary'>{main}</small> : main}
    </div>
  );
}
