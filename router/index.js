/*
 *  路由入口文件 
 */

// 导入路由所需模块
const { CODE_ERROR } = require('../utils/constant.js')
const express = require('express')
const boom = require('boom')
const userRouter = require('./user')
const noticeRouter = require('./notice')
const studentAccount = require('./studentAccount')
const teacherAccount = require('./teacherAccount')
const information = require('./information')
const select = require('./select')
const jwtAuth  = require('./jwt')
const Result = require('../models/Result')

// 注册路由
const router = express.Router()

// 使用JWT
router.use(jwtAuth)

// 通过不同模块对不同路由进行处理,进行解耦
router.get('/', function(req, res) {
  res.send('欢迎管理后台接口')
})

// 登录接口
router.use('/user', userRouter)
// 公告接口
router.use('/notice', noticeRouter)
// 学生账号
router.use('/studentAccount', studentAccount)
// 教师账号
router.use('/TeacherAccount',teacherAccount)
// 个人信息
router.use('/information',information)
// 论文选题
router.use('/select',select)
/**
 * 集中处理404请求的中间件
 * 该中间件必须放在正常处理流程之后
 * 否则，会拦截正常请求
 */
router.use((req, res, next) => {
  next(boom.notFound('接口不存在'))
})

/**
 * 自定义路由异常处理中间件
 * 方法的参数不能减少
 * 方法的必须放在路由最后
 */
router.use((err, req, res, next) => {
  // 如果是token错误
  if( err.name === 'UnauthorizedError' ){
    // 获取err中的status
    const { status = 401} = err
    // 使用自定义方法 Result
    new Result(null,'请求超时',{
      error:status,
      errMsg:err.name
    }).jwtErr(res.status(status))
  } else {
    const msg = ( err && err.message) || '系统错误'
    const statusCode = (err.output && err.output.statusCode) || 500;
    const errorMsg = (err.output && err.output.payload && err.output.payload.error) || err.message
    new Result(null,msg,{
      error:statusCode,
      errorMsg
    }).fail(res.status(statusCode))
  }
})

module.exports = router