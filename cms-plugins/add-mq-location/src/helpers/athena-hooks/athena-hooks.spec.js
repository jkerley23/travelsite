var sinon = require('sinon');
var athenaTest = require('../../../../../test-helpers/athena-test');
var athenaHooks, afterSaveArray;

athenaTest('athenaHooks.setHooks - BS afterSave array', function(t) {
  setupTest();

  t.equal(
    typeof afterSaveArray[0],
    'function',
    'should push a function'
  );

  t.equal(
    afterSaveArray.length,
    1,
    'should only push 1 value'
  );

  t.end();
});

athenaTest('afterSave hook - message', function(t) {
  var ui = require('../ui');

  setupTest();

  afterSaveArray[0]();

  t.ok(
    ui.setStatusText.firstCall.args[0],
    'should inform the user that it is updating the post with a message.'
  );

  t.end();
});

athenaTest('afterSave hook - daas', function(t) {
  setupTest();

  afterSaveArray[0]();

  t.ok(
    global.daasApi.setData.called,
    'should initiate the daas UpdatePostStatus process.'
  );

  t.end();
});

athenaTest('afterSave hook - daas error handling', function(t) {
  var daas = require('../remote-data/daas');
  var ui = require('../ui');
  var deferred = new window.$.Deferred();

  daas.updatePostStatus = sinon.stub().returns(deferred.promise());

  setupTest();
  afterSaveArray[0]();
  deferred.reject();

  t.ok(
    ui.showError.firstCall.args[0],
    'should inform the user if it is unable to update DAAS data.'
  );

  t.end();
});

//                  //
// Helper functions //
//                  //

function setupTest() {
  athenaHooks = require('.');
  athenaHooks.setHooks();
  afterSaveArray = window.BS.cms.hooks.afterSave;
}
