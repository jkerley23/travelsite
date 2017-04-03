var sinon = require('sinon');
var athenaTest = require('../../../../../../test-helpers/athena-test');

var dataDelegation, MqLocation, testLocation, ui;

athenaTest('dataDelegation.addLocalAndRemoteLocations - on Parachute', function(t) {
  var locationArray = [];

  setupTest();
  dataDelegation.addLocalAndRemoteLocations([testLocation], locationArray);
  invokeDaasApiSetDataCallback();

  t.ok(
    ui.addLocationsToUIList.called,
    'should add the location to the UI'
  );

  t.equal(
    locationArray[0],
    testLocation,
    'should add the location to the passed in array'
  );

  t.equal(
    global.blogsmithPostsSdkExtra.set.lastCall.args[0].mqLocations[0],
    testLocation,
    'should add the location to the posts sdk extras'
  );

  t.equal(
    global.daasApi.setData.lastCall.args[1].instance.locations[0],
    testLocation,
    'should add the location to the Athena Daas service'
  );

  t.end();
});

athenaTest('dataDelegation.addLocalAndRemoteLocations - NOT on Parachute', function(t) {
  var locationArray = [];
  require('../../athena').getBlogId = sinon.stub().returns('someOtherBlogId');

  setupTest();
  dataDelegation.addLocalAndRemoteLocations([testLocation], locationArray);
  invokeDaasApiSetDataCallback();

  t.ok(
    ui.addLocationsToUIList.called,
    'should add the location to the UI'
  );

  t.equal(
    locationArray[0],
    testLocation,
    'should add the location to the passed in array'
  );

  t.equal(
    global.blogsmithPostsSdkExtra.set.lastCall.args[0].mqLocations[0],
    testLocation,
    'should add the location to the posts sdk extras'
  );

  t.notEquals(
    global.daasApi.setData.callCount,
    0,
    'should NOT add the location to the Athena Daas service'
  );

  t.end();
});

athenaTest('dataDelegation.addLocalAndRemoteLocations - duplicate protection', function(t) {
  var ui = require('../../ui');
  var locationArray;

  setupTest();
  locationArray = [testLocation];

  dataDelegation.addLocalAndRemoteLocations([testLocation], locationArray);

  t.equals(
    ui.addLocationsToUIList.called,
    false,
    'should NOT add the location to the UI'
  );

  t.ok(
    locationArray.length === 1
      && global.blogsmithPostsSdkExtra.set.callCount === 0
      && global.daasApi.setData.callCount === 0,
    'should NOT add the location to any service or array if a duplicate is passed in'
  );

  t.notEqual(
    ui.showError.lastCall.args[0].indexOf(testLocation.name),
    -1,
    'should warn the user with the name of the duplicate'
  );

  t.end();
});

athenaTest('dataDelegation.removeLocalAndRemoteLocations - on Parachute', function(t) {
  var locationArray;

  setupTest();
  locationArray = [testLocation];

  dataDelegation.removeLocalAndRemoteLocations([testLocation], locationArray);
  invokeDaasApiDeleteDataCallback();

  t.ok(
    ui.removeLocationsFromUIList.called,
    'should remove the location from the UI'
  );

  t.equal(
    locationArray.length,
    0,
    'should remove the location from the passed in array'
  );

  t.equal(
    global.blogsmithPostsSdkExtra.set.lastCall.args[0].mqLocations.length,
    0,
    'should remove the location from the posts sdk extras'
  );

  t.ok(
    global.daasApi.deleteData.called,
    'should remove the location from the Athena Daas service'
  );

  t.end();
});

athenaTest('dataDelegation.removeLocalAndRemoteLocations - NOT on Parachute', function(t) {
  var locationArray;
  require('../../athena').isParachute = sinon.stub().returns(false);

  setupTest();
  locationArray = [testLocation];

  dataDelegation.removeLocalAndRemoteLocations([testLocation], locationArray);

  t.ok(
    ui.removeLocationsFromUIList.called,
    'should remove the location from the UI'
  );

  t.equal(
    locationArray.length,
    0,
    'should remove the location from the passed in array'
  );

  t.equal(
    global.blogsmithPostsSdkExtra.set.lastCall.args[0].mqLocations.length,
    0,
    'should remove the location from the posts sdk extras'
  );

  t.equals(
    global.daasApi.setData.called,
    false,
    'should NOT remove the location from the Athena Daas service'
  );

  t.end();
});

athenaTest('dataDelegation.addLocalAndRemoteLocations - duplicate protection', function(t) {
  var ui = require('../../ui');
  var locationArray;

  setupTest();
  locationArray = [];

  dataDelegation.removeLocalAndRemoteLocations([testLocation], locationArray);

  t.equals(
    ui.addLocationsToUIList.called,
    false,
    'should NOT attempt to add the location to the UI'
  );

  t.ok(
    global.blogsmithPostsSdkExtra.set.callCount === 0
      && global.daasApi.setData.callCount === 0,
    'should NOT attempt to remove the location from any service if the location has not yet been added'
  );

  t.notEqual(
    ui.showError.lastCall.args[0].indexOf(testLocation.name),
    -1,
    'should warn the user with the name of the missing location'
  );

  t.end();
});

athenaTest('dataDelegation.getRemoteLocationData - on Parachute', function(t) {
  setupTest();
  dataDelegation.getRemoteLocationData();
  invokeDaasApiQueryDataCallback();

  t.ok(
    global.blogsmithPostsSdkExtra.get.called,
    'should retrieve the SDK location data'
  );

  t.ok(
    global.daasApi.queryData.called,
    'should retrieve the DAAS location data'
  );

  t.end();
});


athenaTest('dataDelegation.getRemoteLocationData - NOT on Parachute', function(t) {
  require('../../athena').isParachute = sinon.stub().returns(false);
  setupTest();
  dataDelegation.getRemoteLocationData();

  t.ok(
    global.blogsmithPostsSdkExtra.get.called,
    'should retrieve the SDK location data'
  );

  t.equals(
    global.daasApi.queryData.called,
    false,
    'should NOT retrieve the DAAS location data'
  );

  t.end();
});

/* TODO
 *
 * getRemoteLocationData
 *   should reject the promise if on Parachute and the DAAS api returns an error
 *   should reject the promise if on Parachute and the DAAS api returns a non-array instead of locations
 *   should reject the promise if not on Parachute and the SDK api returns an error
 *   should reject the promise if not on Parachute and the SDK api returns a non-array instead of locations
 */

//                  //
// Helper functions //
//                  //

function setupTest() {
  dataDelegation = require('.');
  MqLocation = require('../../../models/mq-location');
  ui = require('../../ui');

  testLocation = new MqLocation(
    '12345',
    'Some Test Location',
    {lat: 12.3456, lng: 98.7654},
    'some/slug/goes/here',
    'type'
  );
}

function invokeDaasApiSetDataCallback(dataToPassIn) {
  var defaultData = {some: 'value'};
  global.daasApi.setData.lastCall.args[2](dataToPassIn || defaultData);
}

function invokeDaasApiQueryDataCallback(dataToPassIn) {
  var defaultData = {some: 'value'};
  global.daasApi.queryData.lastCall.args[1](dataToPassIn || defaultData);
}

function invokeDaasApiDeleteDataCallback(dataToPassIn) {
  var defaultData = {some: 'value'};
  global.daasApi.deleteData.lastCall.args[1](dataToPassIn || defaultData);
}
