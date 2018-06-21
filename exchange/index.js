/**
 * Created By Piny
 * 2018.05.26
 */
const schedule = require('node-schedule');
const Immutable = require('immutable');

const BeijingExchange = require('./beijing');
const shanghaiExchange = require('./shanghai');
const tianjinExchange = require('./tianjin');
const chongqingExchange = require('./chongqing');
const chargeConfig = require('../config/charge.config.json');
const models = require('../models');

class ScheduleTask {
    constructor() {
        models.Maintain.findAll().then((maintainData) => {
            if (maintainData.length !== 0) {
                return;
            }
            const chargeConfigList = chargeConfig.map((item) => {
                return {
                    departmentName: item.group,
                    personName: item.person,
                    maintainType: item.type,
                };
            });
            models.Maintain.bulkCreate(chargeConfigList);
        });
    }

    async start() {
        try {
            this.maintainData = await models.Maintain.findAll().then(
                (maintainData) => Immutable.fromJS(maintainData),
            );
        } catch (err) {
            console.log(err);
            return;
        }

        this.beijingExchange = new BeijingExchange({
            maintainData: this.maintainData,
        });
        this.schedule = schedule.scheduleJob('5 * * * * *', () => {
            // this.schedule = schedule.scheduleJob('0 0 23 * * *', () => {
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
        this.beijingExchange.fetchPrePublishData();
        this.beijingExchange.fetchStocksData();
        this.beijingExchange.fetchIncreaseStocksData();
        this.beijingExchange.fetchMaterialObjData();
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
