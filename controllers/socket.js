/*
 * @Author: socket相关数据库操作
 * @Date: 2020-02-29 11:09:41
 * @LastEditTime: 2020-03-01 18:47:56
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \tchat-servers\controllers\socket.js
 */
const mongoose = require("mongoose");
const socketModule = require("../modules/db-socket");
const friendModule = require("../modules/db-friend");
const { getBrowserInfo, getDeviceInfo } = require("../utils/index");

module.exports = {
  // 创建socket数据
  createSocket(socket, id) {
    // 获取用户信息
    let userInfo = {
      socket_id: socket.id,
      ip: socket.handshake.headers['x-real-ip'] || socket.request.connection.remoteAddress,
      browser: getBrowserInfo(socket.handshake.headers['user-agent']),
      device: getDeviceInfo(socket.handshake.headers['user-agent']),
      online_status: true
    };
    return new Promise((resolve, reject) => {
      if (!id) {
        return reject("用户ID不能为空!");
      } else if (!mongoose.Types.ObjectId.isValid(id)) {
        return reject("用户ID不是有效值!");
      } else {
        socketModule.updateOne({ user_id: id }, userInfo, { upsert: true }).then(updateResult => {
          if (updateResult.n >= 1) {
            return resolve(true);
          } else {
            return reject("连接服务器失败,请重新登录!");
          };
        })
      }
    })
  },
  // 删除socket数据
  deleteSocket(socketId) {
    return new Promise(resolve => {
      socketModule.deleteOne({ socket_id: socketId }).then(deleteResult => {
        if (deleteResult.n > 0) {
          return resolve(true);
        }
      });
    })
  },
  // 查询socket用户数据
  findSocketUserInfo(socketId) {
    return new Promise((resolve, reject) => {
      if (!socketId) return reject("socketID不能为空!");
      socketModule.aggregate([
        { $match: { socket_id: socketId } },
        { $lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "userInfo" } },
        { $unwind: "$userInfo" },
        {
          $project: {
            _id: "$user_id",
            name: "$userInfo.name",
            avatar: "$userInfo.avatar",
            type: "$userInfo.type",
            sex: "$userInfo.sex",
            age: "$userInfo.age",
            signature: "$userInfo.signature",
            qq: "$userInfo.qq",
            weixin: "$userInfo.weixin",
            email: "$userInfo.email",
            github: "$userInfo.github",
            browser: "$browser",
            device: "$device",
            ip: "$ip",
            online_status: "$online_status"
          }
        }
      ]).then(findSocketResult => {
        if (findSocketResult[0]) {
          return resolve(findSocketResult[0]);
        } else {
          return reject("查询登陆用户信息失败!");
        };
      })

    })
  },
  // 查询所有在线好友的socketID
  findFriendSocketIds(id) {
    return new Promise((resolve, reject) => {
      if (!id) {
        return reject("用户ID不能为空!");
      } else if (!mongoose.Types.ObjectId.isValid(id)) {
        return reject("用户ID不是有效值!");
      } else {
        friendModule.aggregate([
          { $match: { creator_id: mongoose.Types.ObjectId(id) } },
          { $lookup: { from: "sockets", localField: "friend_id", foreignField: "user_id", as: "socketInfo" } },
          { $unwind: "$socketInfo" },
          {
            $project: {
              socket_id: "$socketInfo.socket_id",
              user_id: "$socketInfo.user_id",
            }
          }
        ]).then(findSocketsResult => {
          if (findSocketsResult.length > 0) {
            let socketIdArr = findSocketsResult.map(item => {
              return { socket_id: item.socket_id, user_id: item.user_id }
            })
            return resolve(socketIdArr);
          } else {
            return resolve([]);
          }
        })
      }
    });
  },
  // 查询好友socketID
  findFriendSocketId(friendId) {
    return new Promise((resolve, reject) => {
      if (!friendId) {
        return reject("好友ID不能为空!");
      } else if (!mongoose.Types.ObjectId.isValid(friendId)) {
        return reject("好友ID不是有效值!");
      } else {
        socketModule.findOne({ user_id: friendId }).then(findSocketResult => {
          if (findSocketResult) {
            return resolve(findSocketResult.socket_id);
          } else {
            return resolve(false);
          }
        })
      }
    })
  }
};