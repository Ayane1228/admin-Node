const { querySql,queryOne} = require('../db')

function findAdminInformation() {
    return querySql(`SELECT truename,teacherID,phone,email,office FROM adminaccount`)
}

function changeAdminInf(trueName,phone,email,office){
    return querySql(
        `   UPDATE adminaccount SET phone = '${phone}', email = '${email}', office = '${office}' 
            WHERE truename = '${trueName}'
        `)
}

function findTeacherInformation(teacherUsername) {
    return querySql(`SELECT truename,teacherID,phone,email,office FROM teacheraccount WHERE '${teacherUsername}' = username`)
}

function changeStudentInf(trueName,phone,email,office){
    return querySql(
        `   UPDATE teacheraccount SET phone = '${phone}', email = '${email}', office = '${office}' 
            WHERE truename = '${trueName}'
        `)
}
 

module.exports = { findAdminInformation,findTeacherInformation,changeAdminInf,changeStudentInf }