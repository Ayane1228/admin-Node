const express = require('express')
const Result = require('../models/Result')

const router = express.Router()
const { findNotice } = require('../service/notice')
const { all } = require('./user')

// 最新公告
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

module.exports = router