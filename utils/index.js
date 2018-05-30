/**
 * Created By Piny
 * 2018.05.25
 */
const mkdir = require('./mkdir');
const compareDate = require('./compare-date');
const formatDate = require('./format-date');

class Utils {
    constructor(data) {
        Object.entries(data).forEach(([key, fn]) => {
            this[key] = fn;
        });
    }
}

module.exports = new Utils({
    mkdir,
    compareDate,
    formatDate,
});