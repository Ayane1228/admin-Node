const express = require('express')
const Result = require('../models/Result')
const { findAdminInformation, findTeacherInformation,changeAdminInf,changeStudentInf } = require('../service/teacherI.js')
const router = express.Router()


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

router.post('/adminChangeInf',function (req,res) {
    changeAdminInf(req.body.trueName,req.body.newPhone,req.body.newEmail,req.body.newOffice)
        .then( (res) => {
            new Result('成功').success(res)
        }).catch( (err) => {
            new Result('失败').fail(res)
        })
})

router.post('/teacherChangeInf',function (req,res) {
    changeStudentInf(req.body.trueName,req.body.newPhone,req.body.newEmail,req.body.newOffice)
        .then( (res) => {
            new Result('成功').success(res)
        }).catch( (err) => {
            new Result('失败').fail(res)
        })
})

module.exports = router