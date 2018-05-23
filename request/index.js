/**
 * Created by Piny on 2018/3/2.
 */
const schedule = require('node-schedule');
const request = require('request-promise');
const cheerio = require('cheerio');
const qs = require('querystring');
const async = require('async');

const models = require('../models');
const siteUrl = require('../config/site.config');

const { getMaintain } = require('../utils/maintain');

const eachPageListNum = 15;

const prePublishExchange = () => {
    // 北交所 央企预披露交易
    console.log('央企预披露地址: ', siteUrl.beijing.centerPrepublish);
    request(siteUrl.beijing.centerPrepublish).then(body => {
        // console.log(body);
        const $ = cheerio.load(body);
        // 首先获取 共有多少数据
        const { total, pageNum } = getPageNum($('.page_yqgp').eq(0));
        var condition = {
            categoryName: 'yqygp',
            protype: 'yqgp',
            order: 'date1',
            numPerPage: eachPageListNum,
            direction: 'down'
        };
        var prePublishUrl = [];
        for (let i = 1; i <= pageNum; i++) {
            condition.curPage = i;
            prePublishUrl.push(`http://www.cbex.com.cn/article/xmpd/gzgpbj/index.shtml?${qs.stringify(condition)}`);
        }
        return Promise.all(prePublishUrl.map(url => request(url)));
    }).then((prePublishPageList) => {
        var prePublishData = Array.prototype.concat.apply([], prePublishPageList.map(pageBody => {
            const $ = cheerio.load(pageBody);
            return getDataByTrList($('.plist_yqygp').find('tr')).filter(item => {
                return new Date(item.date).getTime() >= (new Date().getTime() - 24 * 60 * 60 * 1000);
            });
        }));
        return Promise.all(prePublishData.map(item => request(item.path).then(body => {
            return {
                $: cheerio.load(body),
                path: item.path
            }
        })));
    }).then(infoPageList => {
        infoPageList.forEach(({ $, path }) => {
            var commonInfo = getCommonInfo($('.xinxi').find('tr'));
            commonInfo.type = '央企';
            commonInfo.exchange = '北交所';
            commonInfo.pagePath = path;

            var { transferPartyList, companyInfo } = getExchangeInfo($('.qingk').find('tr'));
            var projectList = mergeTransferPartyByGroup(transferPartyList);

            projectList.forEach(project => {
                Object.assign(project, commonInfo, companyInfo, getMaintain(project.parentGroup));
            });
            saveProject(commonInfo.code, projectList);
        })
    });

    // 北交所 市属预披露交易
    console.log('市属预披露地址,' , siteUrl.beijing.cityPrepublish);
    request(siteUrl.beijing.cityPrepublish).then(body => {
        const $ = cheerio.load(body);

        const { total, pageNum } = getPageNum($('.page_yqygq').eq(0));
        var condition = {
            categoryName: 'ssygp',
            protype: 'ssgp',
            order: 'date1',
            numPerPage: eachPageListNum,
            direction: 'down'
        };
        var prePublishUrl = [];
        for (let i = 1; i <= pageNum; i++ ) {
            condition.curPage = i;
            prePublishUrl.push(`http://www.cbex.com.cn/article/xmpd/gzgp/index_ShiShu.shtml?${qs.stringify(condition)}`);
        }
        return Promise.all(prePublishUrl.map(url => request(url)));
    }).then(prePublishPageList => {
        var prePublishData = Array.prototype.concat.apply([], prePublishPageList.map(pageBody => {
            const $ = cheerio.load(pageBody);
            return getDataByTrList($('.plist_yqygp').find('tr')).filter(item => {
                return new Date(item.date).getTime() >= (new Date().getTime() - 24 * 60 * 60 * 1000);
            });
        }));
        return Promise.all(prePublishData.map(item => request(item.path).then(body => {
            return {
                $: cheerio.load(body),
                path: item.path
            }
        })));
    }).then(infoPageList => {
        infoPageList.forEach(infoPage => {
            const $ = infoPage.$;
            var commonInfo = getCommonInfo($('.xinxi').find('tr'));
            commonInfo.type = "市属";
            commonInfo.exchange = "北交所";
            commonInfo.pagePath = infoPage.path;

            var { transferPartyList, campanyInfo } = getExchangeInfo($('.qingk').find('tr'));
            var projectList = mergeTransferPartyByGroup(transferPartyList);

            projectList.forEach(project => {
                Object.assign(project, commonInfo, campanyInfo, getMaintain(project.parentGroup));
            });

            saveProject(commonInfo.code, projectList);
        })
    });

    /**
     * getPageNum 根据列表页面标签获取当前总数和页面总数
     * @param $div
     * @returns {{total: number, pageNum: number}}
     */
    function getPageNum($div) {
        const eachPageListNum = 15;
        const numReg = /\d+/;
        const total = numReg.exec($div.text())[0];
        const pageNum = Math.ceil(total / eachPageListNum);

        return {
            total,
            pageNum
        }
    }

    /**
     * getCommonInfo 获取交易基本信息
     * @param $tr
     * @returns {{}}
     */
    function getCommonInfo($tr) {
        var commonInfo = {};
        commonInfo.code = $tr.eq(0).find('td').eq(3).text();
        commonInfo.startTime = $tr.eq(1).find('td').eq(1).text();
        commonInfo.endTime = $tr.eq(1).find('td').eq(3).text();
        commonInfo.trade = $tr.eq(2).find('td').eq(3).text();
        commonInfo.handlePerson = $tr.eq(5).find('td').eq(1).text().split(/\s|\n\t\t\t/).filter(i => i !== '')[0].split('：')[1];
        return commonInfo;
    }

    /**
     * getExchangeInfo 获取交易涉及的公司信息以及转让方信息
     * @param $tr
     * @returns {{companyInfo: {}, transferPartyList: {}}}
     */
    function getExchangeInfo($tr) {
        var companyInfo = {};
        var transferPartyList = [];

        $tr.each((index) => {
            var $tdList = $tr.eq(index).find('td');

            companyInfo.companyName = $tdList.eq(0).text() === "标的企业名称" ? $tdList.eq(1).text() : companyInfo.companyName;
            companyInfo.companyAddress = $tdList.eq(1).text() === "注册地（住所）" ? $tdList.eq(2).text() : companyInfo.companyAddress;
            companyInfo.legalPerson = $tdList.eq(0).text() === "法定代表人" ? $tdList.eq(1).text() : companyInfo.legalPerson;
            companyInfo.setupDate = $tdList.eq(2).text() === "成立日期" ? $tdList.eq(3).text() : companyInfo.setupDate;

            if ($tdList.eq(1).text() === "转让方名称") {
                transferPartyList.push({
                    transferParty: $tdList.eq(2).text()
                });
            }
            if ($tdList.eq(0).text() === "国家出资企业或主管部门名称") {
                transferPartyList[transferPartyList.length - 1].parentGroup = $tdList.eq(1).text();
                transferPartyList[transferPartyList.length - 1].clientName = transferPartyList[transferPartyList.length - 1].parentGroup;
            }
            if ($tdList.eq(0).text() === "持有产(股)权比例") {
                transferPartyList[transferPartyList.length - 1].ownStock = $tdList.eq(1).text();
            }
            if ($tdList.eq(2).text() === "拟转让产(股)权比例") {
                transferPartyList[transferPartyList.length - 1].transferStock = $tdList.eq(3).text();
            }
        });
        transferPartyList.map(item => {
            item.projectName = item.transferParty + item.transferStock;
        });
        console.log(transferPartyList);
        return {
            companyInfo,
            transferPartyList
        }
    }

    /**
     * mergeTransferPartyByGroup 根据转让方的所属集团进行合并
     * @param transferPartyList
     * @returns {Array}
     */
    function mergeTransferPartyByGroup(transferPartyList) {
        var projectList = [];
        transferPartyList.forEach((item) => {
            var project = projectList.find(project => project.parentGroup === item.parentGroup);
            if (project === undefined || project === -1) {
                return projectList.push(item);
            }
            console.log(project);
            project.projectName += '、' + item.projectName;
            project.transferParty += '、' + item.transferParty;
            project.ownStock = parseFloat(project.ownStock.split('%')[0]) + parseFloat(item.ownStock.split("%")[0]) + "%";
            project.transferStock = parseFloat(project.transferStock.split('%')[0]) + parseFloat(item.transferStock.split("%")[0]) + "%";
        });
        return projectList;
    }

    /**
     * saveProject 保存数据
     * @param code
     * @param projectList
     */
    function saveProject(code, projectList) {
        models.PrePublish.findOne({
            where: {
                code: code
            }
        }).then((result) => {
            if (!!result)
                return null;
            return models.PrePublish.bulkCreate(projectList);
        }).catch(errors => {
            console.log(errors, projectList);
        });
    }

    /**
     * getDataByTrList 根据交易列表获得简要信息
     * @param $trList
     * @returns Array [{
     *      code,
     *      name,
     *      path,
     *      date
     *  }]
     */
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
            data.push({code, name, path, date});
        });
        return data;
    }
};

function getDataByUrl(urlList, type) {
}



const stocksExchange = () => {
    console.log("央企股权地址: ", siteUrl.beijing.centerPrepublish);
    console.log("市属股权地址: ", siteUrl.beijing.centerStocks);
};

const increasesStocksExchange = () => {
    console.log("增资扩股地址: ", siteUrl.beijing.increasesStock);
};

const materialObjExchange = () => {
    console.log("实物交易地址: ", siteUrl.beijing.materialObject);
};

const start = () => {
    schedule.scheduleJob('5 * * * * *', () => {
        var presentTime = new Date();
        console.log(presentTime);
        prePublishExchange();
        // stocksExchange();
        // increasesStocksExchange();
        // materialObjExchange();
    })
};

module.exports = {
    start
};