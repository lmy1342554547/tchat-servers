/*
 * @Author: 好友相关socket事件
 * @Date: 2020-02-29 11:04:04
 * @LastEditTime: 2020-03-01 13:31:42
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \tchat-servers\socket\friend.js
 */
const { addFriend, deleteFriend, updateFriendRemarkName,findFriendInfo } = require("../controllers/friend");
module.exports = (io, socket, id) => {
  // 监听客户端添加好友事件
  socket.on("addFriend", async (friendId, callback) => {
    try {
      // 执行添加好友操作
      await addFriend(id, friendId);
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

      // 执行查询好友信息数据
      const addFriendInfoResult = await findFriendInfo(id, friendId);
      // 返回添加好友信息数据
      callback(addFriendInfoResult)
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    } catch (error) {
      console.log("添加好友捕获到错误", error);
      io.to(socket.id).emit("error", error)
    }
  });
  // 监听客户端删除好友事件
  socket.on("deleteFriend", async (friendId, callback) => {
    try {
      // 执行删除好友操作
      const deleteFriendResult = await deleteFriend(id, friendId);
      // 删除成功返回删除好友的_id
      if (deleteFriendResult) return callback(friendId);
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    } catch (error) {
      console.log("删除好友捕获到错误", error);
      io.to(socket.id).emit("error", error)
    }

  });
  // 监听客户端更新好友备注名事件
  socket.on("updateFriendRemarkName", async (params, callback) => {
    try {
      // 执行更新好友备注操作
      await updateFriendRemarkName(id, params.friendId, params.remarkName);
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

      // 执行查询好友信息数据
      const friendInfoResult = await findFriendInfo(id, friendId);
      // 返回好友信息数据
      callback(friendInfoResult);
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    } catch (error) {
      console.log("删除好友捕获到错误", error);
      io.to(socket.id).emit("error", error)
    }
  });
};