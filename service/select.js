const { querySql,queryOne} = require('../db')

function showAddSelect(teacherName){
    return querySql(`SELECT truename,phone,email,office,teacherrank FROM teacheraccount WHERE username = '${teacherName}' `)
}
function addSelect(newTitle,teacherName,newMajor,newContent){
    // 1表示可选，3表示最多有三人可选该选题
    return querySql(
        `   INSERT INTO select_table (id,title,teachername,major,content,istrue,personnumber)
            VALUES (id, '${newTitle}', '${teacherName}', '${newMajor}', '${newContent}', '可选','0') 
        `)
}
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

module.exports = { showAddSelect,addSelect,allSelect }