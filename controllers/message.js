/*
 * @Author: 消息相关数据库操作
 * @Date: 2020-02-29 11:08:54
 * @LastEditTime: 2020-03-01 16:15:55
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \tchat-servers\controllers\message.js
 */
const mongoose = require("mongoose");
const friendModule = require("../modules/db-friend");
const friendMessageModule = require("../modules/db-friendMessage");
const groupUserModule = require("../modules/db-groupUser");
const groupMessageModule = require("../modules/db-groupMessage");
const { isFriend, isGroup } = require("./common");
const { checkMessageType } = require("../utils/index");

module.exports = {
  // 查询好友最后一条聊天消息
  findFriendLastMessage(id, friendId) {
    return new Promise((resolve, reject) => {
      if (!id) {
        return reject("用户ID不能为空!");
      } else if (!mongoose.Types.ObjectId.isValid(id)) {
        return reject("用户ID不是有效值!");
      } else if (!friendId) {
        return reject("好友ID不能为空!");
      } else if (!mongoose.Types.ObjectId.isValid(friendId)) {
        return reject("好友ID不是有效值!");
      } else {
        friendMessageModule.aggregate([
          // 匹配数据
          {
            $match: {
              creator_id: { $in: [mongoose.Types.ObjectId(friendId), mongoose.Types.ObjectId(id)] },
              friend_id: { $in: [mongoose.Types.ObjectId(id), mongoose.Types.ObjectId(friendId)] }
            }
          },
          // 关联查询消息创建者信息
          { $lookup: { from: "users", localField: "creator_id", foreignField: "_id", as: "creatorInfo" } },
          // 拆分数组
          { $unwind: { path: "$creatorInfo", preserveNullAndEmptyArrays: true } },
          // 关联查询好友信息
          { $lookup: { from: "users", localField: "friend_id", foreignField: "_id", as: "friendInfo" } },
          // 拆分数组
          { $unwind: { path: "$friendInfo", preserveNullAndEmptyArrays: true } },
          // 定义字段
          {
            $project: {
              _id: "$_id",
              creator_name: "$creatorInfo.name",
              creator_id: "$creator_id",
              creator_avatar: "$creatorInfo.avatar",
              creator_type: "$creatorInfo.type",
              friend_name: "$friendInfo.name",
              friend_id: "$friend_id",
              friend_avatar: "$friendInfo.avatar",
              friend_type: "$friendInfo.type",
              message_type: "$message_type",
              content: "$content",
              send_time: "$send_time"
            }
          },
          // 排序
          { $sort: { _id: -1 } }
        ])
          .limit(1)
          .then(findMessageResult => {
            if (findMessageResult.length >= 1) {
              // 查询到数据返回数据
              return resolve(findMessageResult[0]);
            } else {
              // 未查询到数据返回undefined
              return resolve(undefined);
            }
          })
      }
    })

  },
  // 查询好友聊天记录
  findFriendChatRecord(id, friendId) {
    return new Promise((resolve, reject) => {
      if (!id) {
        return reject("用户ID不能为空!");
      } else if (!mongoose.Types.ObjectId.isValid(id)) {
        return reject("用户ID不是有效值!");
      } else if (!friendId) {
        return reject("好友ID不能为空!");
      } else if (!mongoose.Types.ObjectId.isValid(friendId)) {
        return reject("好友ID不是有效值!");
      } else {
        isFriend(id, friendId).then(isFriendResult => {
          if (isFriendResult) {
            friendMessageModule.aggregate([
              // 匹配数据
              {
                $match: {
                  creator_id: { $in: [mongoose.Types.ObjectId(friendId), mongoose.Types.ObjectId(id)] },
                  friend_id: { $in: [mongoose.Types.ObjectId(id), mongoose.Types.ObjectId(friendId)] }
                },
              },
              // 关联查询创建者信息
              { $lookup: { from: "users", localField: "creator_id", foreignField: "_id", as: "creatorInfo" } },
              // 拆分数组
              { $unwind: { path: "$creatorInfo", preserveNullAndEmptyArrays: true } },
              // 关联查询创建者信息
              { $lookup: { from: "users", localField: "friend_id", foreignField: "_id", as: "friendInfo" } },
              // 拆分数组
              { $unwind: { path: "$friendInfo", preserveNullAndEmptyArrays: true } },
              // 定义字段
              {
                $project: {
                  _id: "$_id",
                  creator_name: "$creatorInfo.name",
                  creator_id: "$creator_id",
                  creator_avatar: "$creatorInfo.avatar",
                  creator_type: "$creatorInfo.type",
                  friend_name: "$friendInfo.name",
                  friend_id: "$friend_id",
                  friend_avatar: "$friendInfo.avatar",
                  friend_type: "$friendInfo.type",
                  message_type: "$message_type",
                  content: "$content",
                  send_time: "$send_time"
                }
              },
              // 排序
              { $sort: { _id: 1 } },
              // 待添加分页
            ]).then(findMessageResult => {
              return resolve(findMessageResult);
            })
          } else {
            return reject("该用户不是你的好友,查询失败!");
          }
        })
      }
    })
  },
  // 查询群聊最后一条聊天消息
  findGroupLastMessage(groupId) {
    return new Promise((resolve, reject) => {
      if (!groupId) {
        return reject("群聊ID不能为空!");
      } else if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return reject("群聊ID不是有效值!");
      } else {
        groupMessageModule.aggregate([
          // 匹配数据
          { $match: { group_id: mongoose.Types.ObjectId(groupId) } },
          // 关联查询消息创建者信息
          { $lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "userInfo" } },
          // 拆分数组
          { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
          // 定义字段
          {
            $project: {
              _id: "$_id",
              group_id: "$group_id",
              user_name: "$userInfo.name",
              user_id: "$user_id",
              user_avatar: "$userInfo.avatar",
              user_type: "$userInfo.type",
              message_type: "$message_type",
              content: "$content",
              send_time: "$send_time"
            }
          },
          { $sort: { _id: -1 } }
        ]).limit(1).then(findMessageResult => {
          if (findMessageResult.length >= 1) {
            // 查询到最后一条消息
            return resolve(findMessageResult[0]);
          } else {
            // 未查询到数据返回undefined
            return resolve(undefined);
          }
        })
      }
    })
  },
  // 查询群聊聊天记录
  findGroupChatRecord(id, groupId) {
    return new Promise((resolve, reject) => {
      if (!id) {
        return reject("用户ID不能为空!");
      } else if (!mongoose.Types.ObjectId.isValid(id)) {
        return reject("用户ID不是有效值!");
      } else if (!groupId) {
        return reject("群聊ID不能为空!");
      } else if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return reject("群聊ID不是有效值!");
      } else {
        isGroup(id, groupId).then(isGroupResult => {
          if (isGroupResult) {
            groupMessageModule.aggregate([
              // 匹配数据
              { $match: { group_id: mongoose.Types.ObjectId(groupId) } },
              // 关联查询发送者信息
              { $lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "userInfo" } },
              // 拆分数组
              { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
              // 定义字段
              {
                $project: {
                  _id: "$_id",
                  group_id: "$group_id",
                  user_name: "$userInfo.name",
                  user_id: "$userInfo._id",
                  user_avatar: "$userInfo.avatar",
                  user_type: "$userInfo.type",
                  message_type: "$message_type",
                  content: "$content",
                  send_time: "$send_time"
                }
              },
              // 排序
              { $sort: { _id: 1 } },
              // 待添加分页
            ]).then(findMessageResult => {
              return resolve(findMessageResult)
            })
          } else {
            return reject("你不是该群聊成员,查询失败!");
          }
        })
      }
    })
  },
  // 保存好友消息
  saveFriendMessage(id, params) {
    return new Promise((resolve, reject) => {
      if (!id) {
        return reject("用户ID不能为空!");
      } else if (!mongoose.Types.ObjectId.isValid(id)) {
        return reject("用户ID不是有效值!");
      } else if (!params.friendId) {
        return reject("好友ID不能为空!");
      } else if (!mongoose.Types.ObjectId.isValid(params.friendId)) {
        return reject("好友ID不是有效值!");
      } else if (!checkMessageType(params.messageType)) {
        return reject("消息类型参数错误!");
      } else if (!params.content.trim()) {
        return reject("消息内容不能为空!");
      } else {
        isFriend(id, params.friendId).then(isFriendResult => {
          if (isFriendResult) {
            friendMessageModule.create({
              creator_id: id,
              friend_id: params.friendId,
              message_type: params.messageType,
              content: params.content
            }).then(createResult => {
              if (createResult) {
                friendModule.bulkWrite([
                  // 更新好友的好友数据
                  {
                    updateOne: {
                      filter: { creator_id: params.friendId, friend_id: id },
                      update: { is_dialogue: true, chat_time: new Date, $inc: { unread: 1 } }
                    }
                  },
                  // 更新自己的好友数据
                  {
                    updateOne: {
                      filter: { creator_id: id, friend_id: params.friendId },
                      update: { is_dialogue: true, chat_time: new Date, unread: 0 }
                    }
                  }
                ]).then(updateResult => {
                  if (updateResult.result.ok == 1) {
                    return resolve(true);
                  } else {
                    return reject("好友消息发送失败!");
                  }
                })
              } else {
                return reject("好友消息发送失败!");
              }
            })
          } else {
            return reject("该用户不是你的好友,发送失败!");
          }
        })
      }
    })
  },
  // 保存群聊消息
  saveGroupMessage(id, params) {
    return new Promise((resolve, reject) => {
      if (!id) {
        return reject("用户ID不能为空!");
      } else if (!mongoose.Types.ObjectId.isValid(id)) {
        return reject("用户ID不是有效值!");
      } else if (!params.groupId) {
        return reject("群聊ID不能为空!");
      } else if (!mongoose.Types.ObjectId.isValid(params.groupId)) {
        return reject("群聊ID不是有效值!");
      } else if (!checkMessageType(params.messageType)) {
        return reject("消息类型参数错误!");
      } else if (!params.content.trim()) {
        return reject("消息内容不能为空!");
      } else {
        isGroup(id, params.groupId).then(isGroupResult => {
          if (isGroupResult) {
            groupMessageModule.create({
              group_id: params.groupId,
              user_id: id,
              message_type: params.messageType,
              content: params.content
            }).then(createResult => {
              if (createResult) {
                groupUserModule.bulkWrite([
                  // 更新群其他用户数据
                  {
                    updateMany: {
                      filter: { group_id: params.groupId, user_id: { $ne: id } },
                      update: { is_dialogue: true, chat_time: new Date, $inc: { unread: 1 } }
                    }
                  },
                  // 更新群自己的数据
                  {
                    updateOne: {
                      filter: { group_id: params.groupId, user_id: id },
                      update: { is_dialogue: true, chat_time: new Date, unread: 0 }
                    }
                  }
                ]).then(updateResult => {
                  if (updateResult.result.ok == 1) {
                    return resolve(true);
                  } else {
                    return reject("群聊消息发送失败!");
                  }
                })
              } else {
                return reject("群聊消息发送失败!");
              }
            })
          } else {
            return reject("你是不该群聊成员,发送失败!");
          }
        })
      }
    })
  }
};