/**
 * Functions required by downloadThirdPartyLib.js to manage the tools
 * own configuration settings.
 *
 * @author  Dennis Sterzenbach <dennis.sterzenbach@gmail.com>
 */
var fs = require('fs');

function DownloadThirdpartyLibConfig(libConfigFileName) {
  this._config = {};
  this.libConfigFileName = libConfigFileName;

  // automatically load the given configuration file so we are ready to go
  this.loadConfig(libConfigFileName);
}

module.exports = DownloadThirdpartyLibConfig;

DownloadThirdpartyLibConfig.CONST_validKnownSettings = {
  basePath: true,
  test: true
};

DownloadThirdpartyLibConfig.prototype.loadConfig = function loadConfig(fileName) {
  this._config = require(fileName);

  return this._config;
};

DownloadThirdpartyLibConfig.prototype.getConfiguration = function getConfiguration() {
  return this._config;
};

DownloadThirdpartyLibConfig.prototype.setValue = function setValue(setting, value) {
  if (!setting) {
    return false;
  }

  if (!DownloadThirdpartyLibConfig.CONST_validKnownSettings.hasOwnProperty(setting)) {
    return false;
  }

  if (typeof value === 'undefined' || value === null || typeof value === 'object') {
    return false;
  }

  if (setting === 'basePath' && value.substr(value.length - 1) !== '/') {
    value += '/';
  }

  this._config[setting] = value;

  return this.updateConfig(this.libConfigFileName, config);
};

DownloadThirdpartyLibConfig.prototype.updateConfig = function updateConfig(fileName, config) {
  fs.writeFileSync(fileName, JSON.stringify(config, ' ', 4));
  return true;
};
