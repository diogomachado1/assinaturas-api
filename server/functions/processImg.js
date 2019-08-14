const Jimp = require('jimp');
const signatureModel = require('../model/signature')


async function printText(img,display='',posX,posY,fontSize=18,sizeX=350,sizeY=300){
    let font = await Jimp.loadFont(`./server/static/fonts/Roboto-BoldCondensed-${fontSize}/font.fnt`)
    return await img.print(font, posX, posY, display,sizeX, sizeY)
} 

async function expandImg(themeName, img){
    const header = await Jimp.read(`./server/static/model-ass/footer/footer${themeName}.png`)
    return await img.contain(800,img.bitmap.height+20 , Jimp.HORIZONTAL_ALIGN_LEFT | Jimp.VERTICAL_ALIGN_TOP).blit(header, 0,img.bitmap.height-20);
}

async function printContact(id,display,posX,posY,img){
    const icon = await Jimp.read(`./server/static/icons/${id}.png`);
    img.blit(icon, posX, posY-2);
    return await printText(img, display, posX+25, posY);
}
module.exports = async (signature, MIME, save) => { 
    let posX = 75; let posY = 70; 
    const jimpImg = await Jimp.read(`./server/static/model-ass/${signature.business}.png`).then(async img => {
        img = await printText(img, signature.name, posX, posY, 32, 550);
        img = await printText(img, signature.position, posX, posY+=35);
        img = await printText(img, signature.email, posX, posY+=25);
        posY+=10;
        //signature.contacts.sort((a,b)=> a.order-b.order);
        if(signature.contacts){
            for (let index = 0; index < signature.contacts.length; index++) {
                const {id, value} = signature.contacts[index]
                if(posY>=img.bitmap.height-40){
                    img = await expandImg(signature.business, img)
                }
                img = await printContact(id, value, posX, posY+=20, img)
            }
        }
        if(save === true){
            if(signature.email){
                if(MIME == 'image/png'){
                    await img.writeAsync(`./assinatura/${signature._id}.png`)
                }else{
                    img = await img.quality(60)
                    try{
                        //await signatureModel.create(signature);
                        await img.writeAsync(`./assinatura/${signature._id}.jpg`)
                        
                    } catch (error) {
                        throw {error}
                    }
                }
            } else {
                throw {message: 'E-mail obrigatório'}
            }
        } 
        img = await img.quality(80).getBufferAsync(MIME);
        return img
        })
    return jimpImg
}

