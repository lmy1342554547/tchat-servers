/*
 * @Author: socket Module
 * @Date: 2020-01-09 17:03:44
 * @LastEditTime: 2020-02-29 11:58:34
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \tchat-server\modules\db-socket.js
 */
// socket用户表
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const socket = new Schema(
  {
    // 用户Id
    user_id: { type: Schema.Types.ObjectId, ref: "User", index: true, trim: true, required: true },
    // socketId
    socket_id: { type: String, trim: true, required: true },
    // ip地址
    ip: { type: String },
    // 浏览器
    browser: { type: String },
    // 登陆设备
    device: { type: String },
    // 在线状态
    online_status: { type: Boolean, default: true },
    // 上线时间
    online_time: { type: Date, default: Date.now }
  },
  {
    versionKey: false, // 不显示版本号
    timestamps: {
      createdAt: false,
      updatedAt: "online_time"
    }
  }
);

module.exports = mongoose.model("Socket", socket);
