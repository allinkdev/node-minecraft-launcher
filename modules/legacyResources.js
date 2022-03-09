const download = require("./download")
const fs = require("fs")
const path = require("path")
const filesystem = require("./filesystem")
const log = require("./log")
const tar = require("tar")

const parentDir = path.join(__dirname, "..")

module.exports = {
    download: (callback) => {
        var resourcesDir = path.join(parentDir, "resources")
        var tempDir = fs.mkdtempSync("resources")
        const finish = () => {
            fs.rmSync(tempDir, {recursive: true, force: true})
            callback()
        }
        if (!fs.existsSync(resourcesDir)) {
            log.warn("Legacy resources folder doesn't exist. Creating...", "Legacy Resource Downloader")
            var parts = ["https://business-goose.github.io/resources.tar.001", "https://business-goose.github.io/resources.tar.002"]
            var toDo = parts.length

            parts.forEach((part) => {
                var saveTo = path.join(tempDir, path.basename(part))
                download.startDownloading(part, saveTo, () => {
                    toDo--;
                    log.info(`Completed downloading legacy resource archive part #${parts.length-toDo}`, `Legacy Resource Downloader`)
                    if(toDo == 0) { 
                        var part1 = fs.readFileSync(path.join(tempDir, path.basename(parts[0])))
                        var part2 = fs.readFileSync(path.join(tempDir, path.basename(parts[1])))
                        var joined = Buffer.concat([part1, part2])
                        var joinedFileName = path.join(tempDir, "resources.tar");
                        fs.writeFileSync(joinedFileName, joined)
                        tar.extract({file: joinedFileName, cwd: parentDir}, (err) => {
                            if(err) {
                                log.error(`Error extracting legacy resources tarball: ${err}`)
                            }
                            finish()
                        })
                    }
                })
            })

        } else {
            log.info("Legacy resources folder already created. Skipping...", "Legacy Resource Downloader")
            finish()
        }
    }
}