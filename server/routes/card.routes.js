
const express  = require('express');

const Card = require('../model/card');
const Error = require('../model/error');

const multer = require("multer");
const multerConfig = require("../config/multer");
const fs = require('fs');

const cardRouter=express()

cardRouter.get('/api/card', async (req, res, next) => {
  try {
    const {page, size, filter} = req.query
    const data = await Card.getAll(req.body, parseInt(page), parseInt(size), filter)
    res.status(200).send(data)
  } catch (error) {
    Error.errorProcess(res,error)
  }
})

cardRouter.get('/api/card/:id', async (req, res, next) => {
  try {
    const cards = await Card.getOne(req.params.id, req.cardId)
    res.status(200).send(cards)
  } catch (error) {
    Error.errorProcess(res,error)
  }
})

cardRouter.post('/api/card',multer(multerConfig).single("file"), async (req, res) => {
  try {
    console.log(req.file)
    await fs.writeFileSync('test.png',req.file.buffer)
    const card = await Card.create(req.body)
    res.status(200).send(card)
  } catch (error) {
    Error.errorProcess(res,error)
  }
})

cardRouter.put('/api/card/:id', async (req, res, next) => {
  try {
    const card = await Card.update(req.params.id,req.body)
    res.status(200).send(card)
  } catch (error) {
    Error.errorProcess(res,error)
  }
})

cardRouter.delete('/api/card/:id', async (req, res, next) => {
  try {
    const ids = req.params.id.split(',')
    const itemsDeleted = await Card.deleteMany(ids)
    res.status(200).send(itemsDeleted)
  } catch (error) {
    Error.errorProcess(res,error)
  }
})

module.exports = cardRouter