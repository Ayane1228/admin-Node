const { query } = require('express-validator')
const { querySql,queryOne} = require('../db')

// 创建选题时的默认信息
function showAddSelect(teacherName){
    return querySql(`
			SELECT truename,phone,email,office,teacherrank 
			FROM teacheraccount 
			WHERE username = '${teacherName}' `)
}

// 创建新选题
function addSelect(newTitle,teacherName,newMajor,newContent,teacheraccount){
    return querySql(
        `
		INSERT INTO select_table ( id, title, teachername, needmajor, content, istrue, teacheraccount )
		VALUES
			( id, '${newTitle}', '${teacherName}', '${newMajor}', '${newContent}', '可选', '${teacheraccount}' ) 
        `)
}

//显示选题表信息
function allSelect() {
    return querySql(`    
	SELECT
		select_table.title,
		select_table.teachername,
		select_table.major,
		select_table.content, 
		select_table.istrue,
		teacheraccount.phone,
		teacheraccount.email,
		teacheraccount.teacherrank
    FROM
		select_table
	LEFT OUTER JOIN teacheraccount ON select_table.teachername = teacheraccount.truename`)
}

// 判断是否是学生账号
function ifStudent(username) {
	return querySql(`
	SELECT
		role 
	FROM
		user 
	WHERE
		username = '${ username }'
	`)
}

// 学生选题
function choiceSelect(username,title){
	return querySql(`
	UPDATE select_table 
	SET choicestudent = '${username}',istrue = '不可选' 
	WHERE
		title = '${title}';
	UPDATE studentaccount 
	SET choiceselect = '${title}'
	WHERE
		username = '${username}';
	`)
}

// 查看教师的选题结果
function teacherSelect(teachername) {
	return querySql(`
		SELECT
			select_table.title,
			select_table.needmajor,
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


// 教师拒绝学生


module.exports = { showAddSelect,addSelect,allSelect,ifStudent,choiceSelect,teacherSelect }