const platform = require("./platform")
const download = require("./download")
const filesystem = require("./filesystem")
const jar = require("./jar")
const log = require("./log")

const path = require("path")
const fs = require("fs")

module.exports = {
    downloadArtifacts: function (downloads, versionName, callback) {
        var remainingCallbacks = 0;
        if(!downloads) {
            callback()
            return
        }
        var classifiers = downloads["classifiers"]
        if (classifiers) {
            for (var key in classifiers) {
                if (key.startsWith("natives") && key.endsWith(platform.getMojangedPlatform())) {
                    remainingCallbacks++;
                    var nativeArtifact = classifiers[key]
                    var nativeArtifactURL = nativeArtifact["url"]
                    var parentFolder = path.join(__dirname, "..", "libraries", "temp")
                    filesystem.mkdirFolderIfNotExist(parentFolder)
                    var nativesFolder = path.join(__dirname, "..", "natives", `${versionName}`)
                    filesystem.mkdirFolderIfNotExist(nativesFolder)

                    var filesystemPath1 = path.join(parentFolder, nativeArtifact["sha1"] + ".jar")
                    if (!fs.existsSync(filesystemPath1)) {
                        download.startDownloading(nativeArtifactURL, filesystemPath1, () => {
                            log.info(`Successfully downloaded library artifact ${path.basename(filesystemPath1)} (${nativeArtifactURL})!`, `Library Downloader`)
                            jar.extractJar(filesystemPath1, nativesFolder)
                            remainingCallbacks--
                            if (remainingCallbacks == 0) {
                                callback()
                                return
                            }
                        })
                    } else {
                        log.info(`Already downloaded library artifact ${path.basename(nativeArtifactURL)}!`)
                        remainingCallbacks--
                        if (remainingCallbacks == 0) {
                            callback()
                            return
                        }
                    }
                }
            }
        } else {
            callback()
            return
        }

        if (remainingCallbacks == 0) {
            callback()
            return
        }
    }
}