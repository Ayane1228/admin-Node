const { querySql,queryOne} = require('../db')

// 返回值就是查询数据库的结果
function findNotice() {
    return querySql(`SELECT noticeTitle,noticeTime,noticeContent FROM notice`)
  }


module.exports = {findNotice}