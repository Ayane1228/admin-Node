const express = require('express')

const router = express.Router()

// 创建请求接口
router.post('/login', function (req,res) {
  console.log('login',req.body);
  res.json({
    code: 0,
    mes:'登陆成功'
  })
})

module.exports = router