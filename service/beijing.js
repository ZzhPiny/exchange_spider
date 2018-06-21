const Http = require('./axios');
const Immutable = require('immutable');
const { List, Map }  = Immutable;

class Beijing extends Http {
    constructor() {
        super();
        this.url = {
            center: 'http://www.cbex.com.cn/article/xmpd/gzgpbj/index.shtml?protype=yqgp&categoryName=yqygp',
            city: 'http://www.cbex.com.cn/article/xmpd/gzgp/index_ShiShu.shtml?protype=ssgp&categoryName=ssygp',
        }
    }

    /**
     * [getCurrentDayList 获取当日数据]
     * @return {[type]}        [description]
     */
    async getCurrentDayList() {
        try {
            const { $: $centerList } = await this.http.get(this.url.center);
            const total = this._getTotal($centerList('.page_yqgp').eq(0));
            if (!total) {
                return List();
            }
            const { $: $centerTotalList } = await this.http.get(this.url.center, {
                curPage: 1,
                numPerPage: total,
            });
            const detailPageList = this._getDataByTrList($centerTotalList('.plist_yqygp').find('tr'));
            const prePublishData = await this.getDetailData(detailPageList);
            return Immutable.fromJS(prePublishData);
        } catch(err) {
            console.log(err);
            return List([]);
        }
    }
    /**
     * [getDetailData 获取详情数据]
     * @param  {[List]} pageList [详情页面列表]
     * @return {[Promise]}       [Promise => List[Map, Map]]
     */
    getDetailData(pageList) {
        const arrPageList = List.isList(pageList) ? pageList : List([pageList]);
        const requestList = arrPageList.map((item) => {
            return this.http.get(item.get('path')).then((res) => {
                return this._getInformation(res.$).map((infomation) => {
                    return Object.assign({}, infomation, {
                        pagePath: item.get('path'),
                        page: res.page,
                        date: item.get('date'),
                        name: item.get('name'),
                    });
                });
                // const information = Map(this._getInformation(res.$))
                //     .set('pagePath', item.get('path'))
                //     .set('page', res.page)
                //     .set('date', item.get('date'))
                //     .set('name', item.get('name'));
                // return information;
            });
        });
        return Promise.all(requestList.toArray()).then((dataList) => {
            const data = Array.prototype.concat.apply([], dataList);
            return data;
        });
    }

    /**
     * _getTotal 根据列表页面标签获取当前总数
     * @param $div
     * @returns {{total: number, pageNum: number}}
     */
    _getTotal($div) {
        const numReg = /\d+/;
        const total = numReg.exec($div.text())[0] || 0;

        return total;
    }

    /**
     * _getDataByTrList 根据交易列表获得简要信息
     * @param $trList
     * @returns List [
     *     Map {
     *         code,
     *         name,
     *         path,
     *         date,
     *     }
     * ]
     */
    _getDataByTrList($trList) {
        let basedata = List();
        $trList.each((index, tr) => {
            if (index === 0)
                return;
            const tdList = tr.children.filter(i => i.name === 'td');
            const baseinfo = Map({
                code: tdList[0].children[0].data,
                name: tdList[1].children[0].children[0].data,
                path: tdList[1].children[0].attribs.href,
                date: tdList[3].children[0].data,
            });
            basedata = basedata.push(baseinfo);
        });
        return basedata;
    }
    
    /**
     * [_getInformation 获取当前页面下的交易数据]
     * @param  {[Object]} $ [cherrio instance]
     * @return {[Array]}   [description]
     */
    _getInformation($) {
        // const information = {};
        const commonInfo = this._getCommonInfo($('.xinxi').find('tr'));
        const exchangeInfo = this._getExchangeInfo($('.qingk').find('tr'));
        const information = exchangeInfo.map((item) => {
            return Object.assign({}, commonInfo, item, {
                exchange: '北交所',
                exchangeType: '预披露',
                type: '央企',
            });
        });
        // Object.assign(information, commonInfo, exchangeInfo, {
        //     exchange: '北交所',
        //     exchangeType: '预披露',
        //     type: '央企',
        // });
        return information;
    }

    /**
     * _getCommonInfo 获取交易基本信息
     * @param $tr
     * @returns {{}}
     */
    _getCommonInfo($tr) {
        const commonInfo = {};
        commonInfo.projectName = $tr.eq(0).find('td').eq(1).text();
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
    /*** 需要优化 ***/
    _getExchangeInfo($tr) {
        const companyInfo = {};
        const transferPartyList = [];

        $tr.each((index) => {
            var $tdList = $tr.eq(index).find('td');

            companyInfo.companyName = $tdList.eq(0).text() === "标的企业名称" ? $tdList.eq(1).text() : companyInfo.companyName;
            companyInfo.companyAddress = $tdList.eq(1).text() === "注册地（住所）" ? $tdList.eq(2).text() : companyInfo.companyAddress;
            companyInfo.legalPerson = $tdList.eq(0).text() === "法定代表人" ? $tdList.eq(1).text() : companyInfo.legalPerson;
            companyInfo.setupDate = $tdList.eq(2).text() === "成立日期" ? $tdList.eq(3).text() : companyInfo.setupDate;

            if ($tdList.eq(1).text() === "转让方名称") {
                transferPartyList.push({
                    transferParty: $tdList.eq(2).text(),
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

        const exchangeInfo = [];
        transferPartyList.forEach(item => {
            item.subProjectName = item.transferParty + item.transferStock;
            exchangeInfo.push(Object.assign(item, companyInfo));
        });
        // Object.assign(exchangeInfo, companyInfo, {
        //     transferPartyList,
        // });
        return exchangeInfo;
    }
}

module.exports = new Beijing();