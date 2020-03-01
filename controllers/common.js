/*
 * @Author: 共用数据库操作方法
 * @Date: 2020-02-29 14:23:24
 * @LastEditTime: 2020-03-01 15:05:46
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \tchat-servers\controllers\common.js
 */
const mongoose = require("mongoose");
const friendModule = require("../modules/db-friend");
const groupUserModule = require("../modules/db-groupUser");

module.exports = {
  // 判断是否为好友
  isFriend(id, friendId) {
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
        friendModule.find({
          creator_id: { $in: [id, friendId] },
          friend_id: { $in: [friendId, id] }
        }).then(findResult => {
          if (findResult.length > 0) {
            return resolve(true)
          } else {
            return resolve(false)
          }
        })
      }
    })
  },
  // 判断是否是群成员
  isGroup(id, groupId) {
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
        groupUserModule.findOne({ user_id: id, group_id: groupId }).then(findResult => {
          if (findResult) {
            return resolve(true)
          } else {
            return resolve(false)
          }
        })
      }
    })
  },
  // 重置好友未读消息次数
  resetFriendUnread(id, friendId, isDialogue, time) {
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
        friendModule.find({
          creator_id: { $in: [id, friendId] },
          friend_id: { $in: [friendId, id] }
        }).then(findResult => {
          // 判断当前用户是否是好友
          if (findResult.length > 0) {
            // 是好友执行更新数据
            // 判断是否有time参数
            if (time) {
              // 有time就更新time
              friendModule.updateOne(
                { creator_id: id, friend_id: friendId },
                { is_dialogue: isDialogue ? true : false, chat_time: time, unread: 0 },
              ).then(updateResult => {
                if (updateResult.ok >= 1) {
                  return resolve(true);
                } else {
                  return resolve(false);
                }
              })
            } else {
              // 没有则不跟新time
              friendModule.updateOne(
                { creator_id: id, friend_id: friendId },
                { is_dialogue: isDialogue ? true : false, unread: 0 },
              ).then(updateResult => {
                if (updateResult.ok >= 1) {
                  return resolve(true);
                } else {
                  return resolve(false);
                }
              })
            }

          } else {
            // 不是好友reject
            return reject("该用户不是你的好友,操作失败!")
          }
        })
      }
    })
  },
  // 重置群聊未读消息次数
  resetGroupUnread(id, groupId, isDialogue, time) {
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
        // 查询用时是否在该群内
        groupUserModule.findOne({ user_id: id, group_id: groupId }).then(findResult => {
          // 判断结果
          if (findResult) {
            // 在该群内执行更新数据
            // 有time参数
            if (time) {
              groupUserModule.updateOne(
                { user_id: id, group_id: groupId },
                { is_dialogue: isDialogue == true ? true : false, chat_time: time, unread: 0 }
              ).then(updateResult => {
                if (updateResult.ok >= 1) {
                  return resolve(true);
                } else {
                  return resolve(false);
                }
              })
            } else {
              groupUserModule.updateOne(
                { user_id: id, group_id: groupId },
                { is_dialogue: isDialogue == true ? true : false, unread: 0 }
              ).then(updateResult => {
                if (updateResult.ok >= 1) {
                  return resolve(true);
                } else {
                  return resolve(false);
                }
              })
            }

          } else {
            // 如果未在该群内reject
            return reject("你不是该群聊用户,操作失败!")
          }
        })
      }
    })
  }
};