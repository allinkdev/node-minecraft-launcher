/**
 * Common module for mathematical operations.
 * @author Allink
 */
module.exports = {
    /**
     * Returns a number (ideally under 100) with a 0 if it is under 9, else it just returns the number. Good for timestampsa nd such. 
     * @param {String} num The number you want to pad with zeroes 
     * @returns The number with zeroes
     */
    addZeroes: function(num) {
        if(num > 9) {
            return num;
        }
        return `0${num}`;
    }
}