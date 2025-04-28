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
// == Fim busca CEP ========================================

// vetor global que será usado na manipulação dos dados
let arrayClient = []

//capturar o foco na busca pelo cliente
// a constante do foco obtem o elemento html
const foco = document.getElementById('searchClient')

function teclaEnter(event) {
    if(event.key === "Enter") {
        event.preventDefault()
        buscarCliente()
    }
}

// iniciar a janela de cliente alterrando as propriedades de alguns elementos
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
let emailClient = document.getElementById('inputEmailClient')
let phoneClient = document.getElementById('inputPhoneClient')
let cepClient = document.getElementById('inputCEPClient')
let addressClient = document.getElementById('inputAddressClient')
let numberClient = document.getElementById('inputNumberClient')
let complementClient = document.getElementById('inputComplementClient')
let neighborhoodClient = document.getElementById('inputNeighborhoodClient')
let cityClient = document.getElementById('inputCityClient')
let ufClient = document.getElementById('inputUFClient')

// captura do id do cliente
let id = document.getElementById('idClient')

//==============================================================
// == Manipulação da tecla Enter ============================

// Função para manipular o evento da tecla Enter
function teclaEnter(event){
    if (event.key === "Enter") {
        event.preventDefault()
        buscarCliente()
    }
}

// Função para restaurar o padrão da tecla Enter (submit)
function restaurarEnter() {
    frmClient.removeEventListener('keydown', teclaEnter)
}
// "Escuta do evento Tecla Enter"
frmClient.addEventListener('keydown', teclaEnter)

// == Fim - manipulação tecla Enter ==========================

// === Função para aplicar máscara no CPF ===
function aplicarMascaraCPF(campo) {
    let cpf = campo.value.replace(/\D/g, ""); // Remove caracteres não numéricos

    if (cpf.length > 3) cpf = cpf.replace(/^(\d{3})(\d)/, "$1.$2");
    if (cpf.length > 6) cpf = cpf.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
    if (cpf.length > 9) cpf = cpf.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");

    campo.value = cpf;
}

// === Função para validar CPF ===
function validarCPF() {
    let campo = document.getElementById('inputCPFClient');
    let cpf = campo.value.replace(/\D/g, ""); // Remove caracteres não numéricos

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        campo.style.borderColor = "red";
        campo.style.color = "red";
        return false;
    }

    let soma = 0, resto;

    for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) {
        campo.style.borderColor = "red";
        campo.style.color = "red";
        return false;
    }

    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[10])) {
        campo.style.borderColor = "red";
        campo.style.color = "red";
        return false;
    }

    campo.style.borderColor = "green";
    campo.style.color = "green";
    return true;
}

// Adicionar eventos para CPF
cpfClient.addEventListener("input", () => aplicarMascaraCPF(cpfClient)); // Máscara ao digitar
cpfClient.addEventListener("blur", validarCPF); // Validação ao perder o foco

//== CRUD Create/Update =========================================

//==Evento associado ao botao submit(uso das validações do html)
frmClient.addEventListener('submit', async (event) => {
    // evitar o comportamento padrao do submit que é enviar os
    // formularios e reiniciar o docu html
    event.preventDefault()
    // teste Importante (receber dos dados do formulario- passo )
   //let nameClient = document.getElementById('inputNameClient')
    console.log(nameClient.value, cpfClient.value, emailClient.value,
    phoneClient.value, cepClient.value, addressClient.value,
    numberClient.value, complementClient.value, neighborhoodClient.value,
    cityClient.value, ufClient.value)

    // Limpa o CPF antes de salvar no banco
    let cpfSemFormatacao = cpfClient.value.replace(/\D/g, "");

    //criar um objeto pra armazenar os dados do cliente antes de enviar ao main
    const client = {
        nameCli: nameClient.value,
        cpfCli: cpfClient.value,
        emailCli: emailClient.value,
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

//== Fim CRUD Create/Update===================================

// ============================================================
// == Inicio CRUD Read ========================================
function buscarCliente() {
    //console.log("teste do botão")
    // Passo 1: capturar o nome do cliente
    let name = document.getElementById('searchClient').value
    console.log(name) // teste do passo 1

    // validação de campo obrigatório
    if (name === "") {
        // enviar ao main um pedido para alertar o usuário
        api.validateSearch()
        foco.focus()

    } else {
        api.searchName(name) // Passo 2: envio do nome ao main
        // recebimento dos dados do cliente
        api.renderClient((event, dataClient) => {
            console.log(dataClient) // teste do passo 5
        // usar o laço forEach para percorre o vetor e setar os campos (caixas de texto) do formulário
            const dadosCliente = JSON.parse(dataClient)
        // atribuir ao vetor os dados do cliente
            arrayClient = dadosCliente
        // extrair os dados do cliente
            arrayClient.forEach((c) =>{
                id.value = c._id,
                nameClient.value = c.nomeCliente,
                    cpfClient.value = c.cpfCliente,
                    emailClient.value = c.emailCliente,
                    phoneClient.value = c.foneCliente,
                    cepClient.value = c.cepCliente,
                    addressClient.value = c.logradouroCliente,
                    numberClient.value = c.numeroCliente,
                    complementClient.value = c.complementoCliente,
                    neighborhoodClient.value = c.bairroCliente,
                    cityClient.value = c.cidadeCliente,
                    ufClient.value = c.ufCliente

                    //bloqueio do botao adicionar
                    btnCreate.disabled = true
                    // desbloquear dos botoes editar e excluir
                    btnUpdate.disabled = false
                    btnDelete.disabled = false
            })
        })    
    }             
}

// setar o cliente não cadastrado (recortar do campo de busca e colar no campo nome)
api.setClient((args) => {
    // criar uma variável para armazenar o valor digitado no campo de busca (nome ou cpf)
    let campoBusca = document.getElementById('searchClient').value
    // foco no campo de nome do cliente
    foco.value = ""
    // preencher o campo de nome do cliente com o nome da busca
    nameClient.value = campoBusca
})

// == Fim - CRUD Read =========================================

//== CRUD Delete===========================================
function excluirCliente() {
    console.log(id.value) // passo 1 (receber form do ID)
    api.deleteClient(id.value) // passo 2 (enviar o id ao main)
}

//== Fim CRUD Delete ======================================

// == Reset Form ==============================================
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