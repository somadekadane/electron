/**
 * Modelo de dados para construção de coleções ("tabelas")
 */

// Importação dos recursos do framework mongoose 
const { model, Schema } = require('mongoose')

// criação da estrutura da coleção OS
const motoSchema = new Schema ({
    proprietarioMoto: {
        type: String
    },
    marcaMoto: {
        type: String
    },
    modeloMoto: {
        type: String
    },
    anoMoto: {
        type: String
    },
    placaMoto: {
        type: String
    },
    corMoto: {
        type: String
    },
    chassiMoto: {
        type: String
    }
}, {versionKey: false})

// exportar para o main o modulo de dados
module.exports = model('Veículos', motoSchema)