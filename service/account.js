const { querySql,queryOne} = require('../db')

// // 返回值就是查询数据库的结果
function findStudent() {
    return querySql(`SELECT username,password,truename,studentID,classID,college,major,phone,email FROM studentaccount`)
}

function newStudentPassword(studentUsername,studentPassword) {
  // update 表名称 set 列名称=新值 where 更新条件;
  console.log( querySql(`UPDATE studentaccount SET password = '${studentPassword}' WHERE username = '${studentUsername}'`));
  return querySql(`UPDATE studentaccount SET password = '${studentPassword}' WHERE username = '${studentUsername}'`)
}
// findTeacher,changeStudentPassword,changeTeacherPassword
module.exports = { findStudent,newStudentPassword }