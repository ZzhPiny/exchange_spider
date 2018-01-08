const async = require('async');
const cheerio = require('cheerio');
const request = require('request-promise')

module.exports = path => new Promise((resolve, reject) => {
    request(path).then(body => {
        resolve([]);
    }).catch(err => {

    });
});