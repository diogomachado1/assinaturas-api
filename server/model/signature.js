const mongoose = require('mongoose')
const processImg = require('../functions/processImg')
const fs = require('fs');

const CDN_URL = process.env.CDN_URL || `https://localhost:8080`;

const dirname = require('../../dirname')

const signatureSchema = new mongoose.Schema({
    name: String,
    email: { type: String },
    position: String,
    url: String,
    business: String,
    type: String,
    contacts: {
        type: [{
            id: String,
            value: String,
        }]
    },
    created_at: { type: Date, required: true, default: Date.now() },
})

signatureSchema.index({'name': 'text', 'email': 'text', 'position': 'text'}, {weights: {name: 3, email: 2, position: 1}});

signatureSchema.post('save', async function(doc){
    await processImg(this, `image/${this.type}`, true)
})

signatureSchema.post('updateOne', async function(){
    doc = this.getUpdate()
    await processImg(doc, `image/${doc.type}`, true)
})


signatureSchema.pre('save', async function(next){
    this.url = setPath(this)
})

signatureSchema.pre('updateOne', async function(next){
    doc = this.getUpdate()
    doc.url = setPath(doc)
    const signaturesDoc = await Signature.modelSignatures.findById(doc._id)
    await deleteImage(signaturesDoc)
})

signatureSchema.pre('deleteMany', async function(next){
    const signatureDocList = await Signature.modelSignatures.find(this.getQuery())
    signatureDocList.forEach(async item => {
        await deleteImage(item)
    })
})

const deleteImage = async (signature) =>{
    if(signature.type === 'png'){
        await fs.unlinkSync(`${dirname}/assinatura/${signature._id}.png`)
    }else{
        await fs.unlinkSync(`${dirname}/assinatura/${signature._id}.jpg`)
    }
}

const setPath = (signature) => {
    if(signature.type === 'png'){
        return `${CDN_URL}/assinatura/${signature._id}.png`;
    }else{
        return `${CDN_URL}/assinatura/${signature._id}.jpg`;
    }
}

class Signature {

    constructor(name, email, position, url, type, business, contacts, created_at, _id) {
        this.email = email;
        this.name = name;
        this.position = position;
        this.url = url;
        this.type = type;
        this.business = business;
        this.contacts = contacts;
        this.created_at = created_at;
        this._id = _id;
    }


    static createSignatureObj(signature) {
        return new Signature(signature.name, signature.email, signature.position, signature.url, signature.type, signature.business, signature.contacts, signature.created_at, signature._id ? signature._id.toString() : signature._id)
    }

    static async getAll(signature, page, size, filter='') {
            filter.trim()
            const signaturesDoc = filter === ''?
                            await this.modelSignatures
                                .find({...signature})
                                .limit(size)
                                .skip(size * (page - 1)):
                            await this.modelSignatures
                                .find({$text: { $search : filter }}, { score : { $meta: 'textScore' } })
                                .sort( {score: { $meta : 'textScore' }} )
                                .limit(size)
                                .skip(size * (page - 1))
        const count =  filter === '' ? 
                        await this.modelSignatures.countDocuments({ ...signature }):
                        await this.modelSignatures.countDocuments({$text: { $search : filter }})
        const signatures = await Promise.all(signaturesDoc.map(async (signature) => {
            return await this.createSignatureObj(signature)
        }))
        return { data: signatures, count }
    }

    static async getOne(_id) {
        const signaturesDoc = await this.modelSignatures.findById(_id)
        return  this.createSignatureObj(signaturesDoc)
    }


    static async create(reqSignature) {
        const signature = await this.createSignatureObj(reqSignature)
        const signatureDoc = await this.modelSignatures.create(signature)
        return await this.createSignatureObj(signatureDoc)
    }

    static async update(_id, reqSignature) {
        const signature = await this.createSignatureObj(reqSignature)
        const signatureDoc = await this.modelSignatures.updateOne({_id}, signature, { new: true, runValidators: true })
        if (signatureDoc) {
            return await this.createSignatureObj(signatureDoc)
        } else {
          throw {message:'Não encontrado'}
        }
      }

    static async previewImage(signature, type) {
        return await processImg(signature, type, false)
    }

    static async delete(signature_id) {
        const signatureDoc = await this.modelSignatures.findOneAndDelete({ signature_id })
        if (signatureDoc) {
            return await this.createSignatureObj(signatureDoc)
        } else {
            throw { message: 'Não encontrado' }
        }
    }
    
    static async deleteMany(Array_id) {
        const signatureDoc = await this.modelSignatures.deleteMany({ _id: { $in: Array_id } })
        if (signatureDoc) {
            return await { data: Array_id }
        } else {
            throw { message: 'Não encontrado' }
        }
    }
}


Signature.modelSignatures = mongoose.model('Signature', signatureSchema);

module.exports = Signature;