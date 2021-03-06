/*
 * 个人信息路由 
 */

const express = require('express')
const Result = require('../models/Result')
const { findAdminInformation, findTeacherInformation,findStudnetInformation,
        changeAdminInf,changeTeachertInf,changeStudentInf } = require('../service/information.js')
const { newStudentPassword,newTeacherPassword } = require('../service/account')        
const { response } = require('express')
const router = express.Router()

// 管理员/教师获得管理员/教师信息
router.get('/teacherInformation', function(req,res){
    // 判断账号是否为管理员
    if (req.user.username == 'admin') {
        const findAdminInf = findAdminInformation()
        findAdminInf.then(
            adminInformationization => {
                if (adminInformationization) {
                    new Result(adminInformationization,'获取admin信息成功').success(res)
                } else {
                    new Result('获取admin信息失败').fail(res)
                }
            }
        )
    } else {
        const findTeacherInf = findTeacherInformation(req.user.username)
        findTeacherInf.then(
            teacherInf => {
                if (teacherInf) {
                    new Result(teacherInf,'获取教师信息成功').success(res)
                } else {
                    new Result('获取教师信息失败').fail(res)
                }
            }
        )
    }
})

// 管理员修改个人信息
router.post('/adminChangeInf',function(req,res) {
    changeAdminInf(req.body.trueName,req.body.newPhone,req.body.newEmail,req.body.newOffice)
        .then( (results) => {
            new Result('修改管理员信息成功，请刷新页面').success(res)
        }).catch( (errors) => {
            new Result('修改管理员信息失败，请重试').fail(res)
        })
})

// 教师修改个人信息
router.post('/teacherChangeInf',function(req,res) {
    changeTeachertInf(req.body.trueName,req.body.newPhone,req.body.newEmail,req.body.newOffice,req.body.newTeacherrank)
        .then( (result) => {
            new Result('修改教师信息成功,请刷新页面').success(res)
        }).catch( (errors) => {
            new Result('修改教师信息失败，请重试').fail(res)
        })
})

// 教师修改密码
router.post('/changeTeacherPassword',function(req,res) {
    const teacherUsername = req.user.username
    const teacherPassword = req.body.newPassword;
    newTeacherPassword(teacherUsername,teacherPassword).then( (response) => {
        new Result(response,'教师修改密码成功').success(res)
    }).catch( (err) => {
        new Result('教师修改密码失败').fail(res)
    })
})

// 学生获得个人信息并判断是否为管理员
router.get('/studentInformation',function(req,res){
    // 判断是否为管理员
    if (req.user.username == 'admin' ) {
        res.send('管理员无权访问学生个人信息')
    } else {
        const studentInf = findStudnetInformation(req.user.username)
        studentInf.then( studentInf =>{
            if (studentInf) {
                new Result(studentInf,'获取学生个人信息成功').success(res)
            } else {
                new Result('获取学生个人信息失败').fail(res)
            }
        })
    }
})

// 学生修改个人信息
router.post('/studentChangeInf',function(req,res) {
    const result = req.body
    changeStudentInf(result.trueName,result.newPhone,result.newEmail,result.newIntroduction)
        .then( (result) => {
            new Result('修改学生信息成功').success(res)
        }) 
        .catch( (errors) => {
            new Result('修改学生信息失败').fail(err)
        })
})

// 学生修改密码
router.post('/changeStudentPassword',function(req,res) {
    const studentUsername = req.user.username
    const studentPassword = req.body.newPassword;
    newStudentPassword(studentUsername,studentPassword).then( (response) => {
        new Result(response,'学生修改密码成功').success(res)
    }).catch( (err) => {
        new Result('学生修改密码失败').fail(res)
    })
})

module.exports = router