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
    $('.xmnr').each((index, tr) => {
        var projectTime = new Date($(tr).last().text());
        if (projectTime.getTime() < new Date(utils.formatDate(presentTime)))
            return;
        var tdList = $(tr).find('td');
        projectList.push({
            code: tdList.eq(0).text(),
            name: tdList.eq(1).text(),
            href: tdList.eq(1).find('a').attr('href'),
            publishTime: tdList.eq(5).text()
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
        // console.log(body)
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
        var increasesData = {};
        var $trList = $('.tTable').find('tr');
        increasesData.pagePath = project.href;
        increasesData.name = $trList.eq(0).find('td').eq(1).text();
        increasesData.code = $trList.eq(0).find('td').eq(3).text();
        increasesData.area = $trList.eq(1).find('td').eq(1).text().replace(/\n|\t|\s/g, '');
        increasesData.type = $trList.eq(1).find('td').eq(3).text();
        increasesData.startTime = $trList.eq(2).find('td').eq(1).text().replace(/\n|\t/g, '');
        increasesData.endTime = $trList.eq(2).find('td').eq(3).text().replace(/\n|\t/g, '');
        increasesData.financing = $trList.eq(3).find('td').eq(1).text().replace(/\n|\t/g, '');
        increasesData.financingToStock = $trList.eq(4).find('td').eq(1).text().replace(/\n|\t/g, '');
        var index = $trList.eq(5).find('td').eq(0).text() === "交易机构" ? 5 : 6;
        increasesData.projectLeader = $trList.eq(index).find('.table_fzr').eq(0).text().split('：')[1];
        increasesData.projectLeaderPhone = $trList.eq(index).find('.table_mob').eq(0).text().split('：')[1];
        increasesData.sectionLeader = $trList.eq(index).find('.table_fzr').eq(1).text().split('：')[1];
        increasesData.sectionLeaderPhone = $trList.eq(index).find('.table_mob').eq(0).text().split('：')[1];

        var $detailTrList = $('.gp_info').find('tr');
        $detailTrList.each((index, tr) => {
            var $td = $(tr).children();
            increasesData.financingParty = $td.eq(0).text() === "名称" ? $td.eq(1).text().replace(/\n|\t/g, '') : (increasesData.financingParty || "");
            increasesData.financingPartyAddress = $td.eq(1).text() === "住所" ? $td.eq(2).text().replace(/\n|\t/g, '') : (increasesData.financingPartyAddress || "");
            increasesData.legalPerson = $td.eq(0).text() === "法定代表人" ? $td.eq(1).text().replace(/\n|\t/g, '') : (increasesData.legalPerson || "");
            increasesData.setupTime = $td.eq(0).text() === "成立日期" ? $td.eq(1).text().replace(/\n|\t/g, '') : (increasesData.setupTime || "");
            increasesData.registeredCapital = $td.eq(0).text() === "注册资本" ? $td.eq(1).text().replace(/\n|\t/g, '') : (increasesData.registeredCapital || "");
            increasesData.parentGroup = $td.eq(0).text() === "国家出资企业或主管部门名称" ? $td.eq(1).text().replace(/\n|\t/g, '') : (increasesData.parentGroup || "");
        });

        increasesData.clientName = increasesData.parentGroup;
        var charge = chargeConfig.find(item => item.group == increasesData.parentGroup);
        increasesData.department = !!charge ? charge.type : '';
        increasesData.maintain = !!charge ? charge.person : '';

        callback(null, increasesData);
    }));
    return projectReqList;
}
