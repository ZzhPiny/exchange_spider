const async = require('async');
const cheerio = require('cheerio');
const request = require('request-promise');
const utils = require('../utils/utils');
const chargeConfig = require('../config/charge.config.json');

module.exports = path => new Promise((resolve, reject) => request(path).then(body => {
    var $ = cheerio.load(body);
    var projectList = listProject($);
    var projectReqList = listProjectReq(projectList);
    async.parallel(projectReqList, (err, results) => {
        if (err)
            reject(err);
        resolve(results);
    });
}).catch(err => {
    reject(err);
}));

function listProject($) {
    var projectList = [];
    var presentTime = new Date();
    // console.log($table.find('tr'));
    $('.height23').each((index, tr) => {
        var projectTime = new Date($(tr).children().eq(4).text());
        if (projectTime.getTime() < new Date(utils.formatDate(presentTime)))
            return;
        var tdList = $(tr).find('td');
        projectList.push({
            code: tdList.eq(0).text(),
            name: tdList.eq(1).text(),
            href: tdList.eq(1).find('a').attr('href'),
            publishTime: tdList.eq(4).text()
        });

    });
    console.log(projectList);
    return projectList;
}

/**
 *
 * @param projectList
 * @returns {*|Array}
 */
function listProjectReq(projectList) {
    var projectReqList = projectList.map(project => callback => request(project.href).then(body => {
        // console.log(body);
        var $ = cheerio.load(body);
        // var increasesData = {
        //     type: "", // 类型 所属行业
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
        var materialData = $('.xinxi').length !== 0 ? getObjOfFirstPage($) : getObjOfSecondPage($);
        materialData.pagePath = project.href;
        callback(null, materialData);
    }));
    return projectReqList;
}

function getObjOfFirstPage($) {
    var materialData = {};
    var $trList = $('.xinxi > tbody > tr');
    materialData.name = $trList.eq(0).find('td').eq(1).text();
    materialData.code = $trList.eq(0).find('td').eq(3).text();
    materialData.transferParty = $trList.eq(1).children().eq(1).text().replace(/\n|\t|\s/g, '');
    materialData.type = $trList.eq(3).children().eq(3).text().replace(/\n|\t|\s/g, '');
    materialData.startTime = $trList.eq(4).find('td').eq(1).text().replace(/\n|\t/g, '');
    materialData.endTime = $trList.eq(4).find('td').eq(3).text().replace(/\n|\t/g, '');
    materialData.financing = parseFloat($trList.eq(3).find('td').eq(1).text().replace(/\n|\t/g, ''));
    // materialData.financingToStock = $trList.eq(4).find('td').eq(1).text().replace(/\n|\t/g, '');
    // var index = $trList.eq(5).find('td').eq(0).text() === "交易机构" ? 5 : 6;
    // materialData.projectLeader = $trList.eq(index).find('.table_fzr').eq(0).text().split('：')[1];
    // materialData.projectLeaderPhone = $trList.eq(index).find('.table_mob').eq(0).text().split('：')[1];
    // materialData.sectionLeader = $trList.eq(index).find('.table_fzr').eq(1).text().split('：')[1];
    // materialData.sectionLeaderPhone = $trList.eq(index).find('.table_mob').eq(0).text().split('：')[1];

    // var $detailTrList = $('.qingk').find('tr');
    // $detailTrList.each((index, tr) => {
    //     var $td = $(tr).children();
    //     materialData.financingParty = $td.eq(0).text() === "名称" ? $td.eq(1).text().replace(/\n|\t/g, '') : (materialData.financingParty || "");
    //     materialData.financingPartyAddress = $td.eq(1).text() === "住所" ? $td.eq(2).text().replace(/\n|\t/g, '') : (materialData.financingPartyAddress || "");
    //     materialData.legalPerson = $td.eq(0).text() === "法定代表人" ? $td.eq(1).text().replace(/\n|\t/g, '') : (materialData.legalPerson || "");
    //     materialData.setupTime = $td.eq(0).text() === "成立日期" ? $td.eq(1).text().replace(/\n|\t/g, '') : (materialData.setupTime || "");
    //     materialData.registeredCapital = $td.eq(0).text() === "注册资本" ? $td.eq(1).text().replace(/\n|\t/g, '') : (materialData.registeredCapital || "");
    //     materialData.parentGroup = $td.eq(0).text() === "国家出资企业或主管部门名称" ? $td.eq(1).text().replace(/\n|\t/g, '') : (materialData.parentGroup || "");
    // });

    // materialData.clientName = materialData.parentGroup;
    var charge = chargeConfig.find(item => item.group == materialData.parentGroup);
    materialData.department = !!charge ? charge.type : '';
    materialData.maintain = !!charge ? charge.person : '';

    return materialData;
}

function getObjOfSecondPage($) {
    var materialData = {};
    var $trList = $('.xm_tab > tbody > tr');
    materialData.name = $trList.eq(3).children().eq(1).text();
    materialData.code = $trList.eq(0).children().eq(1).text();
    materialData.transferParty = $trList.eq(2).children().eq(1).text().replace(/\n|\t|\s/g, '');
    materialData.type = $trList.eq(5).children().eq(1).text().replace(/\n|\t|\s/g, '');
    materialData.startTime = $trList.eq(7).children().eq(1).text().replace(/\n|\t/g, '');
    materialData.endTime = $trList.eq(8).children().eq(1).text().replace(/\n|\t/g, '');
    materialData.financing = parseFloat($trList.eq(5).children().eq(1).text().replace(/\n|\t/g, ''));
    //
    // materialData.name = $trList.eq(0).find('td').eq(1).text();
    // materialData.code = $trList.eq(0).find('td').eq(3).text();
    // materialData.transferParty = $trList.eq(1).children().eq(1).text();
    // // materialData.area = $trList.eq(1).find('td').eq(1).text().replace(/\n|\t|\s/g, '');
    // materialData.type = $trList.eq(3).children().eq(3).text();
    // materialData.startTime = $trList.eq(4).find('td').eq(1).text().replace(/\n|\t/g, '');
    // materialData.endTime = $trList.eq(4).find('td').eq(3).text().replace(/\n|\t/g, '');
    // materialData.financing = $trList.eq(3).find('td').eq(1).text().replace(/\n|\t/g, '');
    // // materialData.financingToStock = $trList.eq(4).find('td').eq(1).text().replace(/\n|\t/g, '');
    // var index = $trList.eq(5).find('td').eq(0).text() === "交易机构" ? 5 : 6;
    // materialData.projectLeader = $trList.eq(index).find('.table_fzr').eq(0).text().split('：')[1];
    // materialData.projectLeaderPhone = $trList.eq(index).find('.table_mob').eq(0).text().split('：')[1];
    // materialData.sectionLeader = $trList.eq(index).find('.table_fzr').eq(1).text().split('：')[1];
    // materialData.sectionLeaderPhone = $trList.eq(index).find('.table_mob').eq(0).text().split('：')[1];
    //
    // var $detailTrList = $('.qingk').find('tr');
    // $detailTrList.each((index, tr) => {
    //     var $td = $(tr).children();
    //     materialData.financingParty = $td.eq(0).text() === "名称" ? $td.eq(1).text().replace(/\n|\t/g, '') : (materialData.financingParty || "");
    //     materialData.financingPartyAddress = $td.eq(1).text() === "住所" ? $td.eq(2).text().replace(/\n|\t/g, '') : (materialData.financingPartyAddress || "");
    //     materialData.legalPerson = $td.eq(0).text() === "法定代表人" ? $td.eq(1).text().replace(/\n|\t/g, '') : (materialData.legalPerson || "");
    //     materialData.setupTime = $td.eq(0).text() === "成立日期" ? $td.eq(1).text().replace(/\n|\t/g, '') : (materialData.setupTime || "");
    //     materialData.registeredCapital = $td.eq(0).text() === "注册资本" ? $td.eq(1).text().replace(/\n|\t/g, '') : (materialData.registeredCapital || "");
    //     materialData.parentGroup = $td.eq(0).text() === "国家出资企业或主管部门名称" ? $td.eq(1).text().replace(/\n|\t/g, '') : (materialData.parentGroup || "");
    // });

    // materialData.clientName = materialData.parentGroup;
    var charge = chargeConfig.find(item => item.group == materialData.parentGroup);
    materialData.department = !!charge ? charge.type : '';
    materialData.maintain = !!charge ? charge.person : '';

    return materialData;
}