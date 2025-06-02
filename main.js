console.log("Processo principal");

const { app, BrowserWindow, nativeTheme, Menu, ipcMain, dialog, shell } = require("electron");
// shell abrir o aquivo pdf
// Esta linha está relacionada ao preload.js
const path = require("node:path");

//Importacao do schema clientes
const { conectar, desconectar } = require("./database.js");

// importar mongoose (validação do id na OS)
const mongoose = require("mongoose");

const clientModel = require("./src/models/Clientes.js");

// EDER importacao do Schema Moto
const motoModel = require("./src/models/Moto.js");

// importacao do Schema OS
const osModel = require("./src/models/Os.js");

// importação do pacote jspdf (npm i jspdf)
const { jspdf, default: JsPDF } = require("jspdf");

// importação da biblioteca fs (nativa do javascript) para manipulação de arquivo
const fs = require("fs");

// Importação do recurso 'electron-prompt' (dialog de imput)
const prompt = require("electron-prompt");
const Os = require("./src/models/Os.js");

// Janela principal
let win;
const createWindow = () => {
  // a linha abaixo define o tema (claro ou escuro)
  nativeTheme.themeSource = "dark"; //(dark ou light)
  win = new BrowserWindow({
    width: 800,
    height: 600,
    //autoHideMenuBar: true,
    //minimizable: false,
    resizable: false,
    //ativação do preload.js
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // menu personalizado
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  win.loadFile("./src/views/index.html");
};

// Janela sobre
function aboutWindow() {
  nativeTheme.themeSource = "light";
  // a linha abaixo obtém a janela principal
  const main = BrowserWindow.getFocusedWindow();
  let about;
  // Estabelecer uma relação hierárquica entre janelas
  if (main) {
    // Criar a janela sobre
    about = new BrowserWindow({
      width: 360,
      height: 220,
      autoHideMenuBar: true,
      resizable: false,
      minimizable: false,
      parent: main,
      modal: true,
    });
  }
  //carregar o documento html na janela
  about.loadFile("./src/views/sobre.html");
}

// Janela cliente
let client;
function clientWindow() {
  nativeTheme.themeSource = "light";
  const main = BrowserWindow.getFocusedWindow();
  if (main) {
    client = new BrowserWindow({
      width: 1010,
      height: 720,
     // autoHideMenuBar: true,
     // resizable: false,
      parent: main,
      modal: true,
      //ativação do preload.js
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
    });
  }
  client.loadFile("./src/views/cliente.html");
  client.center(); //iniciar no centro da tela
}

// Janela OS
let osScreen;
function osWindow() {
  nativeTheme.themeSource = "light";
  const main = BrowserWindow.getFocusedWindow();
  if (main) {
    osScreen = new BrowserWindow({
      width: 1010,
      height: 820,
      //autoHideMenuBar: true,
      resizable: false,
      parent: main,
      modal: true,
      //ativação do preload.js
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
    });
  }
  osScreen.loadFile("./src/views/os.html");
  osScreen.center();
}

// Janela MOTO
let moto;
function motoWindow() {
  nativeTheme.themeSource = "light";
  const main = BrowserWindow.getFocusedWindow();
  if (main) {
    moto = new BrowserWindow({
      width: 1010,
      height: 720,
      autoHideMenuBar: true,
      resizable: false,
      parent: main,
      modal: true,
      // ativação do preload.js
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
    });
  }
  moto.loadFile("./src/views/moto.html");
  moto.center();
}

// Iniciar a aplicação
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

//reduzir logs não críticos
app.commandLine.appendSwitch("log-level", "3");

// iniciar a conexao com o banco de dados
ipcMain.on("db-connect", async (event) => {
  let conectado = await conectar();
  // se conectado for igual a true
  if (conectado) {
    // enviar uma mensagem para o renderizador trocar o ícone, criar um delay de 0.5s sincronizar a nuvem
    setTimeout(() => {
      event.reply("db-status", "conectado");
    }, 500); //500ms
  }
});

// Importante ! Desconectar o banco de dados quando aplicação for encerrada
app.on("before-quit", () => {
  desconectar();
});

// template do menu
const template = [
  {
    label: "Cadastro",
    submenu: [
      {
        label: "Cliente",
        click: () => clientWindow(),
      },
      {
        label: "Veículo",
        click: () => motoWindow(),
      },
      {
        label: "OS",
        click: () => osWindow(),
      },
      {
        type: "separator",
      },
      {
        label: "Sair",
        click: () => app.quit(),
        accelerator: "Alt+F4",
      },
    ],
  },
  {
    label: "Relatórios",
    submenu: [
      {
        label: "Clientes",
        click: () => relatorioClientes(),
      },
      {
        label: "OS abertas",
        click: () => relatorioOsAbertas(),
      },
      {
        label: "OS concluídas",
        click: () => relatorioOsConcluidas(),
      },
    ],
  },
  {
    label: "Ferramentas",
    submenu: [
      {
        label: "Aplicar zoom",
        role: "zoomIn",
      },
      {
        label: "Reduzir",
        role: "zoomOut",
      },
      {
        label: "Restaurar o zoom padrão",
        role: "resetZoom",
      },
      {
        type: "separator",
      },
      {
        label: "Recarregar",
        role: "reload",
      },
      {
        label: "Ferramentas do desenvolvedor",
        role: "toggleDevTools",
      },
    ],
  },
  {
    label: "Ajuda",
    submenu: [
      {
        label: "Sobre",
        click: () => aboutWindow(),
      },
    ],
  },
];

// recebimento dos pedidos do renderizador para abertura de janelas (botões) autorizado no preload.js
ipcMain.on("client-window", () => {
  clientWindow();
});

ipcMain.on("os-window", () => {
  osWindow();
});

ipcMain.on("moto-window", () => {
  motoWindow();
});


//***********************  Clientes  *****************************************/
//****************************************************************************/

//=============================================================================
//===== Clientes - CRUD Create ================================================
// recebimeto do objeto com os dados cliente
ipcMain.on("new-client", async (event, client) => {
  // importante teste de recibimento dos dados cliente
  console.log(client);
  // cadastro da estrutura de dados no banco de dados MOngoDB
  try {
    // criar uma nova estrutura de dados
    // Atenção! os atributos precisa ser identicos ao medelo
    // de dados Cientes.js
    const newClient = new clientModel({
      idCliente: client.idCli,
      nomeCliente: client.nameCli,
      cpfCliente: client.cpfCli,
      emailCliente: client.emailCli,
      foneCliente: client.phoneCli,
      cepCliente: client.cepCli,
      logradouroCliente: client.addressCli,
      numeroCliente: client.numberCli,
      complementoCliente: client.complementCli,
      bairroCliente: client.neighborhoodCli,
      cidadeCliente: client.cityCli,
      ufCliente: client.ufCli,
    });
    // salvar os dados do cliente no banco de dados
    await newClient.save();
    // mensagem de confimação
    dialog.showMessageBox({
        //customização
        type: "info",
        title: "Aviso",
        message: "Cliente adicionado com sucesso",
        buttons: ["OK"],
      })
      .then((result) => {
        //acão ao pressionar o botão (result = 0)
        if (result.response === 0) {
          // enviar um pedido para o redenrizador limpar os campos e resetar
          // as consfiguração pré definidas (rótulo, 'reset-form' do preload.js)
          event.reply("reset-form");
        }
      });
  } catch (error) {
    // se o codigo de erro for 11000 (cpf duplicado)
    if (error.code === 11000) {
      dialog.showMessageBox({
          type: "error",
          title: "Atenção!",
          message: "CPF já está cadastrado\nVerifique se digitou corretamente",
          buttons: ["OK"],
        })
        .then((result) => {
          if (result.response === 0) {
            // limpar a caixa de imput do fpf, focar esta caixa e deixar a borda vermelho
          }
        });
    }
    console.log(error);
  }
});
//===== Fim - Clientes CRUD Create ============================================

//=============================================================================
//===== Veiculo - CRUD Create =================================================
// recebimento do objeto que contem os dados do cliente
ipcMain.on("new-moto", async (event, mot) => {
  // Importante! Teste de recebimento dos dados do cliente
  console.log(mot);
  // cadastrar a estrutura de dados no banco de dados usando a classe modelo. Atenção!! os atributos precisam ser identicos ao modelo de dados Clientes.js eos valores sao definidos pelo conteudo do objeto cliente
  try {
    const newMoto = new motoModel({
      proprietarioMotoMoto: mot.proMot,
      marcaMoto: mot.marMot,
      modeloMoto: mot.modMot,
      anoMoto: mot.anoMot,
      placaMoto: mot.plaMot,
      corMoto: mot.corMot,
      chassiMoto: mot.chasMot,
    });
    // salvar os dados do cliente no banco de dados
    await newMoto.save();
    //Mensagem de confirmação
    dialog.showMessageBox({
        //Customização
        type: "info",
        title: "Aviso",
        message: "Cliente adicionado com sucesso",
        buttons: ["OK"],
      })
      .then((result) => {
        //ação ao precionar o botão
        if (result.response === 0) {
          // enviar um pedido para o renderizador limpar os campos e resetar as
          // configurações pré definidas (rótulo) preload.js
          event.reply("reset-form");
        }
      });
  } catch (error) {
    console.log(error);
  }
});
//===== Fim - Veiculo - CRUD Create ===========================================


//=============================================================================
//===== Relatório de clientes =================================================

async function relatorioClientes() {
  try {
    // passo 1: consutar o banco de dados e obter listagem de clientes cadastrados
    const clientes = await clientModel.find().sort({ nomeCliente: 1 });
    // Teste de recebimento da listagem de clientes
    //console.log(clientes)
    //Passso 2: formatação do documento pdf
    // p - portrait | l - landscape | mm a a4 (folha a4 = 210x297mm)
    const doc = new JsPDF("p", "mm", "a4");

    //Inserir imagem no documento pdf
    // imagePath (caminho da imagem que sera inserida no pdf)
    // imageBase (uso da biblioteca fs para ler o arquivo no formato png)
    const imagePath = path.join(__dirname, "src", "public", "img", "logo4.png");
    const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });
    doc.addImage(imageBase64, "PNG", 5, 8); //(5mm, 8mm, x,y)

    // definir o tamanho da fonte(tamanho equiv. word)
    doc.setFontSize(18);
    // escrever o texto (margem - titulo)
    doc.text("Relatório de clientes", 14, 45); //x, y (mm)
    //Inserir a data atual no relatório
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    doc.setFontSize(12);
    doc.text(`Data: ${dataAtual}`, 165, 10);
    // variavel de apoio na formatação
    let y = 60;
    doc.text("Nome", 14, y);
    doc.text("Telefone", 80, y);
    doc.text("E-mail", 130, y);
    y += 5;
    // desenhar uma linha
    doc.setLineWidth(0.5); // espessura da linha
    doc.line(10, y, 200, y); // 10 inicio da linha -- 200 (fim)

    //redenrizar os clientes cadastrado no banco
    y += 10; // espaçamento da linha
    // pecorrer o vetor do clientes (obtido do banco) usando o laço forEach
    clientes.forEach((c) => {
      // adicionar outra pagina se a folha for preenchida
      // (estrategia é saber o tamanho da folha)
      // folha a4 y = 297 mm
      if (y > 280) {
        doc.addPage();
        y = 20; // resetar a variavel y
        // redesenhar p cabeçalho
        doc.text("Nome", 14, y);
        doc.text("Telefone", 80, y);
        doc.text("E-mail", 130, y);
        y += 5;
        doc.setLineWidth(0.5);
        doc.line(10, y, 200, y);
        y += 10;
      }
      doc.text(c.nomeCliente, 14, y),
        doc.text(c.foneCliente, 80, y),
        doc.text(c.emailCliente || "N/A", 130, y);
      y += 10; // quebra de linha
    });

    // adionar numeração automatica de página
    const paginas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= paginas; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Página ${i} de ${paginas}`, 105, 290, { align: "center" });
    }

    //Definir o caminho do arquivo temporário
    const tempDir = app.getPath("temp");
    const filePath = path.join(tempDir, "clientes.pdf");

    // salvar temporariamente o arquivo
    doc.save(filePath);
    //abrir o arquivo no aplicativo padrão de leitura de pdf
    shell.openPath(filePath);
  } catch (error) {
    console.log(error);
  }
}
//===== Fim - relatório do clientes ===========================================

//=============================================================================
//===== Relatorio da OS Aberta ================================================

async function relatorioOsAbertas() {
  try {
    const clientes = await osModel
      .find({ stats: "Aberta" })
      .sort({ Aberta: 1 });

    const doc = new jsPDF("p", "mm", "a4");

    const imagePath = path.join(__dirname, "src", "public", "img", "logo4.png");
    const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });
    doc.addImage(imageBase64, "PNG", 20, 8); //(5mm, 8mm x,y)

    doc.setFontSize(18);

    doc.text("Relatório de Ordem de Serviços", 14, 45); //x,y (mm)

    const dataAtual = new Date().toLocaleDateString("pt-BR");
    doc.setFontSize(12);
    doc.text(`Data: ${dataAtual}`, 160, 10);

    let y = 60;
    doc.text("Nome do Cliente", 14, y);
    doc.text("Orçamento", 70, y);
    doc.text("Status", 120, y);
    y += 5;

    doc.setLineWidth(0.5); // expessura da linha
    doc.line(10, y, 200, y); // inicio e fim

    y += 10; // espaçãmento da linha

    clientes.forEach((c) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
        doc.text("Nome do Cliente", 14, y);
        doc.text("Orçamento", 70, y);
        doc.text("Status", 120, y);
        y += 5;
        doc.setLineWidth(0.5);
        doc.line(10, y, 200, y);
        y += 10;
      }

      doc.text(c.idCliente || "N/A", 14, y);
      doc.text(c.orcamento || "N/A", 70, y);
      doc.text(c.status || "N/A", 120, y);
      y += 10;
    });

    const paginas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= paginas; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Página ${i} de ${paginas}`, 105, 290, { align: "center" });
    }

    const tempDir = app.getPath("temp");
    const filePath = path.join(tempDir, "ordemservico.pdf");

    doc.save(filePath);

    shell.openPath(filePath);
  } catch (error) {
    console.log(error);
  }
}
//===== Fim relatorio da os aberta ============================================

//=============================================================================
//===== Relatorio da OS Concluida =============================================

async function relatorioOsConcluidas() {
  try {
    const clientes = await osModel
      .find({ stats: "Finalizada" })
      .sort({ Finalizada: 1 });

    const doc = new jsPDF("p", "mm", "a4");

    const imagePath = path.join(__dirname, "src", "public", "img", "logo4.png");
    const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });
    doc.addImage(imageBase64, "PNG", 20, 8); //(5mm, 8mm x,y)

    doc.setFontSize(18);

    doc.text("Relatório de Ordem de Serviços", 14, 45); //x,y (mm)

    const dataAtual = new Date().toLocaleDateString("pt-BR");
    doc.setFontSize(12);
    doc.text(`Data: ${dataAtual}`, 160, 10);

    let y = 60;
    doc.text("Nome do Cliente", 14, y);
    doc.text("Orçamento", 70, y);
    doc.text("Status", 120, y);
    y += 5;

    doc.setLineWidth(0.5); // expessura da linha
    doc.line(10, y, 200, y); // inicio e fim

    y += 10; // espaçãmento da linha

    clientes.forEach((c) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
        doc.text("Nome do Cliente", 14, y);
        doc.text("Orçamento", 70, y);
        doc.text("Status", 120, y);
        y += 5;
        doc.setLineWidth(0.5);
        doc.line(10, y, 200, y);
        y += 10;
      }

      doc.text(c.idCliente || "N/A", 14, y);
      doc.text(c.orcamento || "N/A", 70, y);
      doc.text(c.status || "N/A", 120, y);
      y += 10;
    });

    const paginas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= paginas; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Página ${i} de ${paginas}`, 105, 290, { align: "center" });
    }

    const tempDir = app.getPath("temp");
    const filePath = path.join(tempDir, "ordemservico.pdf");

    doc.save(filePath);

    shell.openPath(filePath);
  } catch (error) {
    console.log(error);
  }
}
//===== fim relatorio da OS concluida =========================================

//=============================================================================
//===== CRUD Read =============================================================
// Validação de busca (preenchimento obrigatório)
ipcMain.on("validate-search", () => {
  dialog.showMessageBox({
    type: "warning",
    title: "Atenção!",
    message: "Preencha o campo de busca",
    buttons: ["OK"],
  });
});

ipcMain.on("search-name", async (event, name) => {
  try {
    const dataClient = await clientModel.find({
      $or: [
        { nomeCliente: new RegExp(name, "i") },
        { cpfCliente: new RegExp(name, "i") },
      ],
    });
    console.log(dataClient); // teste passo 3 e 4 (Importante!)

    // se o vetor estiver vazio [] (cliente não cadastrado)
    if (dataClient.length === 0) {
      dialog.showMessageBox({
          type: "warning",
          title: "Aviso",
          message: "Cliente não cadastrado.\nDeseja cadastrar este cliente?",
          defaultId: 0, //botão 0
          buttons: ["Sim", "Não"], // [0, 1]
        })
        .then((result) => {
          if (result.response === 0) {
            // enviar ao renderizador um pedido para setar os campos (recortar do campo de busca e colar no campo nome)
            event.reply("set-client");
          } else {
            // limpar o formulário
            event.reply("reset-form");
          }
        });
    }
    // enviando os dados do cliente ao rendererCliente
    event.reply("renderClient", JSON.stringify(dataClient));
  } catch (error) {
    console.log(error);
  }
});

ipcMain.on('search-idClient', async (event, idClient) => {
    console.log(idClient) // teste do passo 2 (importante!)
    // Passos 3 e 4 busca dos dados do cliente no banco

    try {
        const dataClient = await clientModel.find({
            _id: idClient
        })
        console.log(dataClient) // teste passos 3 e 4 (importante!)

        event.reply('render-IdClient', JSON.stringify(dataClient))

    } catch (error) {
        console.log(error)
    }

})
//===== Fim - CRUD Read =======================================================

//=============================================================================
//===== Crud Delete ===========================================================
ipcMain.on("delete-client", async (event, id) => {
  console.log(id); // teste do passo 2 (recebimento do id)
  try {
    // importante - confirmar a exclusao
    const { response } = await dialog.showMessageBox(client, {
      type: "warning",
      title: "Atenção!",
      message: "Deseja excluir este cliente\nEsta ação não poderá ser desfeita.",
      buttons: ["Cancelar", "Excluir"], //0 ou 1
    });
    if (response === 1) {
      console.log("Cliente excluido com sucesso!");
      // passo 3 - Excluir o registro de cliente
      const delClient = await clientModel.findByIdAndDelete(id);
      event.reply("reset-form");
    }
  } catch (error) {
    console.log(error);
  }
});
//===== Fim Crud Delete =======================================================

//=============================================================================
//===== Crud Updade ===========================================================

ipcMain.on("update-client", async (event, client) => {
  console.log(client); //teste importante (recebimento dos dados do cliente)
  try {
    // criar uma nova de estrutura de dados usando a classe modelo.
    const updateClient = await clientModel.findByIdAndUpdate(
      client.idCli,
      {
        nomeCliente: client.nameCli,
        cpfCliente: client.cpfCli,
        emailCliente: client.emailCli,
        foneCliente: client.phoneCli,
        cepCliente: client.cepCli,
        logradouroCliente: client.addressCli,
        numeroCliente: client.numberCli,
        complementoCliente: client.complementCli,
        bairroCliente: client.neighborhoodCli,
        cidadeCliente: client.cityCli,
        ufCliente: client.ufCli,
      },
      {
        new: true,
      }
    );
    // mesagem de confirmação
    dialog.showMessageBox({
        type: "info",
        title: "Aviso!",
        message: "Dados do cliente alterados com sucesso",
        buttons: ["OK"],
      })
      .then((result) => {
        if (result.response === 0) {
          event.reply("reset-form");
        }
      });
  } catch (error) {
    console.log(error);
  }
});
//===== Fim Crud Update =======================================================

//************************************************************/
//*******************  Ordem de Serviço  *********************/
//************************************************************/

//===== Buscar cliente para vincular na OS (estilo Google) ====================

ipcMain.on("search-clients", async (event) => {
  try {
    //buscar no banco os clientes pelo nome em ordem alfabética
    const clients = await clientModel.find().sort({ nomeCliente: 1 });
    //console.log(clients) // teste do passo 2
    // passo 3: Envio dos clientes para o renderizador
    // OBS: não esquecer de converter para string
    event.reply("list-clients", JSON.stringify(clients));
  } catch (error) {
    console.log(error);
  }
});
//===== Fim Busca cliente (estilo Google) =====================================

//=============================================================================
//===== CRUD Create - Gerar OS ================================================

// Validação de busca (preenchimento obrigatório Id Cliente-OS)
ipcMain.on("validate-client", (event) => {
  dialog.showMessageBox({
      type: "warning",
      title: "Aviso!",
      message: "É obrigatório vincular o cliente na Ordem de Serviço",
      buttons: ["OK"],
    })
    .then((result) => {
      //ação ao pressionar o botão (result = 0)
      if (result.response === 0) {
        event.reply("set-search");
      }
    });
});

ipcMain.on("new-os", async (event, os) => {
  //importante! teste de recebimento dos dados da os (passo 2)
  console.log(os);
  //console.log("teste");
  // Cadastrar a estrutura de dados no banco de dados MongoDB
  try {
    // criar uma nova de estrutura de dados usando a classe modelo. Atenção! Os atributos precisam ser idênticos ao modelo de dados OS.js e os valores são definidos pelo conteúdo do objeto os
    const newOS = new osModel({
      idCliente: os.idClient_OS,
      NomeOS: os.NameN,  //EDER
      statusOS: os.stat_OS,
      motocicleta: os.motor_OS, //EDER
      serie: os.serial_OS,
      problema: os.problem_OS,
      observacao: os.obs_OS,
      tecnico: os.specialist_OS,
      diagnostico: os.diagnosis_OS,
      pecas: os.parts_OS,
      valor: os.total_OS
    });
    // salvar os dados da OS no banco de dados
    await newOS.save();

    // Obter o ID gerado automaticamente pelo MongoDB
    const osId = newOS._id
    console.log("ID da nova OS:", osId)

    // Mensagem de confirmação
    dialog.showMessageBox({
        //customização
        type: "info",
        title: "Aviso",
        message: "OS gerada com sucesso",
        buttons: ["OK"],
      })
      .then((result) => {
        //ação ao pressionar o botão (result = 0)
        if (result.response === 0) {
          // executar a função printOS passando o id da OS como parâmetro
          printOS(osId)
          //enviar um pedido para o renderizador limpar os campos e resetar as configurações pré definidas (rótulo 'reset-form' do preload.js
          event.reply("reset-form");
        } else {
            //enviar um pedido para o renderizador limpar os campos e resetar as configurações pré definidas (rótulo 'reset-form' do preload.js
            event.reply('reset-form')
        }

      });
  } catch (error) {
    console.log(error);
  }
});
//===== Fim CRUD Create - Gerar OS ============================================

//=============================================================================
//===== Buscar OS - CRUD Read =================================================

ipcMain.on("search-os", async (event) => {
  //console.log("teste: busca OS")
  prompt({
    title: "Buscar OS",
    label: "Digite o número da OS:",
    inputAttrs: {
      type: "text",
    },
    type: "input",
    width: 400,
    height: 200,
  }).then(async (result) => {
    // buscar OS pelo id (verificar formato usando o mongoose - importar no início do main)
    if (result !== null) {
      // Verificar se o ID é válido (uso do mongoose - não esquecer de importar)
      if (mongoose.Types.ObjectId.isValid(result)) {
        try {
          const dataOS = await osModel.findById(result);
          if (dataOS && dataOS !== null) {
            console.log(dataOS); // teste importante
            // enviando os dados da OS ao rendererOS
            // OBS: IPC só trabalha com string, então é necessário converter o JSON para string JSON.stringify(dataOS)
            event.reply("render-os", JSON.stringify(dataOS));
          } else {
            dialog.showMessageBox({
              type: "warning",
              title: "Aviso!",
              message: "OS não encontrada",
              buttons: ["OK"],
            });
          }
        } catch (error) {
          console.log(error);
        }
      } else {
        dialog.showMessageBox({
          type: "error",
          title: "Atenção!",
          message: "Código da OS inválido.\nVerifique e tente novamente.",
          buttons: ["OK"],
        });
      }
    }
  });
});

//===== Fim - Buscar OS - CRUD Read ===========================================

// ============================================================
// == Excluir OS - CRUD Delete  ===============================

ipcMain.on('delete-os', async (event, idOS) => {
    console.log(idOS) // teste do passo 2 (recebimento do id)
    try {
        //importante - confirmar a exclusão
        //osScreen é o nome da variável que representa a janela OS
        const { response } = await dialog.showMessageBox(osScreen, {
            type: 'warning',
            title: "Atenção!",
            message: "Deseja excluir esta ordem de serviço?\nEsta ação não poderá ser desfeita.",
            buttons: ['Cancelar', 'Excluir'] //[0, 1]
        })
        if (response === 1) {
            //console.log("teste do if de excluir")
            //Passo 3 - Excluir a OS
            const delOS = await osModel.findByIdAndDelete(idOS)
            event.reply('reset-form')
        }
    } catch (error) {
        console.log(error)
    }
})

// == Fim Excluir OS - CRUD Delete ============================================

// ============================================================================
// == Editar OS - CRUD Update =================================================

ipcMain.on('update-os', async (event, os) => {
    //importante! teste de recebimento dos dados da os (passo 2)
    console.log(os)
    // Alterar os dados da OS no banco de dados MongoDB
    try {
        // criar uma nova de estrutura de dados usando a classe modelo. Atenção! Os atributos precisam ser idênticos ao modelo de dados OS.js e os valores são definidos pelo conteúdo do objeto os
        const updateOS = await osModel.findByIdAndUpdate(
            os.id_OS,
            {
                idCliente: os.idClient_OS,
                statusOS: os.stat_OS,
                motocicleta: os.motor_OS,  //EDER
                serie: os.serial_OS,
                problema: os.problem_OS,
                observacao: os.obs_OS,
                tecnico: os.specialist_OS,
                diagnostico: os.diagnosis_OS,
                pecas: os.parts_OS,
                valor: os.total_OS
            },
            {
                new: true
            }
        )
        // Mensagem de confirmação
        dialog.showMessageBox({
            //customização
            type: 'info',
            title: "Aviso",
            message: "Dados da OS alterados com sucesso",
            buttons: ['OK']
        }).then((result) => {
            //ação ao pressionar o botão (result = 0)
            if (result.response === 0) {
                //enviar um pedido para o renderizador limpar os campos e resetar as configurações pré definidas (rótulo 'reset-form' do preload.js
                event.reply('reset-form')
            }
        })
    } catch (error) {
        console.log(error)
    }
})

// == Fim Editar OS - CRUD Update =============================


// ============================================================================
// Impressão de OS ============================================================

ipcMain.on('print-os', async (event) => {
  prompt({
      title: 'Imprimir OS',
      label: 'Digite o número da OS:',
      inputAttrs: {
          type: 'text'
      },
      type: 'input',
      width: 400,
      height: 200
  }).then(async (result) => {
      // buscar OS pelo id (verificar formato usando o mongoose - importar no início do main)
      if (result !== null) {
          // Verificar se o ID é válido (uso do mongoose - não esquecer de importar)
          if (mongoose.Types.ObjectId.isValid(result)) {
              try {
                  // teste do botão imprimir
                  //console.log("imprimir OS")
                  const dataOS = await osModel.findById(result)
                  if (dataOS && dataOS !== null) {
                      console.log(dataOS) // teste importante
                      // extrair os dados do cliente de acordo com o idCliente vinculado a OS
                      const dataClient = await clientModel.find({
                          _id: dataOS.idCliente
                      })
                      console.log(dataClient)
                      // impressão (documento PDF) com os dados da OS, do cliente e termos do serviço (uso do jspdf)

                      // formatação do documento pdf
                      const doc = new jsPDF('p', 'mm', 'a4')
                      const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo4.png')
                      const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
                      doc.addImage(imageBase64, 'PNG', 5, 8)
                      doc.setFontSize(18)
                      doc.text("OS:", 14, 45) //x=14, y=45
                      
                      // Extração dos dados da OS e do cliente vinculado

                      // Texto do termo de serviço
                      doc.setFontSize(10)
                      const termo = `
Termo de Serviço e Garantia

O cliente autoriza a realização dos serviços técnicos descritos nesta ordem, ciente de que:

- Diagnóstico e orçamento são gratuitos apenas se o serviço for aprovado. Caso contrário, poderá ser cobrada taxa de análise.
- Peças substituídas poderão ser retidas para descarte ou devolvidas mediante solicitação no ato do serviço.
- A garantia dos serviços prestados é de 90 dias, conforme Art. 26 do Código de Defesa do Consumidor, e cobre exclusivamente o reparo executado ou peça trocada, desde que o equipamento não tenha sido violado por terceiros.
- Não nos responsabilizamos por dados armazenados. Recomenda-se o backup prévio.
- Equipamentos não retirados em até 90 dias após a conclusão estarão sujeitos a cobrança de armazenagem ou descarte, conforme Art. 1.275 do Código Civil.
- O cliente declara estar ciente e de acordo com os termos acima.`

                      // Inserir o termo no PDF
                      doc.text(termo, 14, 60, { maxWidth: 180 }) // x=14, y=60, largura máxima para quebrar o texto automaticamente

                      // Definir o caminho do arquivo temporário e nome do arquivo
                      const tempDir = app.getPath('temp')
                      const filePath = path.join(tempDir, 'os.pdf')
                      // salvar temporariamente o arquivo
                      doc.save(filePath)
                      // abrir o arquivo no aplicativo padrão de leitura de pdf do computador do usuário
                      shell.openPath(filePath)
                  } else {
                      dialog.showMessageBox({
                          type: 'warning',
                          title: "Aviso!",
                          message: "OS não encontrada",
                          buttons: ['OK']
                      })
                  }


              } catch (error) {
                  console.log(error)
              }
          } else {
              dialog.showMessageBox({
                  type: 'error',
                  title: "Atenção!",
                  message: "Código da OS inválido.\nVerifique e tente novamente.",
                  buttons: ['OK']
              })
          }
      }
  })
})

async function printOS(osId) {
    try {
        const dataOS = await osModel.findById(osId)

        const dataClient = await clientModel.find({
            _id: dataOS.idCliente
        })
        console.log(dataClient)
        // impressão (documento PDF) com os dados da OS, do cliente e termos do serviço (uso do jspdf)

        // formatação do documento pdf
        const doc = new jsPDF('p', 'mm', 'a4')
        const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo4.png')
        const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
        doc.addImage(imageBase64, 'PNG', 5, 8)
        doc.setFontSize(18)
        doc.text("OS:", 14, 45) //x=14, y=45
        doc.setFontSize(12)

        // Extração dos dados do cliente vinculado a OS
        dataClient.forEach((c) => {
            doc.text("Cliente:", 14, 65),
                doc.text(c.nomeCliente, 34, 65),
                doc.text(c.foneCliente, 85, 65),
                doc.text(c.emailCliente || "N/A", 130, 65)
            //...
        })

        // Extração dos dados da OS                        
        doc.text(String(dataOS.computador), 14, 85)
        doc.text(String(dataOS.problema), 80, 85)

        // Texto do termo de serviço
        doc.setFontSize(10)
        const termo = `
Termo de Serviço e Garantia

O cliente autoriza a realização dos serviços técnicos descritos nesta ordem, ciente de que:

- Diagnóstico e orçamento são gratuitos apenas se o serviço for aprovado. Caso contrário, poderá ser cobrada taxa de análise.
- Peças substituídas poderão ser retidas para descarte ou devolvidas mediante solicitação no ato do serviço.
- A garantia dos serviços prestados é de 90 dias, conforme Art. 26 do Código de Defesa do Consumidor, e cobre exclusivamente o reparo executado ou peça trocada, desde que o equipamento não tenha sido violado por terceiros.
- Não nos responsabilizamos por dados armazenados. Recomenda-se o backup prévio.
- Equipamentos não retirados em até 90 dias após a conclusão estarão sujeitos a cobrança de armazenagem ou descarte, conforme Art. 1.275 do Código Civil.
- O cliente declara estar ciente e de acordo com os termos acima.`

        // Inserir o termo no PDF
        doc.text(termo, 14, 150, { maxWidth: 180 }) // x=14, y=60, largura máxima para quebrar o texto automaticamente

        // Definir o caminho do arquivo temporário e nome do arquivo
        const tempDir = app.getPath('temp')
        const filePath = path.join(tempDir, 'os.pdf')
        // salvar temporariamente o arquivo
        doc.save(filePath)
        // abrir o arquivo no aplicativo padrão de leitura de pdf do computador do usuário
        shell.openPath(filePath)

    } catch (error) {
        console.log(error)
    }
}

// == Fim - Imprimir ==========================================================
// ============================================================================
