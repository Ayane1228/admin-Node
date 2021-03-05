const { querySql,queryOne} = require('../db')

function showAddSelect(teacherName){
    return querySql(`SELECT truename,phone,email,office,teacherrank FROM teacheraccount WHERE username = '${teacherName}' `)
}
function addSelect(newTitle,teacherName,newMajor,newContent){
    // 3表示最多有三人可选该选题
    return querySql(
        `   INSERT INTO select_table (id,title,teachername,major,content,istrue,personnumber)
            VALUES (id, '${newTitle}', '${teacherName}', '${newMajor}', '${newContent}', '可选','3') 
        `)
}

//显示选题表信息
function allSelect() {
    //连接查询
    return querySql(`    SELECT
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

// 确定选题账号是否在学生表中
function ifStudendtAccount(username) {
	return querySql(`
		select * from studentaccount where username ='${username}';
	`)
}

// 学生选择选题
// 1.判断当前选题的 istrue是否为可选且personnumber的值大于0
// 2.将可选人数personnumber减一，当personnumber为0时，设置istrue为不可选
// 3.select表中新增一列存放选题人名字 
// 4.studentaccount表中存放当前选择的选题信息
function choiceSelect(studentName,selectTitle) {
	return querySql(`
		SELECT * FROM select_table 
		WHERE title = '${selectTitle}'
		if( (istrue = '可选'),(personnumber > 0) )
	`)
}






module.exports = { showAddSelect,addSelect,allSelect,ifStudendtAccount,choiceSelect }