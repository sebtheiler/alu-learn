import Badge from 'react-bootstrap/Badge';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { Profile } from '../types';
import { identifierDict } from './identifiers';

interface BadgeDetail extends Badge {
  description: string;
  shortTitle: string;
  color: string;
}
interface BadgeProps {
  profile: Profile;
  showAll?: boolean;
}
export function BadgeComponent(props: BadgeProps) {
  const { profile, showAll } = props;
  if (!profile.badges) {
    return null;
  }

  const individualBadge = (badge: BadgeDetail, username?: string) => {
    return (
      <OverlayTrigger
        overlay={
          <Tooltip id={`badge-${username}-${badge.shortTitle}`}>
            {badge.description}
          </Tooltip>
        }
        placement='right'
        delay={{ show: 20, hide: 200 }}
        key={username ? `${badge.shortTitle}-${username}` : null}
      >
        <Badge
          style={{
            backgroundColor: badge.color,
            color: 'white',
          }}
          className='ml-1'
          pill
        >
          {badge.shortTitle}
        </Badge>
      </OverlayTrigger>
    );
  }

  const chosenBadge = profile.badges.filter(badge => badge.chosen)[0];
  if (chosenBadge) {
    return (
      <>
        {showAll
          ? profile.badges.map(badge => (badge.chosen ? individualBadge(identifierDict[badge.identifier], profile.username) : null))
          : individualBadge(identifierDict[chosenBadge.identifier])
        }
      </>
    );
  } else {
    return null;
  }
}
