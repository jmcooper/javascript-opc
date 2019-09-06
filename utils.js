'use strict';


let domActionBuffer = [];
let flushTimeout;

window.display = function () {
  if (!flushTimeout) flushTimeout = setTimeout(flushDomQueue, 100);

  domActionBuffer.push({ action: 'display', arguments: arguments });
};

window.clearDisplay = function () {
  if (!flushTimeout) flushTimeout = setTimeout(flushDomQueue, 100);

  domActionBuffer.push({ action: 'clearDisplay' });
};

function doClearDisplay() {
  let outputTag = document.getElementById('output');
  while (outputTag.firstChild) {
    outputTag.removeChild(outputTag.firstChild);
  }
}

function doDisplay() {
  for (var i = 0; i < arguments.length; i++) {
    if (typeof arguments[i] === 'object') displayObject(arguments[i]);
    else displayValue(arguments[i], true);
  }
}

function flushDomQueue() {
  flushTimeout = null;

  if (domActionBuffer.length === 0) return;

  const domActions = [...domActionBuffer];
  domActionBuffer = [];
  for (let domAction of domActions) {
    switch (domAction.action) {
      case 'display':
        doDisplay(...domAction.arguments);
        break;
      case 'clearDisplay':
        doClearDisplay();
        break;
    }
  }
}

function displayValue(value, addMargin, addPadding) {
  let outputTag = document.getElementById('output');
  let div = document.createElement('div');
  div.innerHTML = value;
  if (addMargin) div.style.marginBottom = '30px';
  if (addPadding) div.style.paddingLeft = '30px';

  outputTag.appendChild(div);
}

function displayObject(object) {
  if (object == null) return displayValue('null');
  displayValue(getTypeName(object) + ' {');
  for (var propertyName in object) {
    if (propertyName != 'constructor') {
      displayValue(propertyName + ': ' + object[propertyName], false, true);
    }
  }
  displayValue('}', true);
}

function getTypeName(object) {
  var funcNameRegex = /function (.{1,})\(/;
  var results = funcNameRegex.exec(object.constructor.toString());
  return results && results.length > 1 ? results[1] : '';
}

let reloadJS = () => {
  let oldScriptTag = document.getElementById('script');

  let newScriptTag = document.createElement('script');
  newScriptTag.id = 'script';
  newScriptTag.src = 'demo.js';
  newScriptTag.textContent = '//script';
  var body = document.getElementsByTagName('body')[0];

  oldScriptTag.remove();

  clearDisplay();
  body.appendChild(newScriptTag);
};

setInterval(reloadJS, 1000);
