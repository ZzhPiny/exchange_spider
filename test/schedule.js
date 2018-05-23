/**
 * Created by Piny on 2018/2/28.
 */
const schedule = require('node-schedule');

const scheduleTask = () => {
    schedule.scheduleJob('5 * * * * *', () => {
        var today = new Date();
        console.log(today);
        console.log('开始执行爬取任务');
        console.log('The answer to life, the universe, and everything!');
    });
};

module.exports = scheduleTask();