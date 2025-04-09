// Buscar CEP
function buscarCEP() {
    //console.log("teste do evento blur")
    //armazenar o cep digitado na variável
    let cep = document.getElementById('inputCEPClient').value
    //console.log(cep) //teste de recebimento do CEP
    //"consumir" a API do ViaCEP
    let urlAPI = `https://viacep.com.br/ws/${cep}/json/`
    //acessando o web service par abter os dados
    fetch(urlAPI)
        .then(response => response.json())
        .then(dados => {
            //extração dos dados
            document.getElementById('inputAddressClient').value = dados.logradouro
            document.getElementById('inputNeighborhoodClient').value = dados.bairro
            document.getElementById('inputCityClient').value = dados.localidade
            document.getElementById('inputUFClient').value = dados.uf
        })
        .catch(error => console.log(error))
}

//capturar o foco na busca pelo cliente
// a constante do foco obtem o elemento html
const foco = document.getElementById('searchClient')

// iniciar a janela de cliente alterrando as propriedades de algums elemento
document.addEventListener('DOMContentLoaded', () => {
    btnUpdate.disabled = true
    btnDelete.disabled = true
    // foco na busca do cliente
    foco.focus()
})

// captura dos dados dos inputs do formulario (passo 1: fluxo)
let frmClient = document.getElementById('frmClient')
let nameClient = document.getElementById('inputNameClient')
let cpfClient = document.getElementById('inputCPFClient')
let emailCleint = document.getElementById('inputEmailClient')
let phoneClient = document.getElementById('inputPhoneClient')
let cepClient = document.getElementById('inputCEPClient')
let addressClient = document.getElementById('inputAddressClient')
let numberClient = document.getElementById('inputNumberClient')
let complementClient = document.getElementById('inputComplementClient')
let neighborhoodClient = document.getElementById('inputNeighborhoodClient')
let cityClient = document.getElementById('inputCityClient')
let ufClient = document.getElementById('inputUFClient')

//==============================================================
//== CRUD Create/Update

//==Evento associado ao botao submit(uso das validações do html)
frmClient.addEventListener('submit', async (event) => {
    // evitar o comportamento padrao do submit que é enviar os
    // formularios e reiniciar o docu html
    event.preventDefault()
    // teste Importante (receber dos dados do formulario- passo )
   //let nameClient = document.getElementById('inputNameClient')
    console.log(nameClient.value, cpfClient.value, emailCleint.value,
    phoneClient.value, cepClient.value, addressClient.value,
    numberClient.value, complementClient.value, neighborhoodClient.value,
    cityClient.value, ufClient.value)
    //criar um objeto pra armazenar os dados do cliente antes de enviar ao main
    const client = {
        nameCli: nameClient.value,
        cpfCli: cpfClient.value,
        emailCli: emailCleint.value,
        phoneCli: phoneClient.value,
        cepCli: cepClient.value,
        addressCli: addressClient.value,
        numberCli: numberClient.value,
        complementCli: complementClient.value,
        neighborhoodCli: neighborhoodClient.value,
        cityCli: cityClient.value,
        ufCli: ufClient.value
    }
    // enviar ao main o objeto client - passo 2: fluxo
    // uso do preload.js
    api.newClient(client)
})

//== Fim CRUD Create/Update

//=========================================================//
// == Reset Form ==========================================
function resetForm() {
    // limpar os campos e resetar o furmulario com as configurações
    location.reload()
    //
}
// recebimento do pedido do main pra resetar o form
api.resetForm((args) => {
    resetForm()
})

// ====Fim do  reset form ==================================
//==========================================================