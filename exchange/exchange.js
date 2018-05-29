/**
 * Created By Piny
 * 2018.05.29
 */

class Exchange {
    constructor(data) {
        this.data = data;
    }

    setMaintain(data) {
        console.log('extend maintain');
    }

    savePage(pageList) {
        console.log('extend page');
    }
}

module.exports = Exchange;
