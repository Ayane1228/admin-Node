/*
 *  教师账号管理 
 */

const express = require('express')
const Result = require('../models/Result')
const { checkAccount,findTeacher,newTeacherPassword,newTeacherAccount,queryTeacherAccount,deleteTeacherAccount } = require('../service/account')
const router = express.Router()


// 管理员查看教师账号
router.get('/showTeacherAccount', function (req,res) {
    const TeacherAccount = findTeacher()
    TeacherAccount.then ( allTeacherAccount => {
        if (TeacherAccount) {
            new Result(allTeacherAccount,'获取教师信息成功').success(res)
        } else {
            new Result('获取教师信息失败').fail(res)
        }
    })
})
 
// 管理员修改教师密码
router.post('/changeTeacherAccount', function (req,res) {
    const TeacherUsername = req.body.TeacherUsername
    const TeacherPassword = req.body.value;
    newTeacherPassword(TeacherUsername,TeacherPassword).then( (res) => {
        console.log(res);
    }).catch( (err) => {
        console.log(err);
    })
})

// 管理员添加教师账号
router.post('/addTeacherAccount',function(req,res){
    const newTAccount = req.body.newTAccount
    const newTPassword = req.body.newTPassword
    const newTName = req.body.newTName
    const newTeacherID = req.body.newTeacherID
    checkAccount(newTAccount).then( (checkTeacher) => {
        if (checkTeacher.length === 1) {
            new Result(checkTeacher,'账号名已存在,请重新尝试').success(res)
        } else {
                newTeacherAccount(newTAccount,newTPassword,newTName,newTeacherID).then((result) => {
                    new Result(result,'新增账号成功').success(res)
                }).catch( (err) => { 
                    console.log(err);
                })
        }
    }).catch( (err) => {
        console.log(err);
    })
})

// 管理员删除教师账号
router.post('/deleteTeacher',function(req,res){
    const deleteTeacherAccountName = req.body.deleteTeacherAccountName
    queryTeacherAccount(deleteTeacherAccountName).then( ( exitTeacher ) => {
        if ( exitTeacher.length === 0 ) {
            deleteTeacherAccount(deleteTeacherAccountName).then( (result) => {
                new Result(result,'删除成功').success(res)
            }).catch( (err) => {
                new Result('删除失败').fail(err)
            })
        } else {
            new Result('删除账号存在相关选题存在，无法删除').success(res)
        }
    })
})

module.exports = router