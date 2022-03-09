const fs = require("fs")
const path = require("path")
const download = require("./download")
const filesystem = require("./filesystem")
const json = require("./json")
const log = require("./log")

module.exports = {
    getAssetIndexVersionForMCVersion: function(versionName, callback) {
        json.loadFromFile(path.join(__dirname, "..", "versions", versionName, versionName + ".json"), (versionMeta) => {
            if(versionMeta == {}) {
                log.error(`Unable to load version meta from ${path.join(__dirname, "..", "versions", versionName, versionName + ".json")}`, `Assets Downloader`)
                return;
            }
            var assetIndex = versionMeta["assetIndex"]
            var assetIndexId = (assetIndex) ? assetIndex["id"] : "pre-1.6"
            callback(assetIndexId);
        })
    },
    downloadAssetsFor: function(versionName, callback) {
        json.loadFromFile(path.join(__dirname, "..", "versions", versionName, versionName + ".json"), (versionMeta) => {
            if(versionMeta == {}) {
                log.error(`Unable to load version meta from ${path.join(__dirname, "..", "versions", versionName, versionName + ".json")}`, `Assets Downloader`)
                return;
            }

            var assetsFolder = path.join(__dirname, "..", "assets");
            var objectsFolder = path.join(assetsFolder, "objects");
            var indexesFolder = path.join(assetsFolder, "indexes");
            var assetIndex = versionMeta["assetIndex"]
            if(!assetIndex) {
                callback()
                return;
            }
            var assetIndexURL = assetIndex["url"]
            var assetIndexId = assetIndex["id"]
            var assetIndexPath = path.join(indexesFolder, assetIndexId + ".json")

            log.info(`Downloading asset index "${assetIndexId}" for ${versionName}...`, "Assets Downloader")
            download.startDownloading(assetIndexURL, assetIndexPath, () => {
                log.info(`Finished downloading asset index for ${versionName}!`, `Assets Downloader`)
                json.loadFromFile(assetIndexPath, (assetIndexJSON) => {
                    if(true) {
                        var objects = assetIndexJSON["objects"]
                        var totalObjects = 0;
                        var me = 0;
                        for(var key in objects) {
                            totalObjects++;
                        }
                        var completedCallbacks = totalObjects;
                        for(var key in objects) {
                            var object = objects[key];
                            var hash = object["hash"];
                            var beginning = hash.substring(0, 2);
                            var whole = hash;
                            var objectFolder = path.join(objectsFolder, beginning)
                            var filesystemPath = path.join(objectFolder, whole)
                            if(!fs.existsSync(filesystemPath)) {
                                filesystem.mkdirFolderIfNotExist(objectFolder);
                                //log.debug(`Downloading object ${whole}...`, `Assets Downloader`);
                                var url = `https://resources.download.minecraft.net/${beginning}/${whole}`
                                download.startDownloading(url, filesystemPath, () => {
                                    me++;
                                    log.info(`Downloaded object! (${me}/${totalObjects}, ${(me/totalObjects)*100}%)`, `Assets Downloader`)
                                    completedCallbacks--;
                                    if(completedCallbacks == 0) {
                                        callback();
                                    }
                                })
                            } else {
                                me++;
                                log.info(`Already downloaded object ${whole}! (${me}/${totalObjects}, ${(me/totalObjects)*100}%)`, `Assets Downloader`)
                                completedCallbacks--;
                                if(completedCallbacks == 0) {
                                    callback();
                                }
                            }
                        }
                    }
                })
            })
        })
    }
}