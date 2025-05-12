/**
 * Modelo de dados para construção de coleções ("tabelas")
 */

// Importação dos recursos do framework mongoose 
const { model, Schema } = require('mongoose')

// criação da estrutura da coleção OS
const osSchema = new Schema ({
    dataOS: {
        type: Date,
        default: Date.now
    },
    idCliente: {
        type: String,        
    },
    statusOS: {
        type: String
    },
    moto: {
        type: String
    }, //computador
    placa: {
        type: String        
    }, //serie
    problema: {
        type: String  
    },
    tecnico: {
        type: String  
    },
    diagnostico: {
        type: String  
    },
    pecas: {
        type: String 
    },
    valor: {
        type: String 
    },
   
}, {versionKey: false}) // não versionar os dados armazenados 

// exportar para o main o moulo de dados
//OBS: Clientes será o nome da coleção "tabelas"

module.exports = model('OS', osSchema)