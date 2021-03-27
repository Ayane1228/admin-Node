const { query } = require('express-validator')
const { querySql,queryOne } = require('../db')

// 选题时判断是否是学生账号
function ifStudent(username) {
	return querySql(`
			SELECT
			role 
		FROM
		USER 
		WHERE
			username = '${ username }'
	`)
}

//选题页面显示选题表信息
function allSelect() {
    return querySql(`    
			SELECT
			select_table.title,
			select_table.teachername,
			select_table.needmajor,
			select_table.content,
			select_table.istrue,
			teacheraccount.phone,
			teacheraccount.email,
			teacheraccount.teacherrank 
		FROM
			select_table
			LEFT OUTER JOIN teacheraccount ON select_table.teacheraccount = teacheraccount.username
	`)
}

// 查询选题信息
function searchSelect(teacherName){
	return querySql(`
			SELECT
			* 
			FROM
				select_table 
			WHERE
				teachername LIKE '%${teacherName}%'
	`)
}

// 学生选题，更新选题表和学生表中内容
function choiceSelect(username,title){
	return querySql(`
			UPDATE select_table,
			studentaccount 
			SET select_table.choicestudent = '${username}',
			select_table.istrue = '不可选',
			select_table.pick = '待确认',
			studentaccount.choiceselect = '${title}' 
			WHERE
				select_table.title = '${title}' 
				AND select_table.choicestudent IS NULL 
				AND studentaccount.username = '${username}' 
				AND studentaccount.choiceselect IS NULL
	`)
}

// 学生取消选题
function cancelSelect(choicestudent){
	return querySql(`
			UPDATE select_table 
			SET istrue = '可选',
			choicestudent = NULL 
			WHERE
				choicestudent = '${choicestudent}';
			UPDATE studentaccount 
			SET choiceselect = NULL 
			WHERE
				username = '${choicestudent}'
	`)
}

// 自动填写创建选题时的默认信息
function showAddSelect(teacherName){
    return querySql(`
			SELECT
			truename,
			phone,
			email,
			office,
			teacherrank 
		FROM
			teacheraccount 
		WHERE
			username = '${teacherName}'
	`)
}

// 查看是否有重复选题
function repeatSelect(selectTitle){
	return querySql(`
		SELECT *
		FROM select_table
		WHERE title = '${selectTitle}'
	`)
}

// 教师创建新选题
function addSelect(newTitle,teacherName,newMajor,newContent,teacheraccount){
    return querySql(`
			INSERT INTO select_table ( id, title, teacheraccount,teachername, needmajor, content, istrue, pick )
			VALUES
				( id, '${newTitle}','${teacheraccount}', '${teacherName}', '${newMajor}', '${newContent}', '可选', '待确认' )
    `)
}

// 教师查看选题结果
function teacherSelect(teachername) {
	return querySql(`
			SELECT
			select_table.title,
			select_table.needmajor,
			select_table.pick,
			studentaccount.truename,
			studentaccount.studentID,
			studentaccount.classID,
			studentaccount.major,
			studentaccount.phone,
			studentaccount.email,
			studentaccount.introduction 
		FROM
			select_table
			LEFT OUTER JOIN studentaccount ON select_table.choicestudent = studentaccount.username 
		WHERE
			teacheraccount = '${teachername}';
	`)
}

// 教师选中学生
function pickStudent(finalTitle,studentname){
	return querySql(`
			UPDATE select_table,
			studentaccount 
			SET select_table.finalstudent = '${studentname}',
			select_table.pick = '已确认',
			studentaccount.finalselect = '${finalTitle}' 
			WHERE
				select_table.title = '${finalTitle}' 
				AND select_table.finalstudent IS NULL 
				AND studentaccount.truename = '${studentname}' 
				AND studentaccount.finalselect IS NULL
	`)
}

// 教师拒绝学生
function cancelStudent(selectTitle){
	return querySql(`
			UPDATE select_table 
			SET choicestudent = NULL,
			istrue = '可选' 
			WHERE
				title = '${selectTitle}';
			UPDATE studentaccount 
			SET choiceselect = NULL 
			WHERE
				choiceselect = '${selectTitle}'
	`)
}

// 教师删除选题
function deleteSelect(deleteTitle){
	return querySql(`
			DELETE 
			FROM
				select_table 
			WHERE
				title = '${deleteTitle}'
	`)
}

// 学生查看选题结果
function studentSelect(choicestudent){
	return queryOne(`
			SELECT
			select_table.title,
			select_table.teachername,
			select_table.needmajor,
			select_table.content,
			select_table.pick,
			teacheraccount.teacherrank,
			teacheraccount.phone,
			teacheraccount.email 
		FROM
			select_table
			LEFT OUTER JOIN teacheraccount ON select_table.teacheraccount = teacheraccount.username 
		WHERE
			choicestudent = '${choicestudent}'
	`)
}

module.exports = { 
	showAddSelect,addSelect,allSelect,ifStudent,searchSelect,
	choiceSelect,cancelSelect,repeatSelect,
	teacherSelect,cancelStudent,deleteSelect,
	pickStudent,studentSelect
}