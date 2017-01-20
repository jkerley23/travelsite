var sinon = require('sinon');
var athenaTest, cleanupJsdom;

require('tape-catch')(); // Allows  redtape use tape-catch instead of tape.

athenaTest = require('redtape')({
  beforeEach: setEnv,
  afterEach: cleanEnv
});

// TODO: Allow a setupTest ftn (and a bypass arg for this) to be passed run and ran before each test.
// Currently, one is being called in every test anyway. Find a way to ensure it is not shared between files.
module.exports = athenaTest;

//                  //
// Helper functions //
//                  //

function setEnv(done) {
  var ui, daasApi, blogsmithPostsSdkExtra, startupLocationData;

  if(global.window && !cleanupJsdom) {
    throw new Error('Jsdom was not cleaned up last run and no cleanup function is available.');
  } else if (global.window && cleanupJsdom) {
    // If tape-catch catches an error, the afterEach method is never ran.
    // The before/after blocks will remain separate for clarity.

    cleanEnv(function() {} /* noop for callback */);
  }

  // TODO: If possible, swap this global implementation with a more traditional usage of jsdom.
  cleanupJsdom = require('jsdom-global')();
  window.$ = require('jquery');
  require('../cms-plugins/athena-env.js')(true /* disableLogging */ );

  // Browser element / remote data / side-effect mocks

  ui = require('../cms-plugins/add-mq-location/src/helpers/ui');
  sinon.stub(ui, 'showError');
  sinon.stub(ui, 'clearError');
  sinon.stub(ui, 'setStatusText');
  sinon.stub(ui, 'addLocationsToUIList');
  sinon.stub(ui, 'removeLocationsFromUIList');

  // Globals provided for convenience. This may not stick - will play with it for a bit to see if it causes issues.

  daasApi = window.$.amp.data.api;
  daasApi.init = sinon.spy();
  daasApi.queryData = sinon.spy();
  daasApi.setData = sinon.spy();
  daasApi.deleteData = sinon.spy();
  global.daasApi = daasApi;

  blogsmithPostsSdkExtra = window.blogsmith.sdk.ui.posts.extra;
  blogsmithPostsSdkExtra.get = sinon.spy();
  blogsmithPostsSdkExtra.set = sinon.spy();
  global.blogsmithPostsSdkExtra = blogsmithPostsSdkExtra;

  startupLocationData = {
    results: [{
      instance: {
        live: true,
        locations: [{
          mqId: '123456789',
          name: 'Startup Location',
          coordinates: {
            lat: 12.3456789,
            lng: -98.765432
          },
          slug: 'startup/slug',
          type: 'startupType'
        }]
      }
    }]
  };

  require('../cms-plugins/add-mq-location/src/helpers/remote-data/data-delegation').getRemoteLocationData();
  daasApi.queryData.firstCall.args[1](startupLocationData); // Callback invocation to populate first location
  blogsmithPostsSdkExtra.get.reset();
  daasApi.queryData.reset();

  done();
}

function cleanEnv(done) {
  var requireCache = require.cache;

  cleanupJsdom();
  delete global.daasApi;
  delete global.blogsmithPostsSdkExtra;

  // Removing plugin-related require cache so we can manipulate in-app objects without affecting future tests.
  Object.keys(requireCache)
    .filter(removeNodeModuleAndAthenaTestKeyNames)
    .forEach(removeRequireCacheEntry);

  done();

  function removeNodeModuleAndAthenaTestKeyNames(key) {
    return key.indexOf('node_modules') === -1 && key.indexOf('athena-test.js') === -1;
  }

  function removeRequireCacheEntry(keyToRemove) {
    delete requireCache[keyToRemove];
  }
}
