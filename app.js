const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const router = require('./router/index')

// 创建 express 应用
const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// 监听 / 路径的 get 请求
app.get('/',router)

// 使 express 监听18082
const server = app.listen(18082, function() {
  console.log('Http Server is running on 18082')
})