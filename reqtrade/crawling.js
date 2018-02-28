const fs = require("fs");
const request = require("request-promise");
const cheerio = require("cheerio");
const nodeExcel = require("excel-export");
const async = require("async");

const siteConfig = require("../config/site.config");
const chargeConfig = require("../config/charge.config");

// 获取预披露交易
const getBJPrePublish = require("./prepublish.bj");
const getSHPrePublish = require("./prepublish.sh");
const getTJPrePublish = require("./prepublish.tj");
const getCQPrePublish = require("./prepublish.cq");

// 获取股权交易
const getBJStockRights = require("./stockrights.bj");
const getSHStockRights = require("./stockrights.sh");
const getTJStockRights = require("./stockrights.tj");
const getCQStockRights = require("./stockrights.cq");

// 获取增资扩股交易
const getBJIncreasesStock = require("./increasesstock.bj");
const getSHIncreasesStock = require("./increasesstock.sh");
const getTJIncreasesStock = require("./increasesstock.tj");
const getCQIncreasesStock = require("./increasesstock.cq");

// 获取实物交易
const getBJMaterialObject = require("./materialobj.bj");
const getSHMaterialObject = require("./materialobj.sh");
const getTJMaterialObject = require("./materialobj.tj");
const getCQMaterialObject = require("./materialobj.cq");

var date = new Date("2017-12-22");

var prePublishObj = {
    type: "", // 类型
    code: "", // 项目编号
    name: "", // 项目名称
    parent: [], // 隶属集团
    transferParty: [], // 转让方
    price: "", // 挂牌价格（万）
    trade: "", // 所属行业
    startTime: "", // 披露开始时间
    endTime: "", // 披露结束时间
    trustedOrganization: "", // 受托机构
    clientName: [], // 客户名称 (同隶属集团)
    department: "", // 部门
    maintain: "", // 维护人员
    exchange: "", // 交易所
    handlePerson: "", // 经办人员
    remark: "" // 备注
};

// 北交所
var requestBeijingData = callback => request(siteConfig.beijing).then(body => {
    var $　= cheerio.load(body);
    var link = $("#c1_4").find("a");

    var increasesStockLink = 'http://www.cbex.com.cn/ztym/zzkgb/indexcsmore.shtml'; // link.eq(0).attr("href");
    var centralLink = link.eq(1).attr("href");
    var municipalLink = link.eq(2).attr("href");
    var materialObjectLink = "http://www.cbex.com.cn/article/xmpd/swxt/"; // link.eq(3).attr("href");
    var stockRightsLink = link.eq(0).attr("href");

    console.log("增资扩股：", increasesStockLink);
    console.log("央企产权：", centralLink);
    console.log("市属产权：", municipalLink);
    console.log("实物：", materialObjectLink);
    console.log("股权：", stockRightsLink);
    
    async.parallel([
        callback => getBJPrePublish({
            centralPath: centralLink,
            municipalPath: municipalLink
        }).then(results => {
            callback(null, results);
        }).catch(err => {
            callback(err);
        }),
        callback => getBJIncreasesStock(increasesStockLink).then(results => {
            callback(null, results);
        }).catch(err => {
            callback(err);
        }),
        callback => getBJStockRights({
            centralPath: centralLink,
            municipalPath: municipalLink
        }).then(results => {
            callback(null, results);
        }).catch(err => {
            callback(err);
        }),
        callback => getBJMaterialObject(materialObjectLink).then(results => {
            callback(null, results);
        }).catch(err => {
            callback(err);
        })
    ], (err, results) => {
        if (err) {
            console.log(err);
            throw err;
        }
        callback(null, {
            prePublish: results[0],
            stockRights: results[1],
            increasesStock: results[2],
            materialObject: results[3]
        });
    });
});

// 获取上交所交易数据
var requestShanghaiData = callback => request(siteConfig.shanghai).then(body => {
    var $ = cheerio.load(body);
    
    var prePublishPath;
    var increasesStockPath;
    var stockRightsPath;
    var materialObjPath;
    async.parallel([
        callback => getSHPrePublish({
            centralPath: centralLink,
            municipalPath: municipalLink
        }).then(results => {
            callback(null, results);
        }).catch(err => {
            callback(err);
        }),
        callback => getSHIncreasesStock(increasesStockLink).then(results => {
            callback(null, results);
        }).catch(err => {
            callback(err);
        }),
        callback => getSHStockRights(stockRightsLink).then(results => {
            callback(null, results);
        }).catch(err => {
            callback(err);
        }),
        callback => getSHMaterialObject(materialObjectLink).then(results => {
            callback(null, results);
        }).catch(err => {
            callback(err);
        })
    ], (err, results) => {
        if (err) {
            console.log(err);
            throw err;
        }
        callback(null, {
            prePublish: results[0],
            stockRights: results[1],
            increasesStock: results[2],
            materialObject: results[3]
        });
    });
    callback(null, {
        prePublish: [],
        stockRights: [],
        increasesStock: [],
        materialObject: []
    });
});

// 获取天交所交易数据
var requestTianjinData = callback => {
    callback(null, {
        prePublish: [],
        stockRights: [],
        increasesStock: [],
        materialObject: []
    });
};

// 获取重交所交易数据
var requestChongqingData = callback => {
    callback(null, {
        prePublish: [],
        stockRights: [],
        increasesStock: [],
        materialObject: []
    });
};

module.exports = () => new Promise((resolve, reject) => {
    async.parallel([
        requestBeijingData,
        requestShanghaiData,
        requestTianjinData,
        requestChongqingData
    ], (err, results) => {
        if (err) {
            reject(err);
            throw err;
        }
        var res = {
            prePublish: [].concat(results[0].prePublish, results[1].prePublish, results[2].prePublish, results[3].prePublish),
            stockRights: [].concat(results[0].stockRights, results[1].stockRights, results[2].stockRights, results[3].stockRights),
            increasesStock: [].concat(results[0].increasesStock, results[1].increasesStock, results[2].increasesStock, results[3].increasesStock),
            materialObject: [].concat(results[0].materialObject, results[1].materialObject, results[2].materialObject, results[3].materialObject)
        };
        resolve(res);
    });
});