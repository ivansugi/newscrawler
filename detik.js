// Crawl and scrap kompas.com headlines
// yohanes.gultom@gmail.com

var config = require('./config'),
fs = require('fs'),
request = require('request'),
cheerio = require('cheerio'),
Datastore = require('nedb'),
log4js = require('log4js'),
indexdb = new Datastore({ filename: config.   db, autoload: true }),
url = 'http://news.detik.com/indeks'

// logging
log4js.loadAppender('file')
log4js.addAppender(log4js.appenders.file(config.detik.log), config.detik.name)
var logger = log4js.getLogger(config.detik.name)
logger.setLevel('DEBUG')

getTargetsFromIndex(url).then(function(args) {
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


function getTargetsFromIndex(url) {
    return new Promise(function (resolve, reject) {
        request(url, function(err, response, html){
            if (err) {
                logger.error(err)
                reject(err)
            } else {
                var $ = cheerio.load(html),
                targets = []
                // custom
                $('div.desc_idx a').each(function(){
                    var data = $(this),
                    url = data.attr('href')
                    targets.push('http:' + url)
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
                rawTitle = $('div.jdl h1').first().text(),
                rawContent = $('div.detail_text').first()
                // remove known tags
                $('script', rawContent).remove()
                $('table', rawContent).remove()
                $('div', rawContent).remove()
                rawContent = rawContent.html()

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
                            fs.appendFile(config.detik.output, title + '\n' + content + '\n\n', function (err) {
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
        // clean author sign
        html = html.replace(/<strong>\([\w/]+\)<\/strong>/gi, '')
        // clean source tags
        html = html.replace(/<[^<>]+>/gi, '')
        // clean encoded ascii
        html = html.replace(/&[#\d\w]+;/gi, ' ')
        // trailing whitespaces
        html = html.replace(/\s\s+/gi, ' ')
        return html.trim()
    } catch (err) {
        logger.error('Failed to clean: ' + err)
        return null
    }
}
