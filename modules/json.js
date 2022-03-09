const fs = require("fs")
const log = require("./log")

/**
 * Common module for loading, saving, beautifying & creating JSON format files.
 * @author Allink
 */
module.exports = {
    /**
     * Load a JSON file from a file
     * @param {String} path Path of JSON file
     * @callback callback Returns JSON object, empty if error occurred 
     */
    loadFromFile: function(path, callback) {
        fs.readFile(path, {encoding: "utf-8"}, (err, contents) => {
            if(err) {
                log.error(`Error loading JSON file ${path}: ${err}`);
                callback({});
                return;
            }

            var json = undefined;

            try {
                json = JSON.parse(contents);
            } catch (exception) {
                log.error(`Error while reading JSON file (${path}) contents: ${exception}`)
                callback({});
                return;
            }

            callback(json);
        })
    },
    /**
     * Saves the specified JSON object to a file.
     * @param {Object} json The JSON object to save
     * @param {Strng} path The path to save it to
     * @param {Function} callback Success callback, returns true if successful & false if otherwise. 
     */
    saveToFile: function(json, path, callback = (success)=>{}) {
        var stringified = null;

        try {
            stringified = JSON.stringify(json, null, " ")
        } catch (exception) {
            log.error(`Error while stringifying JSON object to save to ${path}: ${exception}`)
            callback(false);
            return;
        }

        fs.writeFile(path, stringified, {encoding: "utf-8"}, (err) => {
            if(err) {
                log.error(`Error writing JSON file ${path}: ${err}`);
                callback(false);
                return;
            }
            
            callback(true);
        })
    },
    /**
     * Turn a JSON object into a beautiful stringified version
     * @param {String} json The JSON object
     * @returns Beautified string
     */
    beautify: function(json) {
        return JSON.stringify(json, null, " ");
    },
    /**
     * Beautifies a file's JSON contents
     * @param {String} path The path of the file to beautify
     */
    beautifyFile: function(path) {
        fs.readFile(path, (err, data) => {
            if(err) {
                console.error(`Error while reading file ${path} for beautification: ${err}`, `JSON Beautifier`);
                return;
            }

            var originalFile = data.toString("utf-8");
            var asJSON = JSON.parse(originalFile);
            var beautifiedFile = this.beautify(asJSON);
 
            fs.writeFile(path, beautifiedFile, {encoding: "utf-8"}, (err) => {
                if(err) {
                    console.error(`Error while writing beautified file ${path}: ${err}`, `JSON Beautifier`);
                    return;
                }
            })
        })
    }
}