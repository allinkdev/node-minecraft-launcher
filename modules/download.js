const https = require("https")
const fs = require("fs")
const path = require("path")
const statusBar = require("status-bar")
const log = require("./log")

var downloads = 0;
var downloadQueue = [];
var timeSinceLastDownloadInit = 0;

async function downloadObject(remotePath, filesystemPath, callback) {
    var writeStream = fs.createWriteStream(filesystemPath)
    https.get(remotePath, function (res) {
        timeSinceLastDownloadInit = new Date().valueOf();
        downloads++;
        bar = statusBar.create({
                total: res.headers['content-length']
            })
            .on('render', function (stats) {
                process.stdout.write(
                    path.basename(remotePath) + ' ' +
                    this.format.storage(stats.currentSize) + ' ' +
                    this.format.speed(stats.speed) + ' ' +
                    this.format.time(stats.elapsedTime) + ' ' +
                    this.format.time(stats.remainingTime) + ' [' +
                    this.format.progressBar(stats.percentage) + '] ' +
                    this.format.percentage(stats.percentage));
                process.stdout.cursorTo(0);
            });

        res.pipe(bar);
        res.pipe(writeStream);
        res.on("end", () => {
            // Verify if the file has been fully downloaded.
            var bytes = fs.readFileSync(filesystemPath).length
            if(bytes != res.headers['content-length']) {
                log.warn(`Received broken download from ${remotePath} (${bytes} vs ${res.headers['content-length']}), redownloading...`, `Downloader`)
                module.exports.startDownloading(remotePath, filesystemPath, callback)
            } else {
                downloads--;
                callback();
            }
        })
    }).on('error', function (err) {
        if (bar) bar.cancel();
        log.error(err, `Downloader`);
    });
}

setInterval(async () => {
    if (downloadQueue.length != 0) {
        downloadQueue.forEach((value, i) => {
            var now = new Date().valueOf()
            var newDownload = value;
            downloadQueue.splice(i, 1);
            setTimeout(() => {
                downloadObject(newDownload.remotePath, newDownload.filesystemPath, newDownload.callback);
            }, 50*i)
        })
    }
}, 500)

module.exports = {
    /**
     * Queue a file for downloading
     * @param {String} remotePath The path of the remote file
     * @param {String} filesystemPath Where you want it saved
     * @callback callback When we're done downloading this file
     */
    startDownloading: async function (remotePath, filesystemPath, callback) {
        downloadQueue.push({
            remotePath: remotePath,
            filesystemPath: filesystemPath,
            callback: callback
        })
    }
}