/**
 * Functions required by downloadThirdPartyLib.js to manage the library
 * registry and their environments, urls, filenames.
 *
 * @author  Dennis Sterzenbach <dennis.sterzenbach@gmail.com>
 */
var fs = require('fs');

function DownloadThirdpartyLibRegistry(configManager) {
    this._configManager = configManager;

    this.libraryRegistryFilename = this._configManager.getConfiguration().libraryRegistry;
}

module.exports = DownloadThirdpartyLibRegistry;

DownloadThirdpartyLibRegistry.prototype.loadRegistry = function loadRegistry(forceReload) {
    if (!this._registry || !!forceReload) {
        this._registry = require(this.libraryRegistryFilename);
    }

    return this._registry;
};

DownloadThirdpartyLibRegistry.prototype.updateRegistry = function updateRegistry(registryContent) {
    fs.writeFileSync(this.libraryRegistryFilename, JSON.stringify(registryContent, ' ', 4));
};

DownloadThirdpartyLibRegistry.prototype.hasLibrary = function hasLibrary(libName) {
    return this.loadRegistry().hasOwnProperty(libName);
};

DownloadThirdpartyLibRegistry.prototype.removeLib = function removeLib(libName) {
    if (this.hasLibrary(libName)) {
        delete this._registry[libName];
    }

    this.updateRegistry(this._registry);
};

DownloadThirdpartyLibRegistry.prototype.removeLibContext = function removeLibContext(libName, env) {
    if (this.hasLibrary(libName)) {
        if (this._registry[libName][env]) {
            if (Object.keys(this._registry[libName]).length > 1) {
                // there are other environments than only the one requested to be removed
                // so only delete that one and keep the rest of the library's registration
                delete this._registry[libName][env];
            } else {
                // there is only this environment left, so remove the library completely
                this.removeLib(libName);
            }
        }


    }

    this.updateRegistry(this._registry);
};

DownloadThirdpartyLibRegistry.prototype.addLibrary = function addLibrary(libName, env, sourceURL, localFileName) {
    this.loadRegistry();
   
    if (!this._registry[libName]) {
        this._registry[libName] = {};
    }

    if (!this._registry[libName][env]) {
        this._registry[libName][env] = {};
    }

    this._registry[libName][env].url = sourceURL;
    this._registry[libName][env].file = localFileName;

    this.updateRegistry(this._registry);
};
