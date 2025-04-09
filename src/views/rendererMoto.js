// Iniciar a janela de clientes alterando as propriedades de alguns elementos
document.addEventListener('DOMContentLoaded', () => {
    btnUpdate.disabled = true
    btnDelete.disabled = true
    // Foco na busca do cliente
    foco.focus()
})

//captura dos dados dos inputs do formulario
let frmMoto = document.getElementById('frmMoto')
let proprietarioMoto = document.getElementById('inputProprietarioClient')
let marcaMoto = document.getElementById('inputMarcaClient')
let modeloMoto = document.getElementById('inputModeloClient')
let anoMoto = document.getElementById('inputAnoClient')
let placaMoto = document.getElementById('inputPlacaClient')
let corMoto = document.getElementById('inputCorClient')
let chassiMoto = document.getElementById('inputChassiClient')

// == CRUD Creat/Update ==================================

// Evento associado ao botão submit 
frmMoto.addEventListener('submit', async (event) =>{
    //evitar o comportamento padrao do submit
    event.preventDefault()
    //Teste importante ( recebimento dos dados do formulario 
    console.log(proprietarioMoto.value, marcaMoto.value, modeloMoto.value, anoMoto.value, placaMoto.value, corMoto.value, chassiMoto.value) 

    // Criar um objeto para armazenar os dados do cliente amtes de enviar ao main
    const car = {
        proCar: proprietarioMoto.value,
        marCar: marcaMoto.value,
        modCar: modeloMoto.value,
        anoCar: anoMoto.value,
        plaCar: placaMoto.value,
        corCar: corMoto.value,
        chasCar: chassiMoto.value 
    }
    // Enviar ao main o objeto client - (Passo 2 fluxo)
    // uso do preload.js
    api.newMoto(car) 
}) 
// == fim CRUD Creat/Update ==============================

// == Reset form =========================================
function resetForm(){
    //Limpar os campos e resetar o formulario com as configurações pré definidas
    location.reload()
}

// Recebimento do pedido do main para resetar o formulario
api.resetForm((args)=>{
    resetForm()
})

// == Fim - Reset form ===================================
// =======================================================