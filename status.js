var config = require('./config'),
Datastore = require('nedb'),
indexdb = new Datastore({ filename: config.db, autoload: true }),
exec = require('child_process').exec

// handle format option
var format = null
if (process.argv.length > 2) {
    format = process.argv[2]
    format = (format == '--html' || format == '--json') ? format : null
}

var status = {}
indexdb.count({}, function (err, count) {
    if (err) throw err
    status.totalArticles = count
    // count lines and words
    var promises = []
    for (var key in config) {
        if (typeof config[key] == 'object' && 'output' in config[key]) {
            promises.push(new Promise(function (resolve, reject) {
                exec('wc -lc ' + config[key]['output'], function (err, stdout, stderr) {
                    if (err) {
                        reject(err)
                    } else {
                        if (stdout && stdout.length > 0) {
                            stdout = stdout.trim().split(' ')
                            var s = {name: config[key]['name'], lines: stdout[0], words: stdout[1], file:stdout[2]}
                            resolve(s)
                        }
                    }
                })
            }))
        }
    }
    Promise.all(promises).then(function (values) {
        status.details = values
        render(status, format)
    }, function (err) {
        throw err
    })
})

function render(status, format) {
    if ('--json' == format) {
        console.log(status)
    } else if ('--html' == format) {
        console.log('<html>')
        console.log('<body>')
        console.log('<p>')
        console.log('We currently have ' + status.totalArticles + ' article(s)')
        console.log('</p>')
        console.log('<ul>')
        status.details.forEach(function(s) {
            console.log('<li>')
            console.log(s.file + ' consists of ' + s.lines + ' lines and ' + s.words + ' words')
            console.log('</li>')
        })
        console.log('</ul>')
        console.log('</body>')
        console.log('</html>')
    } else {
        console.log('We currently have ' + status.totalArticles + ' article(s)')
        status.details.forEach(function(s) {
            console.log('* ' + s.file + ' consists of ' + s.lines + ' lines and ' + s.words + ' words')
        })
    }
}
