module.exports = class Error{
    static errorProcess(res,error){
      if(error.name){
        console.log(error)
        res.status(400).send(error)
      } else if(error.message==='Não encontrado'){
        res.status(404).send(error)
      } else if(error.message==='Token invalid'){
        res.status(401).send(error)
      } else if(error.message){
        res.status(400).send(error)
      } else{
        console.log(error)
        res.status(500).send(error)
      }
    }
}