var ui = require('../../ui');
var MqLocation = require('../../../models/mq-location');

var blogsmithPostsSdkExtra = window.blogsmith.sdk.ui.posts.extra;

module.exports = {
  getStoredSdkLocations: getStoredSdkLocations,
  setStoredSdkLocations: setStoredSdkLocations
};

function getStoredSdkLocations() {
  return blogsmithPostsSdkExtra.get();
}

function setStoredSdkLocations(mqLocationArray) {
  if (!MqLocation.prototype.isArrayOfMqLocations(mqLocationArray)) {
    ui.showError('Internal error. Incorrect data format used to save location data.', mqLocationArray);
    throw new Error('setStoredSdkLocations expects an array of MqLocations.');
  }

  return blogsmithPostsSdkExtra.set({mqLocations: mqLocationArray});
}
