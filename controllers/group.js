/*
 * @Author: 群聊相关数据库操作
 * @Date: 2020-02-29 11:08:33
 * @LastEditTime: 2020-03-01 16:49:13
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \tchat-servers\controllers\group.js
 */
const mongoose = require("mongoose");
const groupModule = require("../modules/db-group");
const groupUserModule = require("../modules/db-groupUser");
const groupNoticeModule = require("../modules/db-groupNotice");
const { findGroupLastMessage } = require("../controllers/message");
const { isGroup } = require("./common");

module.exports = {
  // 添加群聊
  addGroup(id, groupId) {
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
            return reject("你已经在该群内了,请勿重复添加!")
          } else {
            groupUserModule.create({ group_id: groupId, user_id: id }).then(createResult => {
              if (createResult) {
                return resolve(true);
              } else {
                return reject("加入群聊失败!");
              }
            })
          }
        })
      }
    })
  },
  // 创建群聊
  createGroup(id, params) {
    return new Promise((resolve, reject) => {
      if (!id) {
        return reject("用户ID不能为空!");
      } else if (!mongoose.Types.ObjectId.isValid(id)) {
        return reject("用户ID不是有效值!");
      } else if (!params.name) {
        return reject("群聊名称不能为空!");
      } else {
        groupModule.create({
          name: params.name,
          creator_id: id,
          introduce: params.introduce,
          avatar: params.avatar
        }).then(createResult => {
          if (createResult) {
            groupUserModule.create({ group_id: createResult._id, user_id: id }).then(createGroupUserResult => {
              if (createGroupUserResult) {
                return resolve(createResult._id);
              } else {
                groupModule.deleteOne({ _id: createResult._id }).exec();
                return reject("创建群聊失败!");
              }
            })
          } else {
            return reject("创建群聊失败!");
          }
        })
      }
    })
  },
  // 退出群聊
  quitGroup(id, groupId) {
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
            groupUserModule.deleteOne({ group_id: groupId, user_id: id }).then(deleteResult => {
              if (deleteResult.n >= 1) {
                return resolve(true);
              } else {
                return reject("退出群聊失败!");
              }
            })
          } else {
            return reject("你不是该群聊成员,操作失败!");
          }
        })
      }
    })
  },
  // 查询群聊列表
  findGroupList(id) {
    return new Promise((resolve, reject) => {
      if (!id) {
        return reject("用户ID不能为空!");
      } else if (!mongoose.Types.ObjectId.isValid(id)) {
        return reject("用户ID不是有效值!");
      } else {
        groupUserModule.aggregate([
          // 匹配数据
          { $match: { user_id: mongoose.Types.ObjectId(id) } },
          // 关联查询群信息
          { $lookup: { from: "groups", localField: "group_id", foreignField: "_id", as: "groupInfo" } },
          // 关联查询群用户信息
          { $lookup: { from: "groupusers", localField: "groupInfo._id", foreignField: "group_id", as: "groupUser" } },
          // 关联查询群创建者信息
          { $lookup: { from: "users", localField: "groupInfo.creator_id", foreignField: "_id", as: "creatorInfo" } },
          // 拆分
          { $unwind: { path: "$groupInfo", preserveNullAndEmptyArrays: true } },
          // 拆分
          { $unwind: { path: "$creatorInfo", preserveNullAndEmptyArrays: true } },
          // 筛选字段
          {
            $project: {
              _id: "$group_id",
              name: "$groupInfo.name",
              introduce: "$groupInfo.introduce",
              avatar: "$groupInfo.avatar",
              creator_id: "$groupInfo.creator_id",
              creator_name: "$creatorInfo.name",
              create_time: "$groupInfo.create_time",
              add_time: "$add_time",
              chat_time: "$chat_time",
              user_sum: { $size: "$groupUser" },
              is_dialogue: "$is_dialogue",
              dialogue_type: "$dialogue_type",
              unread: "$unread",
            }
          }
        ]).then(findGroupResult => {
          if (findGroupResult.length > 0) {
            let mapResult = findGroupResult.map(async item => {
              if (item.is_dialogue) {
                // 循环查询群聊的最后一条消息
                let messageResult = await findGroupLastMessage(item._id);
                if (messageResult) {
                  // 查询到消息
                  item['send_user'] = messageResult.user_name
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
            });
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
  // 查询群聊信息
  findGroupInfo(id, groupId) {
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
        groupUserModule.aggregate([
          // 匹配数据
          { $match: { user_id: mongoose.Types.ObjectId(id), group_id: mongoose.Types.ObjectId(groupId) } },
          // 关联查询群信息
          { $lookup: { from: "groups", localField: "group_id", foreignField: "_id", as: "groupInfo" } },
          // 关联查询群用户信息
          { $lookup: { from: "groupusers", localField: "groupInfo._id", foreignField: "group_id", as: "groupUser" } },
          // 关联查询群创建者信息
          { $lookup: { from: "users", localField: "groupInfo.creator_id", foreignField: "_id", as: "creatorInfo" } },
          // 拆分
          { $unwind: { path: "$groupInfo", preserveNullAndEmptyArrays: true } },
          // 拆分
          { $unwind: { path: "$creatorInfo", preserveNullAndEmptyArrays: true } },
          // 筛选字段
          {
            $project: {
              _id: "$group_id",
              name: "$groupInfo.name",
              introduce: "$groupInfo.introduce",
              avatar: "$groupInfo.avatar",
              creator_id: "$groupInfo.creator_id",
              creator_name: "$creatorInfo.name",
              create_time: "$groupInfo.create_time",
              add_time: "$add_time",
              chat_time: "$chat_time",
              user_sum: { $size: "$groupUser" },
              is_dialogue: "$is_dialogue",
              dialogue_type: "$dialogue_type",
              unread: "$unread",
            }
          }
        ]).then(findGroupResult => {
          if (findGroupResult.length > 0) {
            findGroupLastMessage(groupId).then(findMessageResult => {
              if (findMessageResult) {
                // 查询到消息
                findGroupResult[0]['send_user'] = findMessageResult.user_name
                findGroupResult[0]['message_type'] = findMessageResult.message_type
                findGroupResult[0]['content'] = findMessageResult.content
                findGroupResult[0]['send_time'] = findMessageResult.send_time
              } else {
                // 未查询到消息
                findGroupResult[0]['message_type'] = null;
                findGroupResult[0]['content'] = null;
                findGroupResult[0]['send_time'] = findGroupResult[0]['chat_time']
              }
              return resolve(findGroupResult[0]);
            })
          } else {
            return resolve(undefined);
          }
        })
      }
    })
  },
  // 添加群公告
  addGroupNotice(id, params) {
    return new Promise((resolve, reject) => {
      if (!id) {
        return reject("用户ID不能为空!");
      } else if (!mongoose.Types.ObjectId.isValid(id)) {
        return reject("用户ID不是有效值!");
      } else if (!params.groupId) {
        return reject("群聊ID不能为空!");
      } else if (!mongoose.Types.ObjectId.isValid(params.groupId)) {
        return reject("群聊ID不是有效值!");
      } else if (!params.title) {
        return reject("群公告标题不能为空!");
      } else if (!params.content) {
        return reject("群公告内容不能为空!");
      } else {
        isGroup(id, params.groupId).then(isGroupResult => {
          if (isGroupResult) {
            groupNoticeModule.create({
              group_id: params.groupId,
              creator_id: id,
              title: params.title,
              content: params.content
            }).then(createResult => {
              if (createResult) {
                return resolve(true);
              } else {
                return reject("发布群公告失败!");
              }
            })
          } else {
            return reject("你不是该群内成员,发布失败!")
          }
        })
      }
    })
  },
  // 查询群聊公告消息
  findGroupNotice(id, groupId) {
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
            groupNoticeModule.aggregate([
              // 匹配数据
              { $match: { group_id: mongoose.Types.ObjectId(groupId) } },
              // 关联查询创建者信息
              { $lookup: { from: "users", localField: "creator_id", foreignField: "_id", as: "creatorInfo" } },
              // 拆分
              { $unwind: { path: "$creatorInfo", preserveNullAndEmptyArrays: true } },
              // 筛选字段
              {
                $project: {
                  _id: "$_id",
                  title: "$title",
                  content: "$content",
                  create_time: "$create_time",
                  creator_id: "$creatorInfo._id",
                  creator_name: "$creatorInfo.name",
                  read_user: { $size: "$read_user" },
                }
              },
              // 排序
              { $sort: { _id: -1 } }
            ]).then(findResult => {
              if (findResult.length > 0) {
                groupNoticeModule.updateMany(
                  { group_id: groupId },
                  { $set: { read_user: id } },
                  { upsert: true }
                ).then(updateResult => {
                  console.log(updateResult);
                })
                return resolve(findResult)
              } else {
                return resolve([])
              }
            })
          } else {
            return reject("你不是该群聊成员,查询失败!")
          }
        })
      }
    })
  },
  // 删除群聊公告
  deleteGroupNotice(id, params) {
    return new Promise((resolve, reject) => {
      if (!id) {
        return reject("用户ID不能为空!");
      } else if (!mongoose.Types.ObjectId.isValid(id)) {
        return reject("用户ID不是有效值!");
      } else if (!params.groupId) {
        return reject("群聊ID不能为空!");
      } else if (!mongoose.Types.ObjectId.isValid(params.groupId)) {
        return reject("群聊ID不是有效值!");
      } else if (!params.noticeId) {
        return reject("公告ID不能为空!");
      } else if (!mongoose.Types.ObjectId.isValid(params.noticeId)) {
        return reject("公告ID不是有效值!");
      } else {
        isGroup(id, params.groupId).then(isGroupResult => {
          if (isGroupResult) {
            groupModule.findOne({ _id: params.groupId }).then(findGroupResult => {
              if (findGroupResult) {
                if (findGroupResult.creator_id == id) {
                  groupNoticeModule.deleteOne({ _id: params.noticeId }).then(deleteResult => {
                    if (deleteResult) {
                      return resolve(true);
                    } else {
                      return reject("删除失败!");
                    }
                  })
                } else {
                  return reject("你不是该群管理员,删除失败!");
                }
              } else {
                return reject("群信息查询失败,删除失败!");
              }
            })
          } else {
            return reject("你不是该群内成员,删除失败!");
          }
        })
      }
    })
  }
};