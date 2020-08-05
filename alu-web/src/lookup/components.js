function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}


export function backendLookup(method, endpoint, callback, data) {
  let jsonData;
  if (data) {
    jsonData = JSON.stringify(data);
  };
  const xhr = new XMLHttpRequest();
  const endpointUrl = `http://127.0.0.1:8000/api/decks/${endpoint}`;
  
  xhr.responseType = 'json';
  const csrftoken = getCookie('csrftoken');
  xhr.open(method, endpointUrl);
  xhr.setRequestHeader('Content-Type', 'application/json');
  if (csrftoken) {
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('X-CSRFTOKEN', csrftoken);
  };
  xhr.onload = function() {
      if (xhr.status === 403) {
        const detail = xhr.response.detail;
        if (detail === "Authentication credentials were not provided.") {
          window.location.href = '/login?showLoginRequired=true';
        };
      } else { // this else may need to be removed
        callback(xhr.response, xhr.status);
      };
  };
  xhr.onerror = function(e) {
    console.log('Error', e);
    callback({'message': 'The request was an error'}, 400);
  };
  xhr.send(jsonData);
};