/*
 * @Author: friendModule
 * @Date: 2019-10-25 14:57:44
 * @LastEditTime: 2020-02-29 15:33:14
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \tchat-server\modules\db-friend.js
 */
// 好友表
const mongoose = require("mongoose")
const Schema = mongoose.Schema
const friend = new Schema(
  {
    // 创建者id 关联User集合
    creator_id: { type: Schema.Types.ObjectId, ref: "User", index: true, trim: true, required: true },
    // 好友id 关联User集合
    friend_id: { type: Schema.Types.ObjectId, ref: "User", index: true, trim: true, required: true },
    // 备注名称
    remark_name: { type: String, trim: true },
    // 是否为会话好友
    is_dialogue: { type: Boolean, default: false },
    // 会话识别字段
    dialogue_type: { type: String, default: "friend" },
    // 好友添加时间
    create_time: { type: Date, default: Date.now },
    // 未读消息条数
    unread: { type: Number, default: 0 },
    // 更新文档时间
    chat_time: { type: Date, default: Date.now }
  },
  {
    versionKey: false,  // 不显示版本号
    minimize: false,
    timestamps: {
      createdAt: "create_time", // 设置文档创建时间的字段
      updatedAt: false
    }
  })


module.exports = mongoose.model('Friend', friend)