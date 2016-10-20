# News Crawler

> Information rules the world ~ Winston Churchill

News crawler collection built on node.js using:

* Requests (for HTTP request) https://github.com/request/request
* Cheerio (for HTML parsing and DOM traversing) https://github.com/cheeriojs/cheerio
* Nedb (for persisting crawled URL) https://github.com/louischatriot/nedb

## Prerequisites

* Node.js https://nodejs.org
* OS with word count `wc` script installed (most Linux distros have it)

## Setup and Running

Download all dependencies
```
$ npm install
```
Run crawler
```
$ node kompas.js
$ node detik.js
```
Configure scripts output, log and database name in `config.js`
