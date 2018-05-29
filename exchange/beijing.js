/**
 * Created By Piny
 * 2018.05.26
 */
const { beijing: $http } = require('../service/index');
const models = require('../models');
const Exchange = require('./exchange');

class BeijingExchange extends Exchange {
    constructor() {
        super();
    }

    async fetchPrePublishData() {
        // 获取详情数据
        const exchangeData = await $http.getCurrentDayList();
        // 查询数据是否存在
        const noExistData = await this.filterExistData(exchangeData);
        // 为数据设置维护人员、部门
        const dataMaintainList = this.setMaintain(noExistData);
        // 保存数据
        await this.saveData(noExistData);
        // 保存页面
        this.savePage(noExistData);
    }

    async fetchStocksData() {}

    async fetchIncreaseStocksData() {}

    async fetchMaterialObjData() {}

    filterExistData(dataList) {
        const promiseList = dataList.map((item) => {
            return models.PrePublish.findOne({
                where: {
                    code: item.code,
                },
            }).then((result) => {
                if (!!result) {
                    return void 0;
                }
                return item;
            });
        });
        return Promise.all(promiseList).then((data) => {
            return data.filter((item) => item !== void 0);
        });
    }

    saveData(data) {
        return Promise.resolve('save data');
    }
}

module.exports = new BeijingExchange();
