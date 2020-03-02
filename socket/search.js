/*
 * @Author: 搜索相关socket事件
 * @Date: 2020-02-29 11:07:01
 * @LastEditTime: 2020-03-01 19:46:37
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \tchat-servers\socket\search.js
 */
const { searchUser } = require("../controllers/search");

module.exports = (io, socket, id) => {
  // 监听客户端搜索用户事件
  socket.on("searchUser", async (name, callback) => {
    try {
      // 执行搜索用户操作
      const searchUserResult =  await searchUser(name);
      // 返回搜索用户数据
      callback(searchUserResult);
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    } catch (error) {
      console.log("搜索用户捕获到错误", error);
      io.to(socket.id).emit("error", error)
    }
  });
  // 监听客户端搜索群聊事件
  socket.on("searchGroup", async (params, callback) => {

  });
};