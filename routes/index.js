const express = require("express");
const userModule = require("../modules/db-user")
const md5 = require("md5")
const jwt = require("jsonwebtoken")
const path = require("path")
const fs = require("fs")
const privatekey = fs.readFileSync(path.resolve(__dirname, "../middlewares/secreKey/jwt.pem"))
const router = express.Router()

// 注册
router.post('/register', (request, response) => {
  try {
    // 验证用户名格式
    if (/^[0-9a-zA-Z\u4e00-\u9fa5_]{2,10}$/.test(request.body.name) == false) {
      return response.json({ result: false, message: "用户名格式不正确" });
    };
    // 验证密码格式
    if (/^[a-zA-Z0-9\w._!@#$%^&*`~()-+=]{6,12}$/.test(request.body.password) == false) {
      return response.json({ result: false, message: "密码格式不正确" });
    };
    // 验证密保格式
    if (/^$|^\w{6,12}$/.test(request.body.protection) == false) {
      return response.json({ result: false, message: "密保格式不正确" });
    };
    // 查询用户名是否注册
    userModule.findOne({ name: request.body.name }, (err, doc) => {
      if (err) throw err;
      // 如果已经注册
      if (doc) return response.json({ result: false, message: "用户名已被注册,请更换用户名!" });
      // 如果未被注册
      userModule.create({
        name: request.body.name,
        password: md5(request.body.password),
        protection: md5(request.body.protection)
      }, (err, doc) => {
        if (err) throw err;
        if (doc) return response.json({ result: true, message: "注册成功" });
      })
    })
  } catch (err) {
    console.log(err);
    return response.json({ result: false, message: "注册出错!" });
  }
})
// 登陆
router.post('/login', (request, response) => {
  try {
    // 验证用户名格式
    if (/^[0-9a-zA-Z\u4e00-\u9fa5_]{2,10}$/.test(request.body.name) == false) {
      return response.json({ result: false, message: "用户名格式不正确" });
    };
    // 验证密码格式
    if (/^[a-zA-Z0-9\w._!@#$%^&*`~()-+=]{6,12}$/.test(request.body.password) == false) {
      return response.json({ result: false, message: "密码格式不正确" });
    };
    // 根据条件查询数据
    userModule.findOne({
      name: request.body.name,
      password: md5(request.body.password)
    }, (err, doc) => {
      if (err) throw err;
      // 数据不存在直接返回
      if (!doc) return response.json({ result: false, message: "用户名或密码错误!" });
      // 加密Token
      let token = jwt.sign({ _id: doc._id }, privatekey, { algorithm: 'RS256', expiresIn: '24H' });
      // 返回Token数据
      return response.json({ result: true, message: "登陆成功", data: { token } });
    });
  } catch (err) {
    console.log(err);
    return response.json({ result: false, message: "登陆出错!" });
  };
});
// 改密
router.post('/changePassword', (request, response) => {
  try {
    // 验证用户名格式
    if (/^[0-9a-zA-Z\u4e00-\u9fa5_]{2,10}$/.test(request.body.name) == false) {
      return response.json({ result: false, message: "用户名格式不正确" });
    };
    // 验证密码格式
    if (/^[a-zA-Z0-9\w._!@#$%^&*`~()-+=]{6,12}$/.test(request.body.password) == false) {
      return response.json({ result: false, message: "密码格式不正确" });
    };
    // 验证密保格式
    if (/^$|^\w{6,12}$/.test(request.body.protection) == false) {
      return response.json({ result: false, message: "密保格式不正确" });
    };
    // 通过用户名和密保直接更新集合数据
    userModule.updateOne(
      // 匹配数据
      { name: request.body.name, protection: md5(request.body.protection) },
      // 更新数据
      { password: md5(request.body.protection) },
      (err, doc) => {
        if (err) throw err;
        // 如果修改失败
        if (doc.n < 1) return response.json({ result: false, message: "用户名或密保信息错误!" });
        if (doc.n >= 1) return response.json({ result: true, message: "密码修改成功!" });
      }
    );
  } catch (error) {
    console.log(err);
    return response.json({ result: false, message: "修改出错!" });
  }

});

module.exports = router;
