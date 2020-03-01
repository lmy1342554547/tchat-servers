// Token验证中间件
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const publickey = fs.readFileSync(
  path.resolve(__dirname, "./secreKey/jwt_pub.pem")
);

module.exports = token => {
  try {
    const { _id } = jwt.verify(token, publickey);
    return _id;
  } catch (error) {
    console.log(error);
    return false
  }
};
