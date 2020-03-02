/*
 * @Author: 消息相关socket事件
 * @Date: 2020-02-29 11:06:32
 * @LastEditTime: 2020-03-02 16:58:54
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \tchat-servers\socket\message.js
 */
const { saveFriendMessage, saveGroupMessage, findFriendLastMessage, findGroupLastMessage, findFriendChatRecord, findGroupChatRecord } = require("../controllers/message");
const { resetFriendUnread, resetGroupUnread } = require("../controllers/common");
const { findFriendInfo } = require("../controllers/friend");
const { findGroupInfo } = require("../controllers/group");
const { findFriendSocketId } = require("../controllers/socket");

module.exports = (io, socket, id) => {
  // 监听客户端发送好友消息事件
  socket.on("sendFriendMessage", async (params, callback) => {
    try {
      // 执行保存好友消息操作
      await saveFriendMessage(id, params);
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

      // 执行查询最后一条聊天消息数据
      const findFriendLastMessageResult = await findFriendLastMessage(id, params.friendId);
      // 执行查询好友信息数据
      const findFriendInfoResult = await findFriendInfo(id, params.friendId);
      // 返回好友信息数据和最后一条消息记录数据
      callback(findFriendInfoResult, findFriendLastMessageResult)
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

      // 执行查询好友socketID信息
      const friendsocketIdResult = await findFriendSocketId(params.friendId);
      // 如果好友在线
      if (friendsocketIdResult) {
        // 执行查询,好友列表中我的信息
        const friendMyInfoResult = await findFriendInfo(params.friendId, id);
        // 向好友客户端发送我的信息数据
        io.to(friendsocketIdResult).emit("onUpdateFriendList", friendMyInfoResult);
        // 向好友客户端发送最后一条聊天记录数据
        io.to(friendsocketIdResult).emit("onUpdateFriendChatRecord", findFriendLastMessageResult);
      }
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    } catch (error) {
      console.log("发送好友消息捕获到错误", error);
      io.to(socket.id).emit("error", error)
    }
  });
  // 监听客户端发送群聊消息事件
  socket.on("sendGroupMessage", async (params, callback) => {
    try {
      // 执行保存群聊消息操作
      await saveGroupMessage(id, params);
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

      // 执行查询最后一条聊天消息数据
      const findGroupLastMessageResult = await findGroupLastMessage(params.groupId);
      // 执行查询群聊信息数据
      const findGroupInfoResult = await findGroupInfo(id, params.groupId);
      // 返回群聊信息数据和最后一条消息记录数据
      callback(findGroupInfoResult, findGroupLastMessageResult)
      // 查询成功广播群聊最后一条聊天消息数据
      socket.broadcast.to(findGroupInfoResult._id).emit('onUpdateGroupChatRecord', findGroupLastMessageResult);
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    } catch (error) {
      console.log("发送群聊消息捕获到错误", error);
      io.to(socket.id).emit("error", error)
    }
  });
  // 监听客户端查询好友聊天记录事件
  socket.on("findFriendChatRecord", async (friendId, callback) => {
    try {
      // 执行查询好友聊天记录数据
      const friendChatRecordResult = await findFriendChatRecord(id, friendId);
      // 执行重置好友未读消息数据
      await resetFriendUnread(id, friendId, true);
      // 执行查询好友信息数据
      const findFriendInfoResult = await findFriendInfo(id, friendId);
      // 返回好友信息数据和聊天记录数据
      callback(findFriendInfoResult, friendChatRecordResult);
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    } catch (error) {
      console.log("查询好友聊天记录数据捕获到错误", error);
      io.to(socket.id).emit("error", error)
    }
  });
  // 监听客户端查询群聊聊天记录事件
  socket.on("findGroupChatRecord", async (groupId, callback) => {
    try {
      // 执行查询群聊聊天记录数据
      const findGroupChatRecordResult = await findGroupChatRecord(id, groupId);
      // 执行重置群聊未读消息数据
      await resetGroupUnread(id, groupId, true);
      // 执行查询群聊信息数据
      const findGroupInfoResult = await findGroupInfo(id, groupId);
      // 返回群聊信息数据和聊天记录数据
      callback(findGroupInfoResult, findGroupChatRecordResult);
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    } catch (error) {
      console.log("查询群聊聊天记录数据捕获到错误", error);
      io.to(socket.id).emit("error", error)
    }
  });
  // 监听客户端重置好友未读消息事件
  socket.on("resetFriendUnread", async (friendId, callback) => {
    try {
      // 执行重置群聊未读消息数据
      const resetFriendUnreadResult = await resetFriendUnread(id, friendId, true, new Date);
      if (resetFriendUnreadResult) {
        // 执行查询好友信息数据
        const findFriendInfoResult = await findFriendInfo(id, friendId);
        // 返回好友信息数据
        callback(findFriendInfoResult);
      }
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    } catch (error) {
      console.log("重置好友聊天未读记录数据捕获到错误", error);
      io.to(socket.id).emit("error", error)
    }
  });
  // 监听客户端重置群聊未读消息事件
  socket.on("resetGroupUnread", async (groupId, callback) => {
    try {
      // 执行重置群聊未读消息数据
      const resetGroupUnreadResult = await resetGroupUnread(id, groupId, true, new Date);
      if (resetGroupUnreadResult) {
        // 执行查询群聊信息数据
        const findGroupInfoResult = await findGroupInfo(id, groupId);
        // 返回群聊信息数据
        callback(findGroupInfoResult);
      }
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    } catch (error) {
      console.log("重置群聊聊天未读记录数据捕获到错误", error);
      io.to(socket.id).emit("error", error)
    }
  });
};