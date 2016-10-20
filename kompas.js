// Crawl and scrap detik.com headlines
// yohanes.gultom@gmail.com

var config = require('./config'),
  fs = require('fs'),
  request = require('request'),
  cheerio = require('cheerio'),
  Datastore = require('nedb'),
  log4js = require('log4js'),
  indexdb = new Datastore({ filename: config.db, autoload: true }),
  url = 'http://indeks.kompas.com/indeks/headline'

// logging
log4js.loadAppender('file')
log4js.addAppender(log4js.appenders.file(config.kompas.log), config.kompas.name)
var logger = log4js.getLogger(config.kompas.name)
logger.setLevel('ERROR')

// dispatch number of threads async
for (var i = 1; i <= config.kompas.pages; i++) {
  var indexUrl = url + '?p=' + i
  getTargetsFromIndex(indexUrl).then(function(args) {
    var targets = args[0]
    targets.forEach(function (url) {
      // retrieve article if not yet
      // exist in index db
      indexdb.count({ url: url }, function (err, count) {
        if (err) throw err
        if (count <= 0) {
          logger.debug(url)
          saveArticle(url)
        }
      })
    })
  }, function (err) {
    throw err
  })
}

function getTargetsFromIndex(url) {
  return new Promise(function (resolve, reject) {
    request(url, function(err, response, html){
      if (err) {
        logger.error(err)
        reject(err)
      } else {
        var $ = cheerio.load(html),
            targets = []
        $('#headline h3').each(function(){
          var data = $(this),
              url = data.children().first().attr('href')
          targets.push(url)
        })
        resolve([targets])
      }
    })
  })
}

function saveArticle(url) {
  return new Promise(function (resolve, reject) {
    request(url, function(error, response, html){
      if (error) {
        reject(error)
      } else {
        // extract title and content
        var $ = cheerio.load(html),
          rawTitle = $('div.kcm-read-top h2').first().text(),
          rawContent = $('div.kcm-read-text').first().html()

        var title = rawTitle.trim()
        var content = cleanArticle(rawContent)
        // only proceed if not empty
        if (title && content) {
          // save url and title to db as index
          indexdb.insert({url: url, title: title}, function (err, record) {
            if (err) {
              logger.error(err)
              reject(err)
            } else {
              // save title and content to output file
              fs.appendFile(config.kompas.output, title + '\n' + content + '\n\n', function (err) {
                if (err) {
                  reject(err)
                } else {
                  resolve([url, title, content])
                }
              })
            }
          })
        } else {
          logger.error('Failed to save article ' + url)
        }
      }
    })
  })
}

function cleanArticle(html) {
  try {
    // clean source name, tags, references, encoded ascii
    clean = html.replace(/KOMPAS\.com|<[^<>]+>|\(Baca:[^\(\)]+\)/gi, '')
    // clean encoded ascii
    clean = clean.replace(/&[#\d\w]+;/gi, ' ')
    // trailing whitespaces
    clean = clean.replace(/\s\s+/gi, ' ')
    return clean.trim()
  } catch (err) {
    logger.error('Failed to clean: ' + html)
    return null
  }
}
