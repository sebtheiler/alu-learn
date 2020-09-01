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
export function DisplayCountChar(props) {
  return (
    <span className={props.className}>
      {parseInt(props.children) < 1000 ? parseInt(props.children) : numeral(props.children).format('0.0a')}
    </span>
  );
};

// Makes the passed number appear in the format: 1231 -> 1,231, 123 -> 123, 4124124 -> 4,124,124
export function DisplayCountCommas(props) {
  return (
    <span className={props.className}>
      {numeral(props.children).format('0,0')}
    </span>
  );
};

// Calculates whether a color is dark or light
// Adapted from https://awik.io/determine-color-bright-dark-using-javascript/
export function lightOrDark(color) {
  // Variables for red, green, blue values
  let r, g, b, hsp;
  
  // Check the format of the color, HEX or RGB?
  if (color.match(/^rgb/)) {
    // If RGB --> store the red, green, blue values in separate variables
    color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);

    r = color[1];
    g = color[2];
    b = color[3];
  } else {
    // If hex --> Convert it to RGB: http://gist.github.com/983661
    color = +("0x" + color.slice(1).replace( 
    color.length < 5 && /./g, '$&$&'));

    r = color >> 16;
    g = (color >> 8) & 255;
    b = color & 255;
  };
  
  // HSP equation from http://alienryderflex.com/hsp.html
  hsp = Math.sqrt(
    0.299 * (r * r) +
    0.587 * (g * g) +
    0.114 * (b * b)
  );

  // Using the HSP value, determine whether the color is light or dark
  if (hsp > 127.5) {
    return 'light';
  }  else {
    return 'dark';
  };
};

// Taken from https://stackoverflow.com/a/25352300
export function isAlphaNumeric(str) {
  var code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123)) { // lower alpha (a-z)
      return false;
    };
  };
  return true;
};