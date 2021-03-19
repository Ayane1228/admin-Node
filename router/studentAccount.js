/**
 * 账号管理/学生账号管理 
 */
const express = require('express')
const Result = require('../models/Result')
const { 
    checkAccount,
    findStudent,newStudentPassword,newStudentAccount,
    deleteStudentAccount,queryStudentAccount 
        } = require('../service/account')
const router = express.Router()


// 管理员查看学生账号信息
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

// 管理员修改学生密码
router.post('/changeStudentAccount', function (req,res) {
    const studentUsername = req.body.studentUsername
    const studentPassword = req.body.value;
    newStudentPassword(studentUsername,studentPassword).then( (res) => {
        console.log(res);
    }).catch( (err) => {
        console.log(err);
    })
})

// 管理员添加学生账号
router.post('/addStudentAccount',function(req,res){
    const newSAccount = req.body.newSAccount
    const newSPassword = req.body.newSPassword
    const newSName = req.body.newSName
    const newStudentID = req.body.newStudentID
    const newStudentClassID = req.body.newStudentClassID
    const newStudentCollage = req.body.newStudentMajor.split('/')[0]
    const newStudentMajor  = req.body.newStudentMajor.split('/')[1]
    checkAccount(newSAccount).then( (checkStudnet) => {
        if (checkStudnet.length === 1) {
            new Result(checkStudnet,'账号名已存在,请重新尝试').success(res)
        } else {
            newStudentAccount(newSAccount,newSPassword,newSName,newStudentID,newStudentClassID,newStudentCollage,newStudentMajor)
                .then((result) => {
                    new Result(result,'新增账号成功').success(res)
                }).catch( (errors) => { 
                    console.log(errors);
            })
        }
    }).catch( (err) => {
        console.log(err);
    })
})

// 管理员删除学生账号
router.post('/deleteStudent',function(req,res){
    const deleteStudentAccountName = req.body.deleteStudentAccountName
    queryStudentAccount(deleteStudentAccountName).then( (exitStudent) =>{
        // 学生存在已选题情况
        if (exitStudent.length === 1) {
            new Result(exitStudent,'存在选题结果').success(res)
        } else {
            deleteStudentAccount(deleteStudentAccountName).then( (deleteStudent) => {
                if ( deleteStudent ) {
                    new Result(deleteStudent,'删除成功').success(res)
                } else {
                    new Result('删除失败').fail(res)
                }
            }).catch( (err) => {
                console.log(err);
            })
        }
    }).catch( (err) => {
        console.log(err);
    })
})

module.exports = router