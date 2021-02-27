const { querySql,queryOne} = require('../db')

// 查询学生信息
function findStudent() {
    return querySql(`SELECT username,password,truename,studentID,classID,college,major,phone,email FROM studentaccount`)
}
//修改密码
function newStudentPassword(studentUsername,studentPassword) {
  // update 表名称 set 列名称=新值 where 更新条件;
  return querySql(`UPDATE studentaccount,user SET studentaccount.password = '${studentPassword}',user.password = '${studentPassword}'
                    WHERE studentaccount.username = '${studentUsername}' AND user.username = '${studentUsername}'`)
}
// 添加新学生
function newStudentAccount(newSAccount,newSPassword,newSName,newStudentID,newStudentClassID,newStudentCollage,newStudentMajor){
  console.log(newStudentCollage,newStudentMajor);
  return queryOne(`
  INSERT INTO studentaccount (id,username,password,truename,studentID,classID,college,major) 
  VALUES (id,'${newSAccount}', '${newSPassword}','${newSName}','${newStudentID}','${newStudentClassID}','${newStudentCollage}','${newStudentMajor}');
  INSERT INTO user (id,username,password,role) VALUES (id,'${newSAccount}', '${newSPassword}','student')
  `)
}

function deleteStudentAccount(deleteStudentAccountName){
  return queryOne(`
        DELETE FROM studentaccount WHERE username = '${deleteStudentAccountName}';
        DELETE FROM user WHERE username = '${deleteStudentAccountName}';
  `)
}

// 教师部分
function findTeacher() {
  return querySql(`SELECT username,password,truename,teacherID,phone,email FROM teacheraccount`)
}

function newTeacherPassword(teacherUsername,teacherPassword) {
  return querySql(`UPDATE teacheraccount,user SET teacheraccount.password = '${teacherPassword}',user.password = '${teacherPassword}'
  WHERE teacheraccount.username = '${teacherUsername}' AND user.username = '${teacherUsername}'`)
}

function deleteTeacherAccount(deleteTeacherAccount) {
  return queryOne(`
  DELETE FROM teacherAccount WHERE username = '${deleteTeacherAccount}';
  DELETE FROM user WHERE username = '${deleteTeacherAccount}';
`)
}

function newTeacherAccount(newTAccount,newTPassword,newTName,newTeacherID){
  return queryOne(`
  INSERT INTO teacherAccount (id,username,password,truename,teacherID) VALUES (id,'${newTAccount}', '${newTPassword}','${newTName}');
  INSERT INTO user (id,username,password,role) VALUES (id,'${newTAccount}', '${newTPassword}','teacher')
  `)
}

module.exports = { findStudent,newStudentPassword,newStudentAccount,deleteStudentAccount,findTeacher,newTeacherPassword,deleteTeacherAccount,newTeacherAccount }