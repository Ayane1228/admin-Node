/**
 * JWT相关配置
 */
module.exports = {
    CODE_ERROR: -1,
    CODE_SUCCESS: 0,  
    CODE_TOKEN_EXPIRED: -2,
    debug:true,
    // 密钥
    PRIVATE_KEY: 'nhjcxy_suntaiwen_node',
    //过期时间
    JWT_EXPIRED: 60 * 60,
  }