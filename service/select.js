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
        `   INSERT INTO select_table (id,title,teachername,major,content,istrue,teacheraccount)
            VALUES (id, '${newTitle}', '${teacherName}', '${newMajor}', '${newContent}', '可选','${teacheraccount}') 
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

// 添加学生到选择名单中
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
	querySql(`
			SELECT
			title,
			major,
			choicestudent 
		FROM
			select_table 
		WHERE
			teacheraccount = '${teachername}';
	`)
}



module.exports = { showAddSelect,addSelect,allSelect,ifStudent,choiceSelect,teacherSelect }