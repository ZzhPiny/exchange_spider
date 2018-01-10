const fs = require('fs');

function mkdir(path) {
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

module.exports = ({path = 'page', date, exchangeName, exchangeType, fileName, body}) => {
    mkdir(path).then(() => {
        path += '/' + date;
        return mkdir(path);
    }).then(() => {
        path += '/' +exchangeName;
        return mkdir(path);
    }).then(() => {
        path += '/' + exchangeType;
        return mkdir(path);
    }).then(() => {
        path += '/' + fileName;
        fs.writeFileSync(path, body);
    }).catch(err => {
        console.log(err);
    });
};
