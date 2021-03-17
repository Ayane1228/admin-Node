const { querySql,queryOne} = require('../db')

// 查询公告
function findNotice() {
    return querySql(`
            SELECT noticeTitle,noticeTime,noticeContent 
            FROM notice
          `)
  }

// 发布公告
function addNotice(newTitle,newContent) {
  return queryOne(`
          INSERT INTO 
          notice 
          VALUES 
          (id,'${newTitle}',Now(),'${newContent}')
        `)
}

// 删除公告
function deleteNotice(deleteNoticetitle,deleteNoticeTime) {
  return queryOne(`
          DELETE FROM notice 
          WHERE 
          noticeTitle = '${deleteNoticetitle}'
        `)
}

module.exports = { findNotice,addNotice,deleteNotice }