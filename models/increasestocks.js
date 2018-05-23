/**
 * Created by Piny on 2018/3/7.
 */
module.exports = (sequelize, DataTypes) => {
    var IncreaseStocks = sequelize.define('IncreaseStocks', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        startTime: {
            type: DataTypes.STRING(14),
            field: 'start_time'
        },
        endTime: {
            type: DataTypes.STRING(14),
            field: 'end_time'
        },
        trade: {
            type: DataTypes.STRING,
            field: 'trade'
        },
        transferParty: {
            type: DataTypes.STRING,
            field: 'transfer_party'
        },
        parentGroup: {
            type: DataTypes.STRING,
            field: 'parent_group'
        },
        type: {
            type: DataTypes.STRING,
            field: 'type'
        },
        code: {
            type: DataTypes.STRING,
            field: 'code'
        },
        companyName: {
            type: DataTypes.STRING,
            field: 'company_name'
        },
        companyAddress: {
            type: DataTypes.STRING,
            field: 'company_address'
        },
        legalPerson: {
            type: DataTypes.STRING,
            field: 'legal_person'
        },
        setupDate: {
            type: DataTypes.DATE,
            field: 'setup_date'
        },
        clientName: {
            type: DataTypes.STRING,
            field: 'client_name'
        },
        department: {
            type: DataTypes.STRING,
            field: 'department'
        },
        maintain: {
            type: DataTypes.STRING,
            field: 'maintain'
        },
        handlePerson: {
            type: DataTypes.STRING,
            field: 'handle_person'
        },
        ownStock: {
            type: DataTypes.STRING,
            field: 'own_stock'
        },
        transferStock: {
            type: DataTypes.STRING,
            field: 'transfer_stock'
        },
        pagePath: {
            type: DataTypes.STRING,
            field: 'page_path'
        }
    }, {
        tableName: 'increase_stocks'
    });

    IncreaseStocks.associate = (models) => {};
    return IncreaseStocks;
};