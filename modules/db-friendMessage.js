/*
 * @Author: friendMessageModule
 * @Date: 2019-11-22 16:26:39
 * @LastEditTime: 2020-02-27 14:26:49
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \tchat-server\modules\db-friendMessage.js
 */
// 好友消息表
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const friendMessage = new Schema(
  {
    // 消息发送人ID
    creator_id: { type: Schema.Types.ObjectId, ref: 'User', trim: true, require: true, index: true },
    // 消息接收人ID
    friend_id: { type: Schema.Types.ObjectId, ref: 'User', trim: true, require: true, index: true },
    // 消息类型 text文本 image图片 share分享 voice语音 system系统
    message_type: { type: String, enum: ['text', 'image', 'share', 'voice', 'system'], default: "text" },
    // 消息内容
    content: { type: String, trim: true },
    // 消息发送时间
    send_time: { type: Date, default: Date.now }
  },
  {
    versionKey: false,  // 不显示版本号
    minimize: false,
    timestamps: {
      createdAt: "send_time",
      updatedAt: false,
    }
  })

module.exports = mongoose.model('FriendMessage', friendMessage)