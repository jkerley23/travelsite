var sinon = require('sinon');
var createStubProperty = require('../createStubProperty.js');

module.exports = LeafletMock;

function LeafletMock() {
  ['popup', 'setLatLng', 'setContent', 'openOn', 'map'].forEach(createStubProperty(this, this));
  this.map.returns({setView: sinon.spy()});
}
