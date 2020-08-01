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


function lookup(method, endpoint, callback, data) {
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
    xhr.setRequestHeader('HTTP_X_REQUESTED_WITH', 'XMLHttpRequest');
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('X-CSRFTOKEN', csrftoken);
  };
  xhr.onload = function() {
      callback(xhr.response, xhr.status);
  };
  xhr.onerror = function(e) {
    console.log(e);
    callback({'message': 'The request was an error'}, 400);
  };
  xhr.send(jsonData);
};

export function createDeck(newDeck, callback) {
  lookup('POST', 'create/', callback, {title: newDeck});
};

export function loadDecks(callback) {
  lookup('GET', 'decklist/', callback);
};