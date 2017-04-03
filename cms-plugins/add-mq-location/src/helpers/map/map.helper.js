var ui = require('../ui');
var L, MQ, map;

module.exports = {
  initMap: initMap,
  getMapInstance: getMapInstance,
  centerOnAddress: centerOnAddress
};

function initMap(leafletDepObject, mqDepObject) {
  L = leafletDepObject;
  MQ = mqDepObject;

  map = L.map('addmqloc-embedded-map', { // TODO: Remove this from startup - load on button click (Maybe)
    layers: MQ.mapLayer(),
    center: [39.232253141714885, -99.404296875], // Around the middle of the US
    zoom: 3
  });
}

function getMapInstance() {
  // TODO: Remove this function/endpoint and provide replacement utility functions that delegate to the map.
  return map;
}

function centerOnAddress(address, popupMessage) {
  ui.showError('Unable to add addresses. Centering map to the specified address - ' +
    'please search for the location\'s name.');

  ui.elements.mapHolder.show();
  MQ.geocode().search(address).on('success', handleAddressData);

  function handleAddressData(addressData) {
    var bestLatLag = addressData.result.best.latlng;
    map.setView(bestLatLag, 15);

    if(popupMessage) {
      L
        .popup()
        .setLatLng(bestLatLag)
        .setContent(popupMessage)
        .openOn(map);
    }
  }
}
