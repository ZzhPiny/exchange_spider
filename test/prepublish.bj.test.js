/**
 * Created by Piny on 2018/2/6.
 */
const prePublish = require('./prepublish.bj');

function testPrePublish() {
    prePublish({
        centralPath: "http://www.cbex.com.cn/article/xmpd/gzgpbj/index.shtml?protype=yqgp&categoryName=yqygp",
        municipalPath: "http://www.cbex.com.cn/article/xmpd/gzgp/index_ShiShu.shtml?protype=ssgp&categoryName=ssygp"
    }).then(results => {
        console.log(results);
    }).catch(err => {
        console.log(err);
    });
}

testPrePublish();