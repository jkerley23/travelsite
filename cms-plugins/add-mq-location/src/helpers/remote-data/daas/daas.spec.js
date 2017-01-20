var sinon = require('sinon');
var athenaTest = require('../../../../../../test-helpers/athena-test');

var daas, daasApi, MqLocation, athena, testPostDetails, testLocationData, testLocationModelData;

athenaTest('daas.initDaas', function(t) {
  setupTest();
  daas.initDaas();

  t.ok(
    daasApi.init.firstCall.args[0].appId,
    'should initilize the daas API with an app ID'
  );

  t.end();
});

athenaTest('daas.getDaasLocations - success', function(t) {
  var expectedData = {results: [{some: 'data'}]};

  setupTest();
  daas.getDaasLocations().then(testResolution);
  executeDaasQueryDataCallback(expectedData);

  t.end();

  function testResolution(data) {
    t.equal(
      expectedData.results[0],
      data,
      'should resolve with the first index of the results of the Athena daas API call'
    );
  }
});

athenaTest('daas.getDaasLocations - fail', function(t) {
  var errData = {status: 'error'};

  setupTest();

  daas.getDaasLocations(testLocationModelData)
    .then(failTestUponPromiseFulfillment)
    .fail(testRejectionData);

  executeDaasQueryDataCallback(errData);

  t.end();

  function failTestUponPromiseFulfillment() {
    t.fail('should reject the promise upon API failure, but it was fulfilled instead.');
  }

  function testRejectionData(data) {
    t.equal(
      errData,
      data,
      'should reject with an err reason if the daas API call fails.'
    );
  }
});

athenaTest('daas.setDaasLocations - data type verification', function(t) {
  var ui = require('../../ui');

  setupTest();

  t.throws(
    daas.setDaasLocations.bind(null, [{problem: 'Not an array of MqLocations'}]),
    'should usually throw an error if a non-MqLocation is passed in'
  );

  t.ok(
    ui.showError.called,
    'should inform the user that something went wrong'
  );

  t.end();
});

athenaTest('daas.setDaasLocations - data type verification with truthy skip argument', function(t) {
  setupTest();

  t.doesNotThrow(
    daas.setDaasLocations.bind(null, 'This non-array will be ignored', true),
    'should not throw an error with a non-MqLocation if flagged to skip the check'
  );

  t.end();
});

athenaTest('daas.setDaasLocations - api-sent data', function(t) {
  var daasApiCallArgs, queryParam, dataParam;

  setupTest();
  daas.setDaasLocations(testLocationModelData);
  daasApiCallArgs = daasApi.setData.firstCall.args;
  queryParam = daasApiCallArgs[0];
  dataParam = daasApiCallArgs[1];

  t.ok(
    queryParam.schemaName,
    'should include a schema name in the api query'
  );

  t.equals(
    queryParam.key,
    'pid-' + testPostDetails.post_id,
    'should set the key to "pid-(post ID)" in the query'
  );

  t.ok(
    dataParam.instance
      && dataParam.instance.id
      && dataParam.instance.live
      && dataParam.instance.title
      && dataParam.instance.publishDate
      && dataParam.instance.path
      && dataParam.instance.locations
      && MqLocation.prototype.isArrayOfMqLocations(dataParam.instance.locations),
    'should send the data instance per the API requirements'
  );

  t.equals(
    dataParam.instance.live,
    true,
    'should set the "live" property to true if the post status is "Published"'
  );

  t.equals(
    dataParam.instance.path,
    '/some/test/path/',
    'should set the relative path instead of the full URL'
  );

  t.end();
});

athenaTest('daas.setDaasLocations - unpublished post', function(t) {
  setupTest(true /* postInDraftStatus */);

  daas.setDaasLocations(testLocationModelData);

  t.equals(
    daasApi.setData.firstCall.args[1].instance.live,
    false,
    'should set the "live" property to false if the post status is not "Published"'
  );

  t.end();
});

athenaTest('daas.setDaasLocations - empty location data', function(t) {
  setupTest();
  daas.setDaasLocations([]);

  t.ok(
    daasApi.deleteData.called,
    'should completely remove the daas entry if no locations are present.'
  );

  t.end();
});

athenaTest('daas.setDaasLocations - success', function(t) {
  var expectedData = {results: [{some: 'data'}]};

  setupTest();
  daas.setDaasLocations(testLocationModelData).then(testFulfillmentData);
  executeDaasSetDataCallback(expectedData);

  t.end();

  function testFulfillmentData(data) {
    t.equal(
      expectedData,
      data,
      'should resolve with the data sent to the Athena daas API'
    );
  }
});

athenaTest('daas.setDaasLocations - fail', function(t) {
  var errData = {status: 'error'};

  setupTest();

  daas.setDaasLocations(testLocationModelData)
    .then(failTestUponPromiseFulfillment)
    .fail(testRejectionData);

  executeDaasSetDataCallback(errData);

  t.end();

  function failTestUponPromiseFulfillment() {
    t.fail('should reject the promise upon API failure, but it was fulfilled instead.');
  }

  function testRejectionData(data) {
    t.equal(
      errData,
      data,
      'should reject with an err reason if the daas API call fails.'
    );
  }
});

athenaTest('daas.updatePostStatus - no locations', function(t) {
  setupTest();
  daas.setDaasLocations([]);
  daasApi.deleteData.lastCall.args[1]();
  daasApi.setData.reset();
  daas.updatePostStatus();

  t.equal(
    daasApi.setData.called,
    false,
    'should do nothing if no locations are associated with the post'
  );

  t.end();
});

athenaTest('daas.updatePostStatus - successful execution', function(t) {
  var newTestPostDetails = {
    post_id: 'CHANGED - Test post ID',
    status_text: 'Published',
    title: 'CHANGED - Test title',
    url: 'https://www.example.com/some/CHANGED/path/',
    publish_date: '03/21/2017 2:15 AM'
  };

  setupTest();
  daas.setDaasLocations([]);

  daas.getDaasLocations()
    .then(changePostStatus)
    .then(daas.updatePostStatus);

  executeDaasQueryDataCallback({
    results: [{
      instance: {
        locations: [testLocationData]
      }
    }]
  });

  t.equal(
    daasApi.setData.lastCall.args[1].instance.id,
    newTestPostDetails.post_id,
    'should send the last-sent locations and updated post data'
  );

  t.end();

  function changePostStatus() {
    athena.getPostData.returns(newTestPostDetails);
  }
});

//                  //
// Helper functions //
//                  //

function setupTest(postInDraftStatus) {
  testPostDetails = {
    post_id: 'Test post ID',
    status_text: postInDraftStatus ? 'Draft' : 'Published',
    title: 'Test title',
    url: 'https://www.example.com/some/test/path/',
    publish_date: '03/21/2017 2:15 AM'
  };

  athena = require('../../athena');
  athena.getPostData = sinon.stub().returns(testPostDetails);
  daas = require('.');

  MqLocation = require('../../../models/mq-location');

  testLocationData = {
    mqId: '123456789',
    name: 'Test Location',
    coordinates: {
      lat: 12.3456789,
      lng: -98.765432
    },
    slug: 'test/slug',
    type: 'testType'
  };

  testLocationModelData = [new MqLocation(
    testLocationData.mqId,
    testLocationData.name,
    testLocationData.coordinates,
    testLocationData.slug,
    testLocationData.type
  )];

  daasApi = window.$.amp.data.api;
}

function executeDaasQueryDataCallback(dataToPassIn) {
  daasApi.queryData.firstCall.args[1](dataToPassIn);
}

function executeDaasSetDataCallback(dataToPassIn) {
  daasApi.setData.firstCall.args[2](dataToPassIn);
}
