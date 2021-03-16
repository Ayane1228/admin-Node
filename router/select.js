const express = require('express')
const Result = require('../models/Result')
const 
    {   showAddSelect,addSelect,allSelect,ifStudent,
        choiceSelect,teacherSelect,cancelStudent,
        deleteSelect,pickStudent }  = require('../service/select')

const router = express.Router()

// 添加选题页面，自动填写默认信息
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

// 教师选题
router.post('/addSelect',function (req,res) {
    const result = req.body
    addSelect(result.newTitle,result.teacherName,result.newMajor,result.newContent,req.user.username).then( (res) => {
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

// 判断是否为学生账号
router.get('/isStudent',function(req,res) {
    const ifstudent = ifStudent(req.user.username)
    ifstudent.then( (ifstudent) => {
        if (ifstudent) {
            new Result(ifstudent,'判断学生成功').success(res)
        } else {
            new Result('判断学生失败').fail(res)
        }
    }).catch( (err) => {
        console.log(err);
    })
})

// 学生选题
router.post('/choiceSelect',function(req,res) {
    choiceSelect(req.user.username,req.body.row.title)
    .then( (response) => {
        // 调用sql语句之后影响行数为0
        if (response.affectedRows === 0) {
            res.send("不能重复选题")
        } else {
            res.send("选题成功")
        }
    }).catch( (err) => {
        console.log(err);
    })
})

// 查看选题
router.get('/teachersSelect',function(req,res){    
    const allTSelect = teacherSelect(req.user.username)
    allTSelect.then( teacherAllSelect => {
        if( teacherAllSelect ) {
            new Result(teacherAllSelect,'教师选题获取成功').success(res)
        } else {
            new Result('获取教师选题失败').fail(res)
        }
    }).catch( (err) => {
        console.log(err);
    })
}) 

// 教师拒绝学生
router.post('/cancelStudent',function(req,res) {
    const selectTitle = req.body.row.title
    cancelStudent(selectTitle).then( (res) => {
        console.log(res);
    }).catch( (err) => {
        console.log(err);
    })
})

// 教师删除选题
router.post('/deleteSelect',function(req,res) {
    const deleteTitle = req.body.row.title
     deleteSelect(deleteTitle).then( (res) => {
         console.log(res);
     }).catch( (err) => {
         console.log(err);
     })
})

// 教师选中学生
router.post('/pickStudent',function(req,res) {
    const finalTitle = req.body.row.title
    const studentname = req.body.row.truename;
    pickStudent(finalTitle,studentname).then( (res) => {
        console.log(res);
    }).catch( (err) => {
        console.log(err);
    })
})

// 学生查看选题结果


module.exports = router