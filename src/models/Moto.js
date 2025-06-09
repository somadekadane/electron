const { model, Schema } = require('mongoose')
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
module.exports = model('Veículos', motoSchema)