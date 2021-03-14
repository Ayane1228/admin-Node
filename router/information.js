const express = require('express')
const Result = require('../models/Result')
const { findAdminInformation, findTeacherInformation,findStudnetInformation,changeAdminInf,changeTeachertInf,changeStudentInf } = require('../service/information.js')
const router = express.Router()

// 管理员/教师获得管理员/教师信息
router.get('/teacherInformation', function (req,res) {
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
router.post('/adminChangeInf',function (req,res) {
    changeAdminInf(req.body.trueName,req.body.newPhone,req.body.newEmail,req.body.newOffice)
        .then( (res) => {
            new Result('成功').success(res)
        }).catch( (err) => {
            new Result('失败').fail(res)
        })
})

// 教师修改个人信息
router.post('/teacherChangeInf',function (req,res) {
    console.log(req.body);
    changeTeachertInf(req.body.trueName,req.body.newPhone,req.body.newEmail,req.body.newOffice,req.body.newTeacherrank)
        .then( (res) => {
            new Result('修改教师成功').success(res)
        }).catch( (err) => {
            console.log(err);
            new Result('失败123').fail(res)
        })
})

// 学生获得个人信息并判断是否为管理员
router.get('/studentInformation',function(req,res){
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
        .then( (res) => {
            new Result('更新学生成功').success(res)
        }) 
        .catch( (err) => {
            new Result('更新学生失败').fail(err)
        })
})

module.exports = router