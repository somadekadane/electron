console.log("Processo principal");

const { app, BrowserWindow, nativeTheme, Menu, ipcMain, dialog, shell } = require("electron");
const path = require("node:path");
const { conectar, desconectar } = require("./database.js");
const mongoose = require("mongoose");
const clientModel = require("./src/models/Clientes.js");
const motoModel = require("./src/models/Moto.js");
const osModel = require("./src/models/Os.js");
const { jspdf, default: JsPDF } = require("jspdf");
const fs = require("fs");
const prompt = require("electron-prompt");
const Os = require("./src/models/Os.js");

let win;
const createWindow = () => {

  nativeTheme.themeSource = "dark";
  win = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  win.loadFile("./src/views/index.html");
};

function aboutWindow() {
  nativeTheme.themeSource = "light";
  const main = BrowserWindow.getFocusedWindow();
  let about;
  if (main) {
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
  about.loadFile("./src/views/sobre.html");
}

let client;
function clientWindow() {
  nativeTheme.themeSource = "light";
  const main = BrowserWindow.getFocusedWindow();
  if (main) {
    client = new BrowserWindow({
      width: 1010,
      height: 720,
      parent: main,
      modal: true,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
    });
  }
  client.loadFile("./src/views/cliente.html");
  client.center();
}

let osScreen;
function osWindow() {
  nativeTheme.themeSource = "light";
  const main = BrowserWindow.getFocusedWindow();
  if (main) {
    osScreen = new BrowserWindow({
      width: 1010,
      height: 820,
      autoHideMenuBar: true,
      resizable: false,
      parent: main,
      modal: true,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
    });
  }
  osScreen.loadFile("./src/views/os.html");
  osScreen.center();
}

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
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
    });
  }
  moto.loadFile("./src/views/moto.html");
  moto.center();
}

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

app.commandLine.appendSwitch("log-level", "3");

ipcMain.on("db-connect", async (event) => {
  let conectado = await conectar();
  if (conectado) {

    setTimeout(() => {
      event.reply("db-status", "conectado");
    }, 500);
  }
});

app.on("before-quit", () => {
  desconectar();
});

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

ipcMain.on("client-window", () => {
  clientWindow();
});

ipcMain.on("os-window", () => {
  osWindow();
});

ipcMain.on("moto-window", () => {
  motoWindow();
});

ipcMain.on("new-client", async (event, client) => {

  console.log(client);

  try {

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

    await newClient.save();

    dialog.showMessageBox({
      type: "info",
      title: "Aviso",
      message: "Cliente adicionado com sucesso",
      buttons: ["OK"],
    })
      .then((result) => {
        if (result.response === 0) {
          event.reply("reset-form");
        }
      });
  } catch (error) {
    if (error.code === 11000) {
      dialog.showMessageBox({
        type: "error",
        title: "Atenção!",
        message: "CPF já está cadastrado\nVerifique se digitou corretamente",
        buttons: ["OK"],
      })
        .then((result) => {
          if (result.response === 0) {

          }
        });
    }
    console.log(error);
  }
});

ipcMain.on("new-moto", async (event, mot) => {

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

    await newMoto.save();
    dialog.showMessageBox({
      type: "info",
      title: "Aviso",
      message: "Cliente adicionado com sucesso",
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

async function relatorioClientes() {
  try {
    const clientes = await clientModel.find().sort({ nomeCliente: 1 });
    const doc = new JsPDF("p", "mm", "a4");
    const imagePath = path.join(__dirname, "src", "public", "img", "logo4.png");
    const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });
    doc.addImage(imageBase64, "PNG", 5, 8);
    doc.setFontSize(18);

    doc.text("Relatório de clientes", 14, 45);
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    doc.setFontSize(12);
    doc.text(`Data: ${dataAtual}`, 165, 10);

    let y = 60;
    doc.text("Nome", 14, y);
    doc.text("Telefone", 80, y);
    doc.text("E-mail", 130, y);
    y += 5;

    doc.setLineWidth(0.5);
    doc.line(10, y, 200, y);
    y += 10;

    clientes.forEach((c) => {

      if (y > 280) {
        doc.addPage();
        y = 20;

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
      y += 10;
    });

    const paginas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= paginas; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Página ${i} de ${paginas}`, 105, 290, { align: "center" });
    }

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
async function relatorioOsAbertas() {
  try {
    const clientes = await osModel
      .find({ stats: "Aberta" })
      .sort({ Aberta: 1 });

    const doc = new jsPDF("p", "mm", "a4");
    const imagePath = path.join(__dirname, "src", "public", "img", "logo4.png");
    const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });
    doc.addImage(imageBase64, "PNG", 20, 8);
    doc.setFontSize(18);
    doc.text("Relatório de Ordem de Serviços", 14, 45);

    const dataAtual = new Date().toLocaleDateString("pt-BR");
    doc.setFontSize(12);
    doc.text(`Data: ${dataAtual}`, 160, 10);

    let y = 60;
    doc.text("Nome do Cliente", 14, y);
    doc.text("Orçamento", 70, y);
    doc.text("Status", 120, y);
    y += 5;
    doc.setLineWidth(0.5);
    doc.line(10, y, 200, y);

    y += 10;

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

async function relatorioOsConcluidas() {
  try {
    const clientes = await osModel
      .find({ stats: "Finalizada" })
      .sort({ Finalizada: 1 });

    const doc = new jsPDF("p", "mm", "a4");

    const imagePath = path.join(__dirname, "src", "public", "img", "logo4.png");
    const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });
    doc.addImage(imageBase64, "PNG", 20, 8);
    doc.setFontSize(18);

    doc.text("Relatório de Ordem de Serviços", 14, 45);
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    doc.setFontSize(12);
    doc.text(`Data: ${dataAtual}`, 160, 10);

    let y = 60;
    doc.text("Nome do Cliente", 14, y);
    doc.text("Orçamento", 70, y);
    doc.text("Status", 120, y);
    y += 5;

    doc.setLineWidth(0.5);
    doc.line(10, y, 200, y);
    y += 10;

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
    console.log(dataClient);

    if (dataClient.length === 0) {
      dialog.showMessageBox({
        type: "warning",
        title: "Aviso",
        message: "Cliente não cadastrado.\nDeseja cadastrar este cliente?",
        defaultId: 0,
        buttons: ["Sim", "Não"],
      })
        .then((result) => {
          if (result.response === 0) {
            event.reply("set-client");
          } else {
            event.reply("reset-form");
          }
        });
    }
    event.reply("renderClient", JSON.stringify(dataClient));
  } catch (error) {
    console.log(error);
  }
});

ipcMain.on('search-idClient', async (event, idClient) => {
  console.log(idClient)

  try {
    const dataClient = await clientModel.find({
      _id: idClient
    })
    console.log(dataClient)

    event.reply('render-IdClient', JSON.stringify(dataClient))

  } catch (error) {
    console.log(error)
  }

})

ipcMain.on("delete-client", async (event, id) => {
  console.log(id);
  try {
    const { response } = await dialog.showMessageBox(client, {
      type: "warning",
      title: "Atenção!",
      message: "Deseja excluir este cliente\nEsta ação não poderá ser desfeita.",
      buttons: ["Cancelar", "Excluir"],
    });
    if (response === 1) {
      console.log("Cliente excluido com sucesso!");
      const delClient = await clientModel.findByIdAndDelete(id);
      event.reply("reset-form");
    }
  } catch (error) {
    console.log(error);
  }
});

ipcMain.on("update-client", async (event, client) => {
  console.log(client);
  try {
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

ipcMain.on("search-clients", async (event) => {
  try {
    const clients = await clientModel.find().sort({ nomeCliente: 1 });
    event.reply("list-clients", JSON.stringify(clients));
  } catch (error) {
    console.log(error);
  }
});

ipcMain.on("validate-client", (event) => {
  dialog.showMessageBox({
    type: "warning",
    title: "Aviso!",
    message: "É obrigatório vincular o cliente na Ordem de Serviço",
    buttons: ["OK"],
  })
    .then((result) => {
      if (result.response === 0) {
        event.reply("set-search");
      }
    });
});

ipcMain.on("new-os", async (event, os) => {
  console.log(os);

  try {

    const newOS = new osModel({
      idCliente: os.idClient_OS,
      NomeOS: os.NameN,
      statusOS: os.stat_OS,
      motocicleta: os.motor_OS,
      serie: os.serial_OS,
      problema: os.problem_OS,
      observacao: os.obs_OS,
      tecnico: os.specialist_OS,
      diagnostico: os.diagnosis_OS,
      pecas: os.parts_OS,
      valor: os.total_OS
    });
    await newOS.save();
    const osId = newOS._id
    console.log("ID da nova OS:", osId)

    dialog.showMessageBox({
      type: "info",
      title: "Aviso",
      message: "OS gerada com sucesso",
      buttons: ["OK"],
    })
      .then((result) => {
        if (result.response === 0) {
          printOS(osId)
          event.reply("reset-form");
        } else {
          event.reply('reset-form')
        }

      });
  } catch (error) {
    console.log(error);
  }
});
ipcMain.on("search-os", async (event) => {
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

    if (result !== null) {

      if (mongoose.Types.ObjectId.isValid(result)) {
        try {
          const dataOS = await osModel.findById(result);
          if (dataOS && dataOS !== null) {
            console.log(dataOS);
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

ipcMain.on('delete-os', async (event, idOS) => {
  console.log(idOS)
  try {
    const { response } = await dialog.showMessageBox(osScreen, {
      type: 'warning',
      title: "Atenção!",
      message: "Deseja excluir esta ordem de serviço?\nEsta ação não poderá ser desfeita.",
      buttons: ['Cancelar', 'Excluir']
    })
    if (response === 1) {
      const delOS = await osModel.findByIdAndDelete(idOS)
      event.reply('reset-form')
    }
  } catch (error) {
    console.log(error)
  }
})
ipcMain.on('update-os', async (event, os) => {
  console.log(os)
  try {
    const updateOS = await osModel.findByIdAndUpdate(
      os.id_OS,
      {
        idCliente: os.idClient_OS,
        statusOS: os.stat_OS,
        motocicleta: os.motor_OS,
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
    dialog.showMessageBox({
      type: 'info',
      title: "Aviso",
      message: "Dados da OS alterados com sucesso",
      buttons: ['OK']
    }).then((result) => {
      if (result.response === 0) {
        event.reply('reset-form')
      }
    })
  } catch (error) {
    console.log(error)
  }
})
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
    if (result !== null) {
      if (mongoose.Types.ObjectId.isValid(result)) {
        try {
          const dataOS = await osModel.findById(result)
          if (dataOS && dataOS !== null) {
            console.log(dataOS)
            const dataClient = await clientModel.find({
              _id: dataOS.idCliente
            })
            console.log(dataClient)
            const doc = new jsPDF('p', 'mm', 'a4')
            const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo4.png')
            const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
            doc.addImage(imageBase64, 'PNG', 5, 8)
            doc.setFontSize(18)
            doc.text("OS:", 14, 45)
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

            doc.text(termo, 14, 60, { maxWidth: 180 })
            const tempDir = app.getPath('temp')
            const filePath = path.join(tempDir, 'os.pdf')
            doc.save(filePath)
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
    const doc = new jsPDF('p', 'mm', 'a4')
    const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo4.png')
    const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
    doc.addImage(imageBase64, 'PNG', 5, 8)
    doc.setFontSize(18)
    doc.text("OS:", 14, 45)
    doc.setFontSize(12)
    dataClient.forEach((c) => {
      doc.text("Cliente:", 14, 65),
        doc.text(c.nomeCliente, 34, 65),
        doc.text(c.foneCliente, 85, 65),
        doc.text(c.emailCliente || "N/A", 130, 65)
    })

    doc.text(String(dataOS.computador), 14, 85)
    doc.text(String(dataOS.problema), 80, 85)
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


    doc.text(termo, 14, 150, { maxWidth: 180 })
    const tempDir = app.getPath('temp')
    const filePath = path.join(tempDir, 'os.pdf')
    doc.save(filePath)
    shell.openPath(filePath)
  } catch (error) {
    console.log(error)
  }
}
