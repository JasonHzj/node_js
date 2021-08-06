const express = require('express');
//导入跨域中间价
const cors = require('cors');
//导入登入注册路由模块
const userRouter = require('./router/user');
//导入个人中心路由模块
const userInfoRouter = require('./router/user');
//导入文章模块
const article = require('./router/article')
//导入页面模块
const ymmoudle = require('./router/ymmoudle')
//导入错误级别中间件
const joi = require('@hapi/joi')

var bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json


const app = express();
//配置跨域全局中间件
app.use(cors());
app.use(bodyParser.json({
   limit: '50mb'
}));
//配置解析表达数据中间件
app.use(express.urlencoded({ extended: false }))
// 托管静态资源文件
app.use('/uploads', express.static('./uploads'))
//优化res.send
app.use(function(req,res,next){
  
   res.cc = function(err, status = 1){
      res.send({
         status,
         message: err instanceof Error ? err.message : err
      })
   }
   next()
})
//配置解析令牌中间件npm i express-jwt@5.3.3
//导入配置文件
const config = require('./config')
//解析Tonken 的中间件
const expressJWT = require('express-jwt')
// 使用 .unless({ path: [/^\/api\//] }) 指定哪些接口不需要进行 Token 的身份认证
app.use(expressJWT({
   secret: config.jwtSecretKey
}).unless({
   path: [/^\/api\//]
}))

//注册路由模块

app.use('/api',userRouter);
app.use('/my', userInfoRouter);
app.use('/my/article', article);
app.use('/ymlist', ymmoudle);
//错误中间件
app.use((err , req, res, next) => {
   //数据验证失败
   if(err instanceof joi.ValidationError) return res.cc(err)
    // 捕获身份认证失败的错误
   if (err.name === 'UnauthorizedError') return res.cc('身份认证失败！')
   //未知错误
   res.cc(err)
})











app.listen(3007, function(){
   console.log('api server runing at http://127.0.0.1:3007')
})