const { querySql,queryOne} = require('../db')

function addSelect(teacherName){
    return querySql(`SELECT truename,phone,email,office,teacherrank FROM teacheraccount WHERE username = '${teacherName}' `)
}

module.exports = { addSelect }