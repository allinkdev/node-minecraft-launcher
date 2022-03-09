const maths = require("./maths")

/**
 * Common module for logging messages, warns and errors to the console like SL4J.
 * @author Allink
 */
module.exports = {
    /**
     * Generate the current time in timestamp format
     * @returns Timestamp in format [hh:mm:ss]
     */
    generateTimestamp: function() {
        var now = new Date();
        var msg = `[${maths.addZeroes(now.getHours())}:${maths.addZeroes(now.getMinutes())}:${maths.addZeroes(now.getSeconds())}]`;
        return msg;
    },
    /**
     * Log an informative message to the console, like sl4j
     * @param {String} message The message you want to log
     * @param {String} sourceThread (optional) The thread the message originates from
     */
    info: function(message, sourceThread = "Main thread") {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);      
        console.log(`${this.generateTimestamp()} [${sourceThread}/INFO]: ${message}`);
    },
    /**
     * Log an debug message to the console, like sl4j
     * @param {String} message The message you want to log
     * @param {String} sourceThread (optional) The thread the message originates from
     */
    debug: function(message, sourceThread = "Main thread") {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);      
        console.log(`${this.generateTimestamp()} [${sourceThread}/DEBUG]: ${message}`);
    },
     /**
     * Log a warning to the console, like sl4j
     * @param {String} message The warning you want to log
     * @param {String} sourceThread (optional) The thread the warning originates from
     */
    warn: function(message, sourceThread = "Main thread") {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        console.warn(`${this.generateTimestamp()} [${sourceThread}/WARN]: ${message}`);
    },
    /**
     * Log an error to the console, like sl4j
     * @param {String} message The error you want to log
     * @param {String} sourceThread (optional) The thread the error originates from
     */
    error: function(message, sourceThread = "Main thread") {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        console.error(`${this.generateTimestamp()} [${sourceThread}/ERROR]: ${message}`);
    }
}