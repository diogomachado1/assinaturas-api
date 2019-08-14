  
const express  = require('express')
const User = require('../model/user')
const Error = require('../model/error')

const userRouter=express()

userRouter.post("/api/login", async (req, res, next)=>{
  try {
    const { email, password } = req.body
    const user = await User.login(email, password)
    res.status(200).json(user)
  } catch (error) {
    Error.errorProcess(res,error)
  }
})

module.exports = userRouter;