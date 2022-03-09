const fs = require("fs")
const fse = require("fs-extra")
const crypto = require("crypto")
const path = require("path")
const json = require("./json")
const log = require("./log")
const filesystem = require("./filesystem")
const childProcess = require("child_process")
const assets = require("./assets")
const libraries = require("./libraries")

var parentDir = path.join(__dirname, "..")
var mcFolder = path.join(parentDir, ".minecraft");
var assetsFolder = path.join(parentDir, "assets")
var resourcesFolder = path.join(parentDir, "resources")
filesystem.mkdirFolderIfNotExist(mcFolder)

module.exports = {
    launchVersion: function (versionName, username = "Notch", javaBinary = "javaw", jvmArgs = [], mcArgs = []) {
        var argz = {
            "${auth_player_name}": username,
            "${auth_session}": "piss",
            "${assets_root}": assetsFolder,
            "${auth_uuid}": crypto.randomUUID().replace(/-/gm, ""),
            "${auth_access_token}": "piss",
            "${clientid}": "piss",
            "${auth_xuid}": "piss",
            "${user_type}": "pissShit",
            "${user_properties}": "{username:\"ballmuncher123\"}",
            "${version_type}": "node-minecraft-launcher",
            "${version_name}": versionName,
        }

        var gameDirectory = path.join(parentDir, "instances", versionName, "game")
        filesystem.createIfNotExistant(gameDirectory)
        var resourcesCopy = path.join(gameDirectory, "resources")
        fse.copySync(resourcesFolder, resourcesCopy, {
            recursive: true,
            errorOnExist: false,
            overwrite: true
        })
        var versionsFolder = path.join(parentDir, "versions")
        var versionFolder = path.join(versionsFolder, versionName)
        json.loadFromFile(path.join(versionFolder, versionName + ".json"), (versionMeta) => {
            var versionClient = path.join(versionFolder, versionName + ".jar")
            argz["${game_assets}"] = resourcesCopy
            argz["${game_directory}"] = gameDirectory
            var assetIndexVersion = null;
            assets.getAssetIndexVersionForMCVersion(versionName, (version) => {
                assetIndexVersion = version
                argz["${assets_index_name}"] = version

                var uuid = crypto.randomUUID().replace(/-/gm, "")
                var librariesFolder = path.join(parentDir, "libraries")
                var nativesFolder = path.join(parentDir, "natives")
                libraries.getLibrariesFor(versionName, (libs) => {
                    var librariesFor = libs.join(";")
                    var args = [`-Djava.library.path=${path.join(nativesFolder, versionName)}`, `-Dminecraft.client.jar=${versionClient}`, `-cp`, `${librariesFor};${versionClient}`, versionMeta["mainClass"], /* "--gameDir", gameDirectory, "--assetsDir", assetsFolder, "--accessToken", "piss", "--version", `node-minecraft-launcher/${versionName}`,`--userProperties`, `{}`];*/ ]
                    var arguments = (versionMeta["minecraftArguments"]) ? versionMeta["minecraftArguments"].split(" ") : versionMeta["arguments"]["game"]
                    arguments.forEach((argument) => {
                        if (!argument["rules"]) {
                            var parsedArgument = argument
                            for (var argumentName in argz) {
                                parsedArgument = parsedArgument.replace(argumentName, argz[argumentName])
                            }
                            args.push(parsedArgument)
                        }
                    })

                    log.debug(args.join(" "), "Minecraft")
                    var proc = childProcess.execFile(javaBinary, args);
                    var blacklisted = [`java.io.IOException: Server returned HTTP response code: 403 for URL: `,
                        `at sun.net.www.protocol.http.HttpURLConnection.getInputStream(Unknown Source)`,
                        `at java.net.URL.openStream(Unknown Source)`,
                        `cz.a`,
                        `cz.run`
                    ]
                    proc.stderr.on("data", (data) => {
                        var print = true
                        var string = data.toString()

                        blacklisted.forEach((blacklist) => {
                            if (string.includes(blacklist)) {
                                print = false
                            }
                        })
                        if (print) {
                            process.stderr.write(string)
                        }
                    })

                    proc.stdout.pipe(process.stdout)
                    proc.on("exit", (code, signal) => {
                        log.info(`Process exited with exit code ${code}, signal ${signal}`, `Minecraft`)
                        process.exit(code)
                    })

                })

            })


        });
        //, "--username", "Player", "--version", versionName, "--gameDir", mcDir, "--assetsDir", assetsFolder, "--assetIndex", assetIndexVersion, "--uuid", uuid, "--accessToken ", "--userProperties", "{}", "--userType", "mojang"
    }
}