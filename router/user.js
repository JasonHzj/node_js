const express = require('express');
const userHandler = require('../router_handler/user')
//配置路由模块
const router = express.Router();
//对表单数据 进行验证 npm i @escook/express-joi
const expressJoi = require('@escook/express-joi')
const {
    reg_login_schema,
    update_userinfo_schema,
    upadate_password_schema,
    update_avatar_schema
} = require('../schema/user')

//注册新用户
router.post('/reguser',expressJoi(reg_login_schema), userHandler.regUser)
router.post('/login', expressJoi(reg_login_schema), userHandler.login)


//个人中心
router.get('/userinfo', userHandler.getUserInfo)
router.post('/userinfo', expressJoi(update_userinfo_schema), userHandler.updateUserInfo)
router.post('/updatepwd', expressJoi(upadate_password_schema), userHandler.updatePwd)
router.post('/update/avatar', expressJoi(update_avatar_schema), userHandler.updateAvatar)
























module.exports = router