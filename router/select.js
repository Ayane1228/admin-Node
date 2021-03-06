const express = require('express')
const Result = require('../models/Result')
const {showAddSelect,addSelect,allSelect,choiceSelect,addStundetToSelect }  = require('../service/select')

const router = express.Router()

// 进入添加选题页面，自动填写默认信息
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

// 查看课题
router.get('/allSelect',function(req,res) {
    const select = allSelect()
    select.then( (allSelect) => {
        if (allSelect) {
            new Result(allSelect,'获取选题成功').success(res)
        } else {
            new Result('获取选题失败').fail(res)
        }
    }).catch( (err) => {
        console.log(err);
    })
})

// 判断是否为学生账号并进行进行选题操作
router.post('/choiceSelect',function(require,response) {
    choiceSelect(require.user.username,require.body.row.title).then( (res) => {
        if (res = 'true') {
            addStundetToSelect(require.user.username,require.body.row.title).then( (res2) => {
                console.log(res2);
            }).catch( (err2) => {
                console.log(err2);
            })
        } else {
            response.send('不能选题')
        }
    }).catch( (err) => {
        console.log(err);
    })
})




module.exports = router