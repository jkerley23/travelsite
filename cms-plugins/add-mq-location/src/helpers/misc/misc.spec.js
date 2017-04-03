var athenaTest = require('../../../../../test-helpers/athena-test');

athenaTest('misc.identity', function(t) {
  var misc = require('.');
  // We use an object to ensure that a copy isn't returned.
  var expectedValue = {some: 'value'};

  t.equals(
    misc.identity(expectedValue),
    expectedValue,
    'should return the passed in value'
  );

  t.end();
});
