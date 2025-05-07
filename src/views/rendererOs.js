// ================================================
// == Busca avançada - estilo Google ==============
const input = document.getElementById('inputSearchClient')
// capturar os ids nome do cliente
const suggestionList = document.getElementById('viewListSuggestion')
//capturar os campos preenchida
let idClient = document.getElementById('inputidClient')
let nameClient = document.getElementById('inputNameClient')
let placaClient = document.getElementById('inputPlacaClient')  // alterei para placa

// vetor usado na manipulaçao (filtragem) dos dados
let arrayClients = []

// captura em tempo real do input(digitação de caracteres na busca)
input.addEventListener('input', () => {
    // passo 1: capturar  o que for digitado na busca coverter pra letras minúsculas
    const search = input.value.toLowerCase()
    //console.log(search) // teste de apoio a lógica
    //passo 2: Enviar ao main um pedido de busca de clientes pelo nome (via preload - Api)
    api.searchClients()

    //recebimento dos clientes banco de dados (passo 3)
    api.listClients((event, clients) => {
        //console.log(clients) // teste
        // converter para json os dados dos clientes recebidos
        const dataClients = JSON.parse(clients)
        // armazenar o vetor os dados do clientes
        arrayClients = dataClients
        //Passo 4: filtrar os dados dos clientes extraindo nomes
        // que tenham relação com os caracteres digitando busca tempo real
        const results = arrayClients.filter(c =>
            c.nomeCliente && c.nomeCliente.toLowerCase().includes(search)
        ).slice(0, 10) // máximo 10 resultados
        //console.log(results) // Importante pra o entendimento
        //limpar a lista a cada caracteres
        suggestionList.innerHTML = ""
        // para cada resultao gerar um item da lista <li>
        results.forEach(c => {
            // criar elemento
            const item = document.createElement('li')
            // adic classes boostrap a ca li criado
            item.classList.add('list-group-item', 'list-group-item-action')
            //exibir 
            item.textContent = c.nomeCliente

            // adicionar os li's lista ul
            suggestionList.appendChild(item)

            //aicionar um evento de clique no item da lista pra preencher os campos formulario
            item.addEventListener('click', () => {
              idClient.value = c._id
              nameClient.value = c.nomeCliente
              phoneClient.value = c.foneCliente
              // limpar o input e recolher a lista
              input.value = ""
              suggestionList.innerHTML = ""  
            })
        })
        
    })
})

// ocultar a lista ao clicar fora
document.addEventListener('click', (event) => {
    // ocultar a listar se existir e estiver ativa
    if(!input.contains(event.target) && !suggestionList.contains(event.target)){
        suggestionList.innerHTML = ""
    }
})

// == fim busca avançada ==============================

// buscar OS ======================================

function inputOS() {
    // console log("Teste")
    api.searchOS()
}

// const foco = document.getElementById('searchClient')

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