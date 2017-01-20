var $ = window.$;

var ui = require('../../ui');
var extras = require('../extras');
var daas = require('../daas');
var misc = require('../../misc');
var athena = require('../../athena'); // Parachute blog ID.

var MqLocation = require('../../../models/mq-location');

var isArrayOfMqLocations = MqLocation.prototype.isArrayOfMqLocations;

module.exports = {
  addLocalAndRemoteLocations: addLocalAndRemoteLocations,
  removeLocalAndRemoteLocations: removeLocalAndRemoteLocations,
  getRemoteLocationData: getRemoteLocationData
};

function addLocalAndRemoteLocations(mqLocationsToAdd, mqLocationsArrayToModify) {
  modifyLocalAndRemoteLocations(
    mqLocationsToAdd,
    mqLocationsArrayToModify,
    true,
    mqLocationsArrayToModify
  );
}

function removeLocalAndRemoteLocations(mqLocationsToRemove, mqLocationsArrayToModify) {
  modifyLocalAndRemoteLocations(
    mqLocationsArrayToModify,
    mqLocationsToRemove,
    false,
    mqLocationsArrayToModify
  );
}

function getRemoteLocationData(message) {
// TODO: Handle SDK - DAAS data separation (Reset to DAAS, warn user)

  var isParachute = athena.isParachute();
  var deferred = $.Deferred(); // eslint-disable-line new-cap
  ui.setStatusText(message || 'Getting location data...');

  // TODO: Figure out why regular .then chaining isn't working here. Using deferred for now.
  $.when(
    extras.getStoredSdkLocations(),
    isParachute ? daas.getDaasLocations() : $.when()
  )
    .then(handleRemoteLocationData)
    .fail(handleRemoteLocationFail);

  return deferred.promise();

  function handleRemoteLocationData(sdkData, daasData) {
    var finalData = externalObjectToMqLocation(isParachute ? daasData : sdkData, isParachute);
    ui.setStatusText();

    // TODO: Verify that SDK and DAAS data matches before resolving.
    deferred[finalData.error ? 'reject' : 'resolve'](finalData);
  }

  function handleRemoteLocationFail(err) {
    ui.setStatusText();
    deferred.reject(err);
  }
}

//         //
// Helpers //
//         //

function modifyLocalAndRemoteLocations(base, subtractor, addSubtractorDiffToBase, mqLocationsArrayToModify) {
  // TODO: This could probably use a refactor. Reusable code is nice, however, one method that both adds and
  // removes may be overkill. A lot of readability is sacrificed.

  var baseWithSubtractorValuesRemoved, result, errorMessage, errorNames;

  if (!(isArrayOfMqLocations(base) && isArrayOfMqLocations(subtractor))) {
    ui.showError(
      'Internal error: Object passed in to modifyLocalAndRemoteLocations is not an MqLocation Array.',
      subtractor
    );

    return;
  }

  baseWithSubtractorValuesRemoved = base.filter(withOrWithoutTheseMqLocations(subtractor));

  if (baseWithSubtractorValuesRemoved.length !== base.length - (addSubtractorDiffToBase ? 0 : subtractor.length)) {
    errorMessage = addSubtractorDiffToBase
      ? 'Already added: '
      : 'Attempted to remove some locations that have not yet been added: ';

    errorNames = subtractor
      .filter(
        withOrWithoutTheseMqLocations(
          addSubtractorDiffToBase ? base : baseWithSubtractorValuesRemoved,
          addSubtractorDiffToBase
        )
      )
      .map(toMqLocationNames)
      .join(', ');

    ui.showError(errorMessage + errorNames);
  }

  if (addSubtractorDiffToBase
    ? baseWithSubtractorValuesRemoved.length
    : baseWithSubtractorValuesRemoved.length < base.length
  ) {
    result = (
      // The bare baseWithSubtractorValuesRemoved is fine if we aren't adding to the base.
      addSubtractorDiffToBase ? Array.prototype.concat.bind(subtractor) : misc.identity
    )(baseWithSubtractorValuesRemoved);

    setRemoteLocationData(result)
      .then(handleRemoteSetSuccess)
      .fail(handleRemoteSetErr);
  }

  function withOrWithoutTheseMqLocations(mqLocationsToRemove, onlyMatched) {
    return removeIfContains;

    function removeIfContains(mqLocationToThatMightBeRemoved) {
      var hasMatchingLocation = mqLocationsToRemove.some(hasSameId);
      return onlyMatched ? hasMatchingLocation : !hasMatchingLocation;

      function hasSameId(mqLocationToCompare) {
        return mqLocationToThatMightBeRemoved.mqId === mqLocationToCompare.mqId;
      }
    }
  }

  function toMqLocationNames(mqLocation) {
    return mqLocation.name;
  }

  function handleRemoteSetSuccess() {
    var locationsThatNeedUiChange = addSubtractorDiffToBase ? base : subtractor;

    // We must keep the reference to the passed-in array, so we won't set it via = [new locations].
    // We repopulate it instead.
    mqLocationsArrayToModify.length = 0;
    $.merge(mqLocationsArrayToModify, result);

    (
      addSubtractorDiffToBase
        ? ui.addLocationsToUIList
        : ui.removeLocationsFromUIList
    )(locationsThatNeedUiChange, removeLocalAndRemoteLocations, mqLocationsArrayToModify);
  }

  function handleRemoteSetErr() {
    ui.showError(
      'Unable to ' + (addSubtractorDiffToBase ? 'add' : 'remove') + ' locations from post because of a server error.',
      arguments // We use arguments because the failing data can be at indexes 0 and 1 if both fail - 0 otherwise.
    );
  }

  function setRemoteLocationData(mqLocationArray, message) {
    if(!isArrayOfMqLocations(mqLocationArray)) {
      ui.showError('Internal error. Incorrect data format passed to setRemoteLocationData.', mqLocationArray);
      throw new Error('setRemoteLocationData expects an array of MqLocations');
    }

    ui.setStatusText(message || 'Updating location data...');

    return $.when(
      extras.setStoredSdkLocations(mqLocationArray),
      athena.isParachute() ? daas.setDaasLocations(mqLocationArray) : $.when()
    )
      .always(ui.setStatusText.bind(null, null));
  }
}

function externalObjectToMqLocation(externalData, isDaasData) {
  var errorData, locationData;
  externalData = externalData || {};

  errorData =
    (!externalData && {error: 'Blank response from remote server.'})
    || isDaasData
      ? externalData.status && externalData.status === 'error' && {error: externalData.message}
      : externalData.error && externalData;

  locationData =
    !errorData
    && isDaasData
      ? (externalData.instance && externalData.instance.locations) || []
      : externalData.mqLocations || [];

  if(!errorData && !Array.isArray(locationData)) {
    errorData = {
      error: 'Non-array location data from server with no error code',
      data: locationData
    };
  }

  return errorData || locationData.map(toMqLocations);

  function toMqLocations(sdkFormatMqIdNameObject) {
    return new MqLocation(
      sdkFormatMqIdNameObject.mqId,
      sdkFormatMqIdNameObject.name,
      sdkFormatMqIdNameObject.coordinates,
      sdkFormatMqIdNameObject.slug,
      sdkFormatMqIdNameObject.type,
      true
    );
  }
}
