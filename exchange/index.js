/**
 * Created By Piny
 * 2018.05.26
 */
const schedule = require('node-schedule');
const beijingExchange = require('./beijing');
const shanghaiExchange = require('./shanghai');
const tianjinExchange = require('./tianjin');
const chongqingExchange = require('./chongqing');

class ScheduleTask {
    constructor() {}

    start() {
        this.schedule = schedule.scheduleJob('5 * * * * *', () => {
            this.requestBeijingData();
            // this.requestTianjinData();
            // this.requestShanghaiData();
            // this.requestChongqingData();
            // 监听是否有新增数据，若存在新增数据发送短信邮件或者公众号推送
        });
        return this;
    }

    stop() {
        this.schedule();
    }

    requestBeijingData() {
        beijingExchange.fetchPrePublishData();
        beijingExchange.fetchStocksData();
        beijingExchange.fetchIncreaseStocksData();
        beijingExchange.fetchMaterialObjData();
    }

    requestShanghaiData() {
        shanghaiExchange.fetchPrePublishData();
        shanghaiExchange.fetchStocksData();
        shanghaiExchange.fetchIncreaseStocksData();
        shanghaiExchange.fetchMaterialObjData();
    }

    requestTianjinData() {
        tianjinExchange.fetchPrePublishData();
        tianjinExchange.fetchStocksData();
        tianjinExchange.fetchIncreaseStocksData();
        tianjinExchange.fetchMaterialObjData();
    }

    requestChongqingData() {
        chongqingExchange.fetchPrePublishData();
        chongqingExchange.fetchStocksData();
        chongqingExchange.fetchIncreaseStocksData();
        chongqingExchange.fetchMaterialObjData();
    }
}

module.exports = ScheduleTask;
