var athenaTest = require('./athena-test.js');
var uiPath = '../cms-plugins/add-mq-location/src/helpers/ui';
athenaTest('athenaTest setup - window', function(t) {
  t.ok(
    window,
    'The window object should exist'
  );

  t.end();
});

athenaTest('(athenaTest setup - global leakage setup - no asserts)', function(t) {
  var ui = require(uiPath);

  window.addedProperty = 'Added - window';
  global.daasApi.init = 'Changed - daasApi';
  ui.showError = 'Changed - ui';

  // No asserts here. The purpose of this block is to set globals
  // that should NOT persist between this and the next test.

  t.end();
});

athenaTest('athenaTest setup - global leakage', function(t) {
  var ui = require(uiPath);

  t.notOk(
    window.addedProperty,
    'The window object should not be shared between tests'
  );

  t.notEqual(
    global.daasApi.init,
    'Changed - daasApi',
    'The utility globals should not persist changes'
  );

  t.notEqual(
    ui.showError,
    'Changed - ui',
    'Plugin-related require cache should not be shared between tests'
  );

  t.end();
});

athenaTest('athenaTest setup - jQuery', function(t) {
  t.ok(
    window.$,
    'The $ object should be in the window object'
  );

  t.end();
});
