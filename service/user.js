const { querySql,queryOne} = require('../db')

// 登录查询
function login(username, password) {
    return querySql(`
            SELECT * 
            FROM user 
            WHERE username='${username}' AND 
            password='${password}'`)
  }

// 判断权限 
function findUser(username) {
  return queryOne(`
          SELECT id,username,role 
          FROM user 
          WHERE username='${username}'`)
}  

module.exports = {  login,findUser  }