/**
 * Created by Piny on 2018/2/5.
 */
const increaseStock = require('../reqtrade/materialobj.bj');

const path = "http://www.cbex.com.cn/article/xmpd/swxt/";
increaseStock(path).then(results => {
    console.log(results);
}).catch(err => {
    console.log(err);
});