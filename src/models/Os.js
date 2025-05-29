/**
 * Modelo de dados para construção de coleções ("tabelas")
 */

// Importação dos recursos do framework mongoose 
const { model, Schema } = require('mongoose')

// criação da estrutura da coleção OS
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
    veiculo: {
        type: String,        
    }, //computador
    placa: {
        type: String        
    }, //serie
    problema: {
        type: String //descricao "Observações / Ocorrências"
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
}, {versionKey: false}) // não versionar os dados armazenados 

// exportar para o main o moulo de dados

module.exports = model('OS', osSchema)