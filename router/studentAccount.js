const express = require('express')
const Result = require('../models/Result')
const { findStudent,newStudentPassword,newStudentAccount,deleteStudentAccount } = require('../service/account')

const router = express.Router()


// 获取学生信息
router.get('/showStudentAccount', function (req,res) {
    const studentAccount = findStudent()
    studentAccount.then ( allStudentAccount => {
        if (studentAccount) {
            new Result(allStudentAccount,'获取学生信息成功').success(res)
        } else {
            new Result('获取学生信息失败').fail(res)
        }
    })
})

// 重置学生密码
router.post('/changeStudentAccount', function (req,res) {
    const studentUsername = req.body.studentUsername
    const studentPassword = req.body.value;
    newStudentPassword(studentUsername,studentPassword).then( (res) => {
        console.log(res);
    }).catch( (err) => {
        console.log(err);
    })
})
// 添加学生账号
router.post('/addStudentAccount',function(req,res){
    const newSAccount = req.body.newSAccount
    const newSPassword = req.body.newSPassword
    const newSName = req.body.newSName
    const newStudentID = req.body.newStudentID
    const newStudentClassID = req.body.newStudentClassID
    const newStudentMagor = req.body.newStudentMagor
    newStudentAccount(newSAccount,newSPassword,newSName,newStudentID,newStudentClassID,newStudentMagor).then((res) => {
        console.log(res);
    }).catch( (err) => { 
        console.log(err);
    })
})
// 删除学生账号
router.post('/deleteStudent',function(req,res){
    const deleteStudentAccountName = req.body.deleteStudentAccountName
    deleteStudentAccount(deleteStudentAccountName).then( (res) => {
        console.log(res);
    }).catch( (err) => {
        console.log(err);
    })
})

module.exports = router