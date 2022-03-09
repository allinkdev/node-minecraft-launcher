// External modules
const https = require("https")
const fs = require("fs")
const path = require("path")

// Internal modules
const fileSystem = require("./modules/filesystem")
const versions = require("./modules/versions")
const log = require("./modules/log")
const libraries = require("./modules/libraries")
const assets = require("./modules/assets")
const launch = require("./modules/launch")
const legacyResources = require("./modules/legacyResources")

log.info("Starting minecraft-launcher, please wait...")
fileSystem.createIfNotExistant()

var version = process.argv[2]

legacyResources.download(() => {
    versions.populateVersionsFolder(() => {
        libraries.downloadLibrariesFor(process.argv[2], () => {
            assets.downloadAssetsFor(process.argv[2], () => {
                launch.launchVersion(process.argv[2], process.argv[3], process.argv[4]);
            });
        });
    });    
})
