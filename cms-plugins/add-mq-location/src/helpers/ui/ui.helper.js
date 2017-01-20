var $ = window.$ || window.jQuery;
var MqLocation = require('../../models/mq-location');

var locationSelectorDropdown = $('#addmqloc-location-selector');
var mapquestLocations = $('#addmqloc-locations');
var errorArea = $('#addmqloc-locations-errors');
var toggleMapButton = $('#addmqloc-toggle-map');
var mapHolder = $('#addmqloc-map-holder');
var statusText = $('#addmqloc-status');

var hideMapText = 'Hide map / search generically';
var showMapText = 'Show map / search specific location';

var isArrayOfMqLocations = MqLocation.prototype.isArrayOfMqLocations;

module.exports = {
  // TODO: Remove this object and provide replacement methods that delegate to jQuery
  elements: {
    locationSelectorDropdown: locationSelectorDropdown,
    mapHolder: mapHolder,
    toggleMapButton: toggleMapButton
  },

  setStatusText: setStatusText,
  addLocationsToUIList: addLocationsToUIList,
  removeLocationsFromUIList: removeLocationsFromUIList,
  toggleMapVisibility: toggleMapVisibility,
  clearError: clearError,
  showError: showError,
  elementIsVisible: elementIsVisible
};

function setStatusText(message) {
  statusText.text(message);
  statusText[message ? 'show' : 'hide']();
}

function addLocationsToUIList(mqLocationsToAdd, functionToBindToRemoveButton, mqLocationsListToRemoveFrom) {
  var elementToAdd;

  if (!isArrayOfMqLocations(mqLocationsToAdd)) {
    showError('Internal error. A non-MqLocation was passed into addLocationsToUIList.', mqLocationsToAdd);
    return;
  }

  mqLocationsToAdd.forEach(addLocationIfNeeded);

  function addLocationIfNeeded(newMqLocation) {
    if ($('li[data-mqid="' + newMqLocation.mqId + '"]').length > 0) {
      showError('Internal error: Attempted to add a location to the UI that was already there.', newMqLocation);
      return;
    }

    elementToAdd = $(
      '<li data-mqid="' + newMqLocation.mqId + '">' + newMqLocation.name + ' (' + newMqLocation.type + ')'
      + ' <span tabindex="0" aria-label="Remove ' + newMqLocation.name + '">Remove</span></li>'
    );

    mapquestLocations.show()
      .find('ul')
      .append(elementToAdd);

    elementToAdd
      .find('span')
      // TODO: Bind before reaching this ftn so that we don't need to pass in mqLocationsListToRemoveFrom
      .click(functionToBindToRemoveButton.bind(this, [newMqLocation], mqLocationsListToRemoveFrom));
  }
}

function removeLocationsFromUIList(mqLocationsToRemove) {
  if (!isArrayOfMqLocations(mqLocationsToRemove)) {
    showError('Internal error. A non-MqLocation was passed into removeLocationsFromUIList.', mqLocationsToRemove);
    return;
  }

  mqLocationsToRemove.forEach(removeLocationFromList);

  if (mapquestLocations.find('li').length === 0) {
    mapquestLocations.hide();
  }

  function removeLocationFromList(mqLocationToRemove) {
    var itemToRemove = $('li[data-mqid="' + mqLocationToRemove.mqId + '"]');

    if (!itemToRemove.length) {
      showError('Internal error: Attempted to remove a location to the UI that was not there.', mqLocationToRemove);
      return;
    }

    itemToRemove.find('span').off();
    itemToRemove.remove();
    itemToRemove = null;
  }
}

function toggleMapVisibility() {
  mapHolder.toggle();
  toggleMapButton.text(elementIsVisible(mapHolder)
    ? hideMapText
    : showMapText
  );
}

function clearError() {
  errorArea.text('');
}

function showError(errorToDisplayToUser, data) {
  // TODO: Consider throwing an error here and allowing it to propagate.
  // That could eliminate the need of Error().stack and would remove some repeated code.
  errorToDisplayToUser = errorToDisplayToUser || 'Internal error.';

  // TODO: Allow a click on error messages to show full error data instead of using the console.
  console.error( // eslint-disable-line no-console
    '(Add MQ Location To Post Plugin) ' + errorToDisplayToUser,
    '\nData:\n',
    data,
    '\nStacktrace:\n',
    stacktrace()
  );

  errorArea.text(errorToDisplayToUser + (data ? ' See console log for details.' : ''));

  function stacktrace() {
    // Undefined in some browsers - this won't hurt execution - console.error handles undefined args gracefully.
    return new Error().stack;
  }
}

function elementIsVisible(jQueryElement) {
  return jQueryElement.is(':visible');
}
