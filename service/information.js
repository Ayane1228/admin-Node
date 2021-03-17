const { querySql,queryOne} = require('../db')

// 管理员个人信息
function findAdminInformation() {
    return querySql(`
            SELECT 
            truename,teacherID,phone,email,office,teacherrank 
            FROM adminaccount
        `)
}

// 教师个人信息
function findTeacherInformation(teacherUsername) {
    return querySql(`
            SELECT 
            truename,teacherID,phone,email,office,teacherrank 
            FROM teacheraccount 
            WHERE '${teacherUsername}' = username
        `)
}

// 学生个人信息
function findStudnetInformation (studentUsername){
    return querySql(`
            SELECT truename,studentID,major,phone,email,introduction
            FROM studentaccount 
            WHERE '${studentUsername}' = username`)
}

// 管理员修改个人信息
function changeAdminInf(trueName,phone,email,office){
    return querySql(`   
            UPDATE adminaccount 
            SET phone = '${phone}', email = '${email}', office = '${office}' 
            WHERE truename = '${trueName}'
        `)
}

// 教师修改个人信息
function changeTeachertInf(trueName,phone,email,office,teacherrank){
    return querySql(`   
            UPDATE teacheraccount 
            SET phone = '${phone}', email = '${email}',office = '${office}', teacherrank = '${teacherrank}' 
            WHERE truename = '${trueName}'
        `)
}

// 学生修改个人信息
function changeStudentInf(trueName,phone,email,introduction){
    return querySql(`   
            UPDATE studentaccount 
            SET phone = '${phone}', email = '${email}', introduction = '${introduction}' 
            WHERE truename = '${trueName}'
        `)
}
 

module.exports = 
    { 
        findAdminInformation,findTeacherInformation,findStudnetInformation,
        changeAdminInf,changeTeachertInf,changeStudentInf 
    }