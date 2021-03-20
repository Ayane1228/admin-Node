const { query } = require('express-validator')
const { querySql,queryOne} = require('../db')

// 查询学生信息
function findStudent() {
    return querySql(`
            SELECT 
            username,password,truename,studentID,classID,college,major
            FROM studentaccount
            `)
}

//修改学生密码
function newStudentPassword(studentUsername,studentPassword) {
  return querySql(`
          UPDATE 
          studentaccount,user
          SET 
          studentaccount.password = '${studentPassword}',
          user.password = '${studentPassword}'
          WHERE 
          studentaccount.username = '${studentUsername}'
          AND 
          user.username = '${studentUsername}'
          `)
}

// 添加新账号前查看用户名是否重复
function checkAccount(newAccount){
  return querySql(`
          SELECT *
          FROM  user
          WHERE username = '${newAccount}'
  `)
}
// 添加新学生
function newStudentAccount(newSAccount,newSPassword,newSName,newStudentID,newStudentClassID,newStudentCollage,newStudentMajor){
  return queryOne(`
          INSERT INTO 
          studentaccount 
          (id,username,password,truename,studentID,classID,college,major) 
          VALUES 
          (id,'${newSAccount}','${newSPassword}','${newSName}','${newStudentID}','${newStudentClassID}','${newStudentCollage}','${newStudentMajor}');
          INSERT INTO 
          user 
          (id,username,password,role) 
          VALUES 
          (id,'${newSAccount}', '${newSPassword}','student')
          `)
}

// 删除学生账号前查看是否有选题信息存在
function queryStudentAccount(deleteStudentAccountName){
  return querySql(`
          SELECT *
          FROM
          select_table
          WhERE choicestudent = '${deleteStudentAccountName}'
  `)
}

// 删除学生账号
function deleteStudentAccount(deleteStudentAccountName){
  return queryOne(`
          DELETE FROM 
          studentaccount 
          WHERE 
          username = '${deleteStudentAccountName}';
          DELETE FROM 
          user
          WHERE 
          username = '${deleteStudentAccountName}';
          `)
}

// 查看教师账号
function findTeacher() {
  return querySql(`
          SELECT 
          username,password,truename,teacherID,teacherrank 
          FROM 
          teacheraccount
          `)
}

// 修改教师密码
function newTeacherPassword(teacherUsername,teacherPassword) {
  return querySql(`
          UPDATE 
          teacheraccount,user 
          SET 
          teacheraccount.password = '${teacherPassword}',
          user.password = '${teacherPassword}'
          WHERE 
          teacheraccount.username = '${teacherUsername}' 
          AND 
          user.username = '${teacherUsername}'
          `)
}

// 检查是否有教师相关选题存在
function queryTeacherAccount(deleteTeacherAccountName) {
  return querySql(`
          SELECT *
          FROM select_table
          WHERE
          teacheraccount = '${deleteTeacherAccountName}'
  `)
} 

// 删除教师账号
function deleteTeacherAccount(deleteTeacherAccount) {
  return queryOne(`
          DELETE FROM 
          teacherAccount 
          WHERE 
          username = '${deleteTeacherAccount}';
          DELETE FROM 
          user 
          WHERE 
          username = '${deleteTeacherAccount}';
          `)
}

// 创建教师账号
function newTeacherAccount(newTAccount,newTPassword,newTName,newTeacherID){
  return queryOne(`
          INSERT INTO 
          teacherAccount 
          (id,username,password,truename,teacherID) 
          VALUES 
          (id,'${newTAccount}', '${newTPassword}','${newTName}','${newTeacherID}');
          INSERT INTO user 
          (id,username,password,role) 
          VALUES 
          (id,'${newTAccount}', '${newTPassword}','teacher')
  `)
}

module.exports = 
  { checkAccount,
    findStudent,newStudentPassword,newStudentAccount,queryStudentAccount,deleteStudentAccount,
    findTeacher,newTeacherPassword,newTeacherAccount,queryTeacherAccount,deleteTeacherAccount 
  }