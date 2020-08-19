import React from 'react';
import {Tooltip} from 'react-bootstrap';

export const generateTooltip = (text) => {
  return (props) => (
    <Tooltip className='button-tooltip' {...props}>
      {text}
    </Tooltip>
  );
};