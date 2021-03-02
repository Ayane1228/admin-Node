const { querySql,queryOne} = require('../db')

function findAdminInformation() {
    return querySql(`SELECT truename,teacherID,phone,email,office,teacherrank FROM adminaccount`)
}

function findTeacherInformation(teacherUsername) {
    return querySql(`SELECT truename,teacherID,phone,email,office,teacherrank FROM teacheraccount WHERE '${teacherUsername}' = username`)
}

function findStudnetInformation (studentUsername){
    return querySql(`
                    SELECT truename,studentID,major,phone,email,introduction
                    FROM studentaccount WHERE '${studentUsername}' = username`)
}

function changeAdminInf(trueName,phone,email,office){
    return querySql(
        `   UPDATE adminaccount SET phone = '${phone}', email = '${email}', office = '${office}' 
            WHERE truename = '${trueName}'
        `)
}


function changeTeachertInf(trueName,phone,email,office,teacherrank){
    return querySql(
    `   UPDATE teacheraccount SET phone = '${phone}', email = '${email}',office = '${office}', teacherrank = '${teacherrank}' 
        WHERE truename = '${trueName}'`)
}


function changeStudentInf(trueName,phone,email,introduction){
    return querySql(
        `   UPDATE studentaccount SET phone = '${phone}', email = '${email}', introduction = '${introduction}' 
            WHERE truename = '${trueName}'
        `)
}
 

module.exports = { findAdminInformation,findTeacherInformation,findStudnetInformation,changeAdminInf,changeTeachertInf,changeStudentInf }