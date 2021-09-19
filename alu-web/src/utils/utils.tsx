import React, { useRef, useEffect, useState, useMemo, Dispatch, SetStateAction, ChangeEvent, ReactNodeArray, ReactNode } from 'react';
import numeral from 'numeral';
import { Tooltip, OverlayTrigger, Button, Form, FormControlProps } from 'react-bootstrap';
import { FullEditor, createFullEditor  } from '../text-editor';
import { Slate } from 'slate-react';
import { errorHandler } from './errorHandler';
import { Node as SlateNode } from 'slate';

// Creates a simple tooltip
export const generateTooltip = (text) => {
  return (props) => (
    <Tooltip className='button-tooltip' {...props}>
      {text}
    </Tooltip>
  );
}

// Displays the time since a date in a pretty format
// Modified from https://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
export function timeSince(date: Date, reverse=false) {
  const dateGetTime = date.getTime();
  const nowGetTime = new Date().getTime();
  const seconds = Math.floor((reverse ? (dateGetTime - nowGetTime) : (nowGetTime - dateGetTime)) / 1000);
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
export function range(start: number, end: number) {
  const length = end - start;
  return Array.from({ length }, (_, i) => start + i);
}

// Makes a Bootstrap checkmark, that isn't broken
// The React-Bootstrap checkmark is very broken,
// so we are temporarily using regular HTML. Once
// it is fixed we can replace this with proper React-
// Bootstrap
interface FormCheckboxProps {
  required?: boolean;
  name?: string;
  defaultChecked?: boolean;
  id?: string;
  value?: string;
  onChange?(event: ChangeEvent<HTMLInputElement>): void;
  children?: ReactNodeArray | ReactNode;
  type?: 'checkbox' | 'radio';
}
export function FormCheckbox(props: FormCheckboxProps) {
  const { required, name, defaultChecked, id, value, onChange, type='checkbox' } = props;

  return (
    <label className='form-check-label'>
      <input
        type={type}
        required={required}
        defaultChecked={defaultChecked}
        name={name}
        id={id}
        value={value}
        onChange={onChange}
      />{' '}
      {props.children}
    </label>
  );
}


// Generates a little question-bubble with tooltip
interface QuestionBubbleProps {
  type?: 'info' | 'question';
  showDelay?: number;
  hideDelay?: number;
  children?: ReactNodeArray | ReactNode;
  isWhite?: boolean;
}
export function QuestionBubble(props: QuestionBubbleProps) {
  const { type = 'question', showDelay = 350, hideDelay = 1800, isWhite = false, } = props;

  return (
    <OverlayTrigger
      overlay={generateTooltip(props.children)}
      placement='right'
      delay={{ show: showDelay, hide: hideDelay }}
    >
      <i className={`fas fa-${type}-circle` + (isWhite ? '' : ' text-secondary')} />
    </OverlayTrigger>
  );
}

// TODO: DELETE
// Fully-featured MD rendered with KaTeX, MarkDown, and (safe-ish) HTML rendering
// interface MarkdownRenderProps {
//   source: string;
//   allowHtml?: boolean;
//   allowKatex?: boolean;
// }
// export function MarkdownRender(props: MarkdownRenderProps) {
//   const { source, allowHtml=false, allowKatex=true } = props;

//   return (
//     <ReactMarkdown
//       source={source.replaceAll('<script>', '').replaceAll('</script>', '')}
//       plugins={allowKatex ? [RemarkMathPlugin] : undefined}
//       escapeHtml={!Boolean(allowHtml)}
//       renderers={allowKatex ? {
//         math: ({ value }) => <BlockMath>{value}</BlockMath>,
//         inlineMath: ({ value }) => <InlineMath>{value}</InlineMath>
//       } : undefined}
//     />
//   );
// }

// Calls a function every N milliseconds
// Taken from https://gist.github.com/babakness/faca3b633bc23d9a0924efb069c9f1f5
type IntervalFunction = () => (unknown | void);
export function useInterval(callback: IntervalFunction, delay: number | null) {
  const savedCallback = useRef<IntervalFunction| null>(null);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  });

  // Set up the interval.
  useEffect(() => {
    if (delay !== null) {
      function tick() {
        if (savedCallback.current !== null) {
          savedCallback.current();
        }
      }
  
      const id = setInterval(tick, delay);
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
    currentIndex--;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

// Renders Slate rich text
interface RenderRichTextProps {
  text: SlateNode[];
  fixSlateLazy?: boolean;
}
export function RenderRichText(props: RenderRichTextProps) {
  const { text, fixSlateLazy } = props;

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
        styleOptions={{ minHeight: '0' }}
        readOnly
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
export function updateURLParameter(url: string, param: string, paramVal: any){
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
export function timezoneToISOString(date: Date) {
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
}

// Get object from API hook
export function useApiObjectHook<T>(
  apiFunction: Function,
  successCodes: number | number[],
  errorNumber: number,
  args: any[]=[],
  callback: (Function | undefined | null)=undefined,
  processResponse: (Function | undefined | null)=undefined,
  condition: boolean=true,
): [T | undefined, Dispatch<SetStateAction<T | undefined>>] {
  const [apiObject, setApiObject] = useState<T | undefined>(undefined);
  const [apiObjectDidSet, setApiObjectDidSet] = useState<boolean>(false);

  useEffect(() => {
    if (!apiObjectDidSet && condition) {
      setApiObjectDidSet(true);
      apiFunction(...args, (response, status) => {
        if (successCodes instanceof Array ? successCodes.includes(status) : status === successCodes) {
          const processedResponse = processResponse ? processResponse(response) : response;
          setApiObject(processedResponse);
          if (callback) callback(response, status);
        } else {
          errorHandler(response, status, errorNumber);
        }
      });
    }
  }, [apiObject, apiObjectDidSet, apiFunction, args, callback, successCodes, errorNumber, processResponse, condition]);

  return [
    apiObject as T | undefined,
    setApiObject as Dispatch<SetStateAction<T | undefined>>,
  ];
}


export function useApiObjectPaginationHook<T>(
  apiFunction: Function,
  successCodes: number | number[],
  errorNumber: number,
  args: any[]=[],
  callback: (Function | undefined | null)=undefined,
  processResponse: (Function | undefined | null)=undefined,
  condition: boolean=true,
): [T | undefined, string, Dispatch<SetStateAction<T | undefined>>, Dispatch<SetStateAction<string>>] {
  const [nextUrl, setNextUrl] = useState('');
  const [apiObject, setApiObject] = useApiObjectHook<T>(
    apiFunction, successCodes, errorNumber, args, callback,
    response => {
      setNextUrl(response.next);
      return processResponse ? processResponse(response.results) : response.results;
    },
    condition,
  );

  return [
    apiObject as T,
    nextUrl as string,
    setApiObject as Dispatch<SetStateAction<T | undefined>>,
    setNextUrl as Dispatch<SetStateAction<string>>,
  ];
}


// Converts a date with time information to a raw date
export function stripTime(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() , date.getDate());
}


// Gets distance between two dates
// Adapted from https://stackoverflow.com/a/3224854/13042142
export function dateDiff(
  date1: Date,
  date2: Date,
  timeUnit: number = 1000 * 60 * 60 * 24,
): number {
  const diffTime = date2.getTime() - date1.getTime();
  const diff = Math.ceil(diffTime / timeUnit); 

  return diff;
}


// Adds some days to a date
// Adapted from https://stackoverflow.com/a/563442/13042142
export function addDays(date: Date, days: number): Date {
  let result = new Date(date);
  result.setDate(date.getDate() + days);
  return result;
}


// Creates a button that can't accidently be clicked twice
interface LoadingButtonProps {
  children: React.ReactNode | React.ReactNodeArray;
  loadingMessage: string;
  callback?(event: React.MouseEvent): void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'info' | 'warning';
  type?: 'submit' | 'reset' | 'button';
  id?: string;
  block?: boolean;
  className?: string;
}
export function LoadingButton(props: LoadingButtonProps) {
  const { children, loadingMessage, callback, variant, type, id, block, className } = props;
  const [isLoading, setIsLoading] = useState(false);

  const onClick = event => {
    if (!isLoading) {
      setIsLoading(true);
      if (callback) callback(event);
    }
  }

  return (
    <Button onClick={onClick} variant={variant} type={type} id={id} block={block} className={className}>
      {isLoading ? loadingMessage : children}
    </Button>
  );
}

// TS compliant function for checking if object has property
// Taken from https://github.com/microsoft/TypeScript/issues/21732#issuecomment-663994772
export function has<P extends PropertyKey>(target: object, property: P): target is { [K in P]: unknown } {
	// The `in` operator throws a `TypeError` for non-object values.
	return property in target;
}

export function getMonthNumber(monthName: string) {
  return [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ].indexOf(monthName) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
}


/*
Creates a pretty version of the file upload

Get file from Form with:
const file = form.uploadFile.files[0];

Load file contents with
file.text().then((fileContents) => {
  // ...
});

TODO: move to special file in new skill tree with other components
*/
interface FancyFormFileUploadProps extends FormControlProps {
  accept?: string; /** Type of file to accept (.txt, .json, etc.) */
  changeCallback?(event): void;
}
export function FancyFormFileUpload(props: FancyFormFileUploadProps) {
  const { accept, changeCallback } = props;
  let defaultProps = {...props as any};
  if (defaultProps.accept) delete defaultProps.accept;
  if (defaultProps.changeCallback) delete defaultProps.changeCallback;
  const fileRef = React.createRef<HTMLInputElement>();

  return (
    <Form.Group className='custom-file mb-4'>
      <Form.Label
        className='custom-file-label text-left'
        htmlFor='txtFileUpload'
        id='txt-file-label'
      >
        Choose file
      </Form.Label>
      <Form.File
        className='custom-file-input'
        id='txtFileUpload'
        name='uploadFile'
        accept={accept}
        ref={fileRef}

        // Update the label to the name of the uploaded file
        onChange={event => {
          const txtFileLabel = document.getElementById('txt-file-label');
          if (txtFileLabel && fileRef) {
            txtFileLabel.innerHTML =
              fileRef!.current!.value.replace('C:\\fakepath\\', '');
          }
          if (changeCallback) changeCallback(event);
        }}

        {...defaultProps}
      />
    </Form.Group>
  );
}

// Returns the current day's date in the form YYYY-MM-DD (2020-06-02)
export function stringDate(
  date: Date = new Date(),
  tzAware: boolean = true,
): string {
  const offset = tzAware ? date.getTimezoneOffset() : 0;
  date = new Date(date.getTime() - (offset*60*1000));
  return date.toISOString().split('T')[0];
}

// Three functions for dealing with cookies
// adapted from https://stackoverflow.com/a/24103596/10226703
export function setCookie(name: string, value: string, days: number) {
  let expires = "";
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + (days*24*60*60*1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = `${name}=${value || ""}${expires};$path=/"`;
}

export function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  // @ts-ignore  /** TS fails to realize `parts.length === 1` ensures `.pop()` isn't undefined */
  if (parts.length === 2) return parts.pop().split(';').shift();
}

export function eraseCookie(name: string) {   
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}

// Capitalizes the first letter of a string
// If `all` is true, it does this for each word in the string
export function capitalize(str: string, all: boolean = false) {
  if (all)
    return str.split(' ').map(s => capitalize(s)).join(' ');
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function confirmDelete(name: string) {
  return window.prompt(`
Are you sure you want to delete this ${name}?  This action is instant and irreversible.
For your own safety, please type "DELETE" (all caps, without the quotes) to confirm
that you want to delete this deck.
  `) === 'DELETE';
}

// Converts a blob to base64
export const blob2base64 = async (blob: Blob) => {
  return new Promise<string | ArrayBuffer | null>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob); 
    reader.onloadend = () => {
      const base64data = reader.result;                
      resolve(base64data);
    }
  });
}