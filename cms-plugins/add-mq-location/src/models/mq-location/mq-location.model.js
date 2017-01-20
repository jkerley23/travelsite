// TODO: Unit tests.

var $ = window.$;

MqLocation.prototype.isMqLocation = isMqLocation;
MqLocation.prototype.isArrayOfMqLocations = isArrayOfMqLocations;

module.exports = MqLocation;

function MqLocation(mqId, name, coordinates, slug, type, skipValidCheck) {
  var valid = skipValidCheck // For pulling data - otherwise, old data may get locked in.
    || typeof mqId === 'string'
    && typeof name === 'string'
    && name.length > 0
    && coordinates
    && typeof coordinates.lat === 'number'
    // TODO: lat must be between -90 and 90
    && typeof coordinates.lng === 'number'
    // TODO: lng must be between -180 and 180
    && typeof slug === 'string'
    && typeof type === 'string';

  if (!valid) {
    /* TODO: Display error in UI. The following used to be here and had to be removed due to a circular dependency:
    ui.showError(
      'Internal error.',
      {
        mqId: mqId,
        name: name,
        coordinates: coordinates,
        slug: slug,
        type: type
      }
    );
  */

    throw new Error('Incorrect MqLocation parameters.');
  }

  this.mqId = mqId;
  this.name = name;
  this.coordinates = $.extend(true, {}, coordinates);
  this.slug = slug;
  this.type = type;
}

function isMqLocation(objectToCheck) {
  return objectToCheck instanceof MqLocation;
}

function isArrayOfMqLocations(dataToCheck) {
  return Array.isArray(dataToCheck) && (dataToCheck.every(isMqLocation) || dataToCheck.length === 0);
}
