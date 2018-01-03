const async = require('async');
const cheerio = require('cheerio');
const request = require('request-promise')

// 获取央企产权交易信息
var reqCentralData = path => new Promise((resolve, reject) => request(path).then(body => {
    resolve([]);
}));

// 获取市属产权交易信息
var reqMunicipalData = path => new Promise((resolve, reject) => request(path).then(body => {
    resolve([]);
}));


module.exports = paths => new Promise((resolve, reject) => {
    async.paralle([
        callback => reqCentralData(path.centralLink).then(data => callback(null, data)).catch(err => callback(err)),
        callback => reqCentralData(path.municipalLink).then(data => callback(null, data)).catch(err => callback(err))
    ], (err, results) => {
        if (err)
            return reject(err);
        resolve(Array.prototype.concat.apply([], results))
    })
});