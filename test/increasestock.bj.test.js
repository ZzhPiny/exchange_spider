/**
 * Created by Piny on 2018/2/4.
 */
// import increaseStock from '../reqtrade/increasesstock.bj';
const increaseStock = require('./increasesstock.bj');

const path = "http://www.cbex.com.cn/ztym/zzkgb/indexcsmore.shtml";
increaseStock(path).then(results => {
    console.log(results);
}).catch(err => {
    console.log(err);
});