const Http = require('./axios');

class Beijing extends Http {
    constructor() {
        console.log(this);
    }

    getList(params) {

    }

    getInformation(params) {

    }
}

module.exports = new Beijing();