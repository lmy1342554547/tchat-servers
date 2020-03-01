const mongoose = require('mongoose')
const Schema = mongoose.Schema
const user = new Schema(
  {
    // 用户名
    name: { type: String, trim: true, index: true, unique: true },
    // 用户密码
    password: { type: String, trim: true },
    // 用户密保答案
    protection: { type: String, trim: true },
    // 用户类型 0-普通用户 1-GIthub用户
    type: { type: Number, default: 0 },
    // 用户头像
    avatar: { type: String, default: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png' },
    // 用户性别
    sex: { type: String, default: '未设置' },
    // 用户年龄
    age: { type: String, default: '未设置' },
    // 用户个性签名
    signature: { type: String, maxlength: 80, default: '欢迎使用Tchat,如果发现Bug可以在群里反馈谢谢支持' },
    // 用户QQ
    qq: { type: String, default: '未设置' },
    // 用户微信
    weixin: { type: String, default: '未设置' },
    // 用户邮箱
    email: { type: String, default: '未设置' },
    // 用户Github
    github: { type: String, default: '未设置' },
    // 注册时间
    create_time: { type: Date, default: Date.now }
  },
  {
    versionKey: false,  // 不显示版本号
    minimize: false,  // 允许写入空值
    timestamps: {
      createdAt: "create_time", // 设置文档创建时间的字段
      updatedAt: false
    }
  })

module.exports = mongoose.model('User', user)