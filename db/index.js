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
  // 只查询一个用户  
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
  module.exports = {querySql,queryOne}