// Iniciar a janela de clientes alterando as propriedades de alguns elementos
document.addEventListener('DOMContentLoaded', () => {
    btnUpdate.disabled = true
    btnDelete.disabled = true
    // Foco na busca do cliente
    foco.focus()
})

//captura dos dados dos inputs do formulario (passo 1 fluxo)
let frmOS = document.getElementById('frmOS')
let descricaoOS = document.getElementById('serviceDescription')
let materialOS = document.getElementById('inputPecasClient')
let dataOS = document.getElementById('inputconclusãoClient')
let orcamentoOS = document.getElementById('inputOrcamentoClient')
let pagamentoOS = document.getElementById('inputpagamentoClient')
let statusOS = document.getElementById('osStatus')

// =======================================================
// == CRUD Creat/Update ==================================

// Evento associado ao botão submit (uso das validações do html)
frmOS.addEventListener('submit', async (event) =>{
    //evitar o comportamento padrao do submit que é enviar os dados do formulario
    event.preventDefault()
    //Teste importante ( recebimento dos dados do formulario - passo 1 do fluxo)
    console.log(descricaoOS.value, materialOS.value, dataOS.value, orcamentoOS.value, pagamentoOS.value, statusOS.value) 

    // Criar um objeto para armazenar os dados do cliente amtes de enviar ao main
    const OS = {
        desOS: descricaoOS.value,
        matOS: materialOS.value,
        datOS: dataOS.value,
        orcOS: orcamentoOS.value,
        pagOS: pagamentoOS.value,
        staOS: statusOS.value
    }
    // Enviar ao main o objeto client - (Passo 2: fluxo)
    // uso do preload.js
    api.newOS(OS) 
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