/*
 * @Author: 会话相关socket事件
 * @Date: 2020-02-29 11:05:46
 * @LastEditTime: 2020-03-01 13:09:32
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \tchat-servers\socket\dialogue.js
 */
const { addFriendDialogue, addGroupDialogue, deleteFriendDialogue, deleteGroupDialogue } = require("../controllers/dialogue");
const { findFriendInfo } = require("../controllers/friend");
const { findGroupInfo } = require("../controllers/group");
const { findFriendChatRecord, findGroupChatRecord } = require("../controllers/message");
module.exports = (io, socket, id) => {
  // 监听客户端添加好友会话事件
  socket.on("addFriendDialogue", async (friendId, callback) => {
    try {
      // 执行添加好友会话操作
      await addFriendDialogue(id, friendId);
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

      // 执行查询好友信息数据
      const findFriendInfoResult = await findFriendInfo(id, friendId);
      // 执行查询好友聊天记录数据
      const findFriendChatRecordResult = await findFriendChatRecord(id, friendId);
      // 返回好友信息数据和好友聊天记录数据
      callback(findFriendInfoResult, findFriendChatRecordResult)
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    } catch (error) {
      console.log("添加好友会话捕获到错误", error);
      io.to(socket.id).emit("error", error)
    }
  });
  // 监听客户端添加群聊会话事件
  socket.on("addGroupDialogue", async (groupId, callback) => {
    try {
      // 执行添加群聊会话操作
      await addGroupDialogue(id, groupId);
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

      // 执行查询群聊信息数据
      const groupInfoResult = await findGroupInfo(id, groupId);
      // 执行查询群聊聊天记录数据
      const findGroupChatRecordResult = await findGroupChatRecord(id, groupId);
      // 返回群聊信息数据和群聊聊天记录数据
      callback(groupInfoResult, findGroupChatRecordResult)
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    } catch (error) {
      console.log("添加群聊会话捕获到错误", error);
      io.to(socket.id).emit("error", error)
    }
  });
  // 监听客户端删除好友会话事件
  socket.on("deleteFriendDialogue", async (friendId, callback) => {
    try {
      // 执行删除好友会话操作
      await deleteFriendDialogue(id, friendId);
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

      // 执行查询好友信息数据
      const findFriendInfoResult = await findFriendInfo(id, friendId);
      // 返回好友信息数据
      callback(findFriendInfoResult)
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    } catch (error) {
      console.log("删除好友会话捕获到错误", error);
      io.to(socket.id).emit("error", error)
    }
  });
  // 监听客户端删除群聊会话事件
  socket.on("deleteGroupDialogue", async (groupId, callback) => {
    try {
      // 执行删除群聊会话操作
      await deleteGroupDialogue(id, groupId)
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

      // 执行查询群聊信息数据
      const findGroupInfoResult = await findGroupInfo(id, groupId);
      // 返回群聊信息数据
      callback(findGroupInfoResult)
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    } catch (error) {
      console.log("删除群聊会话捕获到错误", error);
      io.to(socket.id).emit("error", error)
    }
  });
};