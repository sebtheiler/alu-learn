import React from 'react';
import {identifierDict} from './identifiers';
import {generateTooltip} from '../utils';
import {Badge, OverlayTrigger} from 'react-bootstrap';

export function BadgeComponent(props) {
  const {profile, showAll} = props;

  const individualBadge = (badge, username) => {
    return (
      <OverlayTrigger
        overlay={generateTooltip(badge.description)}
        placement='right'
        delay={{ show: 20, hide: 200 }}
        key={username ? `${badge.identifier}-${username}` : null}
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
  };

  return (
    <>
      {showAll
        ? profile.badges.map(badge => (badge.chosen ? individualBadge(identifierDict[badge.identifier], profile.username) : null))
        : individualBadge(identifierDict[profile.badges.filter(badge => badge.chosen)[0].identifier])
      }
    </>
  );
};