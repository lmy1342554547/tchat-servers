/*
 * @Author: your name
 * @Date: 2020-02-20 11:31:49
 * @LastEditTime: 2020-02-29 19:53:51
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \tchat-server\modules\db-groupUser.js
 */
// 群用户集合
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const groupUser = new Schema(
  {
    // 群聊ID
    group_id: { type: Schema.Types.ObjectId,ref:'Group' ,trim: true, require: true, index: true },
    // 用户ID
    user_id: { type: Schema.Types.ObjectId, ref: 'User', trim: true, require: true, index: true },
    // 群昵称
    nickname: { type: String, trim: true },
    // 是否为会话
    is_dialogue: { type: Boolean, default: false },
    // 会话识别字段
    dialogue_type: { type: String, default: "group" },
    // 进群时间
    add_time: { type: Date, default: Date.now },
    // 聊天时间
    chat_time: { type: Date, default: Date.now },
    // 未读消息条数
    unread: { type: Number, default: 0 }
  },
  {
    versionKey: false,  // 不显示版本号
    minimize: false,
    timestamps: {
      createdAt: "add_time",
      updatedAt: false,
    }
  })

module.exports = mongoose.model('GroupUser', groupUser)