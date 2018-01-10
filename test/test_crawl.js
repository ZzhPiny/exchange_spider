const crawl = require('../reqtrade/crawling');

crawl().then(body => {
    console.log(body);
}).catch(err => {
    console.log(err)
})