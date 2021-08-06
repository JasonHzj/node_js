const path = require('path')
const db = require('../db/index')
const moment = require('moment');
const async = require('async')
var _ = require('lodash');
const {
  number
} = require('@hapi/joi');
const {
  log
} = require('console');


//验证数据
exports.postYanzData = (req, res) => {
  const sql = 'select DISTINCT date from my_db_01.hp_data where date>="' + req.body.timeStar + '" and date<="' + req.body.timeEnd + '"'
  db.query(sql, function (err, results) {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('获取信息失败')
    res.send({
      status: 0,
      message: '查询成功',
      data: results
    })
  })
}

//获取页面模块数据列表
exports.postMoudleList = (req, res) => {
  const yminfo = req.body
  // const inSql = "INSERT INTO ym_modul_data(`clickCnt`,`clickRate`,`clickUv`, `date`, `leOrderAmt`, `leOrderByrCnt`, `leOrderRate`, `lePayAmt`, `lePayBuyerCnt`, `lePayRate`, `moduleEditTitle`, `moduleNameId`) VALUES ?";
  const inSql = 'insert into ym_modul_data set ?'
  // const inSql = 'insert into cs_dome set ?'
  db.query(inSql, {
    name: yminfo.name,
    date: yminfo.date,
    moduleEditTitle: yminfo.moduleEditTitle,
    moduleNameId: yminfo.moduleNameId,
    clickCnt: yminfo.clickCnt,
    clickUv: yminfo.clickUv,
    clickRate: yminfo.clickRate,
    leOrderByrCnt: yminfo.leOrderByrCnt,
    leOrderAmt: yminfo.leOrderAmt,
    leOrderRate: yminfo.leOrderRate,
    lePayBuyerCnt: yminfo.lePayBuyerCnt,
    lePayAmt: yminfo.lePayAmt,
    lePayRate: yminfo.lePayRate
  }, function (err, results) {

    if (err) return res.cc(err)
    if (results.affectedRows === 0) {
      return res.send({
        status: 1,
        message: '上传数据失败，请稍后再试！'
      })
    }
    res.send({
      status: 0,
      message: '上传成功'
    })
  })
}

//处理页面数据-按日期查询
exports.postymDataList = (req, res) => {
  const sql = 'select * from my_db_01.ym_modul_data where date>= ? and date<= ?'
  db.query(sql, [req.body.starDate, req.body.endDate], function (err, results) {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('获取信息失败')
    res.send({
      status: 0,
      message: '查询成功',
      data: results
    })
  })
}

// 查询所有模块人群并去重
exports.postNameList = (req, res) => {
  const sql = 'select DISTINCT name from ym_modul_data where date>="' + req.body.timeStar + '" and date<="' + req.body.timeEnd + '"'
  db.query(sql, function (err, results) {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('获取信息失败')
    res.send({
      status: 0,
      message: '查询成功',
      data: results
    })
  })
}




// 查询所有模块名称并去重
exports.getTitleList = (req, res) => {
  const sql = 'select DISTINCT moduleEditTitle from ym_modul_data where date>="' + req.body.timeStar + '" and date<="' + req.body.timeEnd + '" and name in (?)'
  db.query(sql, [req.body.renqunList], function (err, results) {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('获取信息失败')
    res.send({
      status: 0,
      message: '查询成功',
      data: results
    })
  })
}
//默认查询最近7天 吸顶，kv,优惠券 模块 
exports.getMorenList = (req, res) => {
  const sql = 'SELECT date,clickRate,moduleEditTitle FROM my_db_01.ym_modul_data where DATE_SUB(CURDATE(), INTERVAL 7 DAY) <= date(date) and (moduleEditTitle = "吸顶" or moduleEditTitle = "KV轮播弹窗" or moduleEditTitle = "优惠券") '
  db.query(sql, function (err, results) {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('获取信息失败')
    const item = zheXianTu(results);
    res.send({
      status: 0,
      message: '查询成功',
      data: item
    })
  })


}

//按模块名称查询
exports.postCheckList = (req, res) => {
  const sql = 'SELECT ' + req.body.fieldName + ' FROM my_db_01.ym_modul_data where date>="' + req.body.timeStar + '" and date<="' + req.body.timeEnd + '" and moduleEditTitle in (?) and name in (?)'
  // const sql = 'SELECT ' + req.body.fieldName + ' FROM my_db_01.ym_modul_data where DATE_SUB(CURDATE(), INTERVAL 7 DAY) <= date(date) and moduleEditTitle in (?)'
  db.query(sql, [req.body.checkArr, req.body.renqunList], function (err, results) {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('获取信息失败')
    const item = zheXianTu(results, req.body.type, req.body.titleName, req.body.uclickName, req.body.checkArr, req.body.renqunList);
    res.send({
      status: 0,
      message: '查询成功',
      data: item
    })
  })

}

//添加LP数据
exports.postLpDateList = (req, res) => {
  const sql = 'insert into my_db_01.lp_data (name, date, pv, uv, clickCnt, clickUv, clickRate, bounceRate, avgStayTime, leOrderAmt, leOrderBuyerCnt, leOrderRate, lePayAmt, lePayBuyerCnt, lePayRate) VALUES ?'
  var lpsumData = chuLIsuju(req.body.lpsumData)
  db.query(sql, [lpsumData], function (err, results) {
    if (err) return res.cc(err)
    if (results.affectedRows === 0) {
      return res.send({
        status: 1,
        message: '上传数据失败，请稍后再试！'
      })
    }
    res.send({
      status: 0,
      message: '上传成功'
    })
  })
}

//添加HP数据
exports.postHpDateList = (req, res) => {
  const sql = 'insert into my_db_01.hp_data (name, date, pv, uv, clickCnt, clickUv, clickRate, bounceRate, avgStayTime, leOrderAmt, leOrderBuyerCnt, leOrderRate, lePayAmt, lePayBuyerCnt, lePayRate) VALUES ?'
  var hpsumData = chuLIsuju(req.body.hpsumData)
  db.query(sql, [hpsumData], function (err, results) {
    if (err) return res.cc(err)
    if (results.affectedRows === 0) {
      return res.send({
        status: 1,
        message: '上传数据失败，请稍后再试！'
      })
    }
    res.send({
      status: 0,
      message: '上传成功'
    })
  })
}

//添加qd数据
exports.postqdDateList = (req, res) => {
  const sql = 'insert into my_db_01.qd_data (name, date, uv, lePayAmt) VALUES ?'
  var qdsumData = []
  req.body.qdsumData.forEach(resas => {
    const item = [
      resas.name,
      resas.date,
      resas.uv,
      resas.lePayAmt
    ]
    qdsumData.push(item)
  });
  db.query(sql, [qdsumData], function (err, results) {
    if (err) return res.cc(err)
    if (results.affectedRows === 0) {
      return res.send({
        status: 1,
        message: '上传数据失败，请稍后再试！'
      })
    }
    res.send({
      status: 0,
      message: '上传成功'
    })
  })
}

//hp总体访客数
exports.postHpSum = (req, res) => {
  const sql = 'select sum(pv) as pv , sum(uv) as uv , sum(clickCnt) as clickCnt , sum(clickUv) as clickUv , date from my_db_01.hp_data where date>="' + req.body.timeStar + '" and date<="' + req.body.timeEnd + '" GROUP BY date'
  db.query(sql, function (err, results) {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('获取信息失败')
    const item = zxtOrszt(results, req.body.type, req.body.titleName, req.body.uclickName, req.body.checkArr);
    var dqData = fangKs(results) //正访客数
    var timeSArr = []
    timeSArr = timeSArr.concat(getdiffdate(req.body.timeStar, req.body.timeEnd))
    var timeSend = myGetDay(timeSArr[0], timeSArr.length)
    var timeEend = myGetDay(timeSArr[timeSArr.length - 1], timeSArr.length)
    //查询环比前30天数据
    const uisql = 'select sum(pv) as pv , sum(uv) as uv , sum(clickCnt) as clickCnt , sum(clickUv) as clickUv , date from my_db_01.hp_data where date>="' + timeSend + '" and date<="' + timeEend + '" GROUP BY date'
    db.query(uisql, function (err, results) {
      if (err) return res.cc(err)
      if (results.length === 0) return res.cc('获取信息失败')
      var zhData = fangKs(results) //反访客数
      const dbitems = {
        pv: (dqData.pv - zhData.pv) / zhData.pv,
        uv: (dqData.uv - zhData.uv) / zhData.uv,
        clickCnt: (dqData.clickCnt - zhData.clickCnt) / zhData.clickCnt,
        clickUv: (dqData.clickUv - zhData.clickUv) / zhData.clickUv,
        clickRate: ((dqData.clickUv / dqData.uv) - (zhData.clickUv / zhData.uv)) / (dqData.clickUv / dqData.uv)
      }
      res.send({
        status: 0,
        message: '查询成功',
        data: item,
        dbdata: dbitems,
        dqData: dqData,
        time: timeSArr.length
      })
    })

  })


}


// 查询hp名称并去重
exports.posthpListName = (req, res) => {
  const sql = 'select DISTINCT name from my_db_01.hp_data where date>="' + req.body.timeStar + '" and date<="' + req.body.timeEnd + '"'
  db.query(sql, function (err, results) {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('获取信息失败')
    res.send({
      status: 0,
      message: '查询成功',
      data: results
    })
  })
}


//hp模块名称查询
exports.posthpCheckList = (req, res) => {
  const sql = 'SELECT ' + req.body.fieldName + ' FROM my_db_01.hp_data where date>="' + req.body.timeStar + '" and date<="' + req.body.timeEnd + '" and name in (?)'
  db.query(sql, [req.body.checkArr], function (err, results) {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('获取信息失败')
    const item = sySzt(results, req.body.type, req.body.titleName, req.body.uclickName, req.body.checkArr);
    res.send({
      status: 0,
      message: '查询成功',
      data: item
    })
  })
}

//查询hp模块名称
exports.posthpCheckname = (req, res) => {
  const sql = 'SELECT DISTINCT name FROM my_db_01.hp_data where date>="' + req.body.timeStar + '" and date<="' + req.body.timeEnd + '"'
  db.query(sql, [req.body.checkArr], function (err, results) {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('获取信息失败')
    res.send({
      status: 0,
      message: '查询成功',
      data: results
    })
  })
}



//本周访客数最大值
exports.postfkmkList = (req, res) => {
  const sql = 'select * from (SELECT date , sum(uv) as uv FROM my_db_01.hp_data where date>="' + req.body.timeStar + '" and date<="' + req.body.timeEnd + '" GROUP BY date) as a order by uv desc limit 1'
  db.query(sql, function (err, results) {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('获取信息失败')
    var fkdata = moment(results[0].date).format('YYYY-MM-DD')
    var fkuv = results[0].uv
    const mksql = 'SELECT ' + req.body.fieldName + ' FROM my_db_01.ym_modul_data where date="' + fkdata + '" and name in (?)'
    db.query(mksql, [req.body.checkArr], function (err, results) {
      if (err) return res.cc(err)
      if (results.length === 0) return res.cc('获取信息失败')
      const item = sySzt(results, req.body.type, req.body.titleName, req.body.uclickName, req.body.checkArr);
      res.send({
        status: 0,
        message: '查询成功',
        data: item,
        fkuv: fkuv,
        list: results
      })
    })
  })
}


// 查询所最近LP名并去重
exports.getLpName = (req, res) => {
  const sql = 'select DISTINCT name from my_db_01.lp_data where date>="' + req.body.timeStar + '" and date<="' + req.body.timeEnd + '" and clickCnt >=10'
  db.query(sql, function (err, results) {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('获取信息失败')
    res.send({
      status: 0,
      message: '查询成功',
      data: results
    })
  })
}


//LP查询
exports.postLPList = (req, res) => {
  const sql = 'SELECT ' + req.body.fieldName + ' FROM my_db_01.lp_data where date>="' + req.body.timeStar + '" and date<="' + req.body.timeEnd + '" and clickCnt >=10'
  db.query(sql, [req.body.checkArr], function (err, results) {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('获取信息失败')
    const item = lpzheXianTu(results, req.body.type, req.body.titleName, req.body.uclickName, req.body.checkArr);
    res.send({
      status: 0,
      message: '查询成功',
      data: item
    })
  })

}


//LP排行查询
exports.postLPph = (req, res) => {
  const sql = 'select * from (SELECT name,sum(clickCnt) as clickCnt FROM my_db_01.lp_data where date>="' + req.body.timeStar + '" and date<="' + req.body.timeEnd + '"  GROUP BY name) as a order by clickCnt desc limit 6;'
  db.query(sql, function (err, results) {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('获取信息失败')
    var lpName = [];
    results.forEach(item => {
      lpName.push(item.name)
    })
    const nsql = 'SELECT date,name,uv,clickRate,bounceRate,leOrderRate FROM my_db_01.lp_data where date>="' + req.body.timeStar + '" and date<="' + req.body.timeEnd + '" and name in (?) order by field (name,?)'
    db.query(nsql, [lpName, lpName], function (err, results) {
      if (err) return res.cc(err)
      if (results.length === 0) return res.cc('获取信息失败')
      const item = lpph(results, req.body.timeStar, req.body.timeEnd)
      res.send({
        status: 0,
        message: '查询成功',
        data: item,
      })
    })

  })

}



//welcome 全店访客数
exports.postqdFks = (req, res) => {
  const sql = 'SELECT sum(uv) as uv ,sum(lePayAmt) as lePayAmt FROM my_db_01.qd_data where date>="' + req.body.timeStar + '" and date<="' + req.body.timeEnd + '"'
  db.query(sql, function (err, results) {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('获取信息失败')
    var dqData = results[0] //正访客数
    var timeSArr = []
    timeSArr = timeSArr.concat(getdiffdate(req.body.timeStar, req.body.timeEnd))
    var timeSend = myGetDay(timeSArr[0], timeSArr.length)
    var timeEend = myGetDay(timeSArr[timeSArr.length - 1], timeSArr.length)
    //首页访客数
    const syfksql = 'SELECT sum(uv) as uv ,sum(lePayAmt) as lePayAmt FROM my_db_01.hp_data where date>="' + req.body.timeStar + '" and date<="' + req.body.timeEnd + '"'
    db.query(syfksql, function (err, results) {
      if (err) return res.cc(err)
      if (results.length === 0) return res.cc('获取信息失败')
      var syfks = results[0] //首页正访客数
      const fjjezb = {
        fkzb: syfks.uv / dqData.uv, //访客占比
        jezb: syfks.lePayAmt / dqData.lePayAmt //支付金额占比
      }
      //全店反访客数
      const sqlser = 'SELECT sum(uv) as uv ,sum(lePayAmt) as lePayAmt FROM my_db_01.qd_data where date>="' + timeSend + '" and date<="' + timeEend + '"'
      db.query(sqlser, function (err, results) {
        if (err) return res.cc(err)
        if (results.length === 0) return res.cc('获取信息失败')
        var zhData = results[0] //反访客数
        const dbitems = {
          uv: (dqData.uv - zhData.uv) / zhData.uv,
          lePayAmt: (dqData.lePayAmt - zhData.lePayAmt) / zhData.lePayAmt
        }
        //首页访客数
        const syfksqlser = 'SELECT sum(uv) as uv ,sum(lePayAmt) as lePayAmt FROM my_db_01.hp_data where date>="' + timeSend + '" and date<="' + timeEend + '"'
        db.query(syfksqlser, function (err, results) {
          if (err) return res.cc(err)
          if (results.length === 0) return res.cc('获取信息失败')
          var zbData = results[0] //反首页访客数
          const zbzf = {
            zbuv: (zbData.uv / zhData.uv) - fjjezb.fkzb, //占比涨幅
            zblePayAmt: (zbData.lePayAmt / zhData.lePayAmt) - fjjezb.jezb,
            fk: zbData.uv / zhData.uv,
            je: zbData.lePayAmt / zhData.lePayAmt

          }

          res.send({
            status: 0,
            message: '查询成功',
            data: dqData, //全店访客
            tbdata: dbitems, // 环比
            syfks: syfks, //首页访客
            fjjezb: fjjezb, // 首页访客占比
            zbzf: zbzf, //占比涨幅
            time: timeSArr.length //天数
          })

        })
      })
    })

  })
}



//占比折线图
exports.postzbzxt = (req, res) => {
  var actions = [];
  var uvAs = []
  var lePayAmtAs = []
  var weekS = [] //周数组
  var loglenght = req.body.qdsumData
  var callback = function () {};

  for (var a = 0; a < loglenght.length; a++) {
    //star
    var vs = a + 1
    weekS.push("w" + vs)
    const sql = 'SELECT sum(uv) as uv ,sum(lePayAmt) as lePayAmt FROM my_db_01.qd_data where date>="' + loglenght[a].start + '" and date<="' + loglenght[a].end + '"'
    const syfksql = 'SELECT sum(uv) as uv ,sum(lePayAmt) as lePayAmt FROM my_db_01.hp_data where date>="' + loglenght[a].start + '" and date<="' + loglenght[a].end + '"'
    db.query(sql, function (err, results) {
      if (err) return res.cc(err)
      if (results.length === 0) return res.cc('获取信息失败')
      var dqData = results[0] //正访客数

      //首页访客数
      db.query(syfksql, function (err, results) {
        if (err) return res.cc(err)
        if (results.length === 0) return res.cc('获取信息失败')
        var syfks = results[0] //首页正访客数
        var fkzb = (syfks.uv / dqData.uv) * 100 //访客占比
        var jezb = (syfks.lePayAmt / dqData.lePayAmt) * 100 //支付金额占比
        uvAs.push(parseFloat(fkzb.toFixed(2)))
        lePayAmtAs.push(parseFloat(jezb.toFixed(2)))



      })
    })

    //end
  }

  setTimeout(() => {
    res.send({
      status: 0,
      message: '查询成功',
      data: {
        xList: weekS, //首页访客
        checkName: ["访客占比", "引导支付金额占比"],
        datalist: [{
          name: "访客占比",
          type: "line",
          data: uvAs,
          markPoint: {
            data: [{
              type: 'max',
              name: '最大值'
            }]
          },
          smooth: true
        }, {
          name: "引导支付金额占比",
          type: "line",
          data: lePayAmtAs,
          markPoint: {
            data: [{
              type: 'max',
              name: '最大值'
            }]
          },
          smooth: true
        }]
      }

    })
  }, 100)


}

//首页访客和全店访客对比
exports.postfksdb = (req, res) => {
  var date = [] // 日期
  var qduv = [] //全店访客数
  var syuv = [] //全店访客数
  const sql = 'SELECT date, sum(uv) as uv FROM my_db_01.qd_data where date>="' + req.body.timeStar + '" and date<="' + req.body.timeEnd + '" GROUP BY date'
  db.query(sql, function (err, results) {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('获取信息失败')

    results.forEach(resdate => {
      qduv.push(Number(resdate.uv))
      date.push(moment(resdate.date).format('MM/DD'))
    })

    const sysql = 'SELECT date, sum(uv) as uv FROM my_db_01.hp_data where date>="' + req.body.timeStar + '" and date<="' + req.body.timeEnd + '" GROUP BY date'
    db.query(sysql, function (err, results) {
      if (err) return res.cc(err)
      if (results.length === 0) return res.cc('获取信息失败')
      results.forEach(resdate => {
        syuv.push(Number(resdate.uv))
      })
      const item = {
        datalist: [{
          name: '全店访客数',
          type: 'bar',
          stack: 'one',
          data: qduv
        }, {
          name: '首页访客数',
          type: 'bar',
          stack: 'one',
          data: syuv
        }],
        xList: date,
        checkName: ['全店访客数', '首页访客数']
      }
      res.send({
        status: 0,
        message: '查询成功',
        data: item
      })


    })

  })

}

//模块涨幅
exports.getsymkzf = (req, res) => {
  var mkname = []
  var dataListr = []
  const end = new Date()
  var newDate = moment(end.setTime(end.getTime() - 3600 * 1000 * 24)).format('YYYY-MM-DD')
  var newDateEnd = moment(end.setTime(end.getTime() - 3600 * 1000 * 24 * 1)).format('YYYY-MM-DD')
  const sql = 'SELECT distinct moduleEditTitle FROM my_db_01.ym_modul_data where date="' + newDateEnd + '"'
  const dqsql = 'SELECT date, name, moduleEditTitle,clickCnt,clickUv,clickRate FROM my_db_01.ym_modul_data where date="' + newDate + '";'
  const endsql = 'SELECT date, name, moduleEditTitle,clickCnt,clickUv,clickRate FROM my_db_01.ym_modul_data where date="' + newDateEnd + '";'
  db.query(sql, function (err, results) {

    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('获取信息失败')
    results.forEach(item => {
      mkname.push(item.moduleEditTitle)
    })

    db.query(dqsql, function (err, results) {
      if (err) return res.cc(err)
      if (results.length === 0) return res.cc('获取信息失败')
      var dqresdata = results

      db.query(endsql, function (err, results) {

        if (err) return res.cc(err)
        if (results.length === 0) return res.cc('获取信息失败')
        var endData = results

        for (var b = 0; b < dqresdata.length; b++) {
          for (var c = 0; c < endData.length; c++) {
            if (dqresdata[b].name == endData[c].name) {
              if (dqresdata[b].moduleEditTitle == endData[c].moduleEditTitle) {
                const item = {
                  name: dqresdata[b].name,
                  moduleEditTitle: dqresdata[b].moduleEditTitle,
                  clickCnt: dqresdata[b].clickCnt,
                  clickUv: dqresdata[b].clickUv,
                  clickRate: dqresdata[b].clickRate,
                  // clickRateZF: (dqresdata[b].clickRate - endData[c].clickRate) / endData[c].clickRate,
                  clickRateZF: dqresdata[b].clickRate - endData[c].clickRate,
                }
                dataListr.push(item);
                continue
              }

            }
          }

          if (mkname.includes(dqresdata[b].moduleEditTitle) == false) {
            const item = {
              name: dqresdata[b].name,
              moduleEditTitle: dqresdata[b].moduleEditTitle,
              clickCnt: dqresdata[b].clickCnt,
              clickUv: dqresdata[b].clickUv,
              clickRate: dqresdata[b].clickRate,
              clickRateZF: 0,
            }
            dataListr.push(item);
          }
        }


        res.send({
          status: 0,
          message: '查询成功',
          data: dataListr
        })



      })




    })


  })

}



//日期活动查询
exports.gethdDate = (req, res) => {
  const sql = 'SELECT * FROM start_activity'
  db.query(sql, function (err, results) {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('获取信息失败')
    var item = rqment(results)
  res.send({
    status: 0,
    message: '查询成功',
    data: results
  })

  })

}

//新增活动
exports.postAddHdDate = (req, res) => {
  const inSql = 'insert into start_activity set ?'
  db.query(inSql, {
        title: req.body.title,
        start: req.body.start,
        end: req.body.end,
        className: req.body.className
      }, function (err, results) {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('新增数据失败')
    res.send({
      status: 0,
      message: '活动添加成功',
    })

  })

}

//修改活动
exports.postUpdataHdDate = (req, res) => {
  const sql = 'update start_activity set ? where id=?'
  db.query(sql, [req.body, req.body.id], function (err, results) {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('修改数据失败')
    res.send({
      status: 0,
      message: '修改成功',
    })

  })

}

//删除活动
exports.postDelHdDate = (req, res) => {
  const sql = 'DELETE FROM start_activity where id=?'
  db.query(sql, req.body.id, function (err, results) {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('删除数据失败')
    res.send({
      status: 0,
      message: '删除成功',
    })

  })

}

// eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
//    eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
//       eeeeeeeeeeeeeeeeeeeeeeeeeeeeeee

//格式化日期
function rqment(results) {
  var data = []
  results.forEach(item => {
    const resul = {
      title: item.name,
      start: moment(item.start_date).format('YYYY-MM-DD'),
      end: moment(item.end_date).format('YYYY-MM-DD'),
      className: item.grades,
      id: item.id
    }
    data.push(resul)
  })
  return data
}

//活动
function hdDate(year, name, results) {
  var dataStar = []
  var nameS = []
  var dataend = [] //汇总数组
  for (var a = 0; a < year.length; a++) {
    for (var b = 0; b < name.length; b++) {
      for (var c = 0; c < results.length; c++) {
        if (year[a].year == results[c].year) {
        
          if (name[b].name == results[c].name) { 
              const itemSa = {
                time: moment(results[c].date).format('YYYY-MM-DD'),
                name: results[c].name
              }
             dataStar.push(itemSa)
            //  nameS.push(results[c].name)
          }
            
         

        }        
      
      }
      //添加
      var dateS = []
      var nameSam = []
      dataStar.forEach(resus =>{
        dateS.push(resus.time)
        nameSam.push(resus.name)
      })
       const item = {
         start: dateS[0],
         end: dateS[dateS.length - 1],
         title: nameSam[0]
       }
      if (JSON.stringify(item) !== "{}"){
       dataend.push(item)
      }
      
      dataStar = []
      dateS = []
      nameSam = []
      // nameS = []
    }
  }
  return dataend
}



//lp排行
function lpph(results, timeStar, timeEnd) {
  const times = getdiffdate(timeStar, timeEnd)
  var rqDate = [] //日期数组
  var lastName = [] //模块名称
  var datalists = [] //数据模块
  var itemData = []
  times.forEach(timesa => {
    rqDate.push(moment(timesa).format('MM/DD'))
  })
  results.forEach(itemList => {
    lastName.push(itemList.name)
  });

  const uniqHolderArr = _.uniqWith(rqDate, _.isEqual); //日期数组
  const uniqLastNameArr = _.uniqWith(lastName, _.isEqual); //模块名称

  for (var a = 0; a < uniqLastNameArr.length; a++) {
    for (var b = 0; b < uniqHolderArr.length; b++) {
      for (var c = 0; c < results.length; c++) {
        if (results[c].name == uniqLastNameArr[a]) {
          if (moment(results[c].date).format('MM/DD') == uniqHolderArr[b]) {
            const itemw = {
              name: results[c].name,
              date: moment(results[c].date).format('MM/DD'),
              uv: results[c].uv,
              clickRate: results[c].clickRate,
              bounceRate: results[c].bounceRate,
              leOrderRate: results[c].leOrderRate
            }
            itemData.push(itemw)
          }
        }
      }
    }
    const itemName = {
      name: uniqLastNameArr[a],
      children: itemData
    }
    datalists.push(itemName)
    itemData = []
  }

  const item = {
    date: uniqHolderArr,
    lastName: uniqLastNameArr,
    dataList: datalists
  }
  return item
}



//lp折线图
function lpzheXianTu(results, type, titleName, uclickName, checkArr) {
  var rqDate = [] //日期数组
  var lastName = [] //模块名称
  var datalists = [] //数据模块
  var clickRateData = [] //点击率
  results.forEach(itemList => {
    rqDate.push(moment(itemList.date).format('MM/DD'))
    lastName.push(itemList.moduleEditTitle)
  });
  const uniqHolderArr = _.uniqWith(rqDate, _.isEqual); //日期数组
  // const uniqLastNameArr = _.uniqWith(lastName, _.isEqual);//模块名称

  if (type == 'line') {
    for (var a = 0; a < checkArr.length; a++) {
      for (var c = 0; c < uniqHolderArr.length; c++) {
        for (var b = 0; b < results.length; b++) {
          if (checkArr[a] == results[b].name) { // 吸顶 = 吸顶，kv,优惠券
            if (uniqHolderArr[c] == moment(results[b].date).format('MM/DD')) {
              if (uclickName == 'clickCnt') {
                clickRateData.push(results[b].clickCnt)
              }
              break;
            }

          }

        }
        if (clickRateData.length == c) {
          clickRateData.push(0)
        }
      }
      if (checkArr[a] == "点击次数") {
        type = "bar"
      } else {
        type = "line"
      }
      const itemS = {
        name: checkArr[a],
        type: type,
        data: clickRateData,
        markPoint: {
          data: [{
            type: 'max',
            name: '最大值'
          }]
        },
        smooth: true
      }
      datalists.push(itemS)
      clickRateData = []
    }

    const item = {
      titleName: titleName,
      xList: uniqHolderArr,
      checkName: checkArr,
      datalist: datalists
    }
    return item
  }

}



//树状图
function sySzt(results, type, titleName, uclickName, checkArr) {
  var rqDate = [] //日期数组
  var lastName = [] //模块名称
  var lastNameTwo = [] //模块名称
  var datalists = [] //数据模块
  var clickRateData = [] //点击率
  results.forEach(itemList => {
    rqDate.push(moment(itemList.date).format('MM/DD'))
    lastNameTwo.push(itemList.moduleEditTitle)
  });
  const uniqHolderArr = _.uniqWith(rqDate, _.isEqual); //日期数组
  const uniqLastNameArr = _.uniqWith(lastNameTwo, _.isEqual); //模块名称

  if (type == 'bar') {
    for (var a = 0; a < checkArr.length; a++) {
      for (var c = 0; c < uniqHolderArr.length; c++) {
        for (var b = 0; b < results.length; b++) {
          if (checkArr[a] == results[b].name) { // 吸顶 = 吸顶，kv,优惠券
            if (uniqHolderArr[c] == moment(results[b].date).format('MM/DD')) {
              if (uclickName == 'clickRate') {
                var num = results[b].clickRate * 100
                clickRateData.push(parseFloat(num.toFixed(2)))
              } else if (uclickName == 'clickCnt') {
                clickRateData.push(results[b].clickCnt)
              } else if (uclickName == 'leOrderRate') {
                var num = results[b].leOrderRate * 100
                clickRateData.push(parseFloat(num.toFixed(2)))
              } else if (uclickName == 'avgStayTime') {
                var num = results[b].avgStayTime
                clickRateData.push(parseFloat(num.toFixed(2)))
              }
              break;
            }

          }

        }
        if (clickRateData.length == c) {
          clickRateData.push(0)
        }
      }
      if (titleName == "平均停留时长") {
        type = "bar"
      } else {
        type = "line"
      }
      const itemS = {
        name: checkArr[a],
        type: type,
        data: clickRateData,
        markPoint: {
          data: [{
            type: 'max',
            name: '最大值'
          }]
        },
        smooth: true
      }
      datalists.push(itemS)
      clickRateData = []
    }

    const item = {
      titleName: titleName,
      xList: uniqHolderArr,
      checkName: checkArr,
      datalist: datalists
    }
    return item
  } else if (type == 'clickCntOrPv') {
    const sjl = ["点击次数", "浏览量"]

    for (var a = 0; a < checkArr.length; a++) {
      for (var d = 0; d < sjl.length; d++) {
        for (var c = 0; c < uniqHolderArr.length; c++) {
          for (var b = 0; b < results.length; b++) {
            if (results[b].name == checkArr[a]) {
              if (sjl[d] == "点击次数") { // 吸顶 = 吸顶，kv,优惠券
                if (uniqHolderArr[c] == moment(results[b].date).format('MM/DD')) {
                  clickRateData.push(results[b].clickCnt)
                  break;
                }

              } else if (sjl[d] == "浏览量") { // 吸顶 = 吸顶，kv,优惠券
                if (uniqHolderArr[c] == moment(results[b].date).format('MM/DD')) {
                  clickRateData.push(results[b].pv)
                  break;
                }

              }
            }
          }

          if (clickRateData.length == c) {
            clickRateData.push(0)
          }
        }


        if (sjl[d] == "点击次数") {
          type = "bar",
            yAxisIndex = 0
        } else {
          type = "line",
            yAxisIndex = 1
        }
        const itemS = {
          name: checkArr[a] + "_" + sjl[d],
          type: type,
          data: clickRateData,
          yAxisIndex: yAxisIndex,
          markPoint: {
            data: [{
              type: 'max',
              name: '最大值'
            }]
          },
          smooth: true
        }
        lastName.push(checkArr[a] + "_" + sjl[d])
        datalists.push(itemS)
        clickRateData = []
      }

    }

    const item = {
      titleName: titleName,
      xList: uniqHolderArr,
      checkName: lastName,
      datalist: datalists
    }
    return item
  } else if (type == 'line') {
    for (var a = 0; a < checkArr.length; a++) {
      for (var c = 0; c < uniqHolderArr.length; c++) {
        for (var b = 0; b < results.length; b++) {
          if (checkArr[a] == results[b].name) { // 吸顶 = 吸顶，kv,优惠券
            if (uniqHolderArr[c] == moment(results[b].date).format('MM/DD')) {
              if (uclickName == 'clickRate') {
                var num = results[b].clickRate * 100
                clickRateData.push(parseFloat(num.toFixed(2)))
              } else if (uclickName == 'clickCnt') {
                clickRateData.push(results[b].clickCnt)
              } else if (uclickName == 'leOrderRate') {
                var num = results[b].leOrderRate * 100
                clickRateData.push(parseFloat(num.toFixed(2)))
              } else if (uclickName == 'avgStayTime') {
                var num = results[b].avgStayTime
                clickRateData.push(parseFloat(num.toFixed(2)))
              }
              break;
            }

          }

        }
        if (clickRateData.length == c) {
          clickRateData.push(0)
        }
      }
      if (titleName == "平均停留时长") {
        type = "bar"
      } else {
        type = "line"
      }
      const itemS = {
        name: checkArr[a],
        type: type,
        data: clickRateData,
        markPoint: {
          data: [{
            type: 'max',
            name: '最大值'
          }]
        },
        smooth: true
      }
      datalists.push(itemS)
      clickRateData = []
    }

    const item = {
      titleName: titleName,
      xList: uniqHolderArr,
      checkName: checkArr,
      datalist: datalists
    }
    return item
  } else if (type == 'mk') {
    for (var a = 0; a < checkArr.length; a++) {
      for (var c = 0; c < uniqLastNameArr.length; c++) {
        for (var b = 0; b < results.length; b++) {
          if (checkArr[a] == results[b].name) { // 吸顶 = 吸顶，kv,优惠券
            if (uniqLastNameArr[c] == results[b].moduleEditTitle) {
              if (uclickName == 'clickRate') {
                var num = results[b].clickRate * 100
                clickRateData.push(parseFloat(num.toFixed(2)))
              } else if (uclickName == 'clickCnt') {
                clickRateData.push(results[b].clickCnt)
              } else if (uclickName == 'leOrderRate') {
                var num = results[b].leOrderRate * 100
                clickRateData.push(parseFloat(num.toFixed(2)))
              } else if (uclickName == 'avgStayTime') {
                var num = results[b].avgStayTime
                clickRateData.push(parseFloat(num.toFixed(2)))
              }
              break;
            }

          }

        }
        if (clickRateData.length == c) {
          clickRateData.push(0)
        }
      }
      if (titleName == "平均停留时长") {
        type = "bar"
      } else {
        type = "line"
      }
      const itemS = {
        name: checkArr[a],
        type: type,
        data: clickRateData,
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          color: "#666666"
        },
        smooth: true
      }
      datalists.push(itemS)
      clickRateData = []
    }
    const dateser = moment(results[0].date).format('MM/DD')
    const item = {
      titleName: dateser + titleName,
      xList: uniqLastNameArr,
      checkName: checkArr,
      datalist: datalists,
      datasj: clickRateData
    }
    return item
  } else if (type == 'uv') {
    for (var a = 0; a < checkArr.length; a++) {
      for (var c = 0; c < uniqHolderArr.length; c++) {
        for (var b = 0; b < results.length; b++) {
          if (checkArr[a] == results[b].name) { // 吸顶 = 吸顶，kv,优惠券
            if (uniqHolderArr[c] == moment(results[b].date).format('MM/DD')) {
              if (uclickName == 'clickRate') {
                var num = results[b].clickRate * 100
                clickRateData.push(parseFloat(num.toFixed(2)))
              } else if (uclickName == 'uv') {
                clickRateData.push(results[b].uv)
              }
              break;
            }

          }

        }
        if (clickRateData.length == c) {
          clickRateData.push(0)
        }
      }
      if (titleName == "访客数") {
        type = "bar"
      } else {
        type = "line"
      }
      const itemS = {
        name: checkArr[a],
        type: type,
        data: clickRateData,
        markPoint: {
          data: [{
            type: 'max',
            name: '最大值'
          }]
        },
        smooth: true
      }
      datalists.push(itemS)
      clickRateData = []
    }

    const item = {
      titleName: titleName,
      xList: uniqHolderArr,
      checkName: checkArr,
      datalist: datalists
    }
    return item
  }


}

//处理表格数据
function biaoGe(results, checkArr) {


}


//树状图和折线图
function zheXianTu(results, type, titleName, uclickName, checkArr, renqunList) {
  var rqDate = [] //日期数组
  var lastName = [] //模块名称
  var datalists = [] //数据模块
  var clickRateData = [] //点击率
  var renquandLastName = [] //人群模块名称
  results.forEach(itemList => {
    rqDate.push(moment(itemList.date).format('YYYY-MM-DD'))
    lastName.push(itemList.moduleEditTitle)
  });
  const uniqHolderArr = _.uniqWith(rqDate, _.isEqual); //日期数组
  // const uniqLastNameArr = _.uniqWith(lastName, _.isEqual);//模块名称

  if (type == 'line') {
    for (var d = 0; d < renqunList.length; d++) {
      for (var a = 0; a < checkArr.length; a++) {
        for (var c = 0; c < uniqHolderArr.length; c++) {
          for (var b = 0; b < results.length; b++) {
            if (renqunList[d] == results[b].name) {
              if (checkArr[a] == results[b].moduleEditTitle) { // 吸顶 = 吸顶，kv,优惠券
                if (uniqHolderArr[c] == moment(results[b].date).format('YYYY-MM-DD')) {
                  if (uclickName == 'clickRate') {
                    var num = results[b].clickRate * 100
                    clickRateData.push(parseFloat(num.toFixed(2)))
                  } else if (uclickName == 'clickCnt') {
                    clickRateData.push(results[b].clickCnt)
                  } else if (uclickName == 'leOrderRate') {
                    var num = results[b].leOrderRate * 100
                    clickRateData.push(parseFloat(num.toFixed(2)))
                  } else if (uclickName == 'avgStayTime') {
                    var num = results[b].avgStayTime
                    clickRateData.push(parseFloat(num.toFixed(2)))
                  }
                  break;
                }

              }
            }
          }
          if (clickRateData.length == c) {
            clickRateData.push(0)
          }
        }
        if (checkArr[a] == "点击次数") {
          type = "bar"
        } else {
          type = "line"
        }
        const itemS = {
          name: renqunList[d] + "-" + checkArr[a],
          type: type,
          data: clickRateData,
          markPoint: {
            data: [{
              type: 'max',
              name: '最大值'
            }]
          },
          smooth: true
        }
        var rqnamesder = renqunList[d] + "-" + checkArr[a]
        renquandLastName.push(rqnamesder)
        datalists.push(itemS)
        clickRateData = []
      }
    }
    const item = {
      titleName: titleName,
      xList: uniqHolderArr,
      checkName: renquandLastName,
      datalist: datalists
    }
    return item
  } else if (type == 'bar') {
    var renquandLastNameas = [] //人群模块名称

    for (var a = 0; a < uniqHolderArr.length; a++) {
      for (var d = 0; d < renqunList.length; d++) {
        for (var c = 0; c < checkArr.length; c++) {
          for (var b = 0; b < results.length; b++) {
            if (uniqHolderArr[a] == moment(results[b].date).format('YYYY-MM-DD')) {
              if (renqunList[d] == results[b].name) {
                if (results[b].moduleEditTitle == checkArr[c]) {
                  if (uclickName == 'clickRate') {
                    var num = results[b].clickRate * 100
                    clickRateData.push(parseFloat(num.toFixed(2)))
                  } else if (uclickName == 'clickCnt') {
                    clickRateData.push(results[b].clickCnt)
                  } else if (uclickName == 'clickUv') {
                    clickRateData.push(results[b].clickUv)
                  } else if (uclickName == 'leOrderRate') {
                    var num = results[b].leOrderRate * 100
                    clickRateData.push(parseFloat(num.toFixed(2)))
                  } else if (uclickName == 'avgStayTime') {
                    var num = results[b].avgStayTime
                    clickRateData.push(parseFloat(num.toFixed(2)))
                  }
                  break;
                }
              }
            }
          }
          if (clickRateData.length == c) {
            clickRateData.push(0)
          }
          var rqnamesder = renqunList[d] + "-" + checkArr[c]
          renquandLastNameas.push(rqnamesder)
        }




      }
      const itemS = {
        name: uniqHolderArr[a],
        type: type,
        barGap: 0,
        label: {
          show: true,
          position: 'insideBottom',
          distance: 15,
          align: 'left',
          verticalAlign: 'middle',
          rotate: 90,
          formatter: '{a}',
          fontSize: 8,
          color: "#666"
        },
        emphasis: {
          focus: 'series'
        },
        data: clickRateData
      }

      datalists.push(itemS)
      clickRateData = []
    }
    const uniqLastNameArr = _.uniqWith(renquandLastNameas, _.isEqual);
    const item = {
      titleName: titleName,
      xList: uniqHolderArr,
      checkName: uniqLastNameArr,
      datalist: datalists
    }
    return item
  }


}
//树状图加折线图
function zxtOrszt(results, type, titleName, uclickName, checkArr) {
  var rqDate = [] //日期数组
  var datalists = [] //数据模块
  var clickRateData = [] //点击率
  results.forEach(itemList => {
    rqDate.push(moment(itemList.date).format('YYYY-MM-DD'))
  });
  const uniqHolderArr = _.uniqWith(rqDate, _.isEqual); //日期数组


  for (var a = 0; a < checkArr.length; a++) {
    for (var c = 0; c < uniqHolderArr.length; c++) {
      for (var b = 0; b < results.length; b++) {
        if (checkArr[a] == "点击次数") { // 吸顶 = 吸顶，kv,优惠券
          if (uniqHolderArr[c] == moment(results[b].date).format('YYYY-MM-DD')) {
            clickRateData.push(results[b].clickCnt)
            break;
          }

        } else if (checkArr[a] == "浏览量") { // 吸顶 = 吸顶，kv,优惠券
          if (uniqHolderArr[c] == moment(results[b].date).format('YYYY-MM-DD')) {
            clickRateData.push(results[b].pv)
            break;
          }

        }

      }
      if (clickRateData.length == c) {
        clickRateData.push(0)
      }
    }
    if (checkArr[a] == "点击次数") {
      type = "bar",
        yAxisIndex = 0
    } else {
      type = "line",
        yAxisIndex = 1
    }
    const itemS = {
      name: checkArr[a],
      type: type,
      data: clickRateData,
      yAxisIndex: yAxisIndex,
      markPoint: {
        data: [{
          type: 'max',
          name: '最大值'
        }]
      },
      smooth: true
    }
    datalists.push(itemS)
    clickRateData = []
  }

  const item = {
    titleName: titleName,
    xList: uniqHolderArr,
    checkName: checkArr,
    datalist: datalists
  }
  return item



}


//处理插入多条数据
function chuLIsuju(lpsumData) {
  var value = []
  lpsumData.forEach(res => {
    const item = [
      res.name,
      res.date,
      res.pv,
      res.uv,
      res.clickCnt,
      res.clickUv,
      res.clickRate,
      res.bounceRate,
      res.avgStayTime,
      res.leOrderAmt,
      res.leOrderBuyerCnt,
      res.leOrderRate,
      res.lePayAmt,
      res.lePayBuyerCnt,
      res.lePayRate
    ]
    value.push(item)
  });
  return value
}

//时间处理函数
function getdiffdate(stime, etime) {
  //初始化日期列表，数组
  var diffdate = new Array()
  var i = 0
  //开始日期小于等于结束日期,并循环
  while (stime <= etime) {
    diffdate[i] = stime

    //获取开始日期时间戳
    var stime_ts = new Date(stime).getTime()

    //增加一天时间戳后的日期
    var next_date = stime_ts + 24 * 60 * 60 * 1000

    //拼接年月日，这里的月份会返回（0-11），所以要+1
    var next_dates_y = new Date(next_date).getFullYear() + '-'
    var next_dates_m =
      new Date(next_date).getMonth() + 1 < 10 ?
      '0' + (new Date(next_date).getMonth() + 1) + '-' :
      new Date(next_date).getMonth() + 1 + '-'
    var next_dates_d =
      new Date(next_date).getDate() < 10 ?
      '0' + new Date(next_date).getDate() :
      new Date(next_date).getDate()

    stime = next_dates_y + next_dates_m + next_dates_d

    //增加数组key
    i++
  }
  return diffdate
}

//获取当前时间前几天日期
function myGetDay(str, length) {
  var time = (new Date(str)).getTime() - 24 * 60 * 60 * 1000 * length;
  var yesday = new Date(time); // 获取的是前几天日期
  yesday = yesday.getFullYear() + "-" + (yesday.getMonth() >= 9 ? (yesday.getMonth() + 1) : "0" + (yesday.getMonth() + 1)) + "-" + (yesday.getDate() > 9 ? (yesday.getDate()) : "0" + (yesday.getDate())); //字符串拼接转格式：例如2018-08-19
  return yesday
}

//处理访客数
function fangKs(results) {
  const pv = []
  const uv = []
  const clickCnt = []
  const clickUv = []
  results.forEach(resdata => {
    pv.push(Number(resdata.pv))
    uv.push(Number(resdata.uv))
    clickCnt.push(Number(resdata.clickCnt))
    clickUv.push(Number(resdata.clickUv))
  })
  const pvSum = sum(pv)
  const uvSum = sum(uv)
  const clickCntSum = sum(clickCnt)
  const clickUvSum = sum(clickUv)
  const item = {
    pv: pvSum,
    uv: uvSum,
    clickCnt: clickCntSum,
    clickUv: clickUvSum
  }
  return item
}

//数字相加
function sum(arr) {
  var s = 0;
  for (var i = arr.length - 1; i >= 0; i--) {
    s += arr[i];
  }
  return s;
}