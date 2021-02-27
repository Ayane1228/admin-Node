const express = require('express')
const Result = require('../models/Result')

const router = express.Router()
const { findNotice,addNotice,deleteNotice } = require('../service/notice')

// 获取最新公告
router.get('/shownotice', function(req, res) {
  const notice = findNotice()
  // notice 是一个Promise对象
  notice.then( allnotice => {
    if( allnotice ) {
      new Result(allnotice,'获取最新公告成功').success(res)
    } else {
      new Result('获取最新公告失败').fail(res)
    }
  })
})

//修改公告
router.post('/changenotice', function(req,res) {
  // 获取请求数据
  const newTitle = req.body.noticeTitle;
  const newContent = req.body.noticeContent;
  addNotice(newTitle,newContent).then( () => {
    console.log('添加成功');
  }).catch( (err) =>{
    console.log('添加公告失败' + err);
  })
})

// 删除公告
router.post('/deleteNotice', function(req,res) {
  const deleteNoticeTitle = req.body.deleteNotice
  const deleteNoticeTime = req.body.deleteNoticeTime 
  deleteNotice(deleteNoticeTitle).then( () => {
    console.log('删除成功');
  }).catch( (err) => {
    console.log('删除失败' + err);
  })
})


module.exports = router