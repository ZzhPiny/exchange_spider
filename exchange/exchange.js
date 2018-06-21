/**
 * Created By Piny
 * 2018.05.29
 */
const fs = require('fs');
const { List, Map } = require('immutable');

const models = require('../models');
const utils = require('../utils');
const chargeConfig = require('../config/charge.config.json');

class Exchange {
    constructor(props = {}) {
        const { maintainData = List([]) } = props;
        this.maintainData = maintainData;
    }

    /**
     * [filterExistData 过滤数据是否已经存在于数据库中]
     * @param  { List } dataList  获得的数据，元素为Map
     * @param  { String } modelType 数据库模型字符串
     * @return {[type]}   返回Promise验证数据是否已存在
     */
    filterExistData(dataList, modelType) {
        const promiseList = dataList.map((item) => {
            return models[modelType]
                .findOne({
                    where: {
                        code: item.get('code'),
                    },
                })
                .then((result) => {
                    if (!!result) {
                        return void 0;
                    }
                    return item;
                });
        });
        return Promise.all(promiseList).then((data) => {
            const noExistData = data.filter((item) => item !== void 0);
            return noExistData;
        });
    }

    /**
     * [setMaintain 根据集团名称获得维护该集团人员以及所属部门]
     * @param {[List]} dataList []
     * return {[List]} [Map, Map, Map]
     */
    setMaintain(dataList = List([])) {
        // 负责人负责最终央企，故数据中所属集团必须为最终央企名称
        const dataWithMaintain = dataList.map((item) => {
            const chargeData =
                this.maintainData.find((maintain) => {
                    return maintain.get('departmentName') === item.groupName;
                }) ||
                Map({
                    maintainType: '',
                    personName: '',
                });
            console.log('chargeData', chargeData);
            return item
                .set('maintain', chargeData.get('personName'))
                .set('department', chargeData.get('maintainType'));
        });
        return List(dataWithMaintain);
    }

    /**
     * [saveData 将数据保存在数据库中]
     * @param  {[List]} dataList   新发布数据列表
     * @param  {[String]} modelType 数据库模型
     * @return {[Promise]}          返回一个Promise
     */
    async saveData(dataList, modelType) {
        // 批量保存数据
        return await models[modelType].bulkCreate(dataList.toJS());
    }

    /**
     * [savePage 根据数据发布时间、交易所、交易类型保存在对应文件夹下]
     * @param  {[List, Map]} pageList 单条数据或多条数据
     * @return {[None]}          无返回值
     */
    savePage(pageList) {
        const pageData = List.isList(pageList) ? pageList : List([pageList]);
        pageData.forEach((pageItem) => {
            const path = 'page';
            const date = pageItem.get('date');
            const exchangeName = pageItem.get('exchange');
            const exchangeType = pageItem.get('exchangeType');
            const fileName = pageItem.get('name');
            const body = pageItem.get('page');

            const catalogPath = [path, date, exchangeName, exchangeType].join(
                '/',
            );
            utils.mkdir(catalogPath).then(() => {
                fs.writeFileSync(`${catalogPath}/${fileName}.html`, body);
            });
        });
    }
}

module.exports = Exchange;
