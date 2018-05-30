/**
 * Created By Piny
 * 2018.05.26
 */
const { beijing: $http } = require('../service/index');
const models = require('../models');
const Exchange = require('./exchange');

class ShanghaiExchange extends Exchange {
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
        // // 保存数据
        // this.saveData(noExistData);
        // // 保存页面
        // this.savePages(noExistData);
    }

    async fetchStocksData() {}

    async fetchIncreaseStocksData() {}

    async fetchMaterialObjData() {}
}

module.exports = new ShanghaiExchange();
