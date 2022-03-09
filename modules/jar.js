const childProcess = require("child_process")

module.exports = {
    extractJar: function (target, workingDirectory) {
        var command = `jar xvf ${target}`
        childProcess.exec(command, {
            cwd: workingDirectory
        })
    }

}