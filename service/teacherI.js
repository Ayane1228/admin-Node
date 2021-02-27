const { querySql,queryOne} = require('../db')

function findAdmin() {
    return querySql(`SELECT username,password,truename,teacherID,phone,email,office FROM adminaccount`)
}


module.exports = { findAdmin }