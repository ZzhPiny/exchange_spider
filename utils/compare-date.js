/**
 * Created by Piny on 2018/1/8.
 */
/**
 * 判断两个日期大小
 * @param {[ dateA ]} 第一个日期
 * @param {[ dateB ]} 第二个日期
 * return -1 / 0 / 1
 */
module.exports = (dateA, dateB) => {
    console.log(dateA.toString());
    console.log(dateB.toString());
    if (dateA.toString() === 'Invalid Date')
        return -1;

    if (dateA.getTime() < dateB.getTime())
        return -1;

    if (dateA.getTime() === dateB.getTime())
        return 0;

    return 1;
};
