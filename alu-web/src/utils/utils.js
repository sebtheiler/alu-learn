import React, { useRef, useEffect, useState, useMemo } from 'react';
import numeral from 'numeral';
import ReactMarkdown from 'react-markdown/with-html';
import RemarkMathPlugin from 'remark-math';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { BlockMath, InlineMath } from 'react-katex';
import { FullEditor, createFullEditor  } from '../notes/editor-components';
import { Slate } from 'slate-react';
import 'katex/dist/katex.min.css';
import { errorHandler } from './errorHandler';

// Creates a simple tooltip
export const generateTooltip = (text) => {
  return (props) => (
    <Tooltip className='button-tooltip' {...props}>
      <ReactMarkdown source={text} />
    </Tooltip>
  );
}

// Displays the time since a date in a pretty format
// Modified from https://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
export function timeSince(date, reverse=false) {
  const seconds = Math.floor((reverse ? (date - new Date()) : (new Date() - date)) / 1000);
  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + (Math.floor(interval) === 1 ? " year" : " years");
  }

  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + (Math.floor(interval) === 1 ? " month" : " months");
  }

  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + (Math.floor(interval) === 1 ? " day" : " days");
  }

  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + (Math.floor(interval) === 1 ? " hour" : " hours");
  }

  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + (Math.floor(interval) === 1 ? " minute" : " minutes");
  }

  return Math.floor(seconds) + (Math.floor(seconds) === 1 ? " second" : " seconds");
}
// export const oneDay = 24*60*60*1000;

export function timeUntil(date) {
  // The second thing returned is 0 if it is today, -1 if it is in past, 1 in future
  date.setMinutes(date.getMinutes() + (new Date()).getTimezoneOffset());
  const today = new Date(new Date().setHours(0, 0, 0));

  if (date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    ) {
      return ['today', 0];
  } else if (date < today) {
    let yesterday = today;
    yesterday.setDate(today.getDate() - 1);

    if (date.getFullYear() === yesterday.getFullYear() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getDate() === yesterday.getDate()
    ) {
      return ['yesterday', -1];
    } else {
      return [timeSince(date) + ' ago', -1];
    }
  } else {
    let tomorrow = today;
    tomorrow.setDate(today.getDate() + 1);

    if (
      date.getFullYear() === tomorrow.getFullYear() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getDate() === tomorrow.getDate()
    ) {
      return ['tomorrow', 1];
    } else {
      return ['in ' + timeSince(date, true), 1];
    }
  }
}


// Makes the passed number appear in the format: 1231 -> 1k, 123 -> 123, 4124124 -> 4m
export function DisplayCountChar(props) {
  return (
    <span className={props.className}>
      {parseInt(props.children) < 1000 ? parseInt(props.children) : numeral(props.children).format('0.0a')}
    </span>
  );
}

// Makes the passed number appear in the format: 1231 -> 1,231, 123 -> 123, 4124124 -> 4,124,124
export function DisplayCountCommas(props) {
  return (
    <span className={props.className}>
      {numeral(props.children).format('0,0')}
    </span>
  );
}

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
  }
  
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
  }
}

// Taken from https://stackoverflow.com/a/25352300
export function isAlphaNumeric(str) {
  var code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123)) { // lower alpha (a-z)
      return false;
    }
  }
  return true;
}

// Move move a date by a number of days
// Taken from https://codesandbox.io/s/73mk9wlyx?file=/src/index.js:1031-1195
export function shiftDate(date, numDays) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + numDays);
  return newDate;
}

// Equivalent of Python's range
// Taken from https://dev.to/ycmjason/how-to-create-range-in-javascript-539i#:~:text=range%20is%20a%20function%20that,integers%20from%20start%20to%20end.
export function range(start, end) {
  const length = end - start;
  return Array.from({ length }, (_, i) => start + i);
}

// Makes a Bootstrap checkmark, that isn't broken
// The React-Bootstrap checkmark is very broken,
// so we are temporarily using regular HTML. Once
// it is fixed we can replace this with proper React-
// Bootstrap
export function FormCheckbox(props) {
  const {required, name, defaultChecked, id, onChange} = props;
  const type = props.type ? props.type : 'checkbox';

  return (
    <label className='form-check-label'>
      <input
        type={type}
        required={required ? 'required' : ''}
        defaultChecked={defaultChecked}
        name={name}
        id={id}
        onChange={onChange}
      />{' '}
      {props.children}
    </label>
  );
}


// Generates a little question-bubble with tooltip
export function QuestionBubble(props) {
  // Type could be:
  // question; info; times; stop; minus; plus;
  // dot; usd; pause; etc.
  const type = props.type ? props.type : 'question';

  const showDelay = props.showDelay ? props.showDelay : 350;
  const hideDelay = props.hideDelay ? props.hideDelay : 1800;

  return (
    <OverlayTrigger
      overlay={generateTooltip(props.children)}
      placement='right'
      delay={{ show: showDelay, hide: hideDelay }}
    >
      <i className={`fas fa-${type}-circle text-secondary`} />
    </OverlayTrigger>
  );
}

// Fully-featured MD rendered with KaTeX, MarkDown, and (safe-ish) HTML rendering
export function MarkdownRender(props) {
  const {source, disallowedTypes} = props;
  const allowHtml = props.allowHtml ? props.allowHtml : true;
  const allowKatex = props.allowKatex ? props.allowKatex : true;

  return (
    <ReactMarkdown
      source={source.replaceAll('<script>', '').replaceAll('</script>', '')}
      plugins={allowKatex ? [RemarkMathPlugin] : null}
      escapeHtml={!Boolean(allowHtml)}
      disallowedTypes={disallowedTypes}
      renderers={allowKatex ? {
        math: ({ value }) => <BlockMath>{value}</BlockMath>,
        inlineMath: ({ value }) => <InlineMath>{value}</InlineMath>
      } : null}
    />
  );
}

// Calls a function every N milliseconds
// Taken from https://overreacted.io/making-setinterval-declarative-with-react-hooks/
export function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

// Returns whether or not an index of a string is in a regex match
// Taken from https://stackoverflow.com/a/64188089/13042142
export function inMatch(pos, str, regex) {
  let match;
  while ((match = regex.exec(str)) !== null) {
    // regex.lastIndex is the position after the last match.
    // And match[0] is the whole last match.
    if (pos >= regex.lastIndex - match[0].length && pos < regex.lastIndex) {
      // if pos is between the beginning and the end of the last match,
      // it is within a match, therefore, return true.
      return true;
    }
  }
  // pos is not within any match, so, return false.
  return false;
}

// https://stackoverflow.com/a/2450976/13042142
export function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

// Renders Slate rich text
export function RenderRichText(props) {
  const {text, fixSlateLazy} = props;
  const [value, setValue] = useState(text);
  const editor = useMemo(
    () => createFullEditor(),
    []
  );

  useEffect(() => {
    try {
      if (fixSlateLazy) {
        // Slate is lazy and won't automatically update the editor when the flashcard
        // prop is changed, so we manually have to check if it has changed
        // The value dependency is excluded on purpose - including it causes infinite loop
        if (text !== value) {
          setValue(text);
        }
      }
    } catch (e) {
      console.log(e);
    }
    // eslint-disable-next-line
  }, [text, fixSlateLazy]);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <FullEditor
        editor={editor}
        readOnly={true}
        styleOptions={{ minHeight: '0' }}
      />
    </Slate>
  );
}

// Chooses n unique random elements from arr
// Adapted from https://stackoverflow.com/a/19270021/13042142
export function sample(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError('sample: more elements taken than available');
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

// Adapted from http://stackoverflow.com/a/10997390/11236
export function updateURLParameter(url, param, paramVal){
  let newAdditionalURL = "";
  let tempArray = url.split("?");
  const baseURL = tempArray[0];
  const additionalURL = tempArray[1];
  let temp = "";
  if (additionalURL) {
    tempArray = additionalURL.split("&");
    for (var i=0; i<tempArray.length; i++){
      if(tempArray[i].split('=')[0] !== param){
        newAdditionalURL += temp + tempArray[i];
        temp = "&";
      }
    }
  }

  const rows_txt = temp + "" + param + "=" + paramVal;
  return baseURL + "?" + newAdditionalURL + rows_txt;
}

// Converts a date to an ISOString, but doesn't convert it to UTC
export function timezoneToISOString(date) {
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
}

// Get object from API hook
export function useApiObjectHook(apiFunction, successCodes, errorNumber, args=[], callback=null) {
  const [apiObject, setApiObject] = useState(null);
  const [apiObjectDidSet, setApiObjectDidSet] = useState(false);

  useEffect(() => {
    if (!apiObjectDidSet) {
      setApiObjectDidSet(true);
      apiFunction(...args, (response, status) => {
        if (successCodes instanceof Array ? successCodes.includes(status) : status === successCodes) {
          setApiObject(response);
          if (callback) callback(response);
        } else {
          errorHandler(response, status, errorNumber);
        }
      })
    }
  }, [apiObject, apiObjectDidSet, apiFunction, args, callback, successCodes, errorNumber]);

  return [apiObject, setApiObject];
}
