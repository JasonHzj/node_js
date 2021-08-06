const path = require('path')
const db = require('../db/index')


//获取文章分类列表
exports.getArticleCatesList = (req, res) => {
    const sql = 'select * from ev_article_cate where is_delete=0 order by id asc'
    db.query(sql,(err,results) =>{
        if (err) return res.cc(err)
        if (results.length === 0) return res.cc('获取文章分类失败')
        res.send({
            status:0,
            message:'获取文章分类列表成功',
            data:results
        })

    })

}

//新增文章分类
exports.articleAddcates = (req, res) => {
  const sql = 'select * from ev_article_cate where name=? or alias=?'
  db.query(sql, [req.body.name, req.body.alias],(err,results) =>{
     if(err) return res.cc(err)
     // 分类名称 和 分类别名 都被占用
     if (results.length === 2) return res.cc('分类名称与别名被占用，请更换后重试！')
     if (results.length === 1 && results[0].name === req.body.name && results[0].alias === req.body.alias) return res.cc('分类名称与别名被占用，请更换后重试！')
     // 分类名称 或 分类别名 被占用
     if (results.length === 1 && results[0].name === req.body.name) return res.cc('分类名称被占用，请更换后重试！')
     if (results.length === 1 && results[0].alias === req.body.alias) return res.cc('分类别名被占用，请更换后重试！')
     
     //插入数据
     const cateSql = 'insert into ev_article_cate set ?'
     db.query(cateSql,req.body, (err,resultsa) =>{
         if(err) return res.cc(err)
         if(resultsa.affectedRows !==1) return res.cc('新增文章分类失败')
         res.cc('新增文章分类成功',0)
     })

  })
}


//根据id删除分类
  exports.articleDeletecate = (req,res) =>{
      const sql = 'update ev_article_cate set is_delete=1 where id=?'
   db.query(sql, req.params.id, (err, results) => {
       if(err) return res.cc(err)
      if(results.affectedRows !==1) return res.cc('删除文章分类失败')
      res.cc('删除文章分类成功',0)
   })
  }


  //根据id获取文章分类
  exports.articleCatesId = (req,res) =>{
   const sql = 'select * from ev_article_cate where id=?'
   db.query(sql, req.params.id, (err,results) =>{
    if(err) return res.cc(err)
    if(results.length !==1) return res.cc('获取文章分类数据失败')
    res.send({
        status:0,
        message: '获取文章分类成功',
        data: results[0]
    })

   })

  }

  //根据文章更新分类
  exports.articleUpdateCate = (req,res) =>{
    const sql = 'select * from ev_article_cate where id=? and (name=? or alias=?)'
   db.query(sql, [req.body.id, req.body.name, req.body.alias], (err, results) => {
       // 执行 SQL 语句失败
      
       if (err) return res.cc(err)

       // 分类名称 和 分类别名 都被占用
       if (results.length === 2) return res.cc('分类名称与别名被占用，请更换后重试！')
       if (results.length === 1 && results[0].name === req.body.name && results[0].alias === req.body.alias) return res.cc('分类名称与别名被占用，请更换后重试！')
       // 分类名称 或 分类别名 被占用
       if (results.length === 1 && results[0].name === req.body.name) return res.cc('分类名称被占用，请更换后重试！')
       if (results.length === 1 && results[0].alias === req.body.alias) return res.cc('分类别名被占用，请更换后重试！')

       // TODO：更新文章分类
       const updateSql = 'update ev_article_cate set ? where id=?'
       db.query(updateSql, [req.body, req.body.id], (err, resultsa) => {
           if (err) return res.cc(err)
           if (resultsa.affectedRows !== 1) return res.cc('更新文章分类失败')
           res.cc("更新文章分类成功！", 0)
       })

   })



  }


  //发布文章
  exports.articleAdds = (req,res) =>{
      
    if (!req.file || req.file.fieldname !== 'cover_img') return res.cc('文章封面为必选参数')
   
    const articleInfo = {
        // 标题、内容、状态、所属的分类Id
        ...req.body,
        // 文章封面在服务器端的存放路径
        cover_img: path.join('../uploads', req.file.filename),
        // 文章发布时间
        pub_date: new Date(),
        // 文章作者的Id
        author_id: req.user.id,
       
    }
     const sql = 'insert into ev_articles set ?'
    db.query(sql, articleInfo,(err,results) =>{
        console.log(articleInfo);
        if(err) return res.cc(err)
          if (results.affectedRows !== 1) return res.cc('发布文章失败！')
          // 发布文章成功
          res.cc('发布文章成功', 0)
    })

  }

