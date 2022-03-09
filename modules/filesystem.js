const fs = require("fs")
const path = require("path")
const log = require("./log")

/**
 * Common module for creating directories and files if they don't exist.
 * @author Allink
 */
module.exports = {
    defaultForFileType: {"json": `{}`},
    mkdirFolderIfNotExist: async function(folderPath) {
        if(!fs.existsSync(folderPath)) {
            log.warn(`Creating folder ${folderPath} from scratch as it does not exist!`, "Filesystem Checker");
            fs.mkdirSync(folderPath, {recursive: true});
        }
    },
    createIfNotExistant: async function() {
        var paths = ["assets", "data", "versions", "instances", "libraries", "assets", "assets/indexes", "assets/skins", "assets/objects"]
        var files = [["data","cached_versions.json"]]

        paths.forEach((partialPath) => {
            var folderPath = path.join(__dirname, "..", partialPath);

            this.mkdirFolderIfNotExist(folderPath);
        })

        files.forEach((partialPathArr) => {
            var filePath = path.join(__dirname, "..");

            partialPathArr.forEach((partialPath) => {
                filePath = path.join(filePath, partialPath);
            })

            if(!fs.existsSync(filePath)) {
                log.warn(`Creating file ${filePath} from scratch as it does not exist!`, "Filesystem Checker");
                var ext = filePath.split(".")[1];
                var content = (this.defaultForFileType[ext] != null) ? this.defaultForFileType[ext] : "";
                fs.writeFile(filePath, content, () => {});
            }
        })
    }
}