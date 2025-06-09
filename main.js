console.log("Processo principal");

const {
  app,
  BrowserWindow,
  nativeTheme,
  Menu,
  ipcMain,
  dialog,
  shell,
} = require("electron");
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
      autoHideMenuBar: true,
      resizable: false,
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
        label: "OS Pendentes",
        click: () => relatorioOSPendentes(),
      },
      {
        label: "OS Finalizadas",
        click: () => relatorioOSFinalizadas(),
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
        label: "Repositório",
        click: () =>
          shell.openExternal("https://github.com/somadekadane/electron"),
      },
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
    dialog
      .showMessageBox({
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
      dialog
        .showMessageBox({
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
    dialog
      .showMessageBox({
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
    doc.save(filePath);
    shell.openPath(filePath);
  } catch (error) {
    console.log(error);
  }
}
async function relatorioOSPendentes() {
  try {
    const clientes = await osModel
      .find({ stats: "Aberta" })
      .sort({ Aberta: 1 });
    const doc = new JsPDF("p", "mm", "a4");
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
async function relatorioOSFinalizadas() {
  try {
    const clientes = await osModel
      .find({ stats: "Finalizada" })
      .sort({ Finalizada: 1 });
    const doc = new JsPDF("p", "mm", "a4");
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
      dialog
        .showMessageBox({
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
ipcMain.on("search-idClient", async (event, idClient) => {
  console.log(idClient);
  try {
    const dataClient = await clientModel.find({
      _id: idClient,
    });
    console.log(dataClient);
    event.reply("render-IdClient", JSON.stringify(dataClient));
  } catch (error) {
    console.log(error);
  }
});
ipcMain.on("search-cpf", async (event, name) => {
  try {
    const dataClient = await clientModel.find({
      cpfCliente: name,
    });
    console.log(dataClient);
    if (dataClient.length === 0) {
      dialog
        .showMessageBox({
          type: "warning",
          title: "Aviso",
          message: "Cliente não cadastrado.\nDeseja cadastrar este cliente?",
          defaultId: 0,
          buttons: ["Sim", "Não"],
        })
        .then((result) => {
          if (result.response === 0) {
            event.reply("set-cpf");
          } else {
            event.reply("reset-form");
          }
        });
    }
    event.reply("render-client", JSON.stringify(dataClient));
  } catch (error) {
    console.log(error);
  }
});
ipcMain.on("delete-client", async (event, id) => {
  console.log(id);
  try {
    const { response } = await dialog.showMessageBox(client, {
      type: "warning",
      title: "Atenção!",
      message:
        "Deseja excluir este cliente\nEsta ação não poderá ser desfeita.",
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
    dialog
      .showMessageBox({
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
  dialog
    .showMessageBox({
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
      valor: os.total_OS,
    });
    await newOS.save();
    const osId = newOS._id;
    console.log("ID da nova OS:", osId);
    dialog
      .showMessageBox({
        type: "info",
        title: "Aviso",
        message: "OS gerada com sucesso",
        buttons: ["OK"],
      })
      .then((result) => {
        if (result.response === 0) {
          printOS(osId);
          event.reply("reset-form");
        } else {
          event.reply("reset-form");
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

ipcMain.on("delete-os", async (event, idOS) => {
  console.log(idOS);
  try {
    const { response } = await dialog.showMessageBox(osScreen, {
      type: "warning",
      title: "Atenção!",
      message:
        "Deseja excluir esta ordem de serviço?\nEsta ação não poderá ser desfeita.",
      buttons: ["Cancelar", "Excluir"],
    });
    if (response === 1) {
      const delOS = await osModel.findByIdAndDelete(idOS);
      event.reply("reset-form");
    }
  } catch (error) {
    console.log(error);
  }
});

ipcMain.on("update-os", async (event, os) => {
  console.log(os);
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
        valor: os.total_OS,
      },
      {
        new: true,
      }
    );
    dialog
      .showMessageBox({
        type: "info",
        title: "Aviso",
        message: "Dados da OS alterados com sucesso",
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

ipcMain.on("print-os", async (event) => {
  prompt({
    title: "Imprimir OS",
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
            dialog.showMessageBox({
              type: "warning",
              title: "Aviso!",
              message: "OS não encontrada",
              buttons: ["OK"],
            });
            return;
          }
          const dataClient = await clientModel.findById(dataOS.idCliente);
          const doc = new JsPDF("p", "mm", "a4");
          const pageWidth = doc.internal.pageSize.getWidth();
          const logoPath = path.join(
            __dirname,
            "src",
            "public",
            "img",
            "logo.png"
          );
          const logoBase64 = fs.readFileSync(logoPath, { encoding: "base64" });
          doc.addImage(logoBase64, "PNG", 5, 7);
          doc.setFontSize(12);
          doc.setTextColor("#003366");
          const numeroOsStr = `OS: ${dataOS._id.toString().toUpperCase()}`;
          const dataAberturaStr = `Data de Abertura: ${new Date(dataOS.dataEntrada).toLocaleDateString("pt-BR")}`;
          const rightSideX = pageWidth - 10;
          doc.text(numeroOsStr, rightSideX, 15, { align: "right" });
          doc.text(dataAberturaStr, rightSideX, 23, { align: "right" });
          doc.setDrawColor("#CCCCCC");
          doc.setLineWidth(0.5);
          doc.line(10, 37, pageWidth - 10, 37);
          doc.setFontSize(16);
          doc.setTextColor("#003366");
          doc.text("Dados do Cliente", 10, 50);
          doc.setFontSize(12);
          doc.setFont("helvetica", "normal");
          doc.setTextColor("#000000");
          let y = 60;
          const lineHeight = 7;
          doc.text(`Nome: ${dataClient.nomeCliente}`, 10, y);
          doc.text(`CPF: ${dataClient.cpfCliente}`, 110, y);
          y += lineHeight;
          doc.text(`Telefone: ${dataClient.foneCliente}`, 10, y);
          doc.text(`Email: ${dataClient.emailCliente || "N/A"}`, 110, y);
          y += lineHeight;
          const endereco =
            `${dataClient.logradouroCliente}, ${dataClient.numeroCliente}` +
            (dataClient.complementoCliente
              ? `, ${dataClient.complementoCliente}`
              : "");
          doc.text(`Endereço: ${endereco}`, 10, y);
          y += lineHeight;
          const bairroCidade = `${dataClient.bairroCliente} - ${dataClient.cidadeCliente} / ${dataClient.ufCliente} - CEP: ${dataClient.cepCliente}`;
          doc.text(bairroCidade, 10, y);
          y += lineHeight + 4;
          doc.setDrawColor("#CCCCCC");
          doc.setLineWidth(0.5);
          doc.line(10, y, pageWidth - 10, y);
          y += 13;
          doc.setFontSize(16);
          doc.setTextColor("#003366");
          doc.text("Detalhes da Ordem de Serviço", 10, y);
          y += lineHeight * 1.8;
          doc.setFontSize(12);
          doc.setTextColor("#000000");
          doc.text(`Equipamento: ${dataOS.motocicleta}`, 10, y);
          y += lineHeight;
          doc.text(`Problema Relatado: ${dataOS.problema || "N/A"}`, 10, y);
          y += lineHeight;
          doc.setFontSize(12);
          doc.text(`Observações:`, 10, y);
          y += lineHeight;
          doc.setFontSize(11);
          doc.text(
            doc.splitTextToSize(dataOS.observacao || "Nenhuma", pageWidth - 20),
            10,
            y
          );
          y += lineHeight * 4;
          doc.setDrawColor("#CCCCCC");
          doc.setLineWidth(0.5);
          doc.line(10, y, pageWidth - 10, y);
          y += 8;
          doc.setFontSize(10);
          doc.setTextColor("#444444");
          const termo = `
Termo de Serviço e Garantia

A MotoSky realiza serviços de manutenção e reparo em motocicletas com peças de qualidade e mão de obra especializada.

- Oferecemos 90 dias de garantia para serviços realizados, conforme o Código de Defesa do Consumidor.
- A garantia cobre defeitos de execução, não se aplicando a mau uso ou desgaste natural de peças.
- Peças fornecidas pelo cliente não possuem garantia da oficina.
- Serviços não autorizados previamente não serão executados.
- É responsabilidade do cliente retornar para revisão dentro do prazo estipulado.
- A aprovação deste termo implica na concordância com as condições descritas acima.`;

          doc.text(doc.splitTextToSize(termo, pageWidth - 20), 10, y);
          y += 60;
          doc.setFontSize(12);
          doc.setTextColor("#000000");
          doc.text("Assinatura do Cliente:", 10, y + 24);
          doc.line(58, y + 25, 125, y + 25);
          const tempDir = app.getPath("temp");
          const filePath = path.join(tempDir, "os.pdf");
          doc.save(filePath);
          await shell.openPath(filePath);
        } catch (error) {
          console.error(error);
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
async function printOS(osId) {
  try {
    const dataOS = await osModel.findById(osId);
    if (!dataOS) {
      dialog.showMessageBox({
        type: "warning",
        title: "Aviso!",
        message: "OS não encontrada",
        buttons: ["OK"],
      });
      return;
    }
    const dataClient = await clientModel.findById(dataOS.idCliente);
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const logoPath = path.join(__dirname, "src", "public", "img", "logo4.png");
    const logoBase64 = fs.readFileSync(logoPath, { encoding: "base64" });
    doc.addImage(logoBase64, "PNG", 5, 7);
    doc.setFontSize(12);
    doc.setTextColor("#003366");
    const numeroOsStr = `OS: ${dataOS._id.toString().toUpperCase()}`;
    const dataAberturaStr = `Data de Abertura: ${new Date(dataOS.dataEntrada).toLocaleDateString("pt-BR")}`;
    const rightSideX = pageWidth - 10;
    doc.text(numeroOsStr, rightSideX, 15, { align: "right" });
    doc.text(dataAberturaStr, rightSideX, 23, { align: "right" });
    doc.setDrawColor("#CCCCCC");
    doc.setLineWidth(0.5);
    doc.line(10, 37, pageWidth - 10, 37);
    doc.setFontSize(16);
    doc.setTextColor("#003366");
    doc.text("Dados do Cliente", 10, 50);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#000000");
    let y = 60;
    const lineHeight = 7;
    doc.text(`Nome: ${dataClient.nomeCliente}`, 10, y);
    doc.text(`CPF: ${dataClient.cpfCliente}`, 110, y);
    y += lineHeight;
    doc.text(`Telefone: ${dataClient.foneCliente}`, 10, y);
    doc.text(`Email: ${dataClient.emailCliente || "N/A"}`, 110, y);
    y += lineHeight;
    const endereco =
      `${dataClient.logradouroCliente}, ${dataClient.numeroCliente}` +
      (dataClient.complementoCliente
        ? `, ${dataClient.complementoCliente}`
        : "");
    doc.text(`Endereço: ${endereco}`, 10, y);
    y += lineHeight;
    const bairroCidade = `${dataClient.bairroCliente} - ${dataClient.cidadeCliente} / ${dataClient.ufCliente} - CEP: ${dataClient.cepCliente}`;
    doc.text(bairroCidade, 10, y);
    y += lineHeight + 4;
    doc.setDrawColor("#CCCCCC");
    doc.setLineWidth(0.5);
    doc.line(10, y, pageWidth - 10, y);
    y += 13;
    doc.setFontSize(16);
    doc.setTextColor("#003366");
    doc.text("Detalhes da Ordem de Serviço", 10, y);
    y += lineHeight * 1.8;
    doc.setFontSize(12);
    doc.setTextColor("#000000");
    doc.text(`Equipamento: ${dataOS.motocicleta}`, 10, y);
    y += lineHeight;
    doc.text(`Problema Relatado: ${dataOS.problema || "N/A"}`, 10, y);
    y += lineHeight;
    doc.setFontSize(12);
    doc.text(`Observações:`, 10, y);
    y += lineHeight;
    doc.setFontSize(11);
    doc.text(
      doc.splitTextToSize(dataOS.observacao || "Nenhuma", pageWidth - 20),
      10,
      y
    );
    y += lineHeight * 4;
    doc.setDrawColor("#CCCCCC");
    doc.setLineWidth(0.5);
    doc.line(10, y, pageWidth - 10, y);
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor("#444444");
    const termo = `
Termo de Serviço e Garantia

A MotoSky realiza serviços de manutenção e reparo em motocicletas com peças de qualidade e mão de obra especializada.

- Oferecemos 90 dias de garantia para serviços realizados, conforme o Código de Defesa do Consumidor.
- A garantia cobre defeitos de execução, não se aplicando a mau uso ou desgaste natural de peças.
- Peças fornecidas pelo cliente não possuem garantia da oficina.
- Serviços não autorizados previamente não serão executados.
- É responsabilidade do cliente retornar para revisão dentro do prazo estipulado.
- A aprovação deste termo implica na concordância com as condições descritas acima.
`;

    doc.text(doc.splitTextToSize(termo, pageWidth - 20), 10, y);
    y += 60;
    doc.setFontSize(12);
    doc.setTextColor("#000000");
    doc.text("Assinatura do Cliente:", 10, y + 24);
    doc.line(58, y + 25, 125, y + 25);
    const tempDir = app.getPath("temp");
    const filePath = path.join(tempDir, "os.pdf");
    doc.save(filePath);
    await shell.openPath(filePath);
  } catch (error) {
    console.error(error);
  }
}
async function relatorioOSPendentes() {
  try {
    const osPendentes = await osModel
      .find({ statusOS: { $ne: "Finalizada" } })
      .sort({ dataEntrada: 1 });
    const doc = new JsPDF("l", "mm", "a4");
    const imagePath = path.join(__dirname, "src", "public", "img", "logo4.png");
    const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });
    doc.addImage(imageBase64, "PNG", 5, 8);
    doc.setFontSize(16);
    doc.text("Ordens de serviço pendentes", 14, 45);
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    doc.setFontSize(12);
    doc.text(`Data: ${dataAtual}`, 250, 15);
    const headers = [
      [
        "Número da OS",
        "Entrada",
        "Cliente",
        "Telefone",
        "Status",
        "Equipamento",
        "Defeito",
      ],
    ];
    const data = [];
    for (const os of osPendentes) {
      let nome, telefone;
      try {
        const cliente = await clientModel.findById(os.idCliente);
        nome = cliente.nomeCliente;
        telefone = cliente.foneCliente;
      } catch (error) {
        console.log(error);
      }
      data.push([
        os._id,
        new Date(os.dataEntrada).toLocaleDateString("pt-BR"),
        nome,
        telefone,
        os.statusOS,
        os.motocicleta,
        os.problema,
      ]);
    }
    //doc.autoTable({
    //  head: headers,
    //  body: data,
   //   startY: 55,
   //   styles: { fontSize: 10 },
    //  headStyles: { fillColor: [0, 120, 215] },
    //});/
    const tempDir = app.getPath("temp");
    const filePath = path.join(tempDir, "os-pendentes.pdf");
    doc.save(filePath);
    shell.openPath(filePath);
  } catch (error) {
    console.log(error);
  }
}
async function relatorioOSFinalizadas() {
  try {
    const osFinalizadas = await osModel
      .find({ statusOS: "Finalizada" })
      .sort({ dataEntrada: 1 });
    const doc = new JsPDF("l", "mm", "a4");
    const imagePath = path.join(__dirname, "src", "public", "img", "logo4.png");
    const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });
    doc.addImage(imageBase64, "PNG", 5, 8);
    doc.setFontSize(16);
    doc.text("Ordens de serviço finalizadas", 14, 45);
    const dataAtual = new Date().toLocaleDateString("pt-BR");
    doc.setFontSize(12);
    doc.text(`Data: ${dataAtual}`, 250, 15);
    const headers = [
      [
        "Número da OS",
        "Entrada",
        "Cliente",
        "Equipamento",
        "Técnico",
        "Diagnóstico",
        "Peças",
        "Valor (R$)",
      ],
    ];
    const data = [];
    let totalGeral = 0;
    for (const os of osFinalizadas) {
      let nomeCliente;
      try {
        const cliente = await clientModel.findById(os.idCliente);
        nomeCliente = cliente.nomeCliente;
      } catch (error) {
        console.log("Erro ao buscar cliente:", error);
      }
      const valorOS = parseFloat(os.valor) || 0;
      totalGeral += valorOS;
      data.push([
        os._id.toString(),
        new Date(os.dataEntrada).toLocaleDateString("pt-BR"),
        nomeCliente,
        os.motocicleta,
        os.tecnico,
        os.diagnostico,
        os.pecas || "N/A",
        valorOS.toFixed(2),
      ]);
    }
    doc.setFontSize(12);
    doc.setTextColor(0, 100, 0);
    doc.text(`Total geral: R$ ${totalGeral.toFixed(2)}`, 235, 50);
    doc.setTextColor(0, 0, 0);
    //doc.autoTable({
    //  head: headers,
    //  body: data,
    //  startY: 55,
    //  styles: { fontSize: 10 },
    //  headStyles: { fillColor: [0, 120, 215] },
    //});
    const tempDir = app.getPath("temp");
    const filePath = path.join(tempDir, "os-finalizadas.pdf");
    doc.save(filePath);
    shell.openPath(filePath);
  } catch (error) {
    console.log(error);
  } 
} 
