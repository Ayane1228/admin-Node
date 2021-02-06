const express = require('express')
const Result = require('../models/Result')

// 验证，使用判断条件
const { body, validationResult } = require('express-validator')

// token
const jwt = require('jsonwebtoken')

// 密钥，过期时间
const { PRIVATE_KEY, JWT_EXPIRED } = require('../utils/constant')

// login方法：登录，用户点击登录
// findUser方法：服务端获取完token之后，客户端接收之后验证用户名
const { login,findUser} = require('../service/user')

// 获取token中的username方法
const { decode } = require('../utils/index')

const boom  = require('boom')
const router = express.Router()

// 创建请求接口
router.post('/login',
  //post请求中的数组使用body方法进行验证,并抛出信息
[
  body('username').isString().withMessage('用户名必须为字符'),
  body('password').isString().withMessage('密码必须为字符'),
],
function(req,res,next){
  // 进行验证
  const err = validationResult(req)
  // err的errors为空数组时，没有异常
  // 如果不为空，处理异常
  if(!err.isEmpty()){
    const [{msg}] = err.errors
    console.log('msg为' + msg);
    // 交给boom方法处理（自定义中间件router/index.js中）,400错误,并传递msg
    next(boom.badRequest(msg))
  } else {
  //查询用户
  const {username,password} = req.body
  login(username,password).then(user => {
    if (!user || user.length ===0 ) {
      new Result('登录失败').fail(res)
    } else {
      // 生成token，使用sign()方法，参数为username，密钥，过期时间
      const token = jwt.sign(
        { username },
        PRIVATE_KEY,
        { expiresIn: JWT_EXPIRED }
      )
      // 传给前端
      new Result({ token }, '登录成功').success(res)
    }
  })
  }
})

router.get('/info', function(req, res) {
  //解析token
  const decoded = decode(req)
  if (decoded && decoded.username) {
    findUser(decoded.username).then(user => {
      if (user) {
        user.roles = [user.role]
        new Result(user, '获取用户信息成功').success(res)
      } else {
        new Result('获取用户信息失败').fail(res)
      }
    })
  } else {
    new Result('用户信息解析失败').fail(res)
  }
})

module.exports = router