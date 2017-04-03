var ui = require('../ui');
var daas = require('../remote-data/daas');

module.exports = {
  setHooks: setHooks
};

function setHooks() {
  window.BS.cms.hooks.afterSave.push(updateMqLocPostStatus);
}

function updateMqLocPostStatus() {
  ui.setStatusText('Updating post status...');

  daas.updatePostStatus()
    .then(handleUpdateSuccess)
    .fail(handleUpdateFail);

  function handleUpdateSuccess() {
    ui.setStatusText();
  }

  function handleUpdateFail(err) {
    ui.setStatusText();
    ui.showError('Unable to update post status on the server. Please attempt to save again.', err);
  }
}
