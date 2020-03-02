/*
 * @Author: 搜索相关数据库操作
 * @Date: 2020-02-29 11:10:28
 * @LastEditTime: 2020-03-01 19:45:23
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \tchat-servers\controllers\search.js
 */
const userModule = require("../modules/db-user");

module.exports = {
  // 搜索用户
  searchUser(name) {
    return new Promise((resolve, reject) => {
      if (!name) {
        return reject("搜索内容不能为空!");
      } else {
        userModule.find(
          { name: { $regex: name } },
          "-password -qq -weixin -email -github -create_time -protection -updatedAt"
        ).sort({ _id: -1 }).then(searchUserResult => {
          if (searchUserResult.length > 0) {
            return resolve(searchUserResult)
          } else {
            return reject("未查询到用户!");
          }
        });
      }
    })
  }
};