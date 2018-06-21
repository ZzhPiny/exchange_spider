/**
 * Created By Piny
 * 2018.06.17
 *
 * 保存各个行业公司维护人员
 */

module.exports = (sequelize, DataTypes) => {
    const Maintain = sequelize.define('Maintain', {
        id: { // 自增索引id
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        departmentName: { // 维护该企业的部门名称
            type: DataTypes.STRING,
            field: 'department_name'
        },
        personName: { // 维护该企业的人员
            type: DataTypes.STRING,
            field: 'person_name'
        },
        maintainType: { // 维护的企业分类
            type: DataTypes.STRING,
            field: 'maintain_type'
        },
    }, {
        tableName: 'department_maintain'
    });

    return Maintain;
};
