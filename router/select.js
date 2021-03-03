const express = require('express')
const Result = require('../models/Result')
const {showAddSelect,addSelect,allSelect }  = require('../service/select')

const router = express.Router()

// 进入页面，自动填写默认信息
router.get('/showSelect', function (req,res) {
    if (req.user.username === 'admin') {
        res.send('管理员无权添加选题')
    } else {
        const newSelect = showAddSelect(req.user.username)
        newSelect.then( teacherInf => {
            if ( teacherInf ){
                new Result(teacherInf,'当前教师选题信息').success(res)
            } else {
                new Result('当前教师选题信息错误').fail(res)
            }
        }).catch( (err) =>{
            console.log(err);
        })
    }
})

// 发布选题
router.post('/addSelect',function (req,res) {
    const result = req.body
    addSelect(result.newTitle,result.teacherName,result.newMajor,result.newContent).then( (res) => {
        console.log(res);
    }).catch( (err) => {
        console.log(err);
    })
})

// 选择课题
router.get('/allSelect',function(req,res) {0
    console.log(req);
})
module.exports = router