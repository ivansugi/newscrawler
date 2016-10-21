var fs = require('fs'),
    concat = require('concat-files'),
    moment = require('moment'),
    exec = require('child_process').exec,
    config = require('./config'),
    outputName = 'crawled',
    now = moment().format('YYYYMMDDHHmmss'),
    outputFile = outputName + '.' + now +  '.txt',
    outputFileZip = outputName + '.' + now + '.tar.gz'

// collect file names
files = []
for (var key in config) {
    if (typeof config[key] == 'object' && 'output' in config[key]) {
        files.push(config[key]['output'])
    }
}

// concat
concat(files, outputFile, function() {
    // compress
    exec('tar -cvzf ' + outputFileZip + ' ' + outputFile, function (err, stdout, stderr) {
        if (err) throw err
        fs.unlink(outputFile)
        console.log('Done. ' + __dirname + '/' + outputFileZip)
    })
})
