import React from 'react';
import numeral from 'numeral';
import {Tooltip} from 'react-bootstrap';

// Creates a simple tooltip
export const generateTooltip = (text) => {
  return (props) => (
    <Tooltip className='button-tooltip' {...props}>
      {text}
    </Tooltip>
  );
};

// Displays the time since a date in a pretty format
// Modified from https://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
// Modified from https://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
export function timeSince(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + (Math.floor(interval) === 1 ? " year" : " years");
  };

  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + (Math.floor(interval) === 1 ? " month" : " months");
  };

  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + (Math.floor(interval) === 1 ? " day" : " days");
  };

  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + (Math.floor(interval) === 1 ? " hour" : " hours");
  };

  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + (Math.floor(interval) === 1 ? " minute" : " minutes");
  };

  return Math.floor(seconds) + (Math.floor(seconds) === 1 ? " second" : " seconds");
};
// export const oneDay = 24*60*60*1000;


// Makes the passed number appear in the format: 1231 -> 1k, 123 -> 123, 4124124 -> 4m
export function DisplayCount(props) {
  return (
    <span className={props.className}>
      {parseInt(props.children) < 1000 ? parseInt(props.children) : numeral(props.children).format('0.0a')}
    </span>
  );
};  