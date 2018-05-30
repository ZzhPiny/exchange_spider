const fs = require('fs');

module.exports = (path) => {
    return new Promise((resolve, reject) => {
        fs.mkdir(path, err => {
            if (err && err.code !== 'EEXIST') {
                console.log(err);
                return reject(err);
            }
            resolve();
        });
    });
}