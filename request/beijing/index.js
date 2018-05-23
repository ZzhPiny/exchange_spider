const Http = require('../axios');

class PrePublishExchange extends Http{
    constructor() {
        this.url = {
            centerPath: '',
            cityPath: '',
        }
    }

    fetchPrePublishData() {

    }

    _getCenterData() {
        const $centerList = await this.http.get(this.url.centerPath);
        const { total, pageNum } = getPageNum($centerList('.page_yqgp').eq(0));
        // console.log(`总条数: ${total}\n共 ${pageNum} 页`);
        var condition = {
            categoryName: "yqygp",
            protype: "yqgp",
            order: "date1",
            numPerPage: eachPageListNum,
            direction: "down"
        };
        var prePublishUrl = [];
        for (let i = 1; i <= pageNum; i++) {
            condition.curPage = i;
            prePublishUrl.push("http://www.cbex.com.cn/article/xmpd/gzgpbj/index.shtml?" + qs.stringify(condition));
            console.log("http://www.cbex.com.cn/article/xmpd/gzgpbj/index.shtml?" + qs.stringify(condition));
        }
    }

    _getCityData() {

    }
    
    /**
     * getPageNum 根据列表页面标签获取当前总数和页面总数
     * @param $div
     * @returns {{total: number, pageNum: number}}
     */
    getPageNum($div) {
        const eachPageListNum = 15;
        const numReg = /\d+/;
        const total = numReg.exec($div.text())[0];
        const pageNum = Math.ceil(total / eachPageListNum);

        return {
            total,
            pageNum
        }
    }
}

modules.export = BeijingExchange;