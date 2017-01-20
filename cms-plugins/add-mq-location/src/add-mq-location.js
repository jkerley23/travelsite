// TODO: Unit tests

var ui = require('./helpers/ui');
var dataDelegation = require('./helpers/remote-data/data-delegation');
var daas = require('./helpers/remote-data/daas');
var searchAhead = require('./helpers/search-ahead');
var map = require('./helpers/map');
var athenaHooks = require('./helpers/athena-hooks');

$(document).ready(init);

function init() {
  var key = '4WHhMcKLZ7bGtBGIU8vRiflrLmmQMGT8';

  // These do not get pulled in time if included as a script tag in the HTML.
  $.getScript('https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/leaflet.js')
    .then($.getScript.bind(this, 'https://www.mapquestapi.com/sdk/leaflet/v2.2/mq-map.js?key=' + key))
    .then($.getScript.bind(this, 'https://www.mapquestapi.com/sdk/leaflet/v2.2/mq-geocoding.js?key=' + key))
    .done(function() {
      loadPlugin(window.L, window.MQ);
    })
    .fail(handleExternalDepsFail);

  function handleExternalDepsFail(err) {
    ui.elements.mapHolder.hide();
    ui.setStatusText();
    ui.showError('Add Mapquest Location plugin: Unable to get Leafet / Mapquest data.', err);
  }
}

function loadPlugin(L, MQ) {
  var selectedLocations = []; // Local stored locations

  // Initialization

  daas.initDaas();
  searchAhead.initSearchAhead(selectedLocations);
  map.initMap(L, MQ);
  ui.elements.mapHolder.hide(); // We hide it here rather than in CSS so the map can properly init
  ui.elements.toggleMapButton.click(ui.toggleMapVisibility);
  athenaHooks.setHooks();

  dataDelegation.getRemoteLocationData()
    .then(handleStartupData)
    .fail(handleStartupFail);

  function handleStartupData(remoteLocationData) {
    $.merge(selectedLocations, remoteLocationData);

    ui.addLocationsToUIList(
      selectedLocations,
      dataDelegation.removeLocalAndRemoteLocations,
      selectedLocations
    );
  }

  function handleStartupFail(err) {
    ui.showError('Unable to get location data.', err);
  }
}
