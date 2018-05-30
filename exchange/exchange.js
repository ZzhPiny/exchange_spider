/**
 * Created By Piny
 * 2018.05.29
 */
const fs = require('fs');
const models = require('../models');
const utils = require('../utils');

class Exchange {
    constructor(data) {
        this.data = data;
    }

    filterExistData(dataList, modelType) {
        const promiseList = dataList.map((item) => {
            return models[modelType]
                .findOne({
                    where: {
                        code: item.code,
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
            return data.filter((item) => item !== void 0);
        });
    }

    /**
     * [setMaintain 根据集团名称获得维护该集团人员以及所属部门]
     * @param {[type]} data [description]
     */
    setMaintain(data) {
        // 负责人负责最终央企，故数据中所属集团必须为最终央企名称
        const dataWithMaintain = data.map((item) => {
            const charge = chargeConfig.find(
                (chargeItem) => chargeItem.group == item.groupName,
            );
            const department = !!charge ? charge.type : '';
            const maintain = !!charge ? charge.person : '';
            return Object.assign({}, item, {
                maintain,
                department,
            });
        });
        return dataWithMaintain;
    }

    async saveData(data, modelType) {
        // 批量保存数据
        return models[modelType].bulkCreate(data);
    }

    savePage(pageList) {
        const pageData = Array.isArray(pageList) ? pageList : [pageList];
        pageData.forEach(
            ({
                path = 'page',
                date,
                exchangeName,
                exchangeType,
                fileName,
                body,
            }) => {
                utils
                    .mkdir(path)
                    .then(() => {
                        path += '/' + date;
                        return mkdir(path);
                    })
                    .then(() => {
                        path += '/' + exchangeName;
                        return mkdir(path);
                    })
                    .then(() => {
                        path += '/' + exchangeType;
                        return mkdir(path);
                    })
                    .then(() => {
                        path += '/' + fileName;
                        fs.writeFileSync(path, body);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            },
        );
    }
}

module.exports = Exchange;
