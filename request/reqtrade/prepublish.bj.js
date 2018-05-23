const async = require('async');
const cheerio = require('cheerio');
const request = require('request-promise');
const utils = require('../utils/utils');
const savePage = require('../utils/savepage');
const contants = require('../config/contants');
const chargeConfig = require('../config/charge.config.json');

// var prePublishObj = {
//     type: "", // 类型
//     code: "", // 项目编号
//     name: "", // 项目名称
//     parent: [], // 隶属集团
//     transferParty: [], // 转让方
//     price: "", // 挂牌价格（万）
//     trade: "", // 所属行业
//     startTime: "", // 披露开始时间
//     endTime: "", // 披露结束时间
//     trustedOrganization: "", // 受托机构
//     clientName: [], // 客户名称 (同隶属集团)
//     department: "", // 部门
//     maintain: "", // 维护人员
//     exchange: "", // 交易所
//     handlePerson: "", // 经办人员
//     remark: "" // 备注
// };

// 获取央企产权交易信息
var reqCentralData = path => new Promise((resolve, reject) => request(path).then(body => {
    var $ = cheerio.load(body);
    var $trList = $(".plist_yqygp").find('tr');
    var data = getDataByTrList($trList);
    var arrRequest = data.map((item, index) => callback => request(item.path).then(body => {
        // console.log(body);
        var $ = cheerio.load(body);
        var $trListofInfo = $('.xinxi').find('tr');

        var commonInfo = {};
        commonInfo.type = "央企";
        commonInfo.code = item.code;
        commonInfo.startTime = $trListofInfo.eq(1).find('td').eq(1).text();
        commonInfo.endTime = $trListofInfo.eq(1).find('td').eq(3).text();
        commonInfo.trade = $trListofInfo.eq(1).find('td').eq(3).text();
        //console.log($trListofInfo.eq(5).find('td').eq(1).text().split(/\s|\n\t\t\t/).filter(i => i !== '')[0].split('：')[1]);
        commonInfo.handlePerson = $trListofInfo.eq(5).find('td').eq(1).text().split(/\s|\n\t\t\t/).filter(i => i !== '')[0].split('：')[1];

        var exchangeByTransferParty = [];
        var $trListofDetail = $('.qingk').find('tr');
        $trListofDetail.each((index, item) => {
            var $tdList = $trListofDetail.eq(index).find('td');

            commonInfo.companyName = $tdList.eq(0).text() === "标的企业名称" ? $tdList.eq(1).text() : commonInfo.companyName;
            commonInfo.companyAddress = $tdList.eq(1).text() === "注册地（住所）" ? $tdList.eq(2).text() : commonInfo.companyAddress;
            commonInfo.legalPerson = $tdList.eq(0).text() === "法定代表人" ? $tdList.eq(1).text() : commonInfo.legalPerson;
            commonInfo.setupDate = $tdList.eq(2).text() === "成立日期" ? $tdList.eq(3).text() : commonInfo.setupDate;

            if ($tdList.eq(1).text() === "转让方名称") {
                exchangeByTransferParty.push({
                    transferParty: $tdList.eq(2).text()
                });
            }

            if ($tdList.eq(0).text() === "国家出资企业或主管部门名称") {
                exchangeByTransferParty[exchangeByTransferParty.length - 1].parentGroup = $tdList.eq(1).text();
            }

            if ($tdList.eq(0).text() === "持有产(股)权比例") {
                exchangeByTransferParty[exchangeByTransferParty.length - 1].stock = $tdList.eq(1).text();
            }

            if ($tdList.eq(2).text() === "拟转让产(股)权比例") {
                exchangeByTransferParty[exchangeByTransferParty.length - 1].transferStock = $tdList.eq(3).text();
            }
        });

        var exchangeProject = [];
        exchangeByTransferParty.forEach((item, index) => {
            var project = exchangeProject.find(project => project.parentGroup === item.parentGroup);
            if (!project) {
                return exchangeProject.push(item);
            }

            project.transferParty += '、' + item.transferParty;
            project.stock = parseFloat(project.stock.split('%')[0]) + parseFloat(item.stock.split("%")[1]) + "%";
            project.transferStock = parseFloat(project.transferStock.split('%')[0]) + parseFloat(item.transferStock.split("%")[1]) + "%";
        });

        exchangeProject.forEach(project => {
            Object.assign(project, commonInfo);
            project.clientName = project.parentGroup;
            var charge = chargeConfig.filter(item => item.group == project.parentGroup)[0];
            project.department = !!charge ? charge.type : '';
            project.maintain = !!charge ? charge.person : '';
        });

        savePage({
            date: item.date,
            exchangeName: contants.exchangeName.bj,
            exchangeType: contants.exchangeType.prePublish,
            fileName: item.name + '.html',
            body: body
        });
        callback(null, exchangeProject);
    }));
    async.parallel(arrRequest, (err, results) => {
        if (err) {
            return reject(err);
        }
        resolve(Array.prototype.concat.apply([], results));
    });
}));

// 获取市属产权交易信息
var reqMunicipalData = path => new Promise((resolve, reject) => request(path).then(body => {
    var $ = cheerio.load(body);
    var $trList = $(".plist_yqygp").find('tr');
    var data = getDataByTrList($trList);
    var arrRequest = data.map((item, index) => callback => request(item.path).then(body => {
        // console.log(body);
        var $ = cheerio.load(body);
        var $trListofInfo = $('.xinxi').find('tr');

        var commonInfo = {};
        commonInfo.type = "市属";
        commonInfo.code = item.code;
        commonInfo.startTime = $trListofInfo.eq(1).find('td').eq(1).text();
        commonInfo.endTime = $trListofInfo.eq(1).find('td').eq(3).text();
        commonInfo.trade = $trListofInfo.eq(1).find('td').eq(3).text();
        //console.log($trListofInfo.eq(5).find('td').eq(1).text().split(/\s|\n\t\t\t/).filter(i => i !== '')[0].split('：')[1]);
        commonInfo.handlePerson = $trListofInfo.eq(5).find('td').eq(1).text().split(/\s|\n\t\t\t/).filter(i => i !== '')[0].split('：')[1];

        var exchangeByTransferParty = [];
        var $trListofDetail = $('.qingk').find('tr');
        $trListofDetail.each((index, item) => {
            var $tdList = $trListofDetail.eq(index).find('td');

            commonInfo.companyName = $tdList.eq(0).text() === "标的企业名称" ? $tdList.eq(1).text() : commonInfo.companyName;
            commonInfo.companyAddress = $tdList.eq(1).text() === "注册地（住所）" ? $tdList.eq(2).text() : commonInfo.companyAddress;
            commonInfo.legalPerson = $tdList.eq(0).text() === "法定代表人" ? $tdList.eq(1).text() : commonInfo.legalPerson;
            commonInfo.setupDate = $tdList.eq(2).text() === "成立日期" ? $tdList.eq(3).text() : commonInfo.setupDate;

            if ($tdList.eq(1).text() === "转让方名称") {
                exchangeByTransferParty.push({
                    transferParty: $tdList.eq(2).text()
                });
            }

            if ($tdList.eq(0).text() === "国家出资企业或主管部门名称") {
                exchangeByTransferParty[exchangeByTransferParty.length - 1].parentGroup = $tdList.eq(1).text();
            }

            if ($tdList.eq(0).text() === "持有产(股)权比例") {
                exchangeByTransferParty[exchangeByTransferParty.length - 1].stock = $tdList.eq(1).text();
            }

            if ($tdList.eq(2).text() === "拟转让产(股)权比例") {
                exchangeByTransferParty[exchangeByTransferParty.length - 1].transferStock = $tdList.eq(3).text();
            }
        });

        var exchangeProject = [];
        exchangeByTransferParty.forEach((item, index) => {
            var project = exchangeProject.find(project => project.parentGroup === item.parentGroup);
            if (!project) {
                return exchangeProject.push(item);
            }

            project.transferParty += '、' + item.transferParty;
            project.stock = parseFloat(project.stock.split('%')[0]) + parseFloat(item.stock.split("%")[1]) + "%";
            project.transferStock = parseFloat(project.transferStock.split('%')[0]) + parseFloat(item.transferStock.split("%")[1]) + "%";
        });

        exchangeProject.forEach(project => {
            Object.assign(project, commonInfo);
            project.clientName = project.parentGroup;
            var charge = chargeConfig.filter(item => item.group == project.parentGroup)[0];
            project.department = !!charge ? charge.type : '';
            project.maintain = !!charge ? charge.person : '';
        });

        savePage({
            date: item.date,
            exchangeName: contants.exchangeName.bj,
            exchangeType: contants.exchangeType.prePublish,
            fileName: item.name + '.html',
            body: body
        });
        callback(null, exchangeProject);
    }));
    async.parallel(arrRequest, (err, results) => {
        if (err) {
            return reject(err);
        }
        resolve(Array.prototype.concat.apply([], results));
    });
}));

function getDataByTrList($trList) {
    var data = [];
    $trList.each((index, tr) => {
        if (index === 0)
            return;
        var tdList = tr.children.filter(i => i.name === 'td');
        var code = tdList[0].children[0].data;
        var name = tdList[1].children[0].children[0].data;
        var path = tdList[1].children[0].attribs.href;
        var date = tdList[3].children[0].data;

        if (utils.compareDate(new Date(date), new Date(utils.formatDate(new Date()))) < 0) {
            return;
        }

        // console.log(index, code, name, path, date);
        data.push({code, name, path, date});
    });
    return data;
}

module.exports = paths => new Promise((resolve, reject) => {
    async.parallel([
        callback => reqCentralData(paths.centralPath).then(data => callback(null, data)).catch(err => callback(err)),
        callback => reqMunicipalData(paths.municipalPath).then(data => callback(null, data)).catch(err => callback(err))
    ], (err, results) => {
        if (err)
            return reject(err);
        resolve(Array.prototype.concat.apply([], results))
    })
});