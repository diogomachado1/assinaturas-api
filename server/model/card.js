const mongoose = require('mongoose')
//const processImg = require('../functions/processImg')
const fs = require('fs');

const CDN_URL = process.env.CDN_URL || `https://localhost:8080`;

const dirname = require('../../dirname')

const cardSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    url: String,
    footer: String,
    created_at: { type: Date, required: true, default: Date.now() },
})

cardSchema.index({'name': 'text'}, {weights: {name: 3}});

// cardSchema.post('save', async function(doc){
//     await processImg(this, `image/${this.type}`, true)
// })

// cardSchema.post('updateOne', async function(){
//     doc = this.getUpdate()
//     await processImg(doc, `image/${doc.type}`, true)
// })


// cardSchema.pre('save', async function(next){
//     this.url = setPath(this)
// })

// cardSchema.pre('updateOne', async function(next){
//     doc = this.getUpdate()
//     doc.url = setPath(doc)
//     const cardsDoc = await Card.modelCards.findById(doc._id)
//     await deleteImage(cardsDoc)
// })

// cardSchema.pre('deleteMany', async function(next){
//     const cardDocList = await Card.modelCards.find(this.getQuery())
//     cardDocList.forEach(async item => {
//         await deleteImage(item)
//     })
// })

// const deleteImage = async (card) =>{
//     if(card.type === 'png'){
//         await fs.unlinkSync(`${dirname}/assinatura/${card._id}.png`)
//     }else{
//         await fs.unlinkSync(`${dirname}/assinatura/${card._id}.jpg`)
//     }
// }

// const setPath = (card) => {
//     if(card.type === 'png'){
//         return `${CDN_URL}/assinatura/${card._id}.png`;
//     }else{
//         return `${CDN_URL}/assinatura/${card._id}.jpg`;
//     }
// }

class Card {

    constructor(name, url, footer, created_at, _id) {
        this.name = name;
        if(url){this.url = url}
        if(footer){this.footer = footer}
        this.created_at = created_at;
        this._id = _id;
    }


    static createCardObj(card) {
        return new Card(card.name, card.url, card.footer, card.created_at, card._id ? card._id.toString() : card._id)
    }

    static async getAll(card, page, size, filter='') {
            filter.trim()
            const cardsDoc = filter === ''?
                            await this.modelCards
                                .find({...card})
                                .limit(size)
                                .skip(size * (page - 1)):
                            await this.modelCards
                                .find({$text: { $search : filter }}, { score : { $meta: 'textScore' } })
                                .sort( {score: { $meta : 'textScore' }} )
                                .limit(size)
                                .skip(size * (page - 1))
        const count =  filter === '' ? 
                        await this.modelCards.countDocuments({ ...card }):
                        await this.modelCards.countDocuments({$text: { $search : filter }})
        const cards = await Promise.all(cardsDoc.map(async (card) => {
            return await this.createCardObj(card)
        }))
        return { data: cards, count }
    }

    static async getOne(_id) {
        const cardsDoc = await this.modelCards.findById(_id)
        return  this.createCardObj(cardsDoc)
    }


    static async create(reqCard) {
        const card = await this.createCardObj(reqCard)
        const cardDoc = await this.modelCards.create(card)
        return await this.createCardObj(cardDoc)
    }

    static async update(_id, reqCard) {
        const card = await this.createCardObj(reqCard)
        console.log(card)
        const cardDoc = await this.modelCards.findOneAndUpdate({_id}, card, { new: true, runValidators: true})
        if (cardDoc) {
            console.log(cardDoc)
            return await this.createCardObj(cardDoc)
        } else {
          throw {message:'Não encontrado'}
        }
      }

    static async previewImage(card, type) {
        return await processImg(card, type, false)
    }

    static async delete(card_id) {
        const cardDoc = await this.modelCards.findOneAndDelete({ card_id })
        if (cardDoc) {
            return await this.createCardObj(cardDoc)
        } else {
            throw { message: 'Não encontrado' }
        }
    }
    
    static async deleteMany(Array_id) {
        const cardDoc = await this.modelCards.deleteMany({ _id: { $in: Array_id } })
        if (cardDoc) {
            return await { data: Array_id }
        } else {
            throw { message: 'Não encontrado' }
        }
    }
}


Card.modelCards = mongoose.model('Card', cardSchema);

module.exports = Card;