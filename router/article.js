const express = require('express');
const articleList = require('../router_handler/article')
//配置路由模块
const router = express.Router();



//导入解析 formdata 格式表单数据的包
const multer = require('multer')
//导入处理路径核心模块
const path = require('path')
// 创建 multer 的实例对象，通过 dest 属性指定文件的存放路径
const upload = multer({ dest: path.join(__dirname, '../uploads') })
//对表单数据 进行验证 npm i @escook/express-joi
const expressJoi = require('@escook/express-joi')
const {
    add_cate_schema,
    get_cate_schema,
    update_cate_schema,
    article_add_schema
} = require('../schema/user')
//获取文章分类列表
router.get('/cates', articleList.getArticleCatesList)
router.post('/addcates', expressJoi(add_cate_schema), articleList.articleAddcates)
router.get('/deletecate/:id', expressJoi(get_cate_schema), articleList.articleDeletecate)
router.get('/cates/:id', expressJoi(get_cate_schema), articleList.articleCatesId)
router.post('/updatecate', expressJoi(update_cate_schema), articleList.articleUpdateCate)

//发布文章
router.post('/add', upload.single('cover_img'), expressJoi(article_add_schema), articleList.articleAdds)






module.exports = router

