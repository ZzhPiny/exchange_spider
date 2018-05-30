const Http = require('./axios');

class Beijing extends Http {
    constructor() {
        super();
        this.url = {
            center: 'http://www.cbex.com.cn/article/xmpd/gzgpbj/index.shtml?protype=yqgp&categoryName=yqygp',
            city: 'http://www.cbex.com.cn/article/xmpd/gzgp/index_ShiShu.shtml?protype=ssgp&categoryName=ssygp',
        }
    }

    async getCurrentDayList(params) {
        const { $: $centerList } = await this.http.get(this.url.center);
        const total = this._getTotal($centerList('.page_yqgp').eq(0));
        if (!total) {
            return [];
        }
        const { $: $centerTotalList } = await this.http.get(this.url.center, {
            curPage: 1,
            numPerPage: total,
        });
        const detailPageList = this._getDataByTrList($centerTotalList('.plist_yqygp').find('tr'));
        const prePublishData = await this.getDetailData(detailPageList);
        return prePublishData; 
    }

    getDetailData(pageList) {
        const arrPageList = Array.isArray(pageList) ? pageList : [pageList];
        const requestList = arrPageList.map((item) => {
            return this.http.get(item.path).then((res) => {
                const information = {};
                return Object.assign(information, this._getInformation(res.$), {
                    path: item.path,
                    page: res.page,
                });
            });
        });
        return Promise.all(requestList);
    }

    /**
     * _getTotal 根据列表页面标签获取当前总数
     * @param $div
     * @returns {{total: number, pageNum: number}}
     */
    _getTotal($div) {
        const numReg = /\d+/;
        const total = numReg.exec($div.text())[0] || 0;

        return total
    }

    /**
     * _getDataByTrList 根据交易列表获得简要信息
     * @param $trList
     * @returns Array [{
     *      code,
     *      name,
     *      path,
     *      date
     *  }]
     */
    _getDataByTrList($trList) {
        const data = [];
        $trList.each((index, tr) => {
            if (index === 0)
                return;
            const tdList = tr.children.filter(i => i.name === 'td');
            const code = tdList[0].children[0].data;
            const name = tdList[1].children[0].children[0].data;
            const path = tdList[1].children[0].attribs.href;
            const date = tdList[3].children[0].data;
            data.push({code, name, path, date});
        });
        return data;
    }
    /**
     * [_getInformation 获取当前页面下的交易数据]
     * @param  {[Object]} $ [cherrio instance]
     * @return {[Array]}   [description]
     */
    _getInformation($) {
        const information = {};
        const commonInfo = this._getCommonInfo($('.xinxi').find('tr'));
        const exchangeInfo = this._getExchangeInfo($('.qingk').find('tr'));
        Object.assign(information, commonInfo, exchangeInfo, {
            exchange: '北交所',
        });
        // console.log(information);
        return information;
    }

    /**
     * _getCommonInfo 获取交易基本信息
     * @param $tr
     * @returns {{}}
     */
    _getCommonInfo($tr) {
        const commonInfo = {};
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
        const exchangeInfo = {};
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
        transferPartyList.map(item => {
            item.projectName = item.transferParty + item.transferStock;
        });
        Object.assign(exchangeInfo, companyInfo, {
            transferPartyList,
        });
        return exchangeInfo;
    }
}

module.exports = new Beijing();