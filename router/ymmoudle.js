const express = require('express');
const yummoudleHandler = require('../router_handler/ymmoudle')
//配置路由模块
const router = express.Router();
//对表单数据 进行验证 npm i @escook/express-joi
const expressJoi = require('@escook/express-joi')
const {
  ymmoudle_add_schema,
  strDate_add_schema,
  checkArr_add_schema,
  lpdata_add_schema,
  hpdata_add_schema,
  qddata_add_schema,
  hpsum_add_schema,
  hpname_add_schema,
  rqname_add_schema,
  checkArrasd_add_schema,
  hd_add_schema,
  hd_up_schema,
  hd_del_schema
} = require('../schema/user')

//验证数据
router.post('/yzsj', expressJoi(hpname_add_schema), yummoudleHandler.postYanzData)
//获取页面模块数据
router.post('/yminfo', expressJoi(ymmoudle_add_schema), yummoudleHandler.postMoudleList)
//处理数据--- 按日期
router.post('/ymdate', expressJoi(strDate_add_schema), yummoudleHandler.postymDataList)
//查询人群
router.post('/ymtitlerq', expressJoi(hpname_add_schema), yummoudleHandler.postNameList)
//查询模块名称
router.post('/ymtitlename', expressJoi(rqname_add_schema), yummoudleHandler.getTitleList)
//查询模块名称
router.post('/ymmorenlist', expressJoi(hpname_add_schema), yummoudleHandler.getMorenList)
//按模块名称查询
router.post('/ymcheck', expressJoi(checkArr_add_schema), yummoudleHandler.postCheckList)
//上传LP数据
router.post('/lpdata', expressJoi(lpdata_add_schema), yummoudleHandler.postLpDateList)
//上传HP数据
router.post('/Hpdata', expressJoi(hpdata_add_schema), yummoudleHandler.postHpDateList)
//上传全店数据
router.post('/qddata', expressJoi(qddata_add_schema), yummoudleHandler.postqdDateList)
//查询hp整体数据
router.post('/hpsum', expressJoi(hpsum_add_schema), yummoudleHandler.postHpSum)
//查询hp名称
router.post('/hpname', expressJoi(hpname_add_schema), yummoudleHandler.posthpListName)
//查询hp页面名称查询
router.post('/hpnamecheck', expressJoi(checkArrasd_add_schema), yummoudleHandler.posthpCheckList)
//查询hp模块名称
router.post('/hpnamechecklist', expressJoi(hpname_add_schema), yummoudleHandler.posthpCheckname)
//查询访客数最高模块
router.post('/fkmklist', expressJoi(checkArrasd_add_schema), yummoudleHandler.postfkmkList)
//查询LP数据
router.post('/lplist', expressJoi(checkArrasd_add_schema), yummoudleHandler.postLPList)
//查询LP名称
router.post('/lpname', expressJoi(hpname_add_schema), yummoudleHandler.getLpName)
//查询LP排行
router.post('/lpph', expressJoi(hpname_add_schema), yummoudleHandler.postLPph)
//查询全店访客数
router.post('/qdfk', expressJoi(hpname_add_schema), yummoudleHandler.postqdFks)
//查询占比折现图
router.post('/zbzxt', expressJoi(qddata_add_schema), yummoudleHandler.postzbzxt)
//查询访客数对比
router.post('/fksdb', expressJoi(hpname_add_schema), yummoudleHandler.postfksdb)
//查询模块
router.get('/symkzf', yummoudleHandler.getsymkzf)
//活动查询
router.get('/hddate', yummoudleHandler.gethdDate)
//新增活动
router.post('/hdadd', expressJoi(hd_add_schema), yummoudleHandler.postAddHdDate)
//修改活动
router.post('/hdup', expressJoi(hd_up_schema), yummoudleHandler.postUpdataHdDate)
//删除活动
router.post('/hddle', expressJoi(hd_del_schema), yummoudleHandler.postDelHdDate)





module.exports = router