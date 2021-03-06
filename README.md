# 前端框架搭建

#### 使用vue-element-admin 源码搭建前端框架：

```javascript
git clone https://github.com/PanJiaChen/vue-element-admin
cd vue-element-admin
npm i
npm run dev
```

### 精简项目

- 删除 src/views 下的源码，保留：

  - dashboard：首页
  - error-page：异常页面
  - login：登录
  - redirect：重定向

- 对 src/router/index 进行相应修改

- 删除 src/router/modules 文件夹

- 删除 src/vendor 文件夹

- 通过 src/settings.js 进行全局配置：

  - title：站点标题，进入某个页面后，格式为：

    ```
    页面标题 - 站点标题
    ```

    - showSettings：是否显示右侧悬浮配置按钮 false
    - tagsView：是否显示页面标签功能条 true
    - fixedHeader：是否将头部布局固定在窗口顶部。true
    - sidebarLogo：菜单栏中是否显示LOGO false

## 项目结构

src文件下：

- api：接口请求
- assets：静态资源
- components：通用组件
- directive：自定义指令
- filters：自定义过滤器
- icons：图标组件
- layout：布局组件
- router：路由配置
- store：状态管理
- styles：自定义样式
- utils：通用工具方法
  - auth.js：token 存取
  - permission.js：权限检查
  - request.js：axios 请求封装
  - index.js：工具方法
- views：页面
- permission.js：登录认证和路由跳转
- settings.js：全局配置
- main.js：全局入口文件
- App.vue：全局入口组件

## 项目初始化

### 创建项目

```bash
mkdir admin-imooc-node
cd admin-imooc-node
npm init -y
```

#### 安装依赖

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

## 项目框架搭建

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

验证 /user/login：

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

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg:#283443;
$light_gray:#fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }

  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }
}
</style>
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

有两点需要注意：

- 这里我使用了域名 `book.youbaobao.xyz`，大家可以将其替换为你自己注册的域名，如果你还没注册域名，用 `localhost` 也是可行的，但如果要发布到互联网需要注册域名
- 如果没有申请 https 证书，可以采用 http 协议，同样可以实现登录请求，但是如果你要发布到互联网上建议使用 https 协议安全性会更好

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

// ...
app.use(cors())
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

## JWT

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

此时在前端重新登录，登录终于成功了！

## 修改 Logout 方法

修改 `src/store/modules/user.js`：

```js
logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      try {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        removeToken()
        resetRouter()
        // reset visited views and cached views
        // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
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

## 最新通知

点击最新通知之后后端查询数据，并将数据返回给前端渲染到页面上。

前端路由为调用后端方法：`http://localhost:18082/#/notice/shownotice`并传递`token`。

后端新建`/router/notice.js`文件用于处理所有通知请求。

`index.js`中：

```js
// 通过 noticeRouter 来处理 /notice 路由，对路由处理进行解耦
router.use('/notice', noticeRouter)
```

获取数据库数据：`service/notice`并导出

```js
const { querySql,queryOne} = require('../db')

function findNotice() {
    const sql = `select * from notice`
    return querySql(sql)
  }


module.exports = {findNotice}
```

运行sql语句

```sql
select * from notice
```

结果：能够查询到数据

`router/notice.js`:

测试能否 在后端查询到数据库数据，执行`findNotice`函数并输出结果。

```js
const express = require('express')
const Result = require('../models/Result')

const router = express.Router()
const { findNotice } = require('../service/notice')

router.get('/shownotice', function(req, res) {
  console.log('shownotice start');
  console.log(findNotice())
})

module.exports = router
```

执行结果：

```shell
shownotice start
SELECT noticeTitle,noticeTime,noticeContent FROM notice
Promise { <pending> }
查询成功 [{"noticeTitle":"本科毕业设计（论文）学生题目申报指南 ","noticeTime":"2009-11-01T07:58:09.000Z","noticeContent":"学生可以申报的本科毕业设计（论文）题目分为“ 
学生自选题目”和“外单位毕设题目”两种类型，“学生自选题目”是指学生自主选择的题目，“外单位毕设题目”是指学生在所在学院以外进行毕业设计的题目。"},{"noticeTitle":"最新公告","noticeTime":"2021-02-20T06:59:51.000Z","noticeContent":"这是一个最新的公告呢日哦那个阿松大啊啊啊"}]
```

将结果返回到前端

```js
const express = require('express')
const Result = require('../models/Result')

const router = express.Router()
const { findNotice } = require('../service/notice')
const { all } = require('./user')

// 最新公告
router.get('/shownotice', function(req, res) {
  console.log('shownotice start');
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
```

前端取得数据处理数据并展示：

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
    @sort-change="sortChange"
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


<script>
import axios from 'axios'
import { getToken } from '@/utils/auth'
// 导入时间戳转换函数
import utc2beijing from '../../utils/get-noticeTime'
export default {
    data() {
      return {
        //数据列表
        list: []
      }
    },
    methods:{
      // 展示详情按钮：
        //点击获取当前列的index和内容
      showContent(index,row){
          //设置内容为当前列的内容和标题
        this.$alert(this.$data.list[index].noticeContent, this.$data.list[index].noticeTitle, {
            //重新设置类名
        customClass:"msgBox",
            //数据为html格式
        dangerouslyUseHTMLString: true,
            //不显示确定按钮
        showConfirmButton:false,
            //显示取消按钮
        showCancelButton:true,
            //取消按钮内容为关闭
        cancelButtonText:"关闭"
        })
         //点击之后的回调函数
            .then( () =>{
          console.log('查看详情');
        }).catch( (err) => {
          console.log(err);
        });
      }
    },
    //计算属性：获取token
    computed:{
      header(){
        return {
          Authorization:`Bearer ${getToken()}`
        }
      }
    },
    //生命周期函数
    beforeMount() {
        //保存token
      const that = this
      const token = this.header
      // 请求后端数据
      axios.get('http://localhost:18082/notice/shownotice',{
            // token加到请求头中
            headers:{
              Authorization:token.Authorization
            }
        })
          .then( function (res) {
            //响应结果遍历之后保存到$data.list数组中
            res.data.data.map( (item) => {
              //格式化时间
              item.noticeTime = utc2beijing(item.noticeTime)
              // 保存
              that.$data.list.push(item)
            })
      }).catch( err => { console.log(err); })
  },
}
</script>

<style>
#main{
  margin: 30px;
}
.msgBox{
    //过长显示滚动条
  overflow: scroll;
    //关闭底部滚动条
  overflow-x:hidden ;
  width: 60%;
  height: 100%;
}
</style>

```

## admin-修改通知

前端采用post请求,

```vue
<template>
  <div>
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
    <hr>
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
            <el-button type="danger">删除该通知</el-button>
          </template>
        </el-table-column>
    </el-table>
    </div>
  </div>
</template>


<script>
import axios from 'axios'
import { getToken } from '@/utils/auth'
// 导入时间戳转换为标准时间函数
import utc2beijing from '../../utils/get-noticeTime'

export default {
    data() {
      return {
        list: [],
        textareaContent:null
      }
    },
    //计算属性获取token
    computed:{
      header(){
        return {
          Authorization:`Bearer ${getToken()}`
        }
      }
    },
    methods:{
      //刷新页面
      reload(){
        window.location.reload();
      },
      // 获取当前列详情的index和内容
      showContent(index,row){
        this.$alert(this.$data.list[index].noticeContent, this.$data.list[index].noticeTitle, {
        customClass:"msgBox",
        dangerouslyUseHTMLString: true,
        showConfirmButton:false,
        showCancelButton:true,
        cancelButtonText:"关闭"
        }).then( () =>{
          console.log('查看详情');
        }).catch( (err) => {
          console.log(err);
        });
      },
      // 提交新公告
      submitNotice(){
        //判断内容是否为空
        if (this.$data.textareaContent === null ) {
            this.$message({
            type: 'warning',
            message: '内容不能为空 ' 
          })
        } else {
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
            // axios响应成功,刷新页面
            console.log(res);
          }).catch( (err) => {
              console.log('请求发布接口失败' + err);
            })
        // 发布结束之后的回调    
        this.$message({
            type: 'success',
            message: '发布成功,标题为: ' + value
          }).then(
            // 刷新页面
            setTimeout(this.reload(),30000)
          ).catch((err) => {
          this.$message({
            type: 'error',
            message: '发布失败'
          })       
        });
      })
    }
  }
},
    beforeMount() {
      const that = this
      const token = this.header
      // 请求后端数据
      axios.get('http://localhost:18082/notice/shownotice',{
            // 并保存token到请求头中
            headers:{
              Authorization:token.Authorization
            }
        }).then( function (res) {
            //保存到data中
            res.data.data.map( (item) => {
              //格式化时间
              item.noticeTime = utc2beijing(item.noticeTime)
              // 显示数据
              that.$data.list.push(item)
            })
      }).catch( err => { console.log(err); })
  },
}
</script>

<style>
#main{
  margin:30px;
}
.msgBox{
  overflow: scroll; 
  overflow-x:hidden ;
  width: 60%;
  height: 80%;
}
.newNotice{
  margin: 30px;
}
.newNotice button{
  margin-top: 10px;
}

</style>

```

后端

```js
//修改公告
router.post('/changenotice', function(req,res) {
  // 获取请求数据
  const newTitle = req.body.noticeTitle;
  const newContent = req.body.noticeContent;
  addNotice(newTitle,newContent).then( (res) => {
    console.log('添加成功');
  }).catch( (err) =>{
    console.log('添加公告失败' + err);
  })
})
```

```js
function addNotice(newTitle,newContent) {
  // 插入语句
  return queryOne(`INSERT INTO notice VALUES (id,'${newTitle}',Now(),'${newContent}')`)
}
```

## admin-修改通知

删除通知

前端：

```vue
<el-button 
    @click="deleteNotice(scope.$index, scope.row)"
    type="danger">
    删除该通知
</el-button>	
```

```js
      // 删除公告
      deleteNotice(index,row){
        const deleteNotice = row.noticeTitle;
        this.$alert(`是否要删除公告:${row.noticeTitle}`, '删除公告', {
          confirmButtonText: '确定删除'
        }).then ( () =>{
            // 获取当前的token
            const token = this.header
            axios({
              url:'http://localhost:18082/notice/deleteNotice',
              method:"post",
              headers:{
                Authorization:token.Authorization
              },
              data:{deleteNotice}
            }).then ( (res) => {
              console.log(res);
            }).catch( (err) => {
              console.log(err);
            })
        }).catch( (err) => {
          console.log(err);
        });
      },
```

​	sql语句

```js
function deletNotice(deleteNotice) {
  return queryOne(`DELETE FROM notice WHERE noticeTitle = ${deleteNotice}`)
}
```



## 学生点击选择课题

请求数据 ： `req.user.username`,`row`登陆账号账号的用户名和当前点击的行的信息。

接受到请求，

先去判断`row.istrue`的值，

再将`select`表添加请求学生信息，将学生的`username`添加到`select`表中给老师查看相关课题当前提交请求的学生信息，当选择的学生数量超过3个时或是老师确定最终人选时，将`select`的istrue修改为不可选择。

当选定时将最终学生添加到`select`表中。

> 前端部分修改：将按钮的disable属性和istrue绑定，如果istrue为可选，则disable为false。
>
> ```js
>               <el-button 
>                   type="primary" 
>                   @click="submit(scope.row)" 
>                   :disabled="scope.row.istrue== '不可选' "
>                 >确认选择
>               </el-button>
> ```

后端sql语句

> 学生选择选题
>
> 1.判断当前选题的 istrue是否为可选且personnumber的值大于0
>
> 2.将可选人数personnumber减一，当personnumber为0时，设置istrue为不可选
>
> 3.select表中新增一列存放选题人名字 
>
> 4.studentaccount表中存放当前选择的选题信息

sql中判断`istrue`和`personnumber`的值,

​	查询测试

```

```









# 问题

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

两个异步请求的res不相同,

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



