/*
 * @Author: 群聊相关socket事件
 * @Date: 2020-02-29 11:06:12
 * @LastEditTime: 2020-03-01 17:08:16
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \tchat-servers\socket\group.js
 */
const { addGroup, quitGroup, findGroupInfo, createGroup, addGroupNotice, findGroupNotice, deleteGroupNotice } = require("../controllers/group");
module.exports = (io, socket, id) => {
  // 监听客户端添加群聊事件
  socket.on("addGroup", async (groupId, callback) => {
    try {
      // 执行添加群聊操作
      await addGroup(id, groupId);
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

      // 执行查询群聊信息数据
      const findGroupInfoResult = await findGroupInfo(id, groupId);
      // 返回群聊信息数据
      callback(findGroupInfoResult)
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    } catch (error) {
      console.log("添加群聊捕获到错误", error);
      io.to(socket.id).emit("error", error)
    }
  });
  // 监听客户端退出群聊事件
  socket.on("quitGroup", async (groupId, callback) => {
    try {
      // 执行退出群聊操作
      const quitGroupResult = await quitGroup(id, groupId);
      // 如果推出群聊成功返回群聊ID
      if (quitGroupResult) return callback(groupId)
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    } catch (error) {
      console.log("退出群聊捕获到错误", error);
      io.to(socket.id).emit("error", error)
    }
  });
  // 监听客户端创建群聊事件
  socket.on("createGroup", async (params, callback) => {
    try {
      // 执行创建群聊操作
      const createGroupResult = await createGroup(id, params);
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

      // 执行查询群聊信息数据
      const findGroupInfoResult = await findGroupInfo(id, createGroupResult);
      // 返回群聊信息数据
      callback(findGroupInfoResult);
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    } catch (error) {
      console.log("创建群聊捕获到错误", error);
      io.to(socket.id).emit("error", error)
    }
  });
  // 监听客户端添加群聊公告事件
  socket.on("addGroupNotice", async (params, callback) => {
    try {
      // 执行添加群聊公告操作
      await addGroupNotice(id, params);
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

      // 执行查询群聊公告数据
      const findGroupNoticeResult = await findGroupNotice(id, params.groupId);
      // 返回群聊公告信息数据
      callback(findGroupNoticeResult);
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

      // 给所有群成员发送群聊公告数据
      socket.broadcast.to(params.groupId).emit('onGetGroupNotice', findGroupNoticeResult);

    } catch (error) {
      console.log("发布群聊公告捕获到错误", error);
      io.to(socket.id).emit("error", error)
    }
  });
  // 监听客户端查询群聊公告事件
  socket.on("findGroupNotice", async (groupId, callback) => {
    try {
      // 执行查询群聊公告数据
      const findGroupNoticeResult = await findGroupNotice(id, groupId);
      // 返回查询群聊公告信息数据
      callback(findGroupNoticeResult)
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    } catch (error) {
      console.log("发布群聊公告捕获到错误", error);
      io.to(socket.id).emit("error", error)
    }
  });
  // 监听客户端删除群聊公告事件
  socket.on("deleteGroupNotice", async (params, callback) => {
    try {
      // 执行删除群聊公告操作
      await deleteGroupNotice(id, params);
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

      // 执行查询群聊公告数据
      const findGroupNoticeResult = await findGroupNotice(id, params.groupId);
      // 返回查询群聊公告信息数据
      callback(findGroupNoticeResult)
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

      // 给所有群成员发送删除群聊公告后的数据

    } catch (error) {
      console.log("发布群聊公告捕获到错误", error);
      io.to(socket.id).emit("error", error)
    }
  });
  // 监听客户端获取群聊信息事件
  socket.on("findGroupInfo", async (groupId, callback) => {
    try {
      // 执行创建群聊操作
      const findGroupInfoResult = await findGroupInfo(id, groupId);
      // 返回群聊信息数据
      callback(findGroupInfoResult);
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    } catch (error) {
      console.log("创建群聊捕获到错误", error);
      io.to(socket.id).emit("error", error)
    }
  });
};