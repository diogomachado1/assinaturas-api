const express  = require('express');

const Signature = require('../model/signature');
const Error = require('../model/error');
const { check, validationResult } = require('express-validator')

const signatureOpenRouter=express()

signatureOpenRouter.get('/api/preview/:type/:signature', async (req,res,next) => {
  req.signature = await JSON.parse(await Buffer.from(req.params.signature, 'base64').toString())
  req.body = {...req.signature}
  next();
})

signatureOpenRouter.get('/api/preview/:type/:signature',
  [
    check('email').isLength({ max:30 }),
    check('name').isLength({ max:30 }),
    check('position').isLength({ max:30 }),
    check('contacts.*.value').isLength({ max:30 }),
  ]
  ,async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      if((req.params.type==='jpeg')||(req.params.type==='png')){
          const img = await Signature.previewImage({...req.body}, `image/${req.params.type}`, false)
          res.writeHead(200, {'Content-Type': `image/${req.params.type}`});
          res.end(img)
      } else res.status(404).send()
    } catch (error) {
        console.log(error)
    }
  })

module.exports = signatureOpenRouter