/*
 *  选题相关接口  
 */

const express = require('express')
const Result = require('../models/Result')
const 
    {   showAddSelect,addSelect,allSelect,ifStudent,searchSelect,
        choiceSelect,cancelSelect,repeatSelect,
        teacherSelect,cancelStudent,
        deleteSelect,pickStudent,studentSelect
     }  = require('../service/select')

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
    repeatSelect(result.newTitle).then( (ifRepeat) => {
        if( ifRepeat.length != 0 ){
            new Result(ifRepeat,'已有相同选题').success(res)
        } else {
        addSelect(result.newTitle,result.teacherName,result.newMajor,result.newContent,req.user.username).then( (results) => {
            new Result(results,'添加选题成功,请刷新页面').success(res)
        }).catch( (error) => {
            new Result(error,'添加选题失败').fail(res)
        })
        }
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

// 搜索课题
router.post('/searchSelect',function(req,res) {
    const teacherName = req.body.teacherName
    searchSelect(teacherName).then( (result) => {
        if( result.length === 0 ){
            new Result(result,'无结果').success(res)
        } else {
            new Result(result,'查询成功').success(res)
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

// 学生取消选题
router.get('/cancelSelect',function(req,res){
    cancelSelect(req.user.username).then( (results) => {
        if (results[0].changedRows === 1 ){
            new Result(results,'取消选题成功').success(res)
        } else {
            new Result(results,'取消选题失败').fail(res)
        }
    }).catch( (err) => {
        console.log(err);
    })
})

// 教师查看选题
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
    console.log(req);
    const selectTitle = req.body.row.title
    cancelStudent(selectTitle).then( (results) => {
        new Result(results,'取消选择学生成功，请刷新页面！').success(res)
    }).catch( (err) => {
        console.log(err);
        new Result('取消选择学生失败，请重试').fail(res)
    })
})

// 教师删除选题
router.post('/deleteSelect',function(req,res) {
    const deleteTitle = req.body.row.title
     deleteSelect(deleteTitle).then( (results) => {
        new Result(results,'查询je')
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
router.get('/studentSelect',function(req,res){
    studentSelect(req.user.username).then(studentSelect => {
        if (studentSelect) {
            new Result(studentSelect,'查询到选题').success(res)
        } else {
            new Result('查询失败').fail(res)
        }
    }).catch( (err) => {
        console.log(err);
    })
})

module.exports = router