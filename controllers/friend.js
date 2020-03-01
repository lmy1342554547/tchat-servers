/*
 * @Author: 好友相关数据库操作
 * @Date: 2020-02-29 11:08:16
 * @LastEditTime: 2020-03-01 16:40:24
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \tchat-servers\controllers\friend.js
 */
const mongoose = require("mongoose");
const friendModule = require("../modules/db-friend");
const { isFriend } = require("./common");
const { findFriendLastMessage } = require("./message");

module.exports = {
  // 添加好友
  addFriend(id, friendId) {
    return new Promise((resolve, reject) => {
      if (!id) {
        return reject("用户ID不能为空!");
      } else if (!mongoose.Types.ObjectId.isValid(id)) {
        return reject("用户ID不是有效值!");
      } else if (!friendId) {
        return reject("好友ID不能为空!");
      } else if (!mongoose.Types.ObjectId.isValid(friendId)) {
        return reject("好友ID不是有效值!");
      } else if (id == friendId) {
        return reject("不能添加自己为好友!");
      } else {
        isFriend(id, friendId).then(isFriendResult => {
          if (isFriendResult) {
            return reject("该用户已经是你的好友了,请勿重复添加!")
          } else {
            friendModule.bulkWrite([
              {
                insertOne: {
                  document: {
                    creator_id: id,
                    friend_id: friendId
                  }
                }
              },
              {
                insertOne: {
                  document: {
                    creator_id: friendId,
                    friend_id: id
                  }
                }
              }
            ]).then(addResult => {
              if (addResult.result.ok == 1) {
                return resolve("添加成功")
              } else {
                return reject("添加好友失败!")
              }
            })
          }
        })
      }
    })
  },
  // 删除好友
  deleteFriend(id, friendId) {
    return new Promise((resolve, reject) => {
      if (!id) {
        return reject("用户ID不能为空!");
      } else if (!mongoose.Types.ObjectId.isValid(id)) {
        return reject("用户ID不是有效值!");
      } else if (!friendId) {
        return reject("好友ID不能为空!");
      } else if (!mongoose.Types.ObjectId.isValid(friendId)) {
        return reject("好友ID不是有效值!");
      } else if (id == friendId) {
        return reject("不能删除自己!");
      } else {
        isFriend(id, friendId).then(isFriendResult => {
          if (isFriendResult) {
            friendModule.deleteMany({
              creator_id: { $in: [id, friendId] },
              friend_id: { $in: [friendId, id] }
            }).then(deleteResult => {
              if (deleteResult) {
                return resolve(true);
              } else {
                return reject("删除好友失败!");
              }
            })
          } else {
            return reject("该用户不是你的好友,操作失败!")
          }
        })
      }
    })
  },
  // 查询好友列表
  findFriendList(id) {
    return new Promise((resolve, reject) => {
      if (!id) {
        return reject("用户ID不能为空!");
      } else if (!mongoose.Types.ObjectId.isValid(id)) {
        return reject("用户ID不是有效值!");
      } else {
        friendModule.aggregate([
          // 匹配数据
          { $match: { creator_id: mongoose.Types.ObjectId(id) } },
          // 关联查询好友信息
          { $lookup: { from: "users", localField: "friend_id", foreignField: "_id", as: "friendInfo" } },
          // 拆分数组
          { $unwind: { path: "$friendInfo", preserveNullAndEmptyArrays: true } },
          // 关联查询socket信息
          { $lookup: { from: "sockets", localField: "friend_id", foreignField: "user_id", as: "socketInfo" } },
          // 拆分数组
          { $unwind: { path: "$socketInfo", preserveNullAndEmptyArrays: true } },
          // 定义字段
          {
            $project: {
              _id: "$friendInfo._id",
              name: "$friendInfo.name",
              remark_name: "$remark_name",
              is_dialogue: "$is_dialogue",
              dialogue_type: "$dialogue_type",
              unread: "$unread",
              avatar: "$friendInfo.avatar",
              type: "$friendInfo.type",
              sex: "$friendInfo.sex",
              age: "$friendInfo.age",
              signature: "$friendInfo.signature",
              qq: "$friendInfo.qq",
              weixin: "$friendInfo.weixin",
              email: "$friendInfo.email",
              github: "$friendInfo.github",
              browser: "$socketInfo.browser",
              device: "$socketInfo.device",
              online_status: "$socketInfo.online_status",
              add_time: "$create_time",
              chat_time: "$chat_time",
              ip: "$socketInfo.ip",
            }
          },
          { $sort: { online_status: -1, add_time: -1 } }
        ]).then(findFriendResult => {
          if (findFriendResult.length > 0) {
            let mapResult = findFriendResult.map(async item => {
              if (item.is_dialogue) {
                // 循环查询好友的最后一条消息
                let messageResult = await findFriendLastMessage(id, item._id)
                if (messageResult) {
                  // 查询到消息
                  item['message_type'] = messageResult.message_type
                  item['content'] = messageResult.content
                  item['send_time'] = messageResult.send_time
                  return item;
                } else {
                  // 未查询到消息
                  item['message_type'] = null;
                  item['content'] = null;
                  item['send_time'] = item.chat_time
                  return item;
                }
              } else {
                item['message_type'] = null;
                item['content'] = null;
                item['send_time'] = item.chat_time
                return item;
              }
            })
            Promise.all(mapResult).then(friendResult => {
              return resolve(friendResult);
            })
          } else {
            return resolve([]);
          }
        })
      }
    })
  },
  // 查询好友信息
  findFriendInfo(id, friendId) {
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
        friendModule.aggregate([
          { $match: { creator_id: mongoose.Types.ObjectId(id), friend_id: mongoose.Types.ObjectId(friendId) } },
          // 关联查询好友信息
          { $lookup: { from: "users", localField: "friend_id", foreignField: "_id", as: "friendInfo" } },
          // 拆分数组
          { $unwind: { path: "$friendInfo", preserveNullAndEmptyArrays: true } },
          // 关联查询socket信息
          { $lookup: { from: "sockets", localField: "friend_id", foreignField: "user_id", as: "socketInfo" } },
          // 拆分数组
          { $unwind: { path: "$socketInfo", preserveNullAndEmptyArrays: true } },
          // 定义字段
          {
            $project: {
              _id: "$friendInfo._id",
              name: "$friendInfo.name",
              remark_name: "$remark_name",
              is_dialogue: "$is_dialogue",
              dialogue_type: "$dialogue_type",
              unread: "$unread",
              avatar: "$friendInfo.avatar",
              type: "$friendInfo.type",
              sex: "$friendInfo.sex",
              age: "$friendInfo.age",
              signature: "$friendInfo.signature",
              qq: "$friendInfo.qq",
              weixin: "$friendInfo.weixin",
              email: "$friendInfo.email",
              github: "$friendInfo.github",
              browser: "$socketInfo.browser",
              device: "$socketInfo.device",
              online_status: "$socketInfo.online_status",
              add_time: "$create_time",
              chat_time: "$chat_time",
              ip: "$socketInfo.ip",
            }
          }
        ]).then(findFriendResult => {
          if (findFriendResult.length > 0) {
            findFriendLastMessage(id, friendId).then(findMessageResult => {
              if (findMessageResult) {
                // 查询到消息
                findFriendResult[0]['message_type'] = findMessageResult.message_type
                findFriendResult[0]['content'] = findMessageResult.content
                findFriendResult[0]['send_time'] = findMessageResult.send_time
              } else {
                // 未查询到消息
                findFriendResult[0]['message_type'] = null;
                findFriendResult[0]['content'] = null;
                findFriendResult[0]['send_time'] = findFriendResult[0]['chat_time']
              }
              return resolve(findFriendResult[0]);
            })
          } else {
            return resolve(undefined);
          }
        })
      };
    })
  },
  // 更新好友备注名称
  updateFriendRemarkName(id, friendId, remarkName) {
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
            friendModule.updateOne(
              { creator_id: id, friend_id: friendId },
              { remark_name: remarkName }
            ).then(updateResult => {
              if (updateResult.ok == 1) {
                return resolve(true)
              } else {
                return reject("更新好友备注名称失败!")
              }
            })
          } else {
            return reject("该用户不是你的好友,操作失败!")
          }
        })
      }
    })
  }
};