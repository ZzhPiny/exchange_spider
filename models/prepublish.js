/**
 * Created by Piny on 2018/3/6.
 */
module.exports = (sequelize, DataTypes) => {
    const PrePublish = sequelize.define('PrePublish', {
        id: { // 自增索引id
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        startTime: { // 披露开始时间
            type: DataTypes.STRING(14),
            field: 'start_time'
        },
        endTime: { // 披露截止时间
            type: DataTypes.STRING(14),
            field: 'end_time'
        },
        exchange: { // 交易所
            type: DataTypes.STRING,
            field: 'exchange'
        },
        type: { // 项目类型
            type: DataTypes.STRING,
            field: 'type'
        },
        code: { // 项目编号
            type: DataTypes.STRING,
            field: 'code'
        },
        projectName: { // 项目名称
            type: DataTypes.STRING,
            field: 'project_name'
        },
        subProjectName: { // 子项目
            type: DataTypes.STRING,
            field: 'sub_project_name'
        },
        trade: { // 所属行业
            type: DataTypes.STRING,
            field: 'trade'
        },
        transferParty: { // 转让方
            type: DataTypes.STRING,
            field: 'transfer_party'
        },
        ownStock: { // 拥有的股权
            type: DataTypes.STRING,
            field: 'own_stock'
        },
        transferStock: { // 即将转让的股权
            type: DataTypes.STRING,
            field: 'transfer_stock'
        },
        parentGroup: { // 隶属集团
            type: DataTypes.STRING,
            field: 'parent_group'
        },
        clientName: { // 客户名称
            type: DataTypes.STRING,
            field: 'client_name'
        },
        department: { // 维护人员所属部门
            type: DataTypes.STRING,
            field: 'department'
        },
        maintain: { // 维护人员名称
            type: DataTypes.STRING,
            field: 'maintain'
        },
        handlePerson: { // 经办人员名称
            type: DataTypes.STRING,
            field: 'handle_person'
        },
        companyName: {  // 项目涉及公司名称
            type: DataTypes.STRING,
            field: 'company_name'
        },
        companyAddress: { // 公司地址
            type: DataTypes.STRING,
            field: 'company_address'
        },
        legalPerson: { // 公司法人
            type: DataTypes.STRING,
            field: 'legal_person'
        },
        setupDate: { // 公司创建时间
            type: DataTypes.DATE,
            field: 'setup_date'
        },
        pagePath: { // 项目页面路径
            type: DataTypes.STRING,
            field: 'page_path'
        }
    }, {
        tableName: 'beforehand_publish'
    });

    PrePublish.associate = (models) => {};
    return PrePublish;
};