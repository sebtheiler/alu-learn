function lookup(method, endpoint, callback, data) {
  let jsonData;
  if (data) {
    jsonData = JSON.stringify(data);
  };
  const xhr = new XMLHttpRequest();
  const endpointUrl = `http://127.0.0.1:8000/api/decks/${endpoint}`;

  xhr.responseType = 'json';
  xhr.open(method, endpointUrl);
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