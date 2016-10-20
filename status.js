var DBPATH = 'index',
    OUTPUT = ['kompas.txt'],
    Datastore = require('nedb'),
    indexdb = new Datastore({ filename: DBPATH, autoload: true }),
    exec = require('child_process').exec

indexdb.count({}, function (err, count) {
  if (err) throw err
  console.log('We currently have ' + count + ' article(s)\n')
  // count lines and words
  console.log('Lines Words File')
  console.log('----- ----- ----')
  OUTPUT.forEach(function (o) {
      exec('wc -lc ' + o, function (err, stdout, stderr) {
          if (err) stdout = err
          console.log(stdout)
      })
  })
})
