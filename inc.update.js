/**
 * Functions required by downloadThirdPartyLib.js to update a library
 * by downloading it from configured origin and store to the destination
 * filename.
 * When given the function downloadFileFromURL will also call a function to
 * generate some header with meta data like the current date, time, url etc.
 *
 * @author  Dennis Sterzenbach <dennis.sterzenbach@gmail.com>
 */
var request = require('request');
var fs = require('fs');
var path = require('path');

var chalk = require('chalk');

function DownloadThirdPartyLibUpdater() {
}

module.exports = DownloadThirdPartyLibUpdater;

DownloadThirdPartyLibUpdater.prototype.downloadFileFromURL = function downloadFileFromURL(sourceURL, destinationFileName, libfiletype, onSuccessCallback, onErrorCallback, generateMetaDataFn) {
    var file = fs.createWriteStream(destinationFileName);
    var downloadRequest = request.get(sourceURL);

    console.log('> downloading file from "' + sourceURL + '"...');

    downloadRequest.on('response', function(response) {
        if (response.statusCode !== 200) {
            if (onErrorCallback) {
                onErrorCallback('Response status was ' + response.statusCode);
            }

            return;
        }
    });

    downloadRequest.on('error', handleDownloadError);

    // Handle
    if (generateMetaDataFn) {
        file.write(generateMetaDataFn(sourceURL, libfiletype));
    }

    downloadRequest.pipe(file);

    file.on('finish', function() {
        file.close(onSuccessCallback); // close() is async, call cb after close completes.
    });

    file.on('error', handleDownloadError);

    function handleDownloadError(err) {
        // Handle errors
        // Delete the file async. (Attention: But we don't check the result!)
        // fs.unlink(destinationFileName);

        if (onErrorCallback) {
            onErrorCallback(err.message);
        }
    }
};

DownloadThirdPartyLibUpdater.prototype.publishDownloadedFile = function publishDownloadedFile(tmp, destination) {
    if (fs.existsSync(destination)) {
        console.log(chalk.gray('... removing existing destination file: "' + destination + '"'));
        fs.unlinkSync(destination);
    }

    fs.rename(tmp, destination, function() {
        console.info(chalk.green('>>> successfully replaced: "' + destination + '"'));
    });
};

DownloadThirdPartyLibUpdater.prototype.downloadAndPublishFile = function downloadAndPublishFile(basePath, descriptor, libfiletype, generateMetaData) {
    var tmpFileName = basePath + descriptor.file + '.tmp';
    var destinationFileName = basePath + descriptor.file;

    this.downloadFileFromURL(descriptor.url, tmpFileName, libfiletype, function() {
        console.info(chalk.green('>>> successfully downloaded'), 'from "' + descriptor.url + '"');
        console.info(chalk.green('>>> wrote downloaded tmpfile'), 'to: "' + tmpFileName + '"');
        this.publishDownloadedFile(tmpFileName, destinationFileName);

    }.bind(this), function(err) {
        console.error('### error downloading the file: ' + err);
    }, generateMetaData);
};
