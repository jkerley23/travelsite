// var sinon = require('sinon');
var athenaTest = require('../../../../../test-helpers/athena-test');

var ui;

athenaTest('ui.elements', function(t) {
  setupTest();

  t.ok(
    ui.elements.locationSelectorDropdown instanceof window.$,
    'locationSelectorDropdown should be a jQuery element'
  );

  t.ok(
    ui.elements.mapHolder instanceof window.$,
    'mapHolder should be a jQuery element'
  );

  t.ok(
    ui.elements.toggleMapButton instanceof window.$,
    'toggleMapButton should be a jQuery element'
  );

  t.end();
});

athenaTest('ui.setStatusText - TODO', function(t) {
  // Append to window.document.documentElement.outerHTML to add elements.
  // ex: window.$(window.document.documentElement).find('body').append(window.$('<div>test BODY</div>))'
  var statusText = window.$('#addmqloc-status');
  setupTest();

  t.end();
});


/* TODO:
 *
 * ui.setStatusText
 *   should set the status text element\'s text to the passed in string
 *   should show the status text element if the string has content
 *   should hide the status text element if the string is empty
 *
 * ui.addLocationsToUIList
 *   should throw an error if the passed in value is not an array MqLocations
 *   should display an error of any of the locations are already in the UI list
 *   should not add duplicate entries to the UI list
 *   should show the UI list element holder
 *   should append a new element that includes the location name in the text
 *   should bind the passed in function to the new element's click handler
 *
 * ui.removeLocationsFromUIList
 *   should show an error if the passed in value is not an array of MqLocations
 *   should show an error if the passed in location is not already in the UI list
 *   should remove the element that represents the passed in location
 *   should hide the UI list holder element if no elements remain in the list
 *
 * ui.toggleMapVisibility
 *   * map is visible
 *   should hide the map holder
 *   should set the text of the map toggle button to include "show"
 *   * map is not visible
 *   should show the map holder element if it is not visible
 *   should set the text of the map toggle button to include "hide"
 *
 * ui.clearError
 *   should set the error area element's text to a blank string
 *
 * ui.showError
 *   *NOTE: The console.error aspect of this function will soon be refactored out, so will not be tested at this time
 *   should set the error area\'s text to the passed-in error string.
 *   should append additional text if any additional data is passed in
 *
 * ui.elementIsVisible
 *   should return false if the passed in jQuery element is hidden
 *   should return true if the passed in jQuery element is shown
 */

//                  //
// Helper functions //
//                  //

function setupTest() {
  ui = require('.');
}
