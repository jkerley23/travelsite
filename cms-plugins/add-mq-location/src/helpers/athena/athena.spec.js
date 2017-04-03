var sinon = require('sinon');
var athenaTest = require('../../../../../test-helpers/athena-test');
var athena;

athenaTest('athena.getPostData', function(t) {
  var expectedData = {some: 'data'};

  setupTest();
  window.blogsmith.getPostDetails = sinon.stub().returns(expectedData);

  t.equal(
    athena.getPostData(),
    expectedData,
    'should use the blogsmith api to get post data'
  );

  t.end();
});

athenaTest('athena.isParachute', function(t) {
  setupTest();
  window._blog_id = 'This should not change the result.';

  t.equal(
    athena.isParachute(),
    true,
    'isParachute\'s value should not change if the Athena global blog ID variable is changed after init'
  );

  t.end();
});

//                  //
// Helper functions //
//                  //

function setupTest() {
  athena = require('.');
}
