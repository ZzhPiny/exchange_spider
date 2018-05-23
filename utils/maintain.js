/**
 * Created by Piny on 2018/3/8.
 */

const chargeConfig = require('../config/charge.config.json');


/**
 * 根据集团名称获得维护该集团人员以及所属部门
 * @param groupName
 * @returns {{maintain: string, department: string}}
 */
exports.getMaintain = function getMaintain(groupName) {
    const charge = chargeConfig.find(item => item.group == groupName);
    const department = !!charge ? charge.type : '';
    const maintain = !!charge ? charge.person : '';
    return {
        maintain,
        department
    }
}
