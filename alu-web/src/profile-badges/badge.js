import React from 'react';
import {identifierDict} from './identifiers';
import {generateTooltip} from '../utils';
import {Badge, OverlayTrigger} from 'react-bootstrap';

export function BadgeComponent(props) {
  const {profile} = props;
  const chosenBadge = identifierDict[profile.badges.filter(badge => badge.chosen)[0].identifier];

  return (
    <OverlayTrigger
      overlay={generateTooltip(chosenBadge.description)}
      placement='right'
      delay={{ show: 20, hide: 200 }}
    >
      <Badge
        style={{
          backgroundColor: chosenBadge.color,
          color: 'white',
        }}
        pill
      >
        {chosenBadge.shortTitle}
      </Badge>
    </OverlayTrigger>
  );
};