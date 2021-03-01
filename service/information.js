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

function findStudnetInformation (studentUsername){
    return querySql(`
                    SELECT truename,studentID,major,phone,email,introduction
                    FROM studentaccount WHERE '${studentUsername}' = username`)
}

function changeStudentInf(trueName,phone,email,introduction){
    return querySql(
        `   UPDATE studentaccount SET phone = '${phone}', email = '${email}', introduction = '${introduction}' 
            WHERE truename = '${trueName}'
        `)
}
 

module.exports = { findAdminInformation,findTeacherInformation,changeAdminInf,findStudnetInformation,changeStudentInf }