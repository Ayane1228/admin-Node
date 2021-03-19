# 后端框架搭建

## 项目结构

```shell
├─db 数据库配置
├─models自定义组件
├─node_modules依赖文件
├─router 路由处理
├─service 数据库处理
└─utils JWT,Token配置
```

## 创建项目

```bash
mkdir admin-imooc-node
cd admin-imooc-node
npm init -y
```

#### 安装express依赖

```bash
npm i -S express
```

#### 创建 app.js

```js
const express = require('express')

// 创建 express 应用
const app = express()

// 监听 / 路径的 get 请求
app.get('/', function(req, res) {
  res.send('hello node')
})

// 使 express 监听 5000 端口号发起的 http 请求
const server = app.listen(5000, function() {
  const { address, port } = server.address()
  console.log('Http Server is running on http://%s:%s', address, port)
})
```

### 路由

安装 boom 依赖：

```bash
npm i -S boom
```

用来处理404异常，当页面没找到的时候，会使用boom.notFound('接口不存在')。

创建 router 文件夹，创建 router/index.js：

```js
const express = require('express')
const boom = require('boom')
const userRouter = require('./user')
const {
  CODE_ERROR
} = require('../utils/constant')

// 注册路由
const router = express.Router()

router.get('/', function(req, res) {
  res.send('欢迎学习小慕读书管理后台')
})

// 通过 userRouter 来处理 /user 路由，对路由处理进行解耦
router.use('/user', userRouter)

/**
 * 集中处理404请求的中间件
 * 注意：该中间件必须放在正常处理流程之后
 * 否则，会拦截正常请求
 */
router.use((req, res, next) => {
  next(boom.notFound('接口不存在'))
})

/**
 * 自定义路由异常处理中间件
 * 注意两点：
 * 第一，方法的参数不能减少
 * 第二，方法的必须放在路由最后
 */
router.use((err, req, res, next) => {
  const msg = (err && err.message) || '系统错误'
  const statusCode = (err.output && err.output.statusCode) || 500;
  const errorMsg = (err.output && err.output.payload && err.output.payload.error) || err.message
  res.status(statusCode).json({
    code: CODE_ERROR,
    msg,
    error: statusCode,
    errorMsg
  })
})

module.exports = router
```

创建 router/use.js：

```js
const express = require('express')

const router = express.Router()

router.get('/info', function(req, res, next) {
  res.json('user info...')
})

module.exports = router
```

创建 utils/constant：

```js
module.exports = {
  CODE_ERROR: -1
}
```

验证 /user/info：

```bash
"user info..."
```

验证 /user/login，结果：

```json
{"code":-1,"msg":"接口不存在","error":404,"errorMsg":"Not Found"}
```

# 用户登录

修改login.vue中的内容

```vue
<template>
  <div class="login-container">
    <el-form 
      ref="loginForm" 
      :model="loginForm" 
      :rules="loginRules" 
      class="login-form" 
      autocomplete="on" 
      label-position="left">

      <div class="title-container">
        <h3 class="title">毕业设计管理系统</h3>
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="username"
          v-model="loginForm.username"
          placeholder="用户名"
          name="username"
          type="text"
          tabindex="1"
          autocomplete="on"
        />
      </el-form-item>
      <el-tooltip v-model="capsTooltip" content="切换为大写" placement="right" manual>
        <el-form-item prop="密码">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            :key="passwordType"
            ref="password"
            v-model="loginForm.password"
            :type="passwordType"
            placeholder="密码"
            name="password"
            tabindex="2"
            autocomplete="on"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
            @keyup.enter.native="handleLogin"
          />
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>
      </el-tooltip>  
      <el-button :loading="loading" type="primary" style="width:100%;margin-bottom:30px;" @click.native.prevent="handleLogin">登录</el-button>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!value || value.length === 0) {
        callback(new Error('请输入正确的用户名'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 4) {
        callback(new Error('密码不能小于4位'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },      
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      showDialog: false,
      redirect: undefined,
      otherQuery: {}
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  mounted() {
    if (this.loginForm.username === '') {
      this.$refs.username.focus()
    } else if (this.loginForm.password === '') {
      this.$refs.password.focus()
    }
  },
  methods: {
    checkCapslock(e) {
      const { key } = e
      this.capsTooltip = key && key.length === 1 && (key >= 'A' && key <= 'Z')
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/login', this.loginForm)
            .then(() => {
              this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
              this.loading = false
            })
            .catch(() => {
              this.loading = false
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
  }
}
</script>
```

# 路由和权限控制

当删除了token，再进入页面的时候就无法访问页面了，这个框架的权限控制是放在路由当中去实现的。

### 创建组件

创建组件 `src/views/notice/shownotice.vue`，`src/views/notice/changenotice.vue`,这里的组件`changenotice`只有在是admin登录的时候才会显示出来。

### 配置路由

constantRoutes：所有的用户都能够访问的路由，

asyncRoutes：需要权限才能访问的路由。

修改 `src/router/index.js` 的 asyncRoutes：

```js
export const asyncRoutes = [
  {
    // 路径   
     path: '/notice',
     // 对应的组件：Layout外面的部分
     component: Layout,
     //重定向
     redirect: '/notice/shownotice',
     meta: { title: '公告', icon: 'edit' },
       // 点击父组件之后显示的子路由
       children: [
       {
         path: '/notice/shownotice',
         //懒加载
         component: () => import('@/views//notice/shownotice'),
         name: 'shownotice', 
        meta: { title: '公告展示', icon: 'edit' }
       },
       {
        path: '/notice/changenotice',
        //懒加载
        component: () => import('@/views//notice/changenotice'),
        name: 'changenotice', 
        // 设置左侧栏的title，icon和 所需要的权限，这里指必须是管理员才能访问
        meta: { title: '修改公告', icon: 'edit' }
      } 
      ]
  },
  // ...
]
```

## 关闭 Mock 接口

去掉 main.js 中 mock 相关代码：

```js
import { mockXHR } from '../mock'
if (process.env.NODE_ENV === 'production') {
  mockXHR()
}
```

删除 `src/api` 目录下 2 个 api 文件：

```bash
article.js
qiniu.js
```

删除 `vue.config.js` 中的相关配置：

```js
proxy: {
  // change xxx-api/login => mock/login
  // detail: https://cli.vuejs.org/config/#devserver-proxy
  [process.env.VUE_APP_BASE_API]: {
    target: `http://127.0.0.1:${port}/mock`,
    changeOrigin: true,
    pathRewrite: {
      ['^' + process.env.VUE_APP_BASE_API]: ''
    }
  }
},
after: require('./mock/mock-server.js')
```



## 修改接口地址

我们将发布到开发环境和生产环境，所以需要修改 `.env.development` 和 `.env.production` 两个配置文件：

```bash
VUE_APP_BASE_API = 'http://localhost:18082'
# VUE_APP_BASE_API = '/dev-api'
```

重新启动项目后，发现登录接口已指向我们指定的接口：

```bash
Request URL: http://localhostz:18082/user/login
```

## 跨域问题

我们需要在 node 服务中添加跨域中间件 cors：

```bash
npm i -S cors
```

然后修改 app.js：

```js
const cors = require('cors')

app.use(cors())
// 解决跨域问题
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By",' 3.2.1')
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});
```

再次请求即可成功，这里我们在 Network 中会发现发起了两次 https 请求，这是因为由于触发跨域，所以会首先进行 OPTIONS 请求，判断服务端是否允许跨域请求，如果允许才能实际进行请求。

# MySql

安装

```
 npm i -S mysql
```

## 配置

创建 db 目录，新建两个文件：

```bash
index.js
config.js
```

config.js 源码如下：

```js
module.exports = {
    // 主机地址
    host: 'localhost',
    // 数据库用户名
    user: 'root',
    // 密码
    password: 'root',
    // 数据库名
    database: 'db'
  }
```

index.js

```js
  const mysql = require('mysql')
  const config = require('./config')
  const { debug } = require('../utils/constant')
  // 连接数据库方法
  function connect() {
      return mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      multipleStatements:true
      })
  }
  // 查询数据库方法
  function querySql(sql) {
      const conn = connect()
      debug && console.log(sql)
      console.log('db connect start');
      return new Promise((resolve, reject) => {
        try {
          conn.query(sql, (err, results) => {
            if (err) {
              debug && console.log('查询失败，原因:' + JSON.stringify(err))
              reject(err)
            } else {
              debug && console.log('查询成功', JSON.stringify(results))
              resolve(results)
            }
          })
        } catch (e) {
          reject(e)
        } finally {
          conn.end()
        }
      })
    }
  module.exports = {querySql}
```

`debug`:将错误信息放在服务端进行显示，上线时将debug设置为false。

## 登陆查询

将登录方法进行封装，新建`service/user.js`

```js
const { querySql } = require('../db')
function login(username, password) {
    const sql = `select * from user where username='${username}' and password='${password}'`
    return querySql(sql)
  }

module.exports = {login}
```

在`router/index.js`中执行

```js
const express = require('express')
const Result = require('../models/Result')
// 登录login方法
const { login } = require('../service/user')

const router = express.Router()

// 创建请求接口
router.post('/login',function(req,res){
  console.log(req.body)
  //查询用户
  const {username,password} = req.body
  login(username,password).then(user => {
    if (!user || user.length ===0 ) {
      new Result('登录失败').fail(res)
    } else {
      new Result('登陆成功').success(res)
    }
  })
})

module.exports = router
```

## express-validator

express-validator 是一个功能强大的表单验证器，它是 validator.js 的中间件

使用 express-validator 可以简化 POST 请求的参数验证，使用方法如下：

安装

```
npm i -S express-validator
```

验证

```js
const { body, validationResult } = require('express-validator')
const boom = require('boom')

router.post(
  '/login',
  [
    body('username').isString().withMessage('username类型不正确'),
    body('password').isString().withMessage('password类型不正确')
  ],
  function(req, res, next) {
    const err = validationResult(req)
    if (!err.isEmpty()) {
      const [{ msg }] = err.errors
      next(boom.badRequest(msg))
    } else {
      const username = req.body.username
      const password = md5(`${req.body.password}${PWD_SALT}`)

      login(username, password).then(user => {
        if (!user || user.length === 0) {
          new Result('登录失败').fail(res)
        } else {
          new Result('登录成功').success(res)
        }
      })
    }
  })
```

express-validator 使用技巧：

- 在 `router.post` 方法中使用 body 方法判断参数类型，并指定出错时的提示信息
- 使用 `const err = validationResult(req)` 获取错误信息，`err.errors` 是一个数组，包含所有错误信息，如果 `err.errors` 为空则表示校验成功，没有参数错误
- 如果发现错误我们可以使用 `next(boom.badRequest(msg))` 抛出异常，交给我们自定义的异常处理方法进行处理

# JWT

### Token 是什么

Token 本质是字符串，用于请求时附带在请求头中，校验请求是否合法及判断用户身份

### Token 与 Session、Cookie 的区别

- Session 保存在服务端，用于客户端与服务端连接时，临时保存用户信息，当用户释放连接后，Session 将被释放；
- Cookie 保存在客户端，当客户端发起请求时，Cookie 会附带在 http header 中，提供给服务端辨识用户身份；
- Token 请求时提供，用于校验用户是否具备访问接口的权限。

### Token 的用途

Token 的用途主要有三点：

- 拦截无效请求，降低服务器处理压力；
- 实现第三方 API 授权，无需每次都输入用户名密码鉴权；
- 身份校验，防止 CSRF 攻击。

## 生成 JWT Token

安装 jsonwebtoken

```bash
npm i -S jsonwebtoken
```

使用

```js
const jwt = require('jsonwebtoken')
// 密钥，过期时间
const { PRIVATE_KEY, JWT_EXPIRED } = require('../utils/constant')

login(username, password).then(user => {
    if (!user || user.length === 0) {
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
```

## 前端登录请求改造

修改 `src/utils/request.js`：

```js
service.interceptors.response.use(
  response => {
    const res = response.data

    if (res.code !== 0) {
      Message({
        message: res.msg || 'Error',
        type: 'error',
        duration: 5 * 1000
      })
      // 判断 token 失效的场景
      if (res.code === -2) {
        // 如果 token 失效，则弹出确认对话框，用户点击后，清空 token 并返回登录页面
        MessageBox.confirm('Token 失效，请重新登录', '确认退出登录', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.msg || '请求失败'))
    } else {
      return res
    }
  },
  error => {
    let message = error.message || '请求失败'
    if (error.response && error.response.data) {
      const { data } = error.response
      message = data.msg
    }
    Message({
      message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)
```

请求失败，原因时使用`user/login`之后使用了`user/info`,而这个接口没有功能。而这个框架是将token放到url中的，我们则需要将token信息放到header中。

## JWT 认证

安装 express-jwt

```bash
npm i -S express-jwt
```

创建 `/router/jwt.js`

```js
const expressJwt = require('express-jwt');
const { PRIVATE_KEY } = require('../utils/constant');

const jwtAuth = expressJwt({
  secret: PRIVATE_KEY,
  credentialsRequired: true // 设置为false就不进行校验了，游客也可以访问
}).unless({
  path: [
    '/',
    '/user/login'
  ], // 设置 jwt 认证白名单
});

module.exports = jwtAuth;
```

在 `/router/index.js` 中使用中间件

```js
const jwtAuth = require('./jwt')

// 注册路由
const router = express.Router()

// 对所有路由进行 jwt 认证
router.use(jwtAuth)
```

在 `/utils/contants.js` 中添加：

```js
module.exports = {
  // ...
  CODE_TOKEN_EXPIRED: -2
}
```

修改 `/model/Result.js`：

```js
expired(res) {
  this.code = CODE_TOKEN_EXPIRED
  this.json(res)
}
```

修改自定义异常：

```js
router.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    new Result(null, 'token失效', {
      error: err.status,
      errorMsg: err.name
    }).expired(res.status(err.status))
  } else {
    const msg = (err && err.message) || '系统错误'
    const statusCode = (err.output && err.output.statusCode) || 500;
    const errorMsg = (err.output && err.output.payload && err.output.payload.error) || err.message
    new Result(null, msg, {
      error: statusCode,
      errorMsg
    }).fail(res.status(statusCode))
  }
})
```

## 前端传入 JWT Token

JWT Token对所有路由进行检查。

后端添加路由的 jwt 认证后，再次请求 `/user/info` 将抛出 401 错误，这是由于前端未传递合理的 Token 导致，下面我们就修改 `/utils/request.js`，使得前端请求时可以传递 Token：

```js
service.interceptors.request.use(
  config => {
    // 如果存在 token 则附带在 http header 中
    if (store.getters.token) {
      config.headers['Authorization'] = `Bearer ${getToken()}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)
```

前端去掉 `/user/info` 请求时传入的 token，因为我们已经从 token 中传入，修改 `src/api/user.js`：

```js
export function getInfo() {
  return request({
    url: '/user/info',
    method: 'get'
  })
}
```

## 用户查询 `/user/info` API

在 `/db/index.js` 中添加：

```js
function queryOne(sql) {
  return new Promise((resolve, reject) => {
    querySql(sql)
      .then(results => {
        if (results && results.length > 0) {
          resolve(results[0])
        } else {
          resolve(null)
        }
      })
      .catch(error => {
        reject(error)
      })
  })
}
```

在 `/services/user.js` 中添加：

```js
function findUser(username) {
  const sql = `select * from admin_user where username='${username}'`
  return queryOne(sql)
}
```

此时有个问题，前端仅在 Http Header 中传入了 Token，如果通过 Token 获取 username 呢？这里就需要通过对 JWT Token 进行解析了，在 `/utils/index.js` 中添加 decode 方法：

```js
const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('./constant')

function decode(req) {
  const authorization = req.get('Authorization')
  let token = ''
  if (authorization.indexOf('Bearer') >= 0) {
    token = authorization.replace('Bearer ', '')
  } else {
    token = authorization
  }
  return jwt.verify(token, PRIVATE_KEY)
}
```

修改 `/router/user.js`：

```js
router.get('/info', function(req, res) {
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
```

此时在前端重新登录，登录成功。

修改 Logout 方法

修改 `src/store/modules/user.js`：

```js
logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      try {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        removeToken()
        resetRouter()
        dispatch('tagsView/delAllViews', null, { root: true })
        resolve()
      } catch (e) {
        reject(e)
      }
    })
}
```

## 权限设置

路由中设置将其放入路由表所需的`roles`,并从服务器端获取访问的role进行判断。

从服务器端获取role数据，前端进行判断，生成动态路由表。

# 公告

## 最新通知shownotice（admin，teacher，student）

点击最新通知，懒加载页面并在生命周期函数`beforeMount`中请求后端查询数据，并将请求到的数据渲染到页面上。

1. 先写前端的页面样式，使用表格并将数据绑定在表格属性中。

   ```vue
   <template>
     <div>
       <div id="main">
       <h3>最新通知</h3>
       <el-table
       :data="list"
       stripe
       fit
       highlight-current-row
       style="width: 100%">
       <el-table-column
         prop="noticeTime"
         label="日期"
         width="180">
       </el-table-column>
       <el-table-column
         prop="noticeTitle"
         label="题目"
         width="600">
       </el-table-column>
       <el-table-column>
         <template slot-scope="scope">
           <el-button 
             type="primary" 
             @click="showContent(scope.$index, scope.row)">
             查看详情
           </el-button>
         </template>
       </el-table-column>
     </el-table>
       </div>
     </div>
   </template>
   <style>
   #main{
     margin: 30px;
   }
   .msgBox{
     overflow: scroll; 
     overflow-x:hidden ;
     width: 60%;
     height: 80%;
   }
   </style>
   ```

2. 前端使用`axios`的`get`请求数据并将数据遍历保存在`data`中的`list`中。

   ```js
       beforeMount() {
         const that = this
         const token = this.header
         // 请求后端数据
         axios.get('http://localhost:18082/notice/shownotice',{
               // 并保存token到请求头中
               headers:{
                 Authorization:token.Authorization
               }
           })
             .then( function (res) {
               //保存到data中
               res.data.data.map( (item) => {
                 //格式化时间
                 item.noticeTime = utc2beijing(item.noticeTime)
                 // 显示数据
                 that.$data.list.push(item)
               })
         }).catch( err => { console.log(err); })
     },
   ```

   由于获取的时间格式一般为MySql中使用的UTC时间`YYYYMMDD T HHMMSS Z`格式，因此使用了函数`utc2beijing`来将utc时间转为北京时间，将格式也修改为`2009/11/1下午3:58:09`样式。

   > 函数`utc2beijing`，参数为utc时间。
   >
   > ```js
   > export default function utc2beijing(utc_datetime) {
   >     // 转为正常的时间格式 年-月-日 时:分:秒
   >     var T_pos = utc_datetime.indexOf('T');
   >     var Z_pos = utc_datetime.indexOf('Z');
   >     var year_month_day = utc_datetime.substr(0,T_pos);
   >     var hour_minute_second = utc_datetime.substr(T_pos+1,Z_pos-T_pos-1);
   >     var new_datetime = year_month_day+" "+hour_minute_second; // 2017-03-31 08:02:06
   > 
   >     // 处理成为时间戳
   >     timestamp = new Date(Date.parse(new_datetime));
   >     timestamp = timestamp.getTime();
   >     timestamp = timestamp/1000;
   > 
   >     // 增加8个小时，北京时间比utc时间多八个时区
   >     var timestamp = timestamp+8*60*60;
   > 
   >     // 时间戳转为时间
   >     var beijing_datetime = new Date(parseInt(timestamp) * 1000).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
   >     return beijing_datetime; // 2017-03-31 16:02:06
   > }
   > ```

3. 后端接受请求。并返回

   `router/index.js`中规定那个模块处理那个请求。

   ```js
   const noticeRouter = require('./notice')
   ...
   // 通过 noticeRouter 来处理 /notice 路由，对路由处理进行解耦
   router.use('/notice', noticeRouter)
   ```

4. `notice.js`中处理有关公告的请求

   ```js
   // 导入express框架
   const express = require('express')
   // 导入自定义的结果处理组件
   const Result = require('../models/Result')
   
   // 创建路由
   const router = express.Router()
   
   // 导入sql语句函数
   const { findNotice,addNotice,deleteNotice } = require('../service/notice')
   
   // 当使用get请求`/shownotice`时，就会调用这个函数
   router.get('/shownotice', function(req, res) {
      // 调用函数findNotice()执行sql语句
     const notice = findNotice()
     // 执行结果notice 是一个Promise对象
     notice.then( allnotice => {
       // 调用自定义组件处理结果，获取到则返回给前端
         if( allnotice ) {
         new Result(allnotice,'获取最新公告成功').success(res)
       } else {
         new Result('获取最新公告失败').fail(res)
       }
     })
   })
   
   // 导出路由
   module.exports = router
   ```

5. `service/notice`中的`findnotice`函数，用于执行sql语句，查询表中的数据。

   ```json
   // 导入自定义查询sql语句函数，自动处理数据库账号，密码，查询结束关闭连接
   const { querySql,queryOne} = require('../db')
   
   function findNotice() {
       return querySql(`SELECT noticeTitle,noticeTime,noticeContent FROM notice`)
     }
   
   // 导出函数
   module.exports = { findNotice }
   ```

6. 其他

   1. 查看详情

   > 按钮，点击触发showContetn函数，参数：该行的索引值（scope.$index）和该行上的内容（scope.row）
   >
   > ```vue
   >     <el-table-column>
   >       <template slot-scope="scope">
   >         <el-button 
   >           type="primary" 
   >           @click="showContent(scope.$index, scope.row)">
   >           查看详情
   >         </el-button>
   >       </template>
   >     </el-table-column>
   > ```
   >
   > 触发事件，`this.$alert`:elementUI调用弹框组件，参见：https://element.eleme.cn/#/zh-CN/component/message-box
   >
   > ```js
   >     methods:{
   >       // 获取当前列的index和内容
   >       showContent(index,row){
   >         this.$alert(
   >             // 弹框内容，弹框标题，获取data中的list中的数据，数据是一个数组，索引值由点击时传递
   >             this.$data.list[index].noticeContent, 				this.$data.list[index].noticeTitle,
   >         // 弹框相关设置    
   >         {
   >             // 自定义类名，便于修改样式
   >         customClass:"msgBox",
   >             // 将内容看做HTML代码处理
   >         dangerouslyUseHTMLString: true,
   >         	// 不显示确定按钮
   >         showConfirmButton:false,
   >         	// 显示取消按钮
   >         showCancelButton:true,
   >         	// 取消按钮的文本内容
   >         cancelButtonText:"关闭"
   >         })
   >         // 回调函数    
   >         .then( () =>{
   >           console.log('查看详情');
   >         }).catch( (err) => {
   >           console.log(err);
   >         });
   >       }
   >     },
   > ```
   >
   > 自定义样式，隐藏x轴滚动条，显示y轴滚动条。
   >
   > ```css
   > .msgBox{
   >   overflow: scroll; 
   >   overflow-x:hidden ;
   >   width: 60%;
   >   height: 80%;
   > }
   > ```

## 修改通知changenotice（admin）

在前段中设置各个页面的访问权限。在`router/index.js`文件中定义路由的相关信息，以`http://localhost:9527/#/notice/changenotice`为例。

> 动态路由：数组形式，指需要登陆之后判定权限才能访问

```js
/* 动态路由 */
export const asyncRoutes = [  
  // 公告路由部分
  {
      // 处理访问路径为‘/notice/’时的情况
      path: notice',
      // 引入懒加载
      component: Layout,
      // 访问会重定向至其他路由，这里是指访问地址为 /notice/ 会自动跳转/notice/shownotice地址
      redirect: '/notice/shownotice',
      //左边的一级标题的文字和图标
      meta: { title: '通知', icon: 'el-icon-position' },
      //子路由
      children: [
        {
          // 路由路径
          path: '/notice/shownotice',
          // 使用懒加载，加载模块
          component: () => import('@/views//notice/shownotice'),
          // 模块名
          name: 'shownotice',
          // 二级菜单的文字和图标
          meta: { title: '最新通知', icon: 'el-icon-position' }
        },
        {
          path: '/notice/changenotice',
          // 懒加载
          component: () => import('@/views//notice/changenotice'),
          name: 'changenotice',
          // 设置左侧栏的title,icon和所需要的权限，这里指必须是登录时获取到的数据库中的role属性为admin时才能访问
          meta: { title: '修改通知', icon: 'el-icon-position', roles: ['admin'] }
        }
      ]
  }
]
```

与最新通知页面不同，这个页面多了2个功能：发布新公告，删除公告

#### 发布新公告：内容为`textarea`,点击发布新通知之后进行前端验证。

```vue
    <div class="newNotice">
    <div style="margin: 20px 0;"></div>
    <h3>发布公告</h3>
    <el-input
      type="textarea"
      :autosize="{ minRows: 10, maxRows: 50}"
      placeholder="请输入内容"
      v-model="textareaContent">
    </el-input>
      <el-button 
        type="success"
        @click="submitNotice"
        >
        发布新通知
      </el-button>
    </div>
```

> 前端验证，先判断内容（textareaContent）是否为空，并给出提示。不为空则调用`$prompt`（提交内容的对话框）要求输入标题。再使用`post`方法将token，内容（`noticeContent:this.$data.textareaContent`和标题`noticeTitle:value`）通过header和data传递并调用后端接口`http://localhost:18082/notice/changenotice`。

```js
      // 提交公告
      submitNotice(){
        //判断内容是否为空
        if (this.$data.textareaContent === null ) {
            this.$message({
            type: 'warning',
            message: '内容不能为空 ' 
          })
        } else {
            // 可以传递值的对话框
          this.$prompt('请输入标题', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(({ value }) => {
          // 请求发布通知接口
          // 获取当前的token
          const token = this.header
          axios({
            url:'http://localhost:18082/notice/changenotice',
            method:'post',
            // 添加token
            headers:{
              Authorization:token.Authorization
            },
            data:{
                noticeTitle:value,
                noticeContent:this.$data.textareaContent
                }
          }).then( (res) =>{
            console.log(res);
          }).catch( (err) => {
              console.log('请求发布接口失败' + err);
            })
            // 发布结束之后的回调    
            this.$message({
                type: 'success',
                message: '发布成功,标题为: ' + value
              }).then( 
				console.log('发布成功')
              ).catch((err) => {
              this.$message({
                type: 'error',
                message: '发布失败'
              })       
            });
        })
      }
      }
  }
```

后端接口，从req.body中接受参数，调用`addNotice()`函数使用`MySql`语句 

```js
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
```

> 插入到表notice中，并自动设置`ID`，自动设置当前时间（MySql中`Now()`函数：返回当前的日期和时间）。

```js
function addNotice(newTitle,newContent) {
  // 插入语句
  return queryOne(`INSERT INTO notice VALUES (id,'${newTitle}',Now(),'${newContent}')`)
}
```

##### 删除公告：点击获取当前列标题，调用后端接口，删除数据库中的记录。

# 账号管理（admin）



账号管理权限为admin，分为学生账号管理和教师账号管理。两者相似，都能查看学生/教师账号信息，添加学生/教师账号，删除学生/教师账号，修改学生/教师账号密码。

### 添加账号

前段页面部分使用表单`el-form`，`el-input`,`el-cascader`完成。点击确认添加调用函数`addNewStudent('newStudentForm')`将表单数据传递给后端。

```vue
    <!-- 添加新学生 -->
    <div class="top">
      <h3>添加新学生账号</h3>
      <div class="topMain">
        <el-form label-width="80px" :model="newStudentForm" :rules="rules" ref="newStudentForm" class="demo-form-inline">
        <el-col :span="5">
          <el-form-item label="账号" prop="newAccount" >
            <el-input v-model="newStudentForm.newAccount" placeholder="账号"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="密码" prop="newPassword" >
            <el-input v-model="newStudentForm.newPassword" placeholder="密码" show-password></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="姓名"  prop="newName">
            <el-input v-model="newStudentForm.newName" placeholder="姓名"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="学号"  prop="newStudentID">
            <el-input v-model="newStudentForm.newStudentID" placeholder="学号"></el-input>
          </el-form-item>        
        </el-col>
        <el-col :span="5">
          <el-form-item label="班号"  prop="newStudentClassID">
            <el-input v-model="newStudentForm.newStudentClassID" placeholder="班号"></el-input>
          </el-form-item>          
        </el-col>
        <el-col :span="5" class="major">
          <el-form-item label="专业" >
            <el-cascader
            ref="zhuangye"
            placeholder="专业"
            :options="newStudentForm.options"
            filterable></el-cascader>
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <el-form-item>
            <el-button type="primary" @click="addNewStudent('newStudentForm')">确认添加</el-button>
          </el-form-item>
        </el-col>
      </el-form>
      </div>    
    </div>
```

其中使用`el-form`的一些功能：验证功能`:rules="rules" `绑定了验证规则（写在`data`中）。

> required：是否必须，message：提示信息，trigger：何时验证。

```js
        // 验证规则，
        rules:{
          newAccount:[{ required: true, message: '请输入账号名', trigger: 'blur' }],
          newPassword:[
            {required: true, message: '请输入密码', trigger: 'blur'},
            { min: 4, message: '密码长度最小为4个字符', trigger: 'blur' }
          ],
          newName:[{required: true, message: '请输入学生姓名', trigger: 'blur'}],
          newStudentID:[{required: true, message: '请输入学生学号', trigger: 'blur'}],
          newStudentClassID:[{required: true, message: '请输入学生班号', trigger: 'blur'}]
        },
```

##### el-cascader:下拉菜单无法获取一级表单的数据	

el-cascader显示的数据是定死的，其他一开始均默认为空，而下拉菜单是可选的，所以要先定义好选项内容（options），label是显示在网页上的值，而value是每个选项真实绑定的值。由于只能获取到二级菜单（children）选中的value，所以将子菜单的value将学院名和专业都写上了，交给后端处理。

> 最后提交给的值其实是：'信息工程学院/软件工程'。

```js
        newStudentForm: {
          newAccount: null,
          newPassword: null,
          newName:null,
          newStudentID:null,
          newStudentClassID:null,  
          //选择专业       
          options: [{
          value: '信息工程学院',
          label: '信息工程学院',
          children: [{
            value: '信息工程学院/软件工程',
            label: '软件工程'
          }, {
            value: '信息工程学院/软件工程(嵌入式)',
            label: '软件工程(嵌入式)',
          }]
          }, 
          {
          value: '机电工程与自动化学院',
          label: '机电工程与自动化学院',
          children: [{
            value: '机电工程与自动化学院/车辆工程',
            label: '车辆工程',
          }, {
            value: '机电工程学院/自动化',
            label: '自动化',
          }]
          }, 
          {
          value: '国际商学院',
          label: '国际商学院',
          children: [{
            value: '国际商学院/国际经济与贸易',
            label: '国际经济与贸易'
          }, {
            value: '国际商学院/会计学CIMA',
            label: '会计学CIMA'
          }]
        }]
        },
```

前段按钮触发函数`addNewStudent(newStudentForm)`

```js
      // 添加账号
      addNewStudent(newStudentForm) {
        this.$refs[newStudentForm].validate((valid) => {
        // 再次进行前端验证
        if (valid) {
          this.$message({
          message: '提交成功',
          type: 'success'
        })
        // 获取数据
        const token = this.header
        const newSAccount = this.$data.newStudentForm.newAccount
        const newSPassword = this.$data.newStudentForm.newPassword
        const newSName = this.$data.newStudentForm.newName
        const newStudentID = this.$data.newStudentForm.newStudentID
        const newStudentClassID = this.$data.newStudentForm.newStudentClassID 
        const newStudentMajor = this.$refs['zhuangye'].getCheckedNodes()[0].data.value
        // 请求接口
        axios({
            url:'http://localhost:18082/studentAccount/addStudentAccount',
            method:'post',
            headers:{ Authorization:token.Authorization },
            data:{newSAccount,newSPassword,newSName,newStudentID,newStudentClassID,newStudentMajor}
        }).then ( (res) => {
          console.log(res);
        }).catch( (err) => {
          console.log(err);
        })
        } 
    // 未通过验证，不符合rules
    else {
          this.$message({
          message: '提交失败',
          type: 'error'
        })
            return false;
          }
        });
      },
```

后端接口同样的也是获取数据，调用函数，查询数据库。而传递过来的学院/专业值则通过字符串方法：`split()`进行分割。

```js
    const newStudentCollage = req.body.newStudentMajor.split('/')[0]
    const newStudentMajor  = req.body.newStudentMajor.split('/')[1]
```

最后保存到两个表（`user`，`studentaccount`）中。

```js
// 添加新学生
function newStudentAccount(newSAccount,newSPassword,newSName,newStudentID,newStudentClassID,newStudentCollage,newStudentMajor){
  console.log(newStudentCollage,newStudentMajor);
  return queryOne(`
  INSERT INTO studentaccount (id,username,password,truename,studentID,classID,college,major) 
  VALUES (id,'${newSAccount}', '${newSPassword}','${newSName}','${newStudentID}','${newStudentClassID}','${newStudentCollage}','${newStudentMajor}');
  INSERT INTO user (id,username,password,role) VALUES (id,'${newSAccount}', '${newSPassword}','student')
  `)
}
```

## 账号信息展示

与公告页类似，在生命周期函数`beoforeMount()`中获取数据并渲染到页面上。

点击展示隐藏的部分数据使用了`el-table`的一个属性：`el-table-column type="expand"`，参见：https://element.eleme.cn/#/zh-CN/component/table#table-column-attributes。

## 修改密码和删除账号

两者类似，都是点击获取当前列的数据，并在前端验证完成后，调用后端接口，将新数据和当前列的用户名传递过去，修改数据库中的值。

# 个人信息

分为学生个人信息和教师个人信息。管理员账号admin分在了教师个人信息中。当前登录的账号可以查看，修改自己的个人信息。

## 学生个人信息（admin，teacher）

由于这个框架中默认管理员有访问所有的动态路由的权限，但管理员不是学生账号，因此需要我们自己加上一层判断。

同样是在获取数据的声明周期函数进行判断，我们直接请求接口`information/studentInformation`，通过后端判断后的返回值（`if (res.data == '管理员无权访问学生个人信息') `）来判断是否是学生账号,如果是则手动重定向到隐藏路由页面`information/errorinformation`,不是则获取数据并渲染页面。

```js
    beforeMount() {
      const that = this
      const dataForm = that.$data.form
      const token = this.header
      // 请求后端数据
      axios.get('http://localhost:18082/information/studentInformation',{
            // 并保存token到请求头中
            headers:{
              Authorization:token.Authorization
            }
        }).then( (res) =>{
          if (res.data == '管理员无权访问学生个人信息') {
            // 重定向
            window.location.href = 'http://localhost:9527/index.html#/information/errorinformation'
          } else {
              const result = res.data.data[0]
              dataForm.truename = result.truename
              dataForm.studentID = result.studentID
              dataForm.phone = result.phone
              dataForm.email = result.email
              dataForm.major = result.major              
              dataForm.introduction = result.introduction
          }
        }).catch( (err) => {
          console.log(err);
        })
  }
}
```

隐藏路由：`router/index.js`中设置：`hidden: true`,设置后改路由信息不在左侧侧边栏中显示。

```js
      {
        path:'/information/errorinformation',
        component:() => import('@/views//information/adminStudent'),
        name:'errorinformation',
        meta:{ title:'管理员无法访问学生个人信息',roles:['admin']},
        hidden: true
      }
```

后端请求验证过程，每次请求接口都会传递此次请求的用户名，因此只需判断用户是否是‘admin’即可。

```js
// 获得学生个人信息
router.get('/studentInformation',function(req,res){
    if (req.user.username == 'admin' ) {
        res.send('管理员无权访问学生个人信息')
    } else {
        const studentInf = findStudnetInformation(req.user.username)
        studentInf.then( studentInf =>{
            if (studentInf) {
                new Result(studentInf,'获取学生个人信息成功').success(res)
            } else {
                new Result('获取学生个人信息失败').fail(res)
            }
        })
    }
})
```

当用户名不为`admin`且`role`是`student`时则可获取到当前登录学生的信息，并传递给前端。

当渲染页面时，为了防止学生修改一些重要信息（姓名，学号，专业等），需要将一些输入框禁用：`:disabled="true"`。

```vue
      <el-form-item label="姓名">
        <el-col :span="10">
        <el-input 
          v-model="form.truename"  
          :disabled="true" ></el-input>
          </el-col>
      </el-form-item>
```

## 教师/管理员个人信息（admin，teacher）

教师和管理员共用一套页面，因此判断之后不是进行重定向，而是定义一个标志值（flag），在生命周期函数请求完之后定义这个值，用于判断提交修改时应该调用哪个接口。

```js
      data() {
      return {
        // flag 0为管理员,1为教师
        flag:null,
        form: {
          truename:null,
          teacherID:null,
          phone:null,
          email:null,
          office:null,
          teacherrank:null
        }
      }
  },  
```

前端接受到响应后，修改flag的值(`that.$data.flag = 0`)，当是管理员时还须调用提示（`this.adminAccount()`）并获取渲染数据。

```js
    beforeMount() {
      const that = this
      const dataForm = that.$data.form
      const token = this.header
      // 请求后端数据
      axios.get('http://localhost:18082/information/teacherInformation',{
            // 并保存token到请求头中
            headers:{
              Authorization:token.Authorization
            }
        }).then( (res) =>{
          if (res.data.msg == '获取admin信息成功') {
            that.$data.flag = 0
            this.adminAccount()
            const result = res.data.data[0]
            dataForm.truename = result.truename
            dataForm.teacherID = result.teacherID
            dataForm.phone = result.phone
            dataForm.email = result.email
            dataForm.office = result.office
            dataForm.teacherrank = result.teacherrank   
          } else {
              that.$data.flag = 1
              const result = res.data.data[0]
              dataForm.truename = result.truename
              dataForm.teacherID = result.teacherID
              dataForm.phone = result.phone
              dataForm.email = result.email
              dataForm.office = result.office
              dataForm.teacherrank = result.teacherrank              
          }
        }).catch( (err) => {
          console.log(err);
        })
  }
```

主要判断逻辑则在后端完成，判断请求的用户用户名`username`,在使用不同的函数查询不同的数据库并放回数据。

```js
// 获得管理员/教师信息
router.get('/teacherInformation', function (req,res) {
    if (req.user.username == 'admin') {
        const findAdminInf = findAdminInformation()
        findAdminInf.then(
            adminInformationization => {
                if (adminInformationization) {
                    new Result(adminInformationization,'获取admin信息成功').success(res)
                } else {
                    new Result('获取admin信息失败').fail(res)
                }
            }
        )
    } else {
        const findTeacherInf = findTeacherInformation(req.user.username)
        findTeacherInf.then(
            teacherInf => {
                if (teacherInf) {
                    new Result(teacherInf,'获取教师信息成功').success(res)
                } else {
                    new Result('获取教师信息失败').fail(res)
                }
            }
        )
    }
})
```

其他和学生信息一致，只有在提交信息修改内容时还需要判断一次flag的值并调用不同的接口:

```js
    onSubmit(){
      // 提示修改信息
      this.change()
      const token = this.header
      // 管理员账号
      if (this.$data.flag === 0)  {
        const trueName = this.$data.form.truename
        const newPhone = this.$data.form.phone
        const newEmail = this.$data.form.email
        const newOffice = this.$data.form.office
        axios({
          url:'http://localhost:18082/information/adminChangeInf',
          method:"post",
          headers:{ Authorization:token.Authorization },
          data:{ trueName,newPhone,newEmail,newOffice }
        }).then( (res) => {
          console.log(res);
        }).catch( (err) => {
          console.log(err);
        })
      } else {
      // 教师
        const trueName = this.$data.form.truename
        const newPhone = this.$data.form.phone
        const newEmail = this.$data.form.email
        const newOffice = this.$data.form.office
        const newTeacherrank = this.$data.form.teacherrank
        axios({
          url:'http://localhost:18082/information/teacherChangeInf',
          method:"post",
          headers:{ Authorization:token.Authorization },
          data:{ trueName,newPhone,newEmail,newOffice,newTeacherrank }
        }).then( (res) => {
          console.log(res);
        }).catch( (err) => {
          console.log(err);
        })
      }
    }
  },
```

# 论文选题

## 选题信息（admin，teacher，student）

无权限限制，但只有学生能点击选题按钮。

管理员/教师判断：通过将按钮的`disabled`属性和`el-tag`中的都绑定该行(数组)中的`istrue`值进行控制:

> ```vue
> <el-tag :type="scope.row.istrue=='可选' ? 'success' : 'danger'" >
>     {{scope.row.istrue}}
> </el-tag>
> ```
>
> `el-tag`绑定`data`中的数据`istrue`，这个三元运算符指：当刚行的`istrue==‘可选’`为真时，该`tag`的`type`就为`sucess`,不为真时则为`danger`。
>
> `el-button`的`disabled`属性则在`istrue`为`不可选`时为真即禁用该按钮。

```vue
          <el-table-column
            prop="isTrue"
            width="180"
            label="当前是否可选">
            <template slot-scope="scope">
            <!-- 三元运算符定义tag的内容 -->
            <el-tag :type="scope.row.istrue=='可选' ? 'success' : 'danger'" >{{scope.row.istrue}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="submit"
            label="确认选择"
            width="180">
            <template slot-scope="scope">
              <el-button 
                  type="primary" 
                  @click="submit(scope.row)" 
                  :disabled="scope.row.istrue== '不可选'"
                >确认选择
              </el-button>
            </template>
          </el-table-column>
```

`istrue`的值有两次改变，默认为空。

第一次是在生命周期函数`beforeMount()`中获取的，与在后端获取到的其他选题信息一样先渲染到页面上。这里的`istrue`是数据库中的值。

```js
  beforeMount(){
      const that = this
      const token = this.header
      axios.get('http://localhost:18082/select/allSelect',{
            // 并保存token到请求头中
            headers:{
              Authorization:token.Authorization
            }
        })
          .then( function (res) {
            //保存到data中
            res.data.data.map( (item) => {
              // 显示数据
              that.$data.allSelect.push(item)
            })
      }).catch( err => { console.log(err); })
  },
```

第二次是在生命周期函数`created()`进行判断，请求后端接口`isStudent`获取当前用户的`role`值。

当`role != 'student'`时遍历`data`中的数组的`istrue`修改为‘不可选’。

> 注意：待解决
>
> 这里并没有修改数据库中的值，而是修改前段页面中渲染的值，因此学生登录时还是能看到可选和非可选的各个选题。
>
> 这里使用了延时函数`setTimeout(function(){},time)`防止在页面数据还未渲染时就执行完这个函数，
>
> 按理说：`mounted（）`生命周期函数只会在`beforeMount()`后执行，但实际上如果不延时，这个操作经常会执行失败,推测与生命周期函数与异步操作之间的先后有关。

```js
  // 判断是否为学生账号,验证修改前端 istrue的值
  mounted(){
      const that = this
      const token = this.header
      axios({
        url:'http://localhost:18082/select/isStudent',
        headers:{ Authorization:token.Authorization }
      }).then( (res) => {
        const role = res.data.data[0].role
        if( role != 'student') {
          setTimeout(function(){
            that.$data.allSelect.forEach((item,index,arr) => {
            item.istrue = '不可选'
          })
          },250)
        } else{
          console.log('可以选择');
        }
      }).catch( (err) => {
        console.log(err);
      })
  }
```

后端验证：将请求时登陆者的账号名做参数，并通过调用函数`ifstudent()`在数据库中获取它的`role`值。

```js
// 判断是否为学生账号
router.get('/isStudent',function(req,res) {
    const ifstudent = ifStudent(req.user.username)
    ifstudent.then( (ifstudent) => {
        if (ifstudent) {
            new Result(ifstudent,'判断学生成功').success(res)
        } else {
            new Result('判断学生失败').fail(res)
        }
    }).catch( (err) => {
        console.log(err);
    })
})
```

数据库判断：获取`user`表中该用户的`role`值。

```js
// 判断是否是学生账号
function ifStudent(username) {
	return querySql(`
	SELECT
		role 
	FROM
		user 
	WHERE
		username = '${ username }'
	`)
}
```

### 学生选题（student）

学生点击按钮，提示是否要选题，确定，提交请求到后台。

判断`studentaccount`中的`username`为`req.user.username`的行`choiceselect`为空。

即判断是否已经选题，若为选题能选题,已选过则报错。

- 前端按钮，当`istrue`为不可选时禁用该按钮。

  ```vue
            <el-table-column
              prop="submit"
              label="确认选择"
              width="180">
              <template slot-scope="scope">
                <el-button 
                    type="primary" 
                    @click="submit(scope.row)" 
                    :disabled="scope.row.istrue== '不可选'"
                  >确认选择
                </el-button>
              </template>
            </el-table-column>
  ```

- 点击后调用的函数`submit()`，参数`row`该行数据。

  点击后调用提示框`this.$confirm`，点击取消则调用`this.$message.info('取消选题')  `，输出提示：取消选题。

  ```js
  
  // 选题
      submit(row) {
            this.$confirm(`注意一个学生一次只选择一个选题，这次将选择选题: ${row.title}, 是否继续?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            const token = this.header
            axios({
              url:'http://localhost:18082/select/choiceSelect',
              method:'post',
              headers:{ Authorization:token.Authorization },
              data:{ row }
            }).then((res) => {
              if(res.data == '不能重复选题' ){
                this.$message({
                  type:'error',
                  message:`${res.data}`
                })
              } else {
                this.$message({
                type: 'success',
                message:`${res.data},请刷新页面`
              });
              } 
            }).catch((err) => {
              console.log(err);
            })
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '取消选题'
            });          
          })
        }
  ```

- 点击确认则请求端口`select/choiceSelect`。

- 调用sql语句。更新选题表、学生账号表中该行的课题中`select_table.title = '${title}'`的已选学生`select_table.choicestudent = '${username}',`和当前登录学生行`studentaccount.username = '${username}'`中的已选课题`studentaccount.choiceselect = '${title}'`并将选题状态置为不可选`select_table.istrue = '不可选',`，条件是已选学生和已选课题均为空。`AND studentaccount.choiceselect IS NULL AND select_table.choicestudent IS NULL`

- 在后端调用sql语句之后，判断响应中的`affectedROWs`是否为0，若为0则表示这次选择不符合查询条件，即已选过选题或选题出现问题,响应给前端`res.send("不能重复选题")`，否则表示修改成功`res.send("选题成功")`。

  > 注意：
  >
  > MySql中where有多个判断条件时要使用`AND`相连。
  >
  > 判断一行是否为空时要使用`IS`判断。
  >
  > 响应时不能只响应数字，会被当作状态码处理。即`res.send(0)`时，0会被当作状态码处理而报错。
  >
  > 这里有2次异步请求。调用接口是一次异步请求，调用sql语句是一次，因此不能重复使用`res`。

  ```js
  // 学生选题
  router.post('/choiceSelect',function(req,res) {
      choiceSelect(req.user.username,req.body.row.title)
      .then( (response) => {
          // 调用sql语句之后影响行数为0
          if (response.affectedRows === 0) {
              res.send("不能重复选题")
          } else {
              res.send("选题成功")
          }
      }).catch( (err) => {
          console.log(err);
      })
  })
  ```

  ```js
  // 学生选题，更新选题表和学生表
  function choiceSelect(username,title){
  	return querySql(`
  	UPDATE select_table,studentaccount
  	SET select_table.choicestudent = '${username}',
  		select_table.istrue = '不可选',
  		studentaccount.choiceselect = '${title}'
  	WHERE
  		select_table.title = '${title}'
  		AND select_table.choicestudent IS NULL
  		AND studentaccount.username = '${username}'
  		AND studentaccount.choiceselect IS NULL
  	`)
  }
  ```

## 提交选题（admin，teacher）

同样因为管理员账号能够访问所有的动态路由，这里也采用了学生个人信息页面的方式，当管理员点击时提交选题时，就会判断请求者的账号名，若为`user`则将自动重定向到页面`selcet/errorselect`。若不是则能请求到数据并渲染页面。

提交选题其他部分则与修改个人信息类似。

## 我的选题（教师）（admin，teacher）

生命周期函数请求接口`select/teachersSelect`,请求接口的sql语句如下：

```js
// 查看教师的选题结果
/*
* 	查询的结果为选题表中该教师的选题（WHERE teacheraccount = '${teachername}';），所需专业，当前选中（LEFT OUTER JOIN studentaccount ON select_table.choicestudent = studentaccount.username）的学生姓名（studentaccount.truename）
*/
function teacherSelect(teachername) {
	return querySql(`
		SELECT
			select_table.title,
			select_table.major,
			studentaccount.truename 
		FROM
			select_table 
		LEFT OUTER JOIN studentaccount ON select_table.choicestudent = studentaccount.username
		WHERE
			teacheraccount = '${teachername}';

	`)
}
```

- 点击查看详情按钮 手风琴效果

因为选题表中的`teacheraccount`中没有`admin`的值且`admin`不能访问提交选题页面，因此当`admin`访问该页面时，不会有任何数据返回，解决了`admin`权限问题。

这里要修改elementUI组建中的`table expand`组件，参见：https://element.eleme.cn/#/zh-CN/component/table#zhan-kai-xing，https://my.oschina.net/u/4320032/blog/3726650

> 官方文档：
>
> toggleRowExpansion：用于可展开表格与树形表格，切换某一行的展开状态，如果使用了第二个参数，则是设置这一行展开与否（expanded 为 true 则展开），参数：row, expanded



尝试：

设置表格的`ref="topicTable" :row-key="getRowKeys"`，

设置点击按钮之后的函数

```vue
            <template slot-scope="scope">
              <el-button 
                  type="primary" 
                  @click="show(scope.row)" 
                  :disabled="scope.row.truename== null"
                >查看学生信息
              </el-button>
            </template>
```

```js
    show(row) {
      this.$refs.topicTable.toggleRowExpansion(row, true) // 点击button展开
    }
```

报错，提示函数`toggleRowExpansion`未在实例上未定义

```js
vue.runtime.esm.js?6e6d:619 [Vue warn]: Property or method "toggleRowExpansion" is not defined on the instance but referenced during render. Make sure that this property is reactive, either in the data option, or for class-based components, by initializing the property. See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.

vue.runtime.esm.js?6e6d:619 [Vue warn]: Error in v-on handler: "TypeError: _vm.toggleRowExpansion is not a function"

vue.runtime.esm.js?6e6d:1888 TypeError: _vm.toggleRowExpansion is not a function
    at click 
```

参见：https://my.oschina.net/u/4407741/blog/3253793进行修改，

先打印相关信息

```js
    showmore(row){
      console.log(row);
      console.log(this.$refs.topicTable); 
    }
```

结果

```
{__ob__: Observer} teacherSelect.vue?d312:87 
VueComponent {_uid: 79, _isVue: true, $options: {…}, _renderProxy: Proxy, _self: VueComponent, …}
```

> 在vue实例中能找到这个方法：
>
> 1. toggleRowSelection: *ƒ ()*
>
> 2. 1. arguments: (...)
>    2. caller: (...)
>    3. length: 2
>    4. name: "bound toggleRowSelection"
>    5. __proto__: *ƒ ()*
>    6. *[[TargetFunction]]*: *ƒ toggleRowSelection(row, selected)*
>    7. *[[BoundThis]]*: VueComponent
>    8. *[[BoundArgs]]*: Array(0)
>
> 3. tooltipEffect: undefined

尝试实现

```js
    showmore(row){
      console.log(row);
      let $table = this.$refs.topicTable
      $table.toggleRowExpansion(row)
    }
```

成功。

将默认显示的小 > 去掉

> 参见：因为我设置了<el-table-column type="expand" width="1"></el-table-column> 会多出1px的边距，所以我们可以再在最外层放一个空的div，设置样式overflow:hidden；
> 再设置此table的样式margin-left:1px；好了，完美实现。（自己的项目中没有遇到1px影响效果的情况，可以直接设置宽度为1px即可）

```vue
      <!-- 手风琴效果 -->
          <div class="top">
              <el-table-column type="expand" width="1" class="over">
                <template slot-scope="props">
                  <el-form label-position="left" inline class="demo-table-expand">
                    <el-form-item label="选择课题学生姓名">
                      <span> {{ props.row.truename }}</span>
                    </el-form-item>
                  </el-form>
                </template>
              </el-table-column>
          </div>
```

```css
  .top{
    overflow: hidden;
  }
  .over{
    margin-left: 1px;
  }
```

发现无效，检察元素，发现箭头类名为`class="el-table__expand-icon"`

设置元素样式：

```css
  .el-table__expand-icon{
    visibility: hidden
  }
```

- 取消选择按钮，和查看选中学生详情按钮一致，`disabled`属性绑定到当前行的`truename`不为空：

  > :disabled="scope.row.truename== null"

  点击按钮=>前端提示=> 调用接口 => 修改数据库

  将`select_table`当前选题（`title`）中的`choicestudent`置空。

  将`studentaccount`表中的`choiceselect`置空。

  ```mysql
  UPDATE select_table 
  SET choicestudent = NULL,
  istrue = '可选' 
  WHERE
  	title = '${selectTitle}';
  UPDATE studentaccount
  SET choiceselect = NULL
  WHERE
  	choiceselect = '${selectTitle}'
  ```

- 删除选题按钮：当没有人选中时才能删除选题，即当前行的`truename`不为空时

  > :disabled="scope.row.truename != null"

  其他与删除选题大致相同。
  
- 确认选中，同上。

## 我的选题（学生）

无权限控制，但在前端设置默认值为null，当为学生且有选中的选题时才会展示当前选中的选题以及最终的选题结果。



# 遇到的问题

错误：只能访问`http://127.0.0.1:18082/`请求其他都没有响应。

解决：少写了`app.use(router)`



错误：出现跨域问题

```
Access to XMLHttpRequest at 'http://localhost:18082/user/login' from origin 'http://localhost:9527' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

解决：设置`Access-Control-Allow-Origi：*；`

```
// 解决跨域问题
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By",' 3.2.1')
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});
```



错误：前端发送请求，响应为err，状态码为500，报错信息：

```
code: -1
error: 500
errorMsg: "admin is not defined"
msg: "admin is not defined"
```

```javascript
xhr.js?eda7:160 POST http://localhost:18082/user/login 500 (Internal Server Error)
request.js?b775:53 errError: Request failed with status code 500
```

发现`req.body`为`undefined`，可能是无法分析req内容导致响应错误。

解决顺序问题：应为      

```javascript
const app = express()

app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(router)
```

 再次请求发现`req.body`显示正确，但错误状态码 还是500，并报错admin未定义，发现if判断条件应写作字符串，并要new一个Result类之后使用sucess，fail方法。

报错提示sucess不是方法

`code: -1
error: 500
errorMsg: "(intermediate value).sucesss is not a function"
msg: "(intermediate value).sucesss is not a function"`

解决：sucess多打了s



错误：`missing ) after argument list`:不应该写`sql：`,应该直接写sql语句。



错误：npm下载报错

```
PS D:\learn\vue-element-admin> npm i -S express-jwt
npm ERR! Maximum call stack size exceeded

npm ERR! A complete log of this run can be found in:
npm ERR!     C:\Users\Rie\AppData\Roaming\npm-cache\_logs\2021-02-06T07_46_31_194Z-debug.log
```

解决：更新npm版本命令：

```
npm install npm -g
cnpm install npm -g
```



服务端使用jwt失败

```shell
PS D:\learn\admin-imooc-node> node .\app.js
D:\learn\admin-imooc-node\node_modules\_express-jwt@6.0.0@express-jwt\lib\index.js:22
  if (!options.algorithms) throw new Error('algorithms should be set');
                           ^

Error: algorithms should be set
    at module.exports (D:\learn\admin-imooc-node\node_modules\_express-jwt@6.0.0@express-jwt\lib\index.js:22:34)
    at Object.<anonymous> (D:\learn\admin-imooc-node\router\jwt.js:4:17)
    at Module._compile (internal/modules/cjs/loader.js:1063:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:1092:10)
    at Module.load (internal/modules/cjs/loader.js:928:32)
    at Function.Module._load (internal/modules/cjs/loader.js:769:14)
    at Module.require (internal/modules/cjs/loader.js:952:19)
    at require (internal/modules/cjs/helpers.js:88:18)
    at Object.<anonymous> (D:\learn\admin-imooc-node\router\index.js:7:18)
    at Module._compile (internal/modules/cjs/loader.js:1063:30)
```

解决：2020.7.7日jwt更新之后，安装的express-jwt模块会默认为6.0.0版本，更新后的jwt需要在配置中加入algorithms属性，即设置jwt的算法。一般HS256为配置algorithms的默认值：

```
const expressJwt = require('express-jwt');
const { PRIVATE_KEY } = require('../utils/constant');

const jwtAuth = expressJwt({
  secret: PRIVATE_KEY,
  algorithms:['HS256'],
  // 设置为false就不进行校验了，游客也可以访问
  credentialsRequired: true 
}).unless({
// 设置 jwt 认证白名单
  path: [
    '/',
    '/user/login'
  ], 
});

module.exports = jwtAuth;
```



错误：

```shell
{code: -1, msg: "res.json is not a function", error: 500, errorMsg: "res.json is not a function"}
code: -1
error: 500
errorMsg: "res.json is not a function"
msg: "res.json is not a function"
```

`req,res`顺序写反

```shell
router.get('/info', function(res,req,next) {
  res.json('user info...')
})
```

应该为

```shell
router.get('/info', function(req,res,next) {
  res.json('user info...')
})
```

 错误：验证`user/info`token验证之后，登录报错

```shell
PS D:\learn\admin-imooc-node> node .\app.js
Http Server is running on 18082
select * from user where username='admin' and password='admin'
查询成功 [{"id":3,"username":"admin","password":"admin","role":"admin","avatar":null}]
{
  code: 0,
  msg: '登录成功',
  data: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNjEyNjA0NDE4LCJleHAiOjE2MTI2MDgwMTh9.c7tSs8nzqRclXPrlTl0CIgr0Qi5yDEdWEtiZyf_2i9Q'
  }
}
{
  code: -1,
  msg: "Cannot access 'decode' before initialization",
  error: 500,
  errorMsg: "Cannot access 'decode' before initialization"
}
```

解决：因为在变量未初始化的情况下就访问变量，`decoded`少打了个ed，

```js
if(token.indexOf('Bearer') === 0)
```

少写`===`,少写`let token = ''`



错误：一直访问`http://localhost:18082/`接口

解决：axios.get('http://localhost:18082/notice/shownotice') 去掉’#‘



错误：服务器端提示`{ code: -2, msg: 'token请求错误', error: 401, errMsg: 'UnauthorizedError' }`

解决：

login:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNjEzODAxNzM4LCJleHAiOjE2MTM4MDUzMzh9.FXqYctUrIBKlDKdb_TrtEZjGFRFYM4aDWU3efCX-B5w
```

notice/shownotice:

```
token: BearereyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNjEzODAxMzIyLCJleHAiOjE2MTM4MDQ5MjJ9.YBPxcTHrUhZJlPmMY_aSupkzzZ4T-f2y2Za9p_TCOYE
```

修改为

```js
// 并保存token到请求头中
headers:{
    Authorization:token.Authorization
}})
```



错误：钩子函数`mounted`不执行函数`this.getList()`

不能打印this.getList()，将测试数据添加发现函数正常执行，证明函数能够正常执行。

```js
    methods:{
      getList(){
        this.$data.list.push(
          // 测试数据
          {
          noticeTime: '2009-11-01 15:58:09',
          noticeTitle: '本科毕业设计（论文）学生题目申报指南 ',
          content: '学生可以申报的本科毕业设计（论文）题目分为“学生自选题目”和“外单位毕设题目”两种类型'
          }
        )
      }
    },
```

说明函数正常执行了，但不能取到`req`的数据。在钩子函数中将`req.data.data导出`再getList函数打印，发现不会执行，改为在钩子函数中直接执行读取数据。



错误：能够取得并查看this.$data中的数据，但打印`this.$data.noticeData`时会变成undefined。

解决：要在回调函数内进行遍历，这样回调函数返回数组数据的顺序和执行遍历的顺序就会一致，因此就不存在异步操作所产生的问题。



错误：msgBox不够长，有的内容无法显示。

解决：添加属性：`overflow: scroll;`隐藏底部滑动条`overflow-x:hidden`

  

错误：sql语句执行失败，传入参数不对 

解决：node sql 语句传入参数写法 用 `${}`,

例子：

```js
// 登录验证用户
let loginVerification = function (  name , password ) {
  let _sql = `SELECT * from users where userName= "${name}" and pass = "${password}"` ;
  return query( _sql)
}
```



错误：添加公告能够打印出信息，会报错

```shell
PS D:\learn\admin-imooc-node> node .\app.js
Http Server is running on 18082
title zheshicontent
INSERT INTO notice VALUES (id,title,Now(),zheshicontent)
查询失败，原因:{"code":"ER_BAD_FIELD_ERROR","errno":1054,"sqlMessage":"Unknown column 'title' in 'field list'","sqlState":"42S22","index":0,"sql":"INSERT INTO notice VALUES (id,title,Now(),zheshicontent)"}
(node:8916) UnhandledPromiseRejectionWarning: Error: ER_BAD_FIELD_ERROR: Unknown column 'title' in 'field list'
    at Query.Sequence._packetToError (D:\learn\admin-imooc-node\node_modules\mysql\lib\protocol\sequences\Sequence.js:47:14)
    at Query.ErrorPacket (D:\learn\admin-imooc-node\node_modules\mysql\lib\protocol\sequences\Query.js:79:18)
    at Protocol._parsePacket (D:\learn\admin-imooc-node\node_modules\mysql\lib\protocol\Protocol.js:291:23)
    at Parser._parsePacket (D:\learn\admin-imooc-node\node_modules\mysql\lib\protocol\Parser.js:433:10)
    at Parser.write (D:\learn\admin-imooc-node\node_modules\mysql\lib\protocol\Parser.js:43:10)
    at Protocol.write (D:\learn\admin-imooc-node\node_modules\mysql\lib\protocol\Protocol.js:38:16)
    at Socket.<anonymous> (D:\learn\admin-imooc-node\node_modules\mysql\lib\Connection.js:88:28)
    at Socket.<anonymous> (D:\learn\admin-imooc-node\node_modules\mysql\lib\Connection.js:526:10)
    at Socket.emit (events.js:315:20)
    at addChunk (internal/streams/readable.js:309:12)
    --------------------
    at Protocol._enqueue (D:\learn\admin-imooc-node\node_modules\mysql\lib\protocol\Protocol.js:144:48)
    at Connection.query (D:\learn\admin-imooc-node\node_modules\mysql\lib\Connection.js:198:25)
    at D:\learn\admin-imooc-node\db\index.js:20:16
    at new Promise (<anonymous>)
    at querySql (D:\learn\admin-imooc-node\db\index.js:18:14)
    at D:\learn\admin-imooc-node\db\index.js:39:7
    at new Promise (<anonymous>)
    at queryOne (D:\learn\admin-imooc-node\db\index.js:38:12)
    at addNotice (D:\learn\admin-imooc-node\service\notice.js:11:10)
    at D:\learn\admin-imooc-node\router\notice.js:26:3
(Use `node --trace-warnings ...` to show where the warning was created)
(node:8916) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). To terminate the node process on unhandled promise rejection, use the CLI flag `--unhandled-rejections=strict` (see https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode). (rejection id: 1)
(node:8916) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
```

```shell
UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). To terminate the node process on unhandled promise rejection, use the CLI flag `--unhandled-rejections=strict` (see https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode). (rejection id: 1)
(node:8916) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
```

没有捕获异常，修改，重新查看报错信息。

```shell
PS D:\learn\admin-imooc-node> node .\app.js
Http Server is running on 18082
INSERT INTO notice VALUES (id,title,Now(),zheshicontent)
查询失败，原因:{"code":"ER_BAD_FIELD_ERROR","errno":1054,"sqlMessage":"Unknown column 'title' in 'field list'","sqlState":"42S22","index":0,"sql":"INSERT INTO notice VALUES (id,title,Now(),zheshicontent)"}
Error: ER_BAD_FIELD_ERROR: Unknown column 'title' in 'field list'
    at Query.Sequence._packetToError (D:\learn\admin-imooc-node\node_modules\mysql\lib\protocol\sequences\Sequence.js:47:14)
    at Query.ErrorPacket (D:\learn\admin-imooc-node\node_modules\mysql\lib\protocol\sequences\Query.js:79:18)
    at Protocol._parsePacket (D:\learn\admin-imooc-node\node_modules\mysql\lib\protocol\Protocol.js:291:23)
    at Parser._parsePacket (D:\learn\admin-imooc-node\node_modules\mysql\lib\protocol\Parser.js:433:10)
    at Parser.write (D:\learn\admin-imooc-node\node_modules\mysql\lib\protocol\Parser.js:43:10)
    at Protocol.write (D:\learn\admin-imooc-node\node_modules\mysql\lib\protocol\Protocol.js:38:16)
    at Socket.<anonymous> (D:\learn\admin-imooc-node\node_modules\mysql\lib\Connection.js:88:28)
    at Socket.<anonymous> (D:\learn\admin-imooc-node\node_modules\mysql\lib\Connection.js:526:10)
    at Socket.emit (events.js:315:20)
    at addChunk (internal/streams/readable.js:309:12)
    --------------------
    at Protocol._enqueue (D:\learn\admin-imooc-node\node_modules\mysql\lib\protocol\Protocol.js:144:48)
    at Connection.query (D:\learn\admin-imooc-node\node_modules\mysql\lib\Connection.js:198:25)
    at D:\learn\admin-imooc-node\db\index.js:20:16
    at new Promise (<anonymous>)
    at querySql (D:\learn\admin-imooc-node\db\index.js:18:14)
    at D:\learn\admin-imooc-node\db\index.js:39:7
    at new Promise (<anonymous>)
    at queryOne (D:\learn\admin-imooc-node\db\index.js:38:12)
    at addNotice (D:\learn\admin-imooc-node\service\notice.js:10:10)
    at D:\learn\admin-imooc-node\router\notice.js:26:3 {
  code: 'ER_BAD_FIELD_ERROR',
  errno: 1054,
  sqlMessage: "Unknown column 'title' in 'field list'",
  sqlState: '42S22',
  index: 0,
  sql: 'INSERT INTO notice VALUES (id,title,Now(),zheshicontent)'
}
```

主要错误信息：`Error: ER_BAD_FIELD_ERROR: Unknown column 'title' in 'field list'`

查到有人说是字符类型不同导致，使用`typeof（）`打印2个值的类型，均为`string`。数据库中的两个值的类型为`varchar`和`text`。

再次修改sql语句，

```js
function addNotice(newTitle,newContent) {
  // 插入语句
  return queryOne(`INSERT INTO notice VALUES (id,'${newTitle}',Now(),'${newContent}')`)
}
```

执行成功。



错误：不能判断textarea和title是否为空

解决：发现一开始自己初始化值的时候写的是`textareaContent:''`修改为`textareaContent:null`

 错误：请求接口 `http://localhost:18082/notice/deleteNotice`报错，错误信息

```js
{code: -2, msg: "请求过时", error: 401, errMsg: "UnauthorizedError"}
code: -2
errMsg: "UnauthorizedError"
error: 401
msg: "请求过时"
```

解决：查看请求头，发现没有token`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNjE0MTM5MDk4LCJleHAiOjE2MTQxNDI2OTh9.Q-aWByDbBt1Vw4UempCE93dGysZ7aW7hxqo3fISZBvM`

​	查看源代码

```js
      deleteNotice(index,row){
        const deleteTitle = row.noticeTitle
        this.$alert(`是否要删除公告:${deleteTitle}`, '删除公告', {
          confirmButtonText: '确定删除'
        }).then ( (deleteTitle) =>{
            // 获取当前的token
            const token = this.header
            axios({
              url:'http://localhost:18082/notice/deleteNotice',
              method:"post",
              header:{
                Authorization:token.Authorization
              },
              data:{deleteTitle}
            }).then ( (res) => {
              console.log(res);
            }).catch( (err) => {
              console.log(err);
            })
        });
      },
```

发现header少写了s



错误：更新密码接受到参数，但前端报错`axios__WEBPACK_IMPORTED_MODULE_1___default(...)(...).then(...).catc is not a function`

解决：catch少写了h



错误：无法获取提交的学生的学院和专业信息。

解决：csdn说这样可以获取到label的值，结果只能获得专业信息。

```html
          <el-form-item label="专业" >
            <el-cascader
            ref="zhuangye"
            placeholder="专业"
            :options="newStudentForm.options"
            filterable></el-cascader>
```

```js
// 获取到专业名（第二级）
console.log(this.$refs['zhuangye'].getCheckedNodes()[0].data.label)

```

```vue
{
          value: '信息工程学院',
          label: '信息工程学院',
          children: [{
            value: '信息工程学院/软件工程',
            label: '软件工程'
          }, {
            value: '信息工程学院/软件工程(嵌入式)',
            label: '软件工程(嵌入式)',
          }]
          } 
```

获取内容

```js
 const newStudentMagor = this.$refs['zhuangye'].getCheckedNodes()[0].data.value
```

结果：信息工程学院/软件工程

交给后端处理，分割字符串并传递给数据库。

```js
router.post('/addStudentAccount',function(req,res){
    const newSAccount = req.body.newSAccount
    const newSPassword = req.body.newSPassword
    const newSName = req.body.newSName
    const newStudentID = req.body.newStudentID
    const newStudentClassID = req.body.newStudentClassID
    const newStudentCollage = req.body.newStudentMajor.split('/')[0]
    const newStudentMajor  = req.body.newStudentMajor.split('/')[1]
    newStudentAccount(newSAccount,newSPassword,newSName,newStudentID,newStudentClassID,newStudentCollage,newStudentMajor)
    .then((res) => {
        console.log(res);
    }).catch( (err) => { 
        console.log(err);
    })
})
```

获取到结果：信息工程学院 软件工程

运行数据库报错，报错信息

```shell
PS D:\learn\admin-imooc-node> node .\app.js
Http Server is running on 18082
信息工程学院 软件工程

  INSERT INTO studentaccount (username,password,truename,studentID,classID,college,major)
  VALUES ('123321', '12441','124211','null',
  'null','信息工程学院,'软件工程'');
  INSERT INTO user (username,password,role) VALUES ('123321', '12441','student')

查询失败，原因:{"code":"ER_PARSE_ERROR","errno":1064,"sqlMessage":"You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near '软件工程'');\n  INSERT INTO user (username,password,role) VALUES ('123321', '' at line 3","sqlState":"42000","index":0,"sql":"\n  
INSERT INTO studentaccount (username,password,truename,studentID,classID,college,major) \n  VALUES ('123321', '12441','124211','null',\n  'null','信息工程学院,'软件工
程'');\n  INSERT INTO user (username,password,role) VALUES ('123321', '12441','student')\n  "}
Error: ER_PARSE_ERROR: You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near '软件工程
'');
  INSERT INTO user (username,password,role) VALUES ('123321', '' at line 3
    at Query.Sequence._packetToError (D:\learn\admin-imooc-node\node_modules\mysql\lib\protocol\sequences\Sequence.js:47:14)
    at Query.ErrorPacket (D:\learn\admin-imooc-node\node_modules\mysql\lib\protocol\sequences\Query.js:79:18)
    at Protocol._parsePacket (D:\learn\admin-imooc-node\node_modules\mysql\lib\protocol\Protocol.js:291:23)
    at Parser._parsePacket (D:\learn\admin-imooc-node\node_modules\mysql\lib\protocol\Parser.js:433:10)
    at Parser.write (D:\learn\admin-imooc-node\node_modules\mysql\lib\protocol\Parser.js:43:10)
    at Protocol.write (D:\learn\admin-imooc-node\node_modules\mysql\lib\protocol\Protocol.js:38:16)
    at Socket.<anonymous> (D:\learn\admin-imooc-node\node_modules\mysql\lib\Connection.js:88:28)
    at Socket.<anonymous> (D:\learn\admin-imooc-node\node_modules\mysql\lib\Connection.js:526:10)
    at Socket.emit (events.js:315:20)
    at addChunk (internal/streams/readable.js:309:12)
    --------------------
    at Protocol._enqueue (D:\learn\admin-imooc-node\node_modules\mysql\lib\protocol\Protocol.js:144:48)
    at Connection.query (D:\learn\admin-imooc-node\node_modules\mysql\lib\Connection.js:198:25)
    at D:\learn\admin-imooc-node\db\index.js:20:16
    at new Promise (<anonymous>)
    at querySql (D:\learn\admin-imooc-node\db\index.js:18:14)
    at D:\learn\admin-imooc-node\db\index.js:39:7
    at new Promise (<anonymous>)
    at queryOne (D:\learn\admin-imooc-node\db\index.js:38:12)
    at newStudentAccount (D:\learn\admin-imooc-node\service\account.js:16:10)
    at D:\learn\admin-imooc-node\router\studentAccount.js:39:5 {
  code: 'ER_PARSE_ERROR',
  errno: 1064,
  sqlMessage: "You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near '软件工程'');\n" 
+
    "  INSERT INTO user (username,password,role) VALUES ('123321', '' at line 3",
  sqlState: '42000',
  index: 0,
  sql: '\n' +
    '  INSERT INTO studentaccount (username,password,truename,studentID,classID,college,major) \n' +
    "  VALUES ('123321', '12441','124211','null',\n" +
    "  'null','信息工程学院,'软件工程'');\n" +
    "  INSERT INTO user (username,password,role) VALUES ('123321', '12441','student')\n" +
    '  '
}
```

sql语句最后多复制了一个`'`前面少了个`'`,至此整个问题解决。



错误：无法显示教师工号信息

解决：发现后端打印数据没有问题，检查前端。

前端信息展示：

```vue
          <el-form-item label="工号">
            <span>{{ props.row.newTeacherID }}</span>
          </el-form-item>
```

数据定义

```js
	 	return {
        newTeacherForm: {
          newAccount: null,
          newPassword: null,
          newName:null,
          newTeacherID:null,
        },
```

获取数据

```vue
    // 查询数据
    beforeMount() {
      const that = this
      const token = this.header
      // 请求后端数据
      axios.get('http://localhost:18082/TeacherAccount/showTeacherAccount',{
            // 并保存token到请求头中
            headers:{ Authorization:token.Authorization }
        }).then( function (res) {
            //保存到data中
            res.data.data.map( (item) => {
              // 显示数据
              that.$data.tableData.push(item)
            })
      }).catch( err => { console.log(err); })
  },
```

前端接收数据也没有问题，检查发现前端绑定的数据错误.

修改为

```vue
          <el-form-item label="工号">
            <span>{{ props.row.teacherID }}</span>
          </el-form-item>
```

 

添加教师账号无效，检查前端，发现发送数据成功，检查后端，打印出req中的数据

```js
router.post('/addTeacherAccount',function(req,res){
    const newTAccount = req.body.newTAccount
    const newTPassword = req.body.newTPassword
    const newTName = req.body.newTName
    const newTeacherID = req.body.newTeacherID
    console.log(newTAccount,newTPassword,newTName,newTeacherID);
    newTeacherAccount(newTAccount,newTPassword,newTName,newTeacherID).then((res) => {
        console.log(res);
    }).catch( (err) => { 
        console.log(err);
    })
})
```

后端报错，并打印出req中的内容

```shell
PS D:\learn\admin-imooc-node> node .\app.js
Http Server is running on 18082
账号 1234 214241 124241241

  INSERT INTO teacherAccount (username,password,truename,teacherID) VALUES ('账号', '1234','214241','124241241');
  INSERT INTO user (username,password,role) VALUES ('账号', '1234','teacher')

查询失败，原因:{"code":"ER_NO_DEFAULT_FOR_FIELD","errno":1364,"sqlMessage":"Field 'id' doesn't have a default value","sqlState":"HY000","index":0,"sql":"\n  INSERT INTO teacherAccount (username,password,truename,teacherID) VALUES ('账号', '1234','214241','124241241');\n  INSERT INTO user (username,password,role) VALUES ('账号', '1234','teacher')\n  "}
Error: ER_NO_DEFAULT_FOR_FIELD: Field 'id' doesn't have a default value
    at Query.Sequence._packetToError (D:\learn\admin-imooc-node\node_modules\mysql\lib\protocol\sequences\Sequence.js:47:14)
    at Query.ErrorPacket (D:\learn\admin-imooc-node\node_modules\mysql\lib\protocol\sequences\Query.js:79:18)
    at Protocol._parsePacket (D:\learn\admin-imooc-node\node_modules\mysql\lib\protocol\Protocol.js:291:23)
    at Parser._parsePacket (D:\learn\admin-imooc-node\node_modules\mysql\lib\protocol\Parser.js:433:10)
    at Parser.write (D:\learn\admin-imooc-node\node_modules\mysql\lib\protocol\Parser.js:43:10)
    at Protocol.write (D:\learn\admin-imooc-node\node_modules\mysql\lib\protocol\Protocol.js:38:16)
    at Socket.<anonymous> (D:\learn\admin-imooc-node\node_modules\mysql\lib\Connection.js:88:28)
    at Socket.<anonymous> (D:\learn\admin-imooc-node\node_modules\mysql\lib\Connection.js:526:10)
    at Socket.emit (events.js:315:20)
    at addChunk (internal/streams/readable.js:309:12)
    --------------------
    at Protocol._enqueue (D:\learn\admin-imooc-node\node_modules\mysql\lib\protocol\Protocol.js:144:48)
    at Connection.query (D:\learn\admin-imooc-node\node_modules\mysql\lib\Connection.js:198:25)
    at D:\learn\admin-imooc-node\db\index.js:20:16
    at new Promise (<anonymous>)
    at querySql (D:\learn\admin-imooc-node\db\index.js:18:14)
    at D:\learn\admin-imooc-node\db\index.js:39:7
    at new Promise (<anonymous>)
    at queryOne (D:\learn\admin-imooc-node\db\index.js:38:12)
    at newTeacherAccount (D:\learn\admin-imooc-node\service\account.js:45:10)
    at D:\learn\admin-imooc-node\router\teacherAccount.js:35:5 {
  code: 'ER_NO_DEFAULT_FOR_FIELD',
  errno: 1364,
  sqlMessage: "Field 'id' doesn't have a default value",
  sqlState: 'HY000',
  index: 0,
  sql: '\n' +
    "  INSERT INTO teacherAccount (username,password,truename,teacherID) VALUES ('账号', '1234','214241','124241241');\n" +
    "  INSERT INTO user (username,password,role) VALUES ('账号', '1234','teacher')\n" +
    '  '
}
```

查看提示信息：提示ID没有默认值

```shell
原因:{"code":"ER_NO_DEFAULT_FOR_FIELD","errno":1364,"sqlMessage":"Field 'id' doesn't have a default value","sqlState":"HY000","index":0,"sql":"\n  INSERT INTO teacherAccount (username,password,truename,teacherID) VALUES ('账号', '1234','214241','124241241');\n  INSERT INTO user (username,password,role) VALUES ('账号', '1234','teacher')\n  "}
```

查询失败，修改sql语句

```js
function newTeacherAccount(newTAccount,newTPassword,newTName,newTeacherID){
  return queryOne(`
  INSERT INTO teacherAccount (id,username,password,truename,teacherID) VALUES (id,'${newTAccount}', '${newTPassword}','${newTName}','${newTeacherID}');
  INSERT INTO user (id,username,password,role) VALUES (id,'${newTAccount}', '${newTPassword}','teacher')
  `)
}
```

错误：

```shell
  code: 'ER_DUP_ENTRY',
  errno: 1062,
  sqlMessage: "Duplicate entry '0' for key 'select_table.PRIMARY'",
  sqlState: '23000',
  index: 0,
  sql: '   INSERT INTO select_table (id,title,teachername,major,content,istrue,personnumber)\n' +
    "            VALUES (id, '浅谈信息技术对未来医学教育的影响', '张三', '信息工程学院/软件工程(嵌入式)', '（1）采用了JSP技术 和Web前端技术\n" +
    '（2）使用My SQL或者SQL Server实现用户数据信息的存储和管理； \n' +
    '（3）服务器采用了占用内存较小的轻量服务器Tomcat； \n' +
    '（4）使用软件工程技术实现对系统开发过程的管理。\n' +
    "', '1','3') \n" +
    '        '
}
```

没有设置id自增



错误：无法获取到当前列的信息

动态绑定`el-tag`的`type`，帮助用户判断当前课题是否可选。使用插槽。

```vue
            <template slot-scope="scope">
            <!-- 三元运算符定义tag的内容 -->
            <el-tag :type="isTrue=='可选' ? 'success' : 'danger'" >{{scope.row.isTrue}}</el-tag>
            </template>
```



问题：通过选题表中的教师信息查找到教师表中的信息

```js
function allSelect() {
    return querySql(`SELECT title,teachername,major,content,istrue FROM select_table`)
}
```

只能查找到select_table中的内容，还需要`teacheraccount`中`teachername`相同的行的`phone,email,teacherrank`信息。

使用左连接查询

```js
SELECT
	select_table.title,
	select_table.teachername,
	select_table.major,
	select_table.content,
	select_table.istrue,
	teacheraccount.phone,
	teacheraccount.email,
	teacheraccount.teacherrank
FROM
	select_table
	LEFT OUTER JOIN teacheraccount ON select_table.teachername = teacheraccount.truename;
```



错误：点击选择时查询该点击的用户是否为学生,先查詢數據庫中的表中的數據，如果不存在，則會返回一個長度為0的數組。再判斷數組長度之後，發送不同的res。

```js
function ifStudendtAccount(username) {
	return querySql(`
		select * from studentaccount where username ='${username}';
	`)
}
```

```js
router.post('/choiceSelect',function(req,res) {
    ifStudendtAccount(req.user.username).then( (res) =>{
        if(res.length === 0){
            res.send('非学生账号，无法选择选题')
        } else {
            res.send(1)
            console.log('學生賬號');
        }
    }).catch( (err) => {
        console.log(err);
    })
})
```

报错：

```shell
PS D:\learn\admin-node> node .\app.js
Http Server is running on 18082

                select * from studentaccount where username ='admin';

查询成功
TypeError: res.send is not a function
    at D:\learn\admin-node\router\select.js:53:17
    at processTicksAndRejections (internal/process/task_queues.js:93:5)

```

两个异步请求的res不能相同

解决：修改其中一个的形参，避免重复。

```js
router.post('/choiceSelect',function(req,res) {
    ifStudendtAccount(req.user.username).then( (response) =>{
        if(response.length === 0){
            res.send('非学生账号，无法选择选题')
        } else {
            res.send(1)
            console.log('學生賬號');
        }
    }).catch( (err) => {
        console.log(err);
    })
})
```

错误：删除选题，点击无效

解决：检查`methods`中的方法名和点击时的方法名。发现一致。

修改函数名为`deleteselect`，`delete`是保留字。



错误：sql数据更新不能判断到数据

解决：[Mysql命令-以NULL做where条件过滤时应该写 IS NULL;](https://www.cnblogs.com/xiaozong/p/5269840.html)



错误：执行sql语句报错`ERR_HTTP_INVALID_STATUS_CODE`

解决：send()中的参数如果为数字，会默认为状态码，当传的数值不存在状态码中，会报无效状态码的错误。

修改`res.send()`的内容