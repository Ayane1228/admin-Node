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
    return querySql(`
            SELECT 
    `)
}

module.exports = { showAddSelect,addSelect,allSelect }