/*
 * 最新通知接口
 */

const express = require('express')
const Result = require('../models/Result')
const router = express.Router()
const { findNotice,addNotice,deleteNotice } = require('../service/notice')

// 最新公告
router.get('/shownotice', function(req, res) {
  findNotice().then( allNotice => {
    if( allNotice ) {
      new Result(allNotice,'获取最新公告成功').success(res)
    } else {
      new Result('获取最新公告失败').fail(res)
    }
  })
})

// 管理员发布公告
router.post('/changenotice', function(req,res) {
  // 获取请求数据
  const newTitle = req.body.noticeTitle;
  const newContent = req.body.noticeContent;
  addNotice(newTitle,newContent).then( (results) => {
    new Result(results,'发布成功').success(res)
  }).catch( (err) =>{
    new Result('发布失败').fail(err)

  })
})

// 管理员删除公告
router.post('/deleteNotice', function(req,res) {
  const deleteNoticeTitle = req.body.deleteNotice
  deleteNotice(deleteNoticeTitle).then( (results) => {
    new Result(results,'删除成功').success(res)
  }).catch( (err) => {
    new Result('删除失败').fail(res)
  })
})


module.exports = router