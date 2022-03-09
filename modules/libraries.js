const fs = require("fs")
const path = require("path")
const artifacts = require("./artifacts")
const download = require("./download")
const filesystem = require("./filesystem")
const json = require("./json")
const log = require("./log")
const platform = require("./platform")

module.exports = {
    getLibrariesFor: function (versionName, callback) {
        json.loadFromFile(path.join(__dirname, "..", "versions", versionName, versionName + ".json"), (versionMeta) => {
            if (versionMeta == {}) {
                log.error(`Unable to load version meta from ${path.join(__dirname, "..", "versions", versionName, versionName + ".json")}`, `Library Downloader`)
                return;
            }
            var libraries = versionMeta["libraries"]
            var returnValue = []
            libraries.forEach((library) => {
                if(library["downloads"]) {
                    if (library["downloads"]["artifact"]) {
                        returnValue.push(path.join(__dirname, "..", "libraries", library["downloads"]["artifact"]["path"]))
                    }    
                }
            })
            callback(returnValue)
        });
    },
    downloadLibrariesFor: function (versionName, callback) {
        finished = function () {
            fs.rmSync(path.join(__dirname, "..", "libraries", "temp"), {
                recursive: true,
                force: true
            })
            callback()
        }

        json.loadFromFile(path.join(__dirname, "..", "versions", versionName, versionName + ".json"), (versionMeta) => {
            var remainingCallbacks = 0
            if (versionMeta == {}) {
                log.error(`Unable to load version meta from ${path.join(__dirname, "..", "versions", versionName, versionName + ".json")}`, `Library Downloader`)
                return;
            }



            if (!fs.existsSync(path.join(__dirname, "..", "versions", versionName, versionName + ".jar"))) {
                var clientJarDownload = versionMeta["downloads"]["client"]["url"]
                log.info(`Downloading client jar, please wait...`)
                remainingCallbacks++;
                download.startDownloading(clientJarDownload, path.join(__dirname, "..", "versions", versionName, versionName + ".jar"), () => {
                    log.info(`Successfully downloaded client jar for ${versionName}!`, `Library Downloader`)
                    remainingCallbacks--;
                    if (remainingCallbacks == 0) {
                        finished()
                    }
                })
            } else {
                log.info(`Client jar for ${versionName} already downloaded!`, `Library Downloader`)
            }


            var libraries = versionMeta["libraries"]
            remainingCallbacks += libraries.length
            log.info(`Downloading ${libraries.length} libraries, please wait...`, `Library Downloader`)
            libraries.forEach((library) => {
                var shouldIDownload = true;
                var rules = library["rules"]
                if (rules) {
                    var operatingSystems = ["osx", "linux", "windows"]
                    var allow = {}
                    var disallow = {}
                    operatingSystems.forEach((os) => {
                        allow[os] = false;
                        disallow[os] = false;
                    })
                    rules.forEach((rule) => {
                        switch (rule["action"]) {
                            case "allow":
                                if (rule["os"]) {
                                    allow[rule["os"]] = true
                                } else {
                                    for (var os in allow) {
                                        allow[os] = true;
                                    }
                                }
                                break;
                            case "disallow":
                                if (rule["os"]) {
                                    disallow[rule["os"]] = true
                                } else {
                                    for (var os in allow) {
                                        disallow[os] = true;
                                    }
                                }
                                break;
                        }

                        var shouldI = {}
                        operatingSystems.forEach((os) => {
                            shouldI[os] = allow[os] && !disallow[os]
                        })
                        shouldIDownload = shouldI[platform.getMojangedPlatform()]
                    })

                }
                if (!shouldIDownload) {
                    remainingCallbacks--;
                    if (remainingCallbacks == 0) {
                        finished()
                    }
                    return;
                }
                var downloads = library["downloads"]
                if(!downloads) {
                    remainingCallbacks--;
                    if (remainingCallbacks == 0) {
                        finished()
                    }
                    return;
                }
                artifacts.downloadArtifacts(downloads, versionName, () => {
                    var artifact = downloads["artifact"]
                    if (!artifact) {
                        remainingCallbacks--;
                        if (remainingCallbacks == 0) {
                            finished()
                        }
                        return;
                    }
                    var filesystemPath = path.join(__dirname, "..", "libraries", artifact["path"])
                    var remotePath = artifact["url"]
                    filesystem.mkdirFolderIfNotExist(path.dirname(filesystemPath))
                    if (!fs.existsSync(filesystemPath)) {
                        download.startDownloading(remotePath, filesystemPath, () => {
                            log.info(`Successfully downloaded library ${path.basename(filesystemPath)}!`, `Library Downloader`)
                            remainingCallbacks--;
                            if (remainingCallbacks == 0) {
                                finished()
                            }
                        })
                    } else {
                        log.debug(`Library ${path.basename(filesystemPath)} already downloaded!`, `Library Downloader`)
                        remainingCallbacks--;
                        if (remainingCallbacks == 0) {
                            finished()
                        }
                    }
                })
            })

        })
    }
}