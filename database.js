/**
 * Módulo de conexão com o banco de dados
 * Uso do framework mongoose
 */

// importação do mongoose
const { connect } = require('http2')
const mongoose = require('mongoose')

// configuração do acesso ao banco de dados
const url = 'mongodb+srv://admin:123Senac@projetonode.d0d37.mongodb.net/dbeder'

// método para conectar o banco de dados

let conectado = false
// validação (se não estiver conectado, conectar)
const conectar = async() => {
    if (!conectado) {
        
        try {
            await mongoose.connect(url) //conectar
            conectado = true //setar a variável
            console.log("MongoDB conectado") //inicio
            return true // para o main identificar a conexao             
        } catch (error) {
            // se o código de erro = 8000 (autenticação)
            if (error.code = 8000) {
                console.log("Erro de autenticação")
            } else {
                console.log(error)
            }
            return false
        }
    }
}

// método para desconectar o banco de dados
const desconectar = async() => {
   
    if (conectado) {
               
        try {
            await mongoose.disconnect(url) //desconectar
            conectado = false //setar a variável
            console.log("MongoDB desconectado")
            return true // para o main identificar             
        } catch (error) {
            console.log(error)
            return false
        }
    }
}
// exportar para o main os métodos conectar e desconectar
module.exports = { conectar, desconectar }