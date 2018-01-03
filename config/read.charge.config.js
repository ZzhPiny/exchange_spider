const fs = require('fs');
const readline = require('readline');

var rl = readline.createInterface({
    input: fs.createReadStream('./charge.txt')
});

var data = [];
rl.on('line', line => {
    var lineData = line.split(/\s/).filter(i => i !== '');
    data.push({
        group: lineData[0],
        person: lineData[1],
        type: lineData[2]
    })
});

rl.on('close', () => {
    fs.writeFile('./charge.config.json', JSON.stringify(data, null, 4), err => {
        if (err)
            throw err;
    });
})