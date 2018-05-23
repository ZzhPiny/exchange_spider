/**
 * Created by Piny on 2018/3/6.
 */
const express = require('express');
const router = express.Router();
const path = require('path');
const nodeExcel = require('excel-export');
const models = require('../models');
const utils = require('../utils/utils');
const fs = require('fs');

function tounicode(data)
{
    if (data == '') return '请输入汉字';
    var str ='';
    for (var i = 0; i < data.length; i++)
    {
        str += "\\u" + parseInt(data[i].charCodeAt(0), 10).toString(16);
    }
    return str;
}

router.get('/prepublish', (req, res) => {
    // var prePublishData = result.sort((dataA, dataB) => {
    //     return (new Date(dataA.startTime)).getTime() >= (new Date(dataB.startTime)).getTime();
    // });
    models.PrePublish.findAll().then(result => {
       res.render('index', {prePublishData: result});
    })
});

router.get('/', (req, res) => {
    models.PrePublish.findAll().then(result => {
        // console.log(result.length);
        var conf ={};
        conf.stylesXmlFile = path.resolve('config/styles.xml');
        conf.name = "yupilu";
        conf.cols = [{
            caption: "类型",
            type: 'string',
            beforeCellWrite: function(row, cellData, e){
                return row.type;
            },
        }, {
            caption: "项目编号",
            type: 'string',
            beforeCellWrite: function(row, cellData){
                return row.code;
            },
        }, {
            caption: "隶属集团",
            type: 'string',
            beforeCellWrite: function(row, cellData){
                return row.parentGroup;
            },
        }, {
            caption: "转让方",
            type: 'string',
            beforeCellWrite: function(row, cellData){
                return row.transferParty;
            },
        }, {
            caption: "项目名称",
            type: 'string',
            beforeCellWrite: function(row, cellData){
                return (row.transferParty + row.transferStock);
            },
        }, {
            caption: "挂牌价格（万）",
            type: 'string',
            beforeCellWrite: function(row, cellData){
                return "";
            },
        }, {
            caption: "所属行业",
            type: 'string',
            beforeCellWrite: function(row, cellData){
                return row.trade;
            },
        }, {
            caption: "披露开始",
            // type: 'date',
            type: 'string',
            beforeCellWrite: function(row, cellData){
                return row.startTime;
            },
        }, {
            caption: "披露截止",
            // type: 'date',
            type: 'string',
            beforeCellWrite: function(row, cellData){
                return row.endTime;
            },
        }, {
            caption: "受托机构",
            type: 'string',
            beforeCellWrite: function(row, cellData){
                return "";
            },
        }, {
            caption: "客户名称",
            type: 'string',
            beforeCellWrite: function(row, cellData){
                return row.clientName;
            },
        }, {
            caption: "部门",
            type: 'string',
            beforeCellWrite: function(row, cellData){
                return row.department;
            },
        }, {
            caption: "维护",
            type: 'string',
            beforeCellWrite: function(row, cellData){
                return row.maintain;
            },
        }, {
            caption: "交易所",
            type: 'string',
            beforeCellWrite: function(row, cellData){
                return "北交所";
            },
        }, {
            caption: "经办",
            type: 'string',
            beforeCellWrite: function(row, cellData){
                return row.handlePerson;
            },
        }, {
            caption: "备注",
            type: 'string',
            beforeCellWrite: function(row, cellData){
                return "";
            },
        }];
        conf.rows = result;
        var resultExcel = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        var fileName = utils.formatDate(new Date());
        res.setHeader("Content-Disposition", `attachment; filename=${fileName}.xlsx`);
        res.end(resultExcel, 'binary');
    });
});

module.exports = router;