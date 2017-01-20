var sinon = require('sinon');
var athenaTest = require('../../../../../test-helpers/athena-test');
var LeafletMock = require('../../../../../test-helpers/mocks/leaflet.mock');
var MqMock = require('../../../../../test-helpers/mocks/mq.mock');

var searchAhead, ui, remoteList, map, jQueryGetJson, mqResponse,
  handleInputData, handleSelect, L, MQ, selectedLocations;

athenaTest('searchAhead.initSearchAhead', function(t) {
  var executedParams;

  setupTest();
  executedParams = remoteList.lastCall.args[0];

  t.ok(
    typeof executedParams.minLength === 'number'
      && typeof executedParams.maxLength === 'number'
      && executedParams.minLength > 1
      && executedParams.maxLength > 1
      && typeof executedParams.source === 'function'
      && typeof executedParams.select === 'function',
    'should use the jquery plugin on the location selector dropdown with correct option syntax'
  );

  t.end();
});

athenaTest('Search-ahead input - search params', function(t) {
  var query = 'Some value';
  var searchParams;

  setupTest();
  handleInputData(query, window.$.noop);
  searchParams = parseParams(jQueryGetJson.lastCall.args[0]);

  t.equal(
    searchParams.collection,
    'adminArea,poi,address,airport',
    'should query for the following: adminArea, poi, address, and airport'
  );

  t.equal(
    searchParams.q,
    query,
    'should include the search string in the query'
  );

  t.notOk(
    searchParams.location,
    'should not include lat/lng if the map is closed'
  );

  t.end();
});

athenaTest('Search-ahead - input with map open', function(t) {
  var query = 'Some string';
  var searchParams;

  setupTest();
  map.getMapInstance = sinon.stub().returns({getCenter: mapBoundsGetter});
  ui.elementIsVisible = sinon.stub().returns(true);
  handleInputData(query, window.$.noop);
  searchParams = parseParams(jQueryGetJson.lastCall.args[0]);

  t.equal(
    searchParams.collection,
    'adminArea,poi,address,airport',
    'should query for the following: adminArea, poi, address, and airport'
  );

  t.equal(
    searchParams.q,
    query,
    'should include the search string in the query'
  );

  t.equal(
    searchParams.location,
    mapBoundsGetter().lng + ',' + mapBoundsGetter().lat,
    'should include lat/lng as a \'lng,lat\' formatted string if the map is open'
  );

  t.end();

  function mapBoundsGetter() {
    return {
      lat: 12.345,
      lng: 54.321
    };
  }
});

athenaTest('Search-ahead - MQ api success', function(t) {
  var callbackSpy = sinon.spy();
  var query;
  setupTest();

  handleInputData(query, callbackSpy);

  t.deepEqual(
    callbackSpy.lastCall.args[0][0],
    {
      value: mqResponse.results[0].displayString,
      label: mqResponse.results[0].recordType,
      searchAheadId: mqResponse.results[0].id,
      coordinates: {
        lat: mqResponse.results[0].place.geometry.coordinates[1],
        lng: mqResponse.results[0].place.geometry.coordinates[0]
      },
      slug: mqResponse.results[0].slug
    },
    'should call back to the jquery plugin in the expected format if fulfilled'
  );

  t.end();
});

athenaTest('Search-ahead - MQ api success - unknown response', function(t) {
  var callbackSpy = sinon.spy();
  var response = {some: 'unknown data format'};

  setupTest();
  window.$.getJSON = sinon.stub().returns(window.$.when(response));

  handleInputData('Test', callbackSpy);

  t.ok(
    ui.showError.lastCall.args[0].length,
    'should show an error if fulfilled with an unexpected response'
  );

  t.equals(
    ui.showError.lastCall.args[1],
    response,
    'should include the received data in the error'
  );

  t.end();
});

athenaTest('Search-ahead - MQ api success - unknown response', function(t) {
  var callbackSpy = sinon.spy();
  var reason = {responseText: 'Some error message'};
  var deferred = new window.$.Deferred();

  setupTest();
  window.$.getJSON = sinon.stub().returns(deferred.promise());
  handleInputData('Test', callbackSpy);
  deferred.reject(reason);

  t.equals(
    ui.showError.lastCall.args[1],
    reason.responseText,
    'should show an error if rejected, including the server response text.'
  );

  t.end();
});

athenaTest('Search-ahead - user selection (address specified)', function(t) {
  var mqResponseData = {
    displayString: '123 Fake St.',
    recordType: 'addressType',
    id: 'address:123-fake-st',
    place: {geometry: {coordinates:
      [22.2222, 33.333] // lng, lat
    }},
    slug: 'address/123-fake-st'
  };

  setupTest(mqResponseData);
  handleSelect();

  t.equal(
    MQ.geocode().search.lastCall.args[0],
    mqResponseData.displayString,
    'should open the map and center on the address'
  );

  t.equal(
    global.daasApi.setData.called,
    false,
    'should not attempt to add any locations'
  );

  t.end();
});

athenaTest('Search-ahead - user selection (non-address specified)', function(t) {
  var locationSelectorDropdownValSpy, searchAheadId;

  setupTest();
  searchAheadId = mqResponse.results[0].id;
  locationSelectorDropdownValSpy = ui.elements.locationSelectorDropdown.val = sinon.spy();

  handleSelect(selectedLocations);
  global.daasApi.setData.lastCall.args[2]({some: 'data'});

  t.ok(
    ui.clearError.called,
    'should clear out any error messages'
  );

  t.equal(
    locationSelectorDropdownValSpy.lastCall.args[0],
    '',
    'should close the search-ahead results'
  );

  t.equal(
    selectedLocations[0].mqId,
    searchAheadId.slice(searchAheadId.indexOf(':') + 1),
    'should remove the search ahead string from the MQID'
  );

  t.equal(
    global.daasApi.setData.lastCall.args[1].instance.locations[0],
    selectedLocations[0],
    'should add the location to the Athena Daas service'
  );

  t.end();
});

//                  //
// Helper functions //
//                  //

function setupTest(customMqResponseData) {
  var mqResponseData = customMqResponseData || {
    displayString: 'displayString',
    recordType: 'recordType',
    id: 'mqId:1234567',
    place: {geometry: {coordinates:
      [11.1111, 22.222] // lng, lat
    }},
    slug: 'slug'
  };

  var remoteListSelectedData;

  mqResponse = {results: [mqResponseData]};
  selectedLocations = [];

  remoteListSelectedData = {
    searchAheadId: mqResponseData.id,
    value: mqResponseData.displayString,
    coordinates: {
      lat: mqResponseData.place.geometry.coordinates[1],
      lng: mqResponseData.place.geometry.coordinates[0]
    },
    slug: mqResponseData.slug,
    label: mqResponseData.recordType
  };

  searchAhead = require('.');
  ui = require('../ui');
  map = require('../map');

  // We separate the $().remoteList and element.remoteList methods for testability
  window.$.fn.remoteList = sinon.stub().returns(remoteListSelectedData);
  remoteList = ui.elements.locationSelectorDropdown.remoteList = sinon.spy();
  jQueryGetJson = window.$.getJSON = sinon.stub().returns(window.$.when(mqResponse));

  searchAhead.initSearchAhead(selectedLocations);

  handleInputData = remoteList.lastCall.args[0].source;
  handleSelect = remoteList.lastCall.args[0].select;

  L = new LeafletMock();
  MQ = new MqMock();
  map.initMap(L, MQ);
}

// http://stackoverflow.com/a/26849194 with modifications.
function parseParams(str) {
  var paramStr = str.split('?')[1] || str;
  return paramStr.split('&').reduce(function(params, param) {
    var paramSplit = param.split('=').map(function(value) {
      return decodeURIComponent(value.replace('+', ' '));
    });
    params[paramSplit[0]] = paramSplit[1];
    return params;
  }, {});
}
