(function(module) {
  'use strict';

  // We want to use this both browsers and tests.
  if(module && module.exports) {
    module.exports = setAthenaMocks;
  } else {
    setAthenaMocks();
  }

  function setAthenaMocks(disableLogging) {
    var $ = window.$;

    var mockLocationData = [{
      mqId: '123456789',
      name: 'Test Location',
      coordinates: {
        lat: 12.3456789,
        lng: -98.765432
      },
      slug: 'test/slug',
      type: 'testType'
    }];

    var postDetails = {
      post_id: '12345',
      status_text: 'Published',
      title: 'Test title',
      url: 'https://www.example.com/some/path/goes/here/',
      publish_date: '02/28/2017 6:35 PM'
    };

    var mockExtrasData = {
      mqLocations: mockLocationData
    };

    var mockDaasData = {
      results: [{
        instance: {
          live: true,
          locations: mockLocationData
        }
      }]
    };

    //                                        //
    // Blogsmith SDK global constants / mocks //
    //                                        //

    window._blog_id = window._blog_id || '979';
    window._post_id = window._post_id || '12345';

    window.blogsmith = window.blogsmith || {
      sdk: {
        ui: {
          posts: {
            extra: {
              get: mockJqueryDeferred('Extra get', mockExtrasData),
              set: mockJqueryDeferred('Extra set', mockExtrasData)
            }
          }
        }
      },
      getPostID: mockNonDeferred('getPostID', postDetails.post_id),
      getPostDetails: mockNonDeferred('getPostDetails', postDetails)
    };

    // BS.cms.hooks.afterSave
    window.BS = window.BS || {
      cms: {
        hooks: {
          afterSave: []
        }
      }
    };

    $.amp = $.amp || {
      data: {
        api: {
          init: mockNonDeferred('init'),
          setData: mockDaasCallback('setData'),
          queryData: mockDaasCallback('queryData', mockDaasData),
          deleteData: mockDaasCallback('deleteData')
        }
      }
    };

    function mockJqueryDeferred(name) {
      var mockName = 'MOCK (jQuery Deferred): "' + name + '"';
      logMessage(mockName + ' loaded.');
      return jqMock;

      function jqMock(data) {
        if (name === 'Extra set') {
          mockExtrasData = data;
        }

        logMessage(mockName + ' invoked.', data, mockExtrasData);
        return $.when(data || mockExtrasData);
      }
    }

    function mockNonDeferred(name, data) {
      var mockName = 'MOCK (Non Deferred): "' + name + '"';
      logMessage(mockName + ' loaded.');
      return mock;

      function mock() {
        logMessage(mockName + ' invoked.', arguments);
        return data;
      }
    }

    function mockDaasCallback(name, dataToReturn) {
      var mockName = 'MOCK (Daas Callback): "' + name + '"';
      logMessage(mockName + ' loaded.');
      return callbackMock;

      function callbackMock(params, dataOrCallback, callback) {
        logMessage(mockName + ' invoked.', arguments);
        (callback || dataOrCallback)(dataToReturn || (callback ? dataOrCallback : params));
      }
    }

    function logMessage(message) {
      if(!disableLogging) {
        console.log(message, arguments); // eslint-disable-line no-console
      }
    }
  }
})(typeof module === 'undefined' ? null : module);
