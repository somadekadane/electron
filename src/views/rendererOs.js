// ============================================================================
// == Busca avançada - estilo Google ==========================================
const input = document.getElementById("inputSearchClient");
// capturar os ids nome do cliente
const suggestionList = document.getElementById("viewListSuggestion");
//capturar os campos preenchida
let idClient = document.getElementById("inputIdClient");
// Disparar ação de busca do nome e telefone do cliente quando o inputIdClient for preenchido (change - usado quando o campo input é desativado)
idClient.addEventListener('change', () => {
    if (idClient.value !== "") {
        console.log(idClient.value)
        api.searchIdClient(idClient.value)
    }
})
let nameClient = document.getElementById("inputNameClient");
let phoneClient = document.getElementById("inputPhoneClient");
let cpfClient = document.getElementById("inputCPFClient");

let arrayClients = []; // vetor usado na manipulaçao (filtragem) dos dados

// captura em tempo real do input(digitação de caracteres na busca)
input.addEventListener("input", () => {
  // passo 1: capturar  o que for digitado na busca coverter pra letras minúsculas
  const search = input.value.toLowerCase();
  //console.log(search) // teste de apoio a lógica
  //passo 2: Enviar ao main um pedido de busca de clientes pelo nome (via preload - Api)
  suggestionList.innerHTML = "";

  // Buscar os nomes dos clientes no banco
  api.searchClients();

  //recebimento dos clientes banco de dados (passo 3)
  api.listClients((event, clients) => {
    const listaClients = JSON.parse(clients);
    arrayClients = listaClients;
    //Passo 4: filtrar os dados dos clientes extraindo nomes
    // que tenham relação com os caracteres digitando busca tempo real
    const results = arrayClients.filter((c) => 
      c.nomeCliente && c.nomeCliente.toLowerCase().includes(search)
      ).slice(0, 8); // máximo 10 resultados
    //console.log(results) // Importante pra o entendimento
    //limpar a lista a cada caracteres
    suggestionList.innerHTML = "";
    // para cada resultao gerar um item da lista <li>
    results.forEach((c) => {
      const item = document.createElement("li");
      item.classList.add("list-group-item", "list-group-item-action");
      item.textContent = c.nomeCliente;

      // adicionar os li's lista ul
      //suggestionList.appendChild(item)

      //adicionar um evento de clique no item da lista pra preencher os campos formulario
      item.addEventListener("click", () => {
        idClient.value = c._id;
        nameClient.value = c.nomeCliente;
        phoneClient.value = c.foneCliente;
        //cpfClient.value = c.cpfCliente
        // limpar o input e recolher a lista
        input.value = "";
        suggestionList.innerHTML = "";
      });
      // adiciona os nomes(itens <li>) a lista <ul>
      suggestionList.appendChild(item);
    });
  });
});
// setar o foco no campo de busca (validação de busca do cliente obrigatória)
api.setSearch((args) => {
  input.focus();
});

// ocultar a lista ao clicar fora
document.addEventListener('click', (e) => {
  // ocultar a listar se existir e estiver ativa
  if (!input.contains(e.target) && !suggestionList.contains(e.target)) {
    suggestionList.innerHTML = "";
  }
});
// == fim busca avançada ======================================================
//=============================================================================

const foco = document.getElementById('searchClient')

//Iniciar a janela de clientes alterando as propriedades de alguns elementos
document.addEventListener('DOMContentLoaded', () => {
    btnUpdate.disabled = true
    btnDelete.disabled = true
    // Foco na busca do cliente
    //foco.focus()
})

// criar um vetor para manipulação dos dados da OS
let arrayOS = [];

//captura dos dados dos inputs do formulario (passo 1 fluxo)
let frmOS = document.getElementById("frmOS");
let descricaoOS = document.getElementById("serviceDescription");
let materialOS = document.getElementById("inputPecasClient");
let dataOS = document.getElementById("inputconclusãoClient");
let orcamentoOS = document.getElementById("inputOrcamentoClient");
let pagamentoOS = document.getElementById("inputpagamentoClient");
let statusOS = document.getElementById('inputStatus')
let IdC = document.getElementById("inputIdClient");
// captura da OS (CRUD Delete e Update)
let idos = document.getElementById("inputOS");
// captura do id do campo data
let dateOS = document.getElementById("inputData");

// ============================================================================
// == CRUD Creat/Update =======================================================

// Evento associado ao botão submit (uso das validações do html)
frmOS.addEventListener('submit', async (event) => {
  //evitar o comportamento padrao do submit que é enviar os dados do formulario
  event.preventDefault();

  if (idClient.value === "") {
    api.validateClient();
  } else {
        // Teste importante (recebimento dos dados do formuláro - passo 1 do fluxo)
        console.log(idOS.value, idClient.value, statusOS.value, computer.value, serial.value, problem.value, obs.value, specialist.value, diagnosis.value, parts.value, total.value)
        if (idOS.value === "") {
            //Gerar OS
            //Criar um objeto para armazenar os dados da OS antes de enviar ao main
            const os = {
                idClient_OS: idClient.value,
                stat_OS: statusOS.value,
                computer_OS: computer.value,
                serial_OS: serial.value,
                problem_OS: problem.value,
                obs_OS: obs.value,
                specialist_OS: specialist.value,
                diagnosis_OS: diagnosis.value,
                parts_OS: parts.value,
                total_OS: total.value
            }
            // Enviar ao main o objeto os - (Passo 2: fluxo)
            // uso do preload.js
            api.newOS(os)
        } else {
            //Editar OS
            //Gerar OS
            //Criar um objeto para armazenar os dados da OS antes de enviar ao main
            const os = {
                id_OS: idOS.value,
                idClient_OS: idClient.value,
                stat_OS: statusOS.value,
                computer_OS: computer.value,
                serial_OS: serial.value,
                problem_OS: problem.value,
                obs_OS: obs.value,
                specialist_OS: specialist.value,
                diagnosis_OS: diagnosis.value,
                parts_OS: parts.value,
                total_OS: total.value
            }
            // Enviar ao main o objeto os - (Passo 2: fluxo)
            // uso do preload.js
            api.updateOS(os)
        }
    }
})      
// == fim CRUD Creat/Update ===================================================

// ============================================================================
// == Busca OS - CRUD Raad ====================================================

function findOS() {
  api.searchOS();
}

api.renderOS((event, dataOS) => {
  console.log(dataOS);
  const os = JSON.parse(dataOS);
  // preencher os campos com os dados da OS
  idOS.value = os._id;
  // formatar data:
  const data = new Date(os.dataEntrada);
  const formatada = data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  dateOS.value = formatada
    idClient.value = os.idCliente
    // disparar ação de busca do cliente pelo id
    idClient.dispatchEvent(new Event('change'))    
    statusOS.value = os.statusOS
    computer.value = os.computador
    serial.value = os.serie
    problem.value = os.problema
    obs.value = os.observacao
    specialist.value = os.tecnico
    diagnosis.value = os.diagnostico
    parts.value = os.pecas
    total.value = os.valor
    // desativar o botão adicionar
    btnCreate.disabled = true
    // ativar os botões editar e excluir
    btnUpdate.disabled = false
    btnDelete.disabled = false
})

// receber dados do cliente para preenchimento da OS
api.renderIdClient((event, dataClient) => {
    console.log(dataClient)
  
}) 
// == Fim - Buscar OS - CRUD Read =============================================

// ============================================================================
// == CRUD Delete =============================================================

function removeOS() {
    console.log(idOS.value) // Passo 1 (receber do form o id da OS)
    api.deleteOS(idOS.value) // Passo 2 (enviar o id da OS ao main)
}

// == Fim - CRUD Delete =======================================================

// ============================================================================
// == Imprimir OS =============================================================
function generateOS() {
api.printOS();
}
// == Fim - Imprimir OS =======================================================

// ============================================================================
//== Reset form ===============================================================
function resetForm() {
  //Limpar os campos e resetar o formulario com as configurações pré definidas
  location.reload();
}

// Recebimento do pedido do main para resetar o formulario
api.resetForm((args) => {
  resetForm();
});
// == Fim - Reset form ========================================================