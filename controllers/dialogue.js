/*
 * @Author: 会话相关数据库操作
 * @Date: 2020-02-29 11:09:14
 * @LastEditTime: 2020-03-01 19:08:44
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \tchat-servers\controllers\dialogue.js
 */
const mongoose = require("mongoose");
const { isFriend, isGroup, resetFriendUnread, resetGroupUnread } = require("../controllers/common");

module.exports = {
  // 添加好友会话
  addFriendDialogue(id, friendId) {
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
            resetFriendUnread(id, friendId, true, new Date).then(resetResult => {
              if (resetResult) {
                return resolve(true)
              } else {
                return reject("添加会话失败!")
              }
            })
          } else {
            return reject("该用户不是你的好友,请检查!")
          }
        })
      }
    })
  },
  // 删除好友会话
  deleteFriendDialogue(id, friendId) {
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
            resetFriendUnread(id, friendId, false).then(resetResult => {
              if (resetResult) {
                return resolve(true)
              } else {
                return reject("删除好友会话失败!")
              }
            })
          } else {
            return reject("该用户不是你的好友,请检查!")
          }
        })
      }
    })
  },
  // 添加群聊会话
  addGroupDialogue(id, groupId) {
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
            resetGroupUnread(id, groupId, true, new Date).then(resetResult => {
              if (resetResult) {
                return resolve(true)
              } else {
                return reject("添加会话失败!")
              }
            })
          } else {
            return reject("你不是该群聊的用户,操作失败!")
          }
        })
      }
    })
  },
  // 删除群聊会话
  deleteGroupDialogue(id, groupId) {
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
            resetGroupUnread(id, groupId, false).then(resetResult => {
              if (resetResult) {
                return resolve(true)
              } else {
                return reject("删除群聊会话失败!")
              }
            })
          } else {
            return reject("你不是该群聊的用户,操作失败!")
          }
        })
      }
    })
  }
};