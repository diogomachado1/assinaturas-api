const jwt = require("jsonwebtoken")
const { promisify } = require("util")
const secret=process.env.APP_SECRET||'test'

module.exports = async (req, res, next) => {
  if(req.method === 'OPTIONS'){
    next()
  } else {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ message: "Token not provided" })
    }
  
    const [, token] = authHeader.split(" ")
  
    try {
      const decoded = await promisify(jwt.verify)(token, secret)
      //@ts-ignore
      req.userId = decoded._id
      req.admin = decoded.admin
      //@ts-ignore
  
      return next()
    } catch (err) {
      return res.status(401).json({ message: "Token invalid" })
    }
  }
};