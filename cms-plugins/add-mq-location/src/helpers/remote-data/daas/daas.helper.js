var $ = window.$ || window.jQuery;

var athena = require('../../athena');
var ui = require('../../ui');
var MqLocation = require('../../../models/mq-location');
var daasApi = $.amp.data.api;

var daasSchemaName = 'article-locations';

var mostRecentlySeen;

module.exports = {
  initDaas: initDaas,
  getDaasLocations: getDaasLocations,
  setDaasLocations: setDaasLocations,
  updatePostStatus: updatePostStatus
};

function initDaas() {
  // TODO: Move this to a constants helper.
  var parachuteAthenaDaasNamespace = '979-nww3ep50iwo';

  // Should we not init this, instead specifying the namespace on every call?
  // If init calls clobber between plugins, it would be better to not rely on init.
  daasApi.init({'appId': parachuteAthenaDaasNamespace});
}

function getDaasLocations() {
  // TODO: Is there a jQuery way to avoid the deferred anti-pattern?
  var deferred = $.Deferred(); // eslint-disable-line new-cap
  var postData = athena.getPostData();

  var queryParams = {
    schemaName: daasSchemaName,
    key: 'pid-' + postData.post_id
  };

  var results;

  daasApi.queryData(queryParams, handleDaasData);
  return deferred.promise();

  function handleDaasData(data) {
    if (data && data.status === 'error') {
      handleDaasGetFail(data);
      return;
    }

    // Only 1 DAAS object per post, so we can safely assume index 0.
    results = data && data.results && data.results[0];
    mostRecentlySeen = $.extend(true, {}, results);
    deferred.resolve(results);

    function handleDaasGetFail(getErrData) {
      deferred.reject(getErrData);
    }
  }
}

function setDaasLocations(mqLocationArray, skipMqLocationCheck) {
  // IMPORTANT: skipMqLocationCheck is only to be used for retrieving data upon start-up or already-validated data.
  // Its purpose is to allow data that is already in DAAS to be passed though there so that invalid data is visible

  var postData = athena.getPostData();
  var deferred, queryParams, finalDaasObject;

  if(!skipMqLocationCheck && !MqLocation.prototype.isArrayOfMqLocations(mqLocationArray)) {
    ui.showError('Internal error. Incorrect data format used to save location data.', mqLocationArray);
    throw new Error('setDaasLocations expects an array of mqLocations.');
  }

  queryParams = {
    schemaName: daasSchemaName,
    key: 'pid-' + postData.post_id
  };

  deferred = $.Deferred(); // eslint-disable-line new-cap

  if(mqLocationArray.length) {
    finalDaasObject = createDaasObject(mqLocationArray, postData);
    daasApi.setData(queryParams, finalDaasObject, handleDassSetData);
  } else {
    daasApi.deleteData(queryParams, handleDassSetData);
  }

  return deferred.promise();

  function handleDassSetData(data) {
    if (data && data.status && data.status === 'error') {
      handleDaasSetFail(data);
      return;
    }

    mostRecentlySeen = $.extend(true, {}, finalDaasObject);
    deferred.resolve(data);
  }

  function handleDaasSetFail(setErrData) {
    deferred.reject(setErrData);
  }
}

function updatePostStatus() {
  var postData;

  if(mostRecentlySeen && mostRecentlySeen.instance) {
    var latestMqLocations = mostRecentlySeen.instance.locations;
    postData = athena.getPostData();

    // We can safely pass true into the datatype checking param because any data that was previously stored in
    // latestMqLocations has already successfully gone though the validation process.
    return setDaasLocations(latestMqLocations, postData, true);
  } else {
    // TODO: getDaasLocations() then rerun updatePostStatus(), protecting against infinite calls.
    return $.when();
  }
}

//         //
// Helpers //
//         //

function createDaasObject(mqLocationArray) {
  // TODO: Extract the path in a more future-proof way (See commented out function below)
  // We control the domain, so the '.com' assumption is safe for now.
  var postData = athena.getPostData();
  var path = postData.url.slice(postData.url.indexOf('.com') + 4);

  return {
    instance: {
      id: postData.post_id,
      live: postData.status_text === 'Published',
      title: postData.title,
      publishDate: postData.publish_date,
      path: path,
      locations: mqLocationArray
    }
  };
}

/* TODO: Potentially implement this as a future-proof way to get the URL path:
 * (From http://stackoverflow.com/a/21553982)

function getLocation(href) {
  var urlPartsMatcher = new RegExp([
    '^(https?:)//', // protocol
    '(([^:/?#]*)(?::([0-9]+))?)', // host (hostname and port)
    '(/{0,1}[^?#]*)', // pathname
    '(\\?[^#]*|)', // search
    '(#.*|)$' // hash
  ].join(''));

  return urlPartsMatcher && {
    protocol: urlPartsMatcher[1],
    host: urlPartsMatcher[2],
    hostname: urlPartsMatcher[3],
    port: urlPartsMatcher[4],
    pathname: urlPartsMatcher[5],
    search: urlPartsMatcher[6],
    hash: urlPartsMatcher[7]
  }
}
*/
