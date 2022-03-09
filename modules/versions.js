const https = require("https")
const fs = require("fs")
const path = require("path")
const log = require("./log")
const json = require("./json")
const downloads = require("./download")
const filesystem = require("./filesystem")
const download = require("./download")

/**
 * Launcher module for loading and downloading versions. 
 * @author Allink
 */
module.exports = {
    // TODO: Make URL (but not the format) and returned versions configurable.

    /**
     * 
     * @param {Object} versions JSON object containing valid versions
     * @param {Array} filter Array of release types to accept 
     * @callback callback The Minecraft versions filtered nicely 
     */
    parseVersionsWithFilter(versions, filter, callback) {
        var filteredVersions = {versions: []}
        var unfilteredVersions = versions["versions"]

        unfilteredVersions.forEach((version) => {
            if(filter.indexOf(version["type"]) != -1) { // .indexOf returns -1 when an element isn't in the array
                filteredVersions["versions"].push(version)
            }
        })

        callback(filteredVersions)
    },

    /**
     * Gets all Minecraft versions
     * @param {Array} filter Array of release types to accept
     * @callback callback The Minecraft versions you requested
     */
    getVersions: function(filter, callback) {
        log.info(`Getting versions with filter ${filter}...`, "Version Updater")
        var url = "https://launchermeta.mojang.com/mc/game/version_manifest.json" // We want to use https://launchermeta.mojang.com/mc/game/version_manifest.json, as it is a smaller download.

        // We want to have a backup of the version list in-case the Launcher API/Internet goes down, however we still
        // have the version JARs saved on our harddrive
        
        var cachedVersionsPath = path.join(__dirname, "..", "data", "cached_versions.json");
        var cachedVersions = {};
        json.loadFromFile(cachedVersionsPath, (data) => {
            cachedVersions = data;
        });
        
        try {
            download.startDownloading(url, cachedVersionsPath, () => {
                json.loadFromFile(cachedVersionsPath, (data) => {
                    cachedVersions = data;
                });
                this.parseVersionsWithFilter(cachedVersions, filter, (versions) => {
                    callback(versions);
                })
                json.beautifyFile(cachedVersionsPath);
                log.info("Successfully updated version index.", "Version Updater")
            })
        } catch (exception) {
            log.warn(`Failed to download current versions from ${url}: ${exception}`, "Version Updater");
            this.parseVersionsWithFilter(cachedVersions, ["release", "old_beta", "old_alpha"], (versions) => {
                callback(versions);
            })            
            json.beautifyFile(cachedVersionsPath);
            return;
        }
    },
    populateVersionsFolder: async function(callback) {
        this.getVersions(["release", "old_beta", "old_alpha"], (response) => {
            var versions = response["versions"];
            var remainingCallbacks = versions.length;
            console.log(remainingCallbacks)
            versions.forEach((version) => {
                var versionFolder = path.join(__dirname, "..", "versions");
                if(!fs.existsSync(versionFolder)) {
                    filesystem.mkdirFolderIfNotExist(path.join(versionFolder, version["id"]));
                    downloads.startDownloading(version["url"], path.join(__dirname, "..", "versions", version["id"], version["id"] + ".json"), () => {
                        log.info(`Successfully downloaded JSON for ${version["id"]}!`, `Version Downloader`);
                        remainingCallbacks--;
                        if(remainingCallbacks == 0) {
                            callback();
                        }
                    });    
                } else {
                    if(!fs.existsSync(path.join(versionFolder, version["id"]))) {
                        filesystem.mkdirFolderIfNotExist(path.join(versionFolder, version["id"]));
                        downloads.startDownloading(version["url"], path.join(__dirname, "..", "versions", version["id"], version["id"] + ".json"), () => {
                            log.info(`Successfully downloaded JSON for ${version["id"]}!`, `Version Downloader`);
                            remainingCallbacks--;
                            if(remainingCallbacks == 0) {
                                callback();
                            }
                        });      
                    } else {
                        remainingCallbacks--;
                        if(remainingCallbacks == 0) {
                            callback();
                        }  
                    }
                }
            })
        })
    }
}