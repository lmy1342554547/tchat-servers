/*
 * @Author: 群聊Module
 * @Date: 2019-11-12 19:48:18
 * @LastEditTime: 2020-02-29 20:16:35
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \tchat-server\modules\db-group.js
 */
// 
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const group = new Schema(
  {
    // 群聊名称
    name: { type: String, trim: true, require: true, index: true },
    // 创建者ID
    creator_id: { type: Schema.Types.ObjectId, ref: "User", index: true, require: true, trim: true },
    // 群介绍
    introduce: { type: String, default: '群主没有留下任何介绍' },
    // 群头像
    avatar: { type: String, default: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png' },
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

module.exports = mongoose.model('Group', group)