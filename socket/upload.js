/*
 * @Author: 上传相关socket事件
 * @Date: 2020-03-02 16:46:12
 * @LastEditTime: 2020-03-02 16:48:45
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \tchat-servers\socket\upload.js
 */
const { createQiuniuToken } = require("../controllers/upload");

module.exports = (io, socket, id) => {
  // 监听客户端获取七牛上传Token事件
  socket.on("getQiniuToken", callback => {
    try {
      // 执行创建七牛Token操作
      const createQiuniuTokenResult = createQiuniuToken();
      // 返回七牛Token数据
      callback(createQiuniuTokenResult);
      // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    } catch (error) {
      console.log("客户端获取七牛Token捕获到错误", error);
      io.to(socket.id).emit("error", error)
    }
  });
};