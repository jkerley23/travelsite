var sinon = require('sinon');

module.exports = createStubProperty;

function createStubProperty(obj, returnValue) {
  return addToObject;

  function addToObject(name) {
    obj[name] = sinon.stub().returns(returnValue);
  }
}
