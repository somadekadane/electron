/**
 * Processo de renderização
 * Tela principal
 */
console.log("Processo de renderização")

function client() {    
    api.clientWindow()
}
// Envio de uma mensagem para o main abrir a janela os
function os() {    
    api.osWindow()
}
// EDER envio de uma mensagem para o main abrir a janela moto
function moto() {    
    api.motoWindow()
}
// troca do icone do banco de dados
api.dbStatus((event, message) => {  
    console.log(message)
    if (message === "conectado") {
        document.getElementById('statusdb').src = "../public/img/dbon.png"
    } else {
        document.getElementById('statusdb').src = "../public/img/dboff.png"
    }
})