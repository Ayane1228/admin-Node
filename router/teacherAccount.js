const express = require('express')
const Result = require('../models/Result')
const { findTeacher,newTeacherPassword,newTeacherAccount,deleteTeacherAccount } = require('../service/account')

const router = express.Router()


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
 
// 修改教师密码
router.post('/changeTeacherAccount', function (req,res) {
    const TeacherUsername = req.body.TeacherUsername
    const TeacherPassword = req.body.value;
    newTeacherPassword(TeacherUsername,TeacherPassword).then( (res) => {
        console.log(res);
    }).catch( (err) => {
        console.log(err);
    })
})

//添加教师账号
/**
 * 原因:{"code":"ER_WRONG_VALUE_COUNT_ON_ROW","errno":1136,
 * "sqlMessage":"Column count doesn't match value count at row 1",
 * "sqlState":"21S01","index":0,
 * "sql":"\n  
 * INSERT INTO teacherAccount (id,username,password,truename,teacherID) VALUES (id,'hongdou', 'hongdou','红豆');
 * \n  INSERT INTO user (id,username,password,role) VALUES (id,'hongdou', 'hongdou','teacher')\n  "}
 */
router.post('/addTeacherAccount',function(req,res){
    const newTAccount = req.body.newTAccount
    const newTPassword = req.body.newTPassword
    const newTName = req.body.newTName
    const newTeacherID = req.body.newTeacherID
    newTeacherAccount(newTAccount,newTPassword,newTName,newTeacherID).then((res) => {
        console.log(res);
    }).catch( (err) => { 
        console.log(err);
    })
})

router.post('/deleteTeacher',function(req,res){
    const deleteTeacherAccountName = req.body.deleteTeacherAccountName
    deleteTeacherAccount(deleteTeacherAccountName).then( (res) => {
        console.log(res);
    }).catch( (err) => {
        console.log(err);
    })
})

module.exports = router