/**
 * Created By Piny
 * 2018.05.26
 */
const { beijing: $http } = require('../service/index');
const models = require('../models');
const Exchange = require('./exchange');

class BeijingExchange extends Exchange {
    constructor(props) {
        super(props);
    }

    async fetchPrePublishData() {
        // 获取详情数据
        const exchangeData = await $http.getCurrentDayList();
        // 查询数据是否存在
        const noExistData = await this.filterExistData(
            exchangeData,
            'PrePublish',
        );
        // 为数据设置维护人员、部门
        const dataMaintainList = this.setMaintain(noExistData);
        // 保存数据
        this.saveData(dataMaintainList, 'PrePublish');
        // 保存页面
        console.log(dataMaintainList);
        this.savePage(dataMaintainList);
    }

    async fetchStocksData() {}

    async fetchIncreaseStocksData() {}

    async fetchMaterialObjData() {}
}

module.exports = BeijingExchange;
