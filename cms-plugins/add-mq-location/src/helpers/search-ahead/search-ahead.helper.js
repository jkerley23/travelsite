var $ = window.$;

var ui = require('../ui');
var map = require('../map');
var dataDelegation = require('../remote-data/data-delegation');
var MqLocation = require('../../models/mq-location');

var elements = ui.elements;

var searchAheadUri = 'https://searchahead-public-api-b2c-production.cloud.mapquest.com/search/v3/prediction';

// FIXME: Underscore, Lodash, and Ben Alman's implementations of debounce are throttling instead.
// It is obviously an error in *this* code, not theirs. Figure this out. Maybe put the debounce in
// the function itself rather than invoking it here.
// var debounceWrappedHandleInputData = $.debounce(handleInputData, 500);

var autocompleteOptions = {
  minLength: 2,
  maxLength: 99,
  source: handleInputData,
  select: handleSelect
};

var selectedLocations;

module.exports = {
  initSearchAhead: initSearchAhead
};

function initSearchAhead(mqLocationArrayToPopulate) {
  selectedLocations = mqLocationArrayToPopulate;
  elements.locationSelectorDropdown.remoteList(autocompleteOptions);
}

//         //
// Helpers //
//         //

function handleInputData(value, response) {
  // FIXME: Figure out why the dropdown does not show up on first call.
  var params = {
    collection: 'adminArea,poi,address,airport',
    q: value
  };

  var mapBounds;

  if (ui.elementIsVisible(elements.mapHolder)) {
    mapBounds = map.getMapInstance().getCenter();
    params.location = mapBounds.lng + ',' + mapBounds.lat;
  }

  $.getJSON(searchAheadUri + '?' + $.param(params))
    .then(handleApiData)
    .fail(handleApiFail);

  function handleApiData(data) {
    if (data && data.results && data.results.map) {
      response(data.results.map(toSearchAheadDisplayObject));
    } else {
      ui.showError('The server responded with data in an unknown format.', data);
    }
  }

  function handleApiFail(reason) {
    ui.showError('Search fail.', reason.responseText);
  }
}

function handleSelect() {
  var selectedData = $(this).remoteList('selectedData');
  var searchAheadId = selectedData.searchAheadId;
  var locationName = selectedData.value;
  var coordinates = selectedData.coordinates;
  var slug = selectedData.slug;
  var type = selectedData.label;
  var mqId;

  if (searchAheadId.indexOf('address:') !== -1) {
    var htmlMessage =
      'This is the location of the address<br/>' +
      'that you searched for. Type in the<br/>' +
      'location\'s name and select it from<br/>' +
      'the dropdown menu.';

    map.centerOnAddress(locationName, htmlMessage);
  } else {
    mqId = searchAheadId.indexOf('mqId:') === -1
      ? ''
      : searchAheadId.slice(searchAheadId.indexOf(':') + 1);

    elements.locationSelectorDropdown.val('');
    ui.clearError();

    dataDelegation.addLocalAndRemoteLocations(
      [new MqLocation(
        mqId,
        locationName,
        coordinates,
        slug,
        type
      )],
      selectedLocations
    );
  }
}

function toSearchAheadDisplayObject(searchAheadData) {
  var coordArray = searchAheadData.place.geometry.coordinates;

  return {
    value: searchAheadData.displayString,
    label: searchAheadData.recordType,
    searchAheadId: searchAheadData.id,
    coordinates: {
      lat: coordArray[1],
      lng: coordArray[0]
    },
    slug: searchAheadData.slug
  };
}
