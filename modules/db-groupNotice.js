/*
 * @Author: 群公告Module
 * @Date: 2020-02-20 17:09:11
 * @LastEditTime: 2020-02-29 22:30:45
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \tchat-server\modules\db-groupNotice.js
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const groupNotice = new Schema(
  {
    // 群聊ID
    group_id: { type: Schema.Types.ObjectId, ref: "Group", trim: true, require: true, index: true },
    // 创建者ID
    creator_id: { type: Schema.Types.ObjectId, ref: "User", index: true, require: true, trim: true },
    // 标题
    title: { type: String, trim: true },
    // 内容
    content: { type: String, trim: true, default: '群主没有留下任何公告' },
    // 已读用户
    read_user: [{ type: Schema.Types.ObjectId }],
    // 创建时间
    create_time: { type: Date, default: Date.now }

  },
  {
    versionKey: false,  // 不显示版本号
    timestamps: {
      createdAt: "create_time",
      updatedAt: false,
    }
  })

module.exports = mongoose.model('GroupNotice', groupNotice)