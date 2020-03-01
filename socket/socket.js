/*
 * @Author: socket相关事件
 * @Date: 2020-02-29 11:07:22
 * @LastEditTime: 2020-03-01 14:21:21
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \tchat-servers\socket\socket.js
 */
const { createSocket, deleteSocket, findSocketUserInfo, findFriendSocketIds } = require("../controllers/socket");
const { findFriendLastMessage, findGroupLastMessage } = require("../controllers/message");
const { findFriendList, findFriendInfo } = require("../controllers/friend");
const { findGroupList } = require("../controllers/group");

// 监听客户端连接事件
module.exports = async (io, socket, id) => {
  try {
    // 创建socket用户信息数据
    await createSocket(socket, id);
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    // 查询socket用户信息数据
    const socketUserInfoResult = await findSocketUserInfo(socket.id);
    // 向客户端发送socket用户信息数据
    socket.emit("onGetUserInfo", socketUserInfoResult);
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    // 查询socket用户好友列表
    const friendListResult = await findFriendList(id);
    // 向客户端发送socket用户好友列表数据
    socket.emit("onGetFriendList", friendListResult);
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    // 查询socket用户群聊列表
    const groupListResult = await findGroupList(id);
    // 向客户端发送socket用户群聊列表数据
    socket.emit("onGetGroupList", groupListResult);
    // 订阅所有群聊的广播消息
    groupListResult.forEach(item => {
      socket.join(item._id);
    });
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    // 查询所有在线好友socketID
    const friendSocketIdsResult = await findFriendSocketIds(id);
    friendSocketIdsResult.forEach(item => {
      // 向所有在线好友发送上线信息
      findFriendInfo(item.user_id, id).then(myUserInfo => {
        if (myUserInfo) {
          io.to(item.socket_id).emit("onUpdateFriendList", myUserInfo);
        }
      })
    });
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  } catch (error) {
    console.log("捕获到socket用户连接错误信息", error);
    socket.disconnect(true);
  }

  // 监听客户端断开连接事件
  socket.on("disconnect", async () => {
    try {
      // 删除断开连接socket用户信息
      await deleteSocket(socket.id);
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

      // 查询所有在线好友socketID
      const friendSocketIdsResult = await findFriendSocketIds(id);
      friendSocketIdsResult.forEach(item => {
        // 向所有在线好友发送下线信息
        findFriendInfo(item.user_id, id).then(myUserInfo => {
          if (myUserInfo) {
            io.to(item.socket_id).emit("onUpdateFriendList", myUserInfo);
          }
        })
      });
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    } catch (error) {
      console.log("客户端断开连接捕获到错误", error);
    }
  });
};