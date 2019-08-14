
const express  = require('express');

const Signature = require('../model/signature');
const Error = require('../model/error');

const signatureRouter=express()

signatureRouter.get('/api/signature', async (req, res, next) => {
  try {
    const {page, size, filter} = req.query
    const data = await Signature.getAll(req.body, parseInt(page), parseInt(size), filter)
    res.status(200).send(data)
  } catch (error) {
    Error.errorProcess(res,error)
  }
})

signatureRouter.get('/api/signature/:id', async (req, res, next) => {
  try {
    const signatures = await Signature.getOne(req.params.id, req.signatureId)
    res.status(200).send(signatures)
  } catch (error) {
    Error.errorProcess(res,error)
  }
})

signatureRouter.post('/api/signature', async (req, res, next) => {
  try {
    const signature = await Signature.create(req.body)
    res.status(200).send(signature)
  } catch (error) {
    Error.errorProcess(res,error)
  }
})

signatureRouter.put('/api/signature/:id', async (req, res, next) => {
  try {
    const signature = await Signature.update(req.params.id,req.body)
    res.status(200).send(signature)
  } catch (error) {
    Error.errorProcess(res,error)
  }
})

signatureRouter.delete('/api/signature/:id', async (req, res, next) => {
  try {
    const ids = req.params.id.split(',')
    const itemsDeleted = await Signature.deleteMany(ids)
    res.status(200).send(itemsDeleted)
  } catch (error) {
    Error.errorProcess(res,error)
  }
})

module.exports = signatureRouter