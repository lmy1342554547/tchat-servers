/*
 * @Author: socket处理
 * @Date: 2020-02-29 11:01:27
 * @LastEditTime: 2020-03-02 17:01:31
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \tchat-servers\socket\index.js
 */
const dialogueHandle = require("./dialogue");
const friendHandle = require("./friend");
const groupHandle = require("./group");
const messageHandle = require("./message");
const searchHandle = require("./search");
const socketHandle = require("./socket");
const userHandle = require("./user");
const uploadHandle = require("./upload");
const verifyToken = require("../middlewares/verifyToken");

module.exports = io => {
  // socket客户端连接Token验证中间件处理
  io.use((socket, next) => {
    if (verifyToken(socket.handshake.query.token)) {
      // 验证成功执行下个事件
      return next();
    }
    // 验证失败返回错误信息
    return next(new Error(`Token验证失败,请重新登录! 时间 =>${new Date().toLocaleString()}`));
  });
  // socket客户端连接处理
  io.on("connection", socket => {
    // 验证Token获取用户ID
    const id = verifyToken(socket.handshake.query.token)
    dialogueHandle(io,socket,id);
    friendHandle(io,socket,id);
    groupHandle(io,socket,id);
    messageHandle(io,socket,id);
    searchHandle(io,socket,id);
    socketHandle(io,socket,id);
    uploadHandle(io,socket,id);
    userHandle(io,socket,id);
  });
}