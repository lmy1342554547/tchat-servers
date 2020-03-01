/*
 * @Author: 群聊消息Module
 * @Date: 2019-11-22 16:26:51
 * @LastEditTime: 2020-02-28 10:40:32
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \tchat-server\modules\db-groupMessage.js
 */
// 群聊消息表
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const groupMessage = new Schema(
  {
    // 所属群聊ID
    group_id: { type: Schema.Types.ObjectId, trim: true, require: true, index: true },
    // 消息用户ID
    user_id: { type: Schema.Types.ObjectId, ref: 'User', trim: true, require: true, index: true },
    // 消息发送时间
    send_time: { type: Date, default: Date.now },
    // 消息类型 text文本 image图片 share分享 voice语音 system系统
    message_type: { type: String, enum: ['text', 'image', 'share', 'voice', 'system'], default: "text" },
    // 消息内容
    content: { type: String }
  },
  {
    versionKey: false,  // 不显示版本号
    minimize: false,
    timestamps: {
      createdAt: "send_time",
      updatedAt: false,
    }
  })

module.exports = mongoose.model('GroupMessage', groupMessage)