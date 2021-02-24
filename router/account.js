const express = require('express')
const Result = require('../models/Result')
const { findStudent,newStudentPassword } = require('../service/account')

const router = express.Router()


// 获取学生信息
router.get('/studentAccount', function (req,res) {
    const studentAccount = findStudent()
    studentAccount.then ( allStudentAccount => {
        if (studentAccount) {
            new Result(allStudentAccount,'获取学生信息成功').success(res)
        } else {
            new Result('获取学生信息失败').fail(res)
        }
    })
})
router.post('/changeStudentAccount', function (req,res) {
    const studentUsername = req.body.studentUsername
    const studentPassword = req.body.value;
    newStudentPassword(studentUsername,studentPassword).then( (res) => {
        console.log(res);
    }).catch( (err) => {
        console.log(err);
    })
})


module.exports = router