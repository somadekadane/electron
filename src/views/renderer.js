console.log("Processo de renderização")

function client() {    
    api.clientWindow()
}
function os() {    
    api.osWindow()
}
function moto() {    
    api.motoWindow()
}
api.dbStatus((event, message) => {  
    console.log(message)
    if (message === "conectado") {
        document.getElementById('statusdb').src = "../public/img/dbon.png"
    } else {
        document.getElementById('statusdb').src = "../public/img/dboff.png"
    }
})