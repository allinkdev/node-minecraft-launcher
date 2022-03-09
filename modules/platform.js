const {platform} = require("os")

module.exports = {
    getMojangedPlatform: function() {
        switch(platform()) {
            default:
            case "linux":
                return "linux";
            case "win32":
                return "windows";
            case "darwin":
                return "osx";
        }
    }
}