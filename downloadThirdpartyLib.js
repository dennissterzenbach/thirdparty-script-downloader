/**
 * Helper script to download a new version of a thirdparty library from origin.
 * You can download a copy from for example separate "dev"elopment or 
 * "prod"uction environments.
 *
 * Usage, see:
 * node downloadThirdpartyLib.js --help
 *
 * @author  Dennis Sterzenbach <dennis.sterzenbach@gmail.com>
 */
var program = require('commander');
var chalk = require('chalk');
var fs = require('fs');

// SETUP CHALK FOR LOG OUTPUT
chalk.enabled = true;
chalk.supportsColor = true;

var libConfigFileName = './thirdparty-libs-config.json';

// GLOBAL VARS
var systemContext;
var libName;

banner();

var DownloadThirdpartyLibConfig = require('./inc.config.js');
var DownloadThirdPartyLibUpdater = require('./inc.update.js');
var DownloadThirdpartyLibRegistry = require('./inc.registry.js');

var libConfig = new DownloadThirdpartyLibConfig(libConfigFileName);
var libRegistry = new DownloadThirdpartyLibRegistry(libConfig);

///////////////////////////////////////////////////////////////////////////////
///// THE PROGRAM
program
  .version('1.0.0')
  .option('-v, --verbose', 'Output verbose');
  
program
  .command('update <libName> <systemContext>')
  .description('update given library by downloading new copy for system context')
  .option('-n, --dry-run', 'Download but only simulate replacing the library')
  .action(programRunUpdate);

program
  .command('show-all')
  .description('lists all configured libraries and their respective systemContext, url, filename')
  .action(programShowAllRegisteredLibraries);

program
  .command('add-lib <libName> <systemContext> <url> <localFileName>')
  .description('adds or updates for the defined url, filename for a library\'s systemContext')
  .action(programAddLibraryToRegistry);

program
  .command('remove-lib <libName>')
  .description('remove the library')
  .action(programRemoveLib);

program
  .command('remove-lib-context <libName> <systemContext>')
  .description('remove the library\'s systemContext')
  .action(programRemoveLibContext);

program
  .command('config-set <setting> <value>')
  .description('set the settings\' value')
  .action(programSetConfigValue);

program
  .command('config-show')
  .description('show currently configured settings')
  .action(programShowConfig);

program
  .parse(process.argv);

///////////////////////////////////////////////////////////////////////////////
///// API
function programRunUpdate(parLibName, parSystemContext) {
    libName = parLibName;
    systemContext = parSystemContext;

    console.log('cmd:', chalk.inverse.underline('Update library ' + libName + ' @ ' + systemContext));
    console.info('RUNNING UPDATE FOR', parLibName);

    var registry = libRegistry.loadRegistry();
    var updater = new DownloadThirdPartyLibUpdater();
    updater.downloadAndPublishFile(libConfig.getConfiguration().basePath, registry[libName][systemContext], libName, generateMetaData);
}

function programShowAllRegisteredLibraries() {
    var registry = libRegistry.loadRegistry();

    console.log('cmd:', chalk.inverse.underline('Showing registry...'));

    Object.keys(registry).forEach(function(libName) {
        var libSettings = registry[libName];
        Object.keys(libSettings).forEach(function(libSystemContext) {
            var libSystemContextSettings = libSettings[libSystemContext];
            
            console.log(chalk.green('> '), chalk.underline(libName + '.' + libSystemContext));
            console.log(chalk.blue('>> url  ='), chalk.gray(libSystemContextSettings.url));
            console.log(chalk.blue('>> file ='), chalk.gray(libSystemContextSettings.file));
        });
    });
}

function programAddLibraryToRegistry(libName, env, sourceURL, localFileName) {
    console.log('cmd:', chalk.inverse.underline('Adding to registry...'));
    console.log(chalk.green('libName:'), libName);
    console.log(chalk.green('context:'), env);
    console.log(chalk.green('source :'), sourceURL);
    console.log(chalk.green('local  :'), localFileName);

    libRegistry.addLibrary(libName, env, sourceURL, localFileName);

    // Object.keys(registry).forEach(function(libName) {
    //     var libSettings = registry[libName];
    //     Object.keys(libSettings).forEach(function(libSystemContext) {
    //         var libSystemContextSettings = libSettings[libSystemContext];
            
    //         console.log(chalk.green('> '), chalk.underline(libName + '.' + libSystemContext));
    //         console.log(chalk.blue('>> url  ='), chalk.gray(libSystemContextSettings.url));
    //         console.log(chalk.blue('>> file ='), chalk.gray(libSystemContextSettings.file));
    //     });
    // });
}

function programRemoveLib(libName) {
    console.log('cmd:', chalk.inverse.underline('Removing lib from registry...'));
    console.log(chalk.gray('libName:'), libName);

    libRegistry.removeLib(libName);

    console.log(chalk.green('done'));
}

function programRemoveLibContext(libName, env) {
    console.log('cmd:', chalk.inverse.underline('Removing lib context from registry...'));
    console.log(chalk.gray('libName:'), libName);
    console.log(chalk.gray('context:'), env);

    libRegistry.removeLibContext(libName, env);

    console.log(chalk.green('done'));
}

///////////////////////////////////////////////////////////////////////////////
// CONFIG

function programShowConfig() {
  console.log('CONFIG');
  console.log(libConfig.getConfiguration());
}

function programSetConfigValue(setting, value) {
  if (libConfig.setValue(setting, value)) {
    programShowConfig();
  }
}

///////////////////////////////////////////////////////////////////////////////
///// GENERAL HELPER
function banner() {
    console.log(chalk.bold('=====[ Thirdparty Library Downloader  ]===== =========================='));
    console.log(chalk.bold(' by Dennis Sterzenbach <dennis.sterzenbach@gmail.com>'));
    console.log();
}

///////////////////////////////////////////////////////////////////////////////
///// HELPER FOR UPDATE
function generateMetaData(url, libfiletype) {
    var timestamp = new Date().toISOString();

    var meta = 'window.thirdpartyLibrary = window.thirdpartyLibrary || {};' + "\n";
    meta += 'window.thirdpartyLibrary.library = window.thirdpartyLibrary.library || {};' + "\n";
    meta += 'window.thirdpartyLibrary.library.' + libfiletype + ' = window.thirdpartyLibrary.library.' + libfiletype + ' || {};' + "\n";
    meta += "window.thirdpartyLibrary.library." + libfiletype + ".source = '" + url + "';\n";
    meta += "window.thirdpartyLibrary.library." + libfiletype + ".timestamp = '" + timestamp + "';\n";
    meta += "\n";

    return meta;
}
