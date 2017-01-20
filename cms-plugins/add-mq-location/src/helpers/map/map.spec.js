var sinon = require('sinon');
var athenaTest = require('../../../../../test-helpers/athena-test');
var LeafletMock = require('../../../../../test-helpers/mocks/leaflet.mock');
var MqMock = require('../../../../../test-helpers/mocks/mq.mock');

var L, MQ, map, ui, addressData, addressHandlerCallback;

athenaTest('map.initMap', function(t) {
  setupTest();

  t.equals(
    L.map.firstCall.args[1].zoom,
    3,
    'The map should start at a wide zoom level of 3.'
  );

  t.equals(
    MQ.mapLayer.called,
    true,
    'should use the MQ mapLayer method to init the map layers'
  );
  t.end();
});

athenaTest('map.getMapInstance', function(t) {
  setupTest();

  t.equals(
    map.getMapInstance(),
    L.map(),
    'should return the leaflet map instance'
  );

  t.end();
});

athenaTest('map.centerOnAddress - UI interaction', function(t) {
  setupTest();
  map.centerOnAddress();
  executeAddressHandlerCallback();

  t.ok(
    ui.showError.args[0],
    'should put a message in the notification area'
  );

  t.equals(
    ui.elements.mapHolder.show.called,
    true,
    'should show the map holder element.'
  );

  t.end();
});

athenaTest('map.centerOnAddress - map interaction', function(t) {
  var popupMessage = 'Some text for the pop up message';
  var bestLatLng;

  setupTest();
  map.centerOnAddress('Some address string', popupMessage);
  executeAddressHandlerCallback();
  bestLatLng = L.map().setView.firstCall.args[0];

  t.equals(
    bestLatLng,
    addressData.result.best.latlng,
    'should center the map to the geocoded lat/lng result'
  );

  t.equals(
    L.popup.called,
    true,
    'should create a popup'
  );

  t.equals(
    L.setLatLng.firstCall.args[0],
    bestLatLng,
    'The popup should be set to the geocoded lat/lng result'
  );

  t.equal(
    L.setContent.firstCall.args[0],
    popupMessage,
    'The popup should contain the specified message'
  );

  t.equals(
    L.openOn.firstCall.args[0],
    L.map(),
    'The popup should be attached to the leaflet map'
  );

  t.end();
});

athenaTest('map.centerOnAddress - map interaction (no popup)', function(t) {
  setupTest();
  map.centerOnAddress('Some address string');
  executeAddressHandlerCallback();

  t.equal(
    L.popup.called,
    false,
    'No popup should be created if no message is passed in'
  );

  t.end();
});

//                  //
// Helper functions //
//                  //

function setupTest() {
  map = require('.');
  ui = require('../ui');

  addressData = {result: {best: {
      latlng: 'Some lat/lng value'
  }}};

  ui.elements.mapHolder.show = sinon.spy();
  L = new LeafletMock();
  MQ = new MqMock();
  map.initMap(L, MQ);
}

function executeAddressHandlerCallback() {
  // The MQ.geocoder method must be invoked before the callback can be executed, so
  // we include this as a helper function instead of a variable.

  addressHandlerCallback = MQ.mockMqGeocodeSeachOnHandler.firstCall.args[1];
  addressHandlerCallback(addressData);
}
