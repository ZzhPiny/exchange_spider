/**
 * Created By Piny
 * 2018.05.26
 */
const schedule = require('node-schedule');
const beijingExchange = require('./beijing');

class ScheduleTask {
    constructor() {

    }

    start() {
        this.schedule = schedule.scheduleJob('5 * * * * *', () => {
            var presentTime = new Date();
            console.log(presentTime);
            this.requestBeijingData();
            this.requestTianjinData();
            this.requestShanghaiData();
            this.requestChongqingData();
        });
        return this;
    }

    stop() {

    }

    requestBeijingData() {
        console.log('request beijing data');
        beijingExchange.requestPrePublishData();
    }

    requestTianjinData() {
        console.log('request tianjin data');

    }

    requestShanghaiData() {
        console.log('request shanghai data');
    }

    requestChongqingData() {
        console.log('request chongqing data');
    }
}

module.exports = ScheduleTask;