
const express  = require('express');

const User = require('../model/user');
const Error = require('../model/error');

const userRouter=express()

User.bootstrap();

userRouter.get('/api/users', async (req, res, next) => {
  try {
    const {page, size} = req.query
    const data = await User.getAll(req.body, parseInt(page), parseInt(size))
    res.status(200).send(data)
  } catch (error) {
    Error.errorProcess(res,error)
  }
})

userRouter.get('/api/users/:id', async (req, res, next) => {
  try {
    const users = await User.getOne(req.params.id, req.userId)
    res.status(200).send(users)
  } catch (error) {
    Error.errorProcess(res,error)
  }
})

userRouter.post('/api/users', async (req, res, next) => {
  try {
    const { email, name, password} = req.body
    const user = await User.create(email, name, password)
    res.status(200).send(user)
  } catch (error) {
    Error.errorProcess(res,error)
  }
})

userRouter.put('/api/users/:id', async (req, res, next) => {
  try {
    const user = await User.update(req.params.id,req.body, req.admin)
    res.status(200).send(user)
  } catch (error) {
    Error.errorProcess(res,error)
  }
})

userRouter.delete('/api/users/:id', async (req, res, next) => {
  try {
    const ids = req.params.id.split(',')
    const itemsDeleted = await User.deleteMany(ids, req.userId, req.admin)
    res.status(200).send(itemsDeleted)
  } catch (error) {
    Error.errorProcess(res,error)
  }
})

module.exports = userRouter