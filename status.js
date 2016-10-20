var config = require('./config'),
    Datastore = require('nedb'),
    indexdb = new Datastore({ filename: config.db, autoload: true }),
    exec = require('child_process').exec

indexdb.count({}, function (err, count) {
  if (err) throw err
  console.log('We currently have ' + count + ' article(s)\n')
  // count lines and words
  console.log('Lines Words File')
  console.log('----- ----- ----')
  for (var key in config) {
      if (typeof config[key] == 'object' && 'output' in config[key]) {
          exec('wc -lc ' + config[key]['output'], function (err, stdout, stderr) {
              if (err) stdout = err
              console.log(stdout)
          })
      }
  }
})
