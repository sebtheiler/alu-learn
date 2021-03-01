// Adapted from http://www.quirksmode.org/js/cookies.html
function getCookie(cname) {
  const name = cname + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}


const host = window.location.host === 'localhost:3000' || window.location.host === '127.0.0.1:3000' ? '127.0.0.1:8000' : window.location.host;
export const baseUrl = `${window.location.protocol}//${host}`; // http://127.0.0.1:8000


// Function for getting and receiving data from the backend
// This is used in all api-lookup functions, and should not be
// changed unless there is a very good reason.
export function backendLookup<T>(
  method: 'GET' | 'POST' | 'DELETE' | 'PUT',
  endpoint: String,
  callback: (response: any, status: number) => void,
  data={}
) {
  let jsonData;
  if (data) {
    jsonData = JSON.stringify(data);
  }
  const xhr = new XMLHttpRequest();
  const endpointUrl = `${baseUrl}/api/${endpoint}`;
  
  xhr.responseType = 'json';
  const csrftoken = getCookie('csrftoken');
  xhr.open(method, endpointUrl);
  xhr.setRequestHeader('Content-Type', 'application/json');
  if (csrftoken) {
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('X-CSRFTOKEN', csrftoken);
  }
  xhr.onload = function() {
    callback(xhr.response as T, xhr.status as number);
  }
  xhr.onerror = function(e) {
    console.log('Error', e);
    callback({'message': 'The request was an error'}, 400);
  }
  xhr.send(jsonData);
}
