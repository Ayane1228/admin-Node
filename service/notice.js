const { querySql,queryOne} = require('../db')

// 返回值就是查询数据库的结果
function findNotice() {
    return querySql(`SELECT noticeTitle,noticeTime,noticeContent FROM notice`)
  }

function addNotice(newTitle,newContent) {
  // 插入语句
  return queryOne(`INSERT INTO notice VALUES (id,'${newTitle}',Now(),'${newContent}')`)
}

module.exports = { findNotice,addNotice }