/**
 * 设置JWT相关配置
 */

const expressJwt = require('express-jwt');
// 导入私钥
const { PRIVATE_KEY } = require('../utils/constant');

const jwtAuth = expressJwt({
  // 配置私钥
  secret: PRIVATE_KEY,
  // jwt算法
  algorithms:['HS256'],
  // 是否开启JWT,设置为false就不进行校验了，游客也可以访问
  credentialsRequired: true 
}).unless({
// 设置 jwt 认证白名单
  path: [
    '/',
    '/user/login'
    ], 
});

module.exports = jwtAuth;