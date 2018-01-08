const fs = require('fs');

function mkdir(path) {
    return new Promise((resolve, reject) => {
        fs.open(path, (err, fd) => {
            if (err && (err.code == 'EEXIST' || err.code == 'EE')) {
                fs.mkdirSync(path);
                return null;
            }
            resolve();
        });
    });
}

module.exports = (path, date, exchangeName, exchangeType, fileName, body) => {
    mkdir(path).then(() => {
        path += date;
        return mkdir(path);
    }).then(() => {
        path += exchangeName;
        return mkdir(path);
    }).then(() => {
        path += exchangeType;
        return mkdir(path);
    }).then(() => {
        path += fileName;
        fs.writeFileSync(path, body);
    });
};
