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

已经完成

# 公告

点击最新通知之后后端查询数据，并将数据返回给前端渲染到页面上。

前端路由为`http://localhost:9527/#/notice/shownotice`调用后端方法。

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
      width="180">
    </el-table-column>
    <el-table-column
      prop="content"
      label="简介">
    </el-table-column>
    <el-table-column>
      <el-button type="primary">查看详情</el-button>
    </el-table-column>
  </el-table>
    </div>
  </div>
</template>
<script>
export default {
    data() {
      return {
        list: []
      }
    },
    methods:{
      getList(){
        // 设置data中的list
        this.$data.list.push({
          noticeTime: '2009-11-01 15:58:09',
          noticeTitle: '本科毕业设计（论文）学生题目申报指南 ',
          content: '学生可以申报的本科毕业设计（论文）题目分为“学生自选题目”和“外单位毕设题目”两种类型'
        })
      }
    },
    // 钩子函数
    mounted: function () {
      this.getList()
}
}

</script>
<style>
#main{
  margin: 30px;
}
</style>
```

后端新建`/router/notice.js`文件用于处理所有通知请求。

`index.js`中：

```js
// 通过 noticeRouter 来处理 /notice 路由，对路由处理进行解耦
router.use('/notice', noticeRouter)
```

前端使用axios访问后端notice接口

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

 



