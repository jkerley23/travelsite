var athenaTest = require('../../../../../../test-helpers/athena-test');

var extras, MqLocation;

athenaTest('getStoredSdkLocation', function(t) {
  setupTest();
  extras.getStoredSdkLocations();

  t.ok(
    global.blogsmithPostsSdkExtra.get.called,
    'should defer to Athena\'s blogsmith SDK'
  );

  t.end();
});

athenaTest('setStoredSdkLocation', function(t) {
  setupTest();

  var testData = new MqLocation(
    'Test id',
    'Test name',
    {lat: 12, lng: 34},
    'Test slug',
    'Test type'
  );

  extras.setStoredSdkLocations([testData]);

  t.equal(
    global.blogsmithPostsSdkExtra.set.firstCall.args[0].mqLocations[0],
    testData,
    'should pass the data to the SDK, wrapped in an mqLocations property.'
  );

  t.end();
});

athenaTest('setStoredSdkLocation - incorrect input', function(t) {
  setupTest();

  var badTestData = [{thisIs: 'not an array of MqLocations'}];

  t.throws(
    extras.setStoredSdkLocations.bind(null, badTestData),
    'should throw an error if something other than an array of MqLocations is passed in'
  );

  t.end();
});

function setupTest() {
  extras = require('.');
  MqLocation = require('../../../models/mq-location');
}
