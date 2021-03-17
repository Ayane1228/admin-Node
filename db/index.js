  /*
   * 数据库入口
   */

  // 导入所需模块
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
    // 连接数据库
      const conn = connect()
      debug && console.log(sql)
      return new Promise((resolve, reject) => {
        try {
          // 查询数据库
          conn.query(sql, (err, results) => {
            if (err) {
              debug && console.log('查询失败，原因:' + JSON.stringify(err))
              reject(err)
            } else {
              debug && console.log('查询成功')
              resolve(results)
            }
          })
        } catch (e) {
          reject(e)
        } finally {
          // 关闭数据库
          conn.end()
        }
      })
    }
  // 只查询一个用户方法  
  function queryOne(sql) {
    return new Promise((resolve,reject) => {
      querySql(sql).then(results => {
        if(resolve && resolve.length > 0) {
          resolve(results[0])
        } else {
          resolve(null)
        }
      }).catch(err => {
        reject(err)
      })
    })
  }

  // 导出相关方法
  module.exports = {  querySql,queryOne }