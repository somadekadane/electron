const { model, Schema } = require('mongoose')
const osSchema = new Schema ({
    dataEntrada: {
        type: Date,
        default: Date.now
    },
    idCliente: {
        type: String,        
    },
    statusOS: {
        type: String
    },
    motocicleta: {
        type: String,        
    }, 
    placa: {
        type: String        
    }, 
    problema: {
        type: String 
    },    
    observacao: {
        type: String
    },
    tecnico: {
        type: String  
    },
    diagnostico: {
        type: String  
    },
    valor: {
        type: String 
    },
}, {versionKey: false}) 
module.exports = model('OS', osSchema)