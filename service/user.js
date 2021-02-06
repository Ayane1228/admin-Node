const { querySql,queryOne} = require('../db')


function login(username, password) {
    const sql = `select * from user where username='${username}' and password='${password}'`
    return querySql(sql)
  }
function findUser(username) {
  return queryOne(`select id,username,role from user where username='${username}'`)
}  

module.exports = {login,findUser}