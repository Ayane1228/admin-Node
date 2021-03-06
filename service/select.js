const { query } = require('express-validator')
const { querySql,queryOne} = require('../db')

// 添加选题时的默认信息
function showAddSelect(teacherName){
    return querySql(`
			SELECT truename,phone,email,office,teacherrank 
			FROM teacheraccount 
			WHERE username = '${teacherName}' `)
}

// 创建新选题
function addSelect(newTitle,teacherName,newMajor,newContent){
    // 3表示最多有三人可选该选题
    return querySql(
        `   INSERT INTO select_table (id,title,teachername,major,content,istrue,personnumber)
            VALUES (id, '${newTitle}', '${teacherName}', '${newMajor}', '${newContent}', '可选') 
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

// 2个参数 当前登录的用户名，当前点击的选题题目
function choiceSelect(username,title){	
	return querySql(`
	SELECT
	IF
		( ( SELECT USER.role FROM USER WHERE USER.username  = '${username}') = 'student', 'true', 'false' )
	`)

}

// 添加学生到选择名单中
function addStundetToSelect(username,title){
	return querySql(`
	UPDATE select_table 
	SET choicestudent = '${username}',istrue = '不可选' 
	WHERE
		title = '${title}'
	`)
}

module.exports = { showAddSelect,addSelect,allSelect,choiceSelect,addStundetToSelect }