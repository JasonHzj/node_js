const db = require('../db/index')
//对密码进行加密存储 npm i bcryptjs@2.4.3
const bcrypt = require('bcryptjs')
//生成Token 字符串 npm i jsonwebtoken@8.5.1
const jwt = require('jsonwebtoken')
const config = require('../config')

//注册模块
exports.regUser = (req, res) => {

//判断用户名密码不为空
if(!userinfo.username || !userinfo.password){
    return res.send({status:1 , message:'用户名密码不能为空'})
}

//查询用户名是否相同
const userinfo = req.body
const sql = 'select * from ev_users where username=?'
db.query(sql,[userinfo.username], function(err,results){
    if(err) return res.send({status:1, message:err.message})

    if(results.length > 0){
        return res.send({
            status: 1,
            message: '用户名被占用，请更换其他用户名！'
        })
    }
})

//添加新用户
   userinfo.password = bcrypt.hashSync(userinfo.password, 10)
   const inSql = 'insert into ev_users set ?'
   db.query(inSql, {
       username: userinfo.username,
       password: userinfo.password
   }, function (err, results) {
       if (err) return res.cc(err)
    //    console.log(results.affectedRows)
       if (results.affectedRows !== 1) {

           return res.send({
               status: 1,
               message: '注册用户失败，请稍后再试！'
           })
       }
       res.send({
           status: 0,
           message: '注册成功'
       })


   })

}
//登入模块
exports.login = (req, res) => {
 res.header('Access-Control-Allow-Origin', '*');
 const userinfo = req.body
 const sql = 'select * from ev_users where username=?'
 db.query(sql, userinfo.username, (err, results) => {
    if(err) return res.cc(err)
    if(results.length !==1 ) return res.cc('登入失败!请输入正确的用户名')
    const compareResult = bcrypt.compareSync(userinfo.password, results[0].password)
    if (!compareResult) return res.cc('登入失败！请输入正确的密码')
    const user = {
        ...results[0],
        password: '',
        user_pic:''
    }
    // 生成 Token 字符串
   const tokenStr = jwt.sign(user, config.jwtSecretKey,{
       expiresIn: '10h' // token 有效期为 10 个小时
   })
   res.send({
       status:0,
       message:'登入成功！',
       token: 'Bearer ' + tokenStr
   })


 })


}

//获取用户基本信息模块
exports.getUserInfo = (req, res) => {
   const sql = 'select id, username, nickname, email, user_pic from ev_users where id=?'
   db.query(sql,req.user.id,(err,results) =>{
       if(err) return res.cc(err)
       if(results.length !==1) return res.cc('获取用户基本信息失败')
       res.send({
           status:0,
           message:'获取用户基本信息成功',
           data: results[0]
       })
   })
}

//更新用户基本模块
exports.updateUserInfo = (req,res) =>{
    const sql = 'update ev_users set ? where id=?'
    db.query(sql,[req.body, req.user.id],(err, results) => {
        if(err) return res.cc(err)
        if(results.affectedRows !==1 ) return res.cc('修改用户基本信息失败')
        return res.cc('修改用户基本信息成功',0)
    })
}

//更新用户密码
exports.updatePwd = (req,res) =>{
  const sql = 'select * from ev_users where id=?'
  db.query(sql,req.user.id,(err, results) =>{
      if(err) return res.cc(err)
      if(results.length !==1) return res.cc('获取信息失败')
      const compareResult = bcrypt.compareSync(req.body.oldPwd, results[0].password)
      if (!compareResult) return res.cc('请输入正确的密码')
      
      const upSql = 'update ev_users set password=? where id=?'
      const newPwd = bcrypt.hashSync(req.body.newPwd, 10)
      db.query(upSql,[newPwd, req.user.id],(err, results) => {
          if(err) return res.cc(err)
          if (results.affectedRows !== 1) return res.cc('更新密码失败')
          res.cc('更新密码成功！', 0)
      })

  })

}


//更新用户头像

exports.updateAvatar = (req, res) =>{
    const sql = 'update ev_users set user_pic=? where id=?'
    db.query(sql, [req.body.avatar, req.user.id], (err, results) =>{
        if(err) return res.cc(err)
        if(results.affectedRows !== 1) return res.cc('更新头像失败')
        res.cc('更新头像成功', 0)
    })

}