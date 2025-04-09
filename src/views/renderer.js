/**
 * Processo de renderização
 * Tela principal
 */

console.log("Processo de renderização")

// Envio de uma mensagem para o main abrir a janela clinte
function client() {
    //console.log("teste do botão cliente")
    //uso da api(autorizada no preload.js)
    api.clientWindow()
}

// Envio de uma mensagem para o main abrir a janela os
function os() {
    //console.log("teste do botão os")
    //uso da api(autorizada no preload.js)
    api.osWindow()
}
// envio de uma mensagem para o main abrir a janela moto
function moto() {
    //uso do api(autorizada no preload.js)
    api.motoWindow()
}

// troca do icone do banco de dados
api.dbStatus((event, message) => {
    // teste de recebimento da msg do main
    console.log(message)
    if (message === "conectado") {
        document.getElementById('statusdb').src = "../public/img/dbon.png"
    } else {
        document.getElementById('statusdb').src = "../public/img/dboff.png"
    }
})