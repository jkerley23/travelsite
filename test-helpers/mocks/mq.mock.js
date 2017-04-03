var sinon = require('sinon');

module.exports = LeafletMock;

function LeafletMock() {
  this.mockMqGeocodeSeachOnHandler = sinon.spy(); // Provided so tests don't have to access via the geocode method
  this.mapLayer = sinon.spy();

  this.geocode = sinon.stub().returns({
    search: sinon.stub().returns({on: this.mockMqGeocodeSeachOnHandler})
  });
}
