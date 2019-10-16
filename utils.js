'use strict';


let domActionBuffer = [];
let flushTimeout;

window.display = function () {
  if (!flushTimeout) flushTimeout = setTimeout(flushDomQueue, 100);

  domActionBuffer.push({ action: 'display', arguments: arguments });
};

window.displayRegexArray = function () {
  if (!flushTimeout) flushTimeout = setTimeout(flushDomQueue, 100);

  domActionBuffer.push({ action: 'displayRegexArray', arguments: arguments });
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
    if (typeof arguments[i] === 'object') displayObject(arguments[i], false);
    else displayValue(arguments[i], true);
  }
}

function doDisplayRegexArray() {
  displayObject(arguments[0], true)
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
      case 'displayRegexArray':
        doDisplayRegexArray(...domAction.arguments);
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

function displayObject(object, regexArray) {
  if (object == null) return displayValue('null');
  if (getTypeName(object) === 'Array' && !regexArray) {
    let appendedArrayValues = object.reduce((acc, cur) => acc+=cur+',', '')
    if (appendedArrayValues.length > 0)
      appendedArrayValues = appendedArrayValues.substr(0, appendedArrayValues.length - 1)
    displayValue('[' + appendedArrayValues  + ']')
    if (Object.keys(object).length > object.length) {
      displayValue('&nbsp;')
      displayValue('Additional array properties:')
    }
    for (let propertyName in object)
    {
      if (!Number.isInteger(+propertyName) && object[propertyName] !== undefined) 
        displayValue('&nbsp;&nbsp;' + propertyName + ": " + object[propertyName])
      else if (typeof object[propertyName] === 'object', false) {
        return displayObject()
      }
    }
    return
  }

  displayValue(getTypeName(object) + ' {');
  for (var propertyName in object) {
    if (typeof object[propertyName] === 'object', false) 
      displayObject(object[propertyName])
    else if (propertyName != 'constructor' && (!regexArray || object[propertyName] !== undefined)) {
      let prefix = Number.isInteger(+propertyName) && regexArray ? '[' : ''
      let suffix = Number.isInteger(+propertyName) && regexArray ? ']' : ''
      displayValue(prefix + propertyName + suffix + ': ' + object[propertyName], false, true);
    }
  }
  displayValue('}', true);
}

function getTypeName(object) {
  return object.constructor.name;
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
