console.log("Processo principal")

const { app, BrowserWindow, nativeTheme, Menu, ipcMain, dialog, shell } = require('electron')
// shell abrir o aquivo pdf
// Esta linha está relacionada ao preload.js
const path = require('node:path')

//Importacao do schema clientes da camada model
const { conectar, desconectar } = require("./database.js")

const clientModel = require('./src/models/Clientes.js')

// importação do pacote jspdf (npm i jspdf)
const { jspdf, default: JsPDF } = require('jspdf')

// importação da biblioteca fs (nativa do javascript) para manipulação de arquivo
const fs = require('fs')

// Janela principal
let win
const createWindow = () => {
    // a linha abaixo define o tema (claro ou escuro)
    nativeTheme.themeSource = 'light' //(dark ou light)
    win = new BrowserWindow({
        width: 800,
        height: 600,
        //autoHideMenuBar: true,
        //minimizable: false,
        resizable: false,
        //ativação do preload.js
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // menu personalizado
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))

    win.loadFile('./src/views/index.html')
}

// Janela sobre
function aboutWindow() {
    nativeTheme.themeSource = 'light'
    // a linha abaixo obtém a janela principal
    const main = BrowserWindow.getFocusedWindow()
    let about
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
            modal: true
        })
    }
    //carregar o documento html na janela
    about.loadFile('./src/views/sobre.html')
}

// Janela cliente
let client
function clientWindow() {
    nativeTheme.themeSource = 'light'
    const main = BrowserWindow.getFocusedWindow()
    if (main) {
        client = new BrowserWindow({
            width: 1010,
            height: 680,
            //autoHideMenuBar: true,
            resizable: false,
            parent: main,
            modal: true,
            //ativação do preload.js
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }
        })
    }
    client.loadFile('./src/views/cliente.html')
    client.center() //iniciar no centro da tela   
}

// Janela OS
let os
function osWindow() {
    nativeTheme.themeSource = 'light'
    const main = BrowserWindow.getFocusedWindow()
    if (main) {
        os = new BrowserWindow({
            width: 1010,
            height: 800,
            // autoHideMenuBar: true,
            resizable: false,
            parent: main,
            modal: true,
            //ativação do preload.js
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }

        })
    }
    os.loadFile('./src/views/os.html')
    os.center()
}

// Janela MOTO
let moto
function motoWindow() {
    nativeTheme.themeSource = 'light'
    const main = BrowserWindow.getFocusedWindow()
    if (main) {
        moto = new BrowserWindow({
            width: 1010,
            height: 720,
            // autoHideMenuBar: true,
            resizable: false,
            parent: main,
            modal: true
        })
    }
    moto.loadFile('./src/views/moto.html')
    moto.center()
}

// Iniciar a aplicação
app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

//reduzir logs não críticos
app.commandLine.appendSwitch('log-level', '3')

// iniciar a conexao com o banco de dados
ipcMain.on('db-connect', async (event) => {
    let conectado = await conectar()
    // se conectado for igual a true
    if (conectado) {
        // enviar uma mensagem para o renderizador trocar o ícone, criar um delay de 0.5s para sincronizar a nuvem
        setTimeout(() => {
            event.reply('db-status', "conectado")
        }, 500) //500ms        
    }
})

// ipcMain.on('db-connect', async (event) => {
//     let conectado = await conectar()
//     if (conectado) {
//         // enviar uma msg para o renderizador trocae o icone
//         // criar um delay de 0.5s pra sincronizar a nuvem
//         setTimeout(() => {
//             event.reply('db-connect', "conectado")
//         }, 500)
//     }})


// Importante ! Desconectar o banco de dados quando aplicação for encerrada
app.on('before-quit', () => {
    desconectar()
})

// template do menu
const template = [
    {
        label: 'Cadastro',
        submenu: [
            {
                label: 'Clientes',
                click: () => clientWindow()
            },
            {
                label: 'OS',
                click: () => osWindow()
            },
            {
                type: 'separator'
            },
            {
                label: 'Sair',
                click: () => app.quit(),
                accelerator: 'Alt+F4'
            }
        ]
    },
    {
        label: 'Relatórios',
        submenu: [
            {
                label: 'Clientes',
                click: () => relatorioClientes()
            },
            {
                label: 'OS abertas'
            },
            {
                label: 'OS concluídas'
            }
        ]
    },
    {
        label: 'Ferramentas',
        submenu: [
            {
                label: 'Aplicar zoom',
                role: 'zoomIn'
            },
            {
                label: 'Reduzir',
                role: 'zoomOut'
            },
            {
                label: 'Restaurar o zoom padrão',
                role: 'resetZoom'
            },
            {
                type: 'separator'
            },
            {
                label: 'Recarregar',
                role: 'reload'
            },
            {
                label: 'Ferramentas do desenvolvedor',
                role: 'toggleDevTools'
            }
        ]
    },
    {
        label: 'Ajuda',
        submenu: [
            {
                label: 'Sobre',
                click: () => aboutWindow()
            }
        ]
    }
]

// recebimento dos pedidos do renderizador para abertura de janelas (botões) autorizado no preload.js
ipcMain.on('client-window', () => {
    clientWindow()
})

ipcMain.on('os-window', () => {
    osWindow()
})

ipcMain.on('moto-window', () => {
    motoWindow()
})

//==================================================================
//== Clientes - CRUD Create
// recebimeto do objeto que contem os dados cliente
ipcMain.on('new-client', async (event, client) => {
    // importante teste de recibimento dos dados cliente
    console.log(client)
    // cadastrar a estrutura de dados no banco de dados MOngoDB
    try {
        // criar uma nova estrutura de dados
        // Atenção! os atributos precisa ser identicos ao medelo
        // de dados Cientes.js
        const newClient = new clientModel({
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

        })
        // salvar os dados do cliente no banco de dados
        await newClient.save()
        // mensagem de confimação
        dialog.showMessageBox({
            //customização
            type: 'info',
            title: "Aviso",
            message: "Cliente adicionado com sucesso",
            buttons: ['OK']
        }).then((result) => {
            //acão ao pressionar o botão (result = 0)
            if (result.response == 0) {
                // enviar um pedido para o redenrizador limpar os campos e resetar
                // as consfiguração pré definidas (rótulo, 'reset-form' do preload.js)
                event.reply('reset-form')
            }
        })

    } catch (error) {
        // se o codigo de erro for 11000 (cpf duplicado)
        if (error.code === 11000) {
            dialog.showMessageBox({
                type: 'error',
                title: "Atenção!",
                message: "CPF já está cadastrado\nVerifique se digitou corretamente",
                buttons: ['OK']
            }).then((result) => {
                if (result.response === 0) {
                    // limpar a caixa de imput do fpf, focar esta caixa e deixar a borda vermelho
                }
            })
        }
        console.log(error)
    }
})
//== Fim - Clientes CRUD Create

//========================================
// == relatório de clientes ==============
async function relatorioClientes() {
    try {
        // passo 1: consutar o banco de dados e obter listagem de clientes cadastrados
        const clientes = await clientModel.find().sort({ nomeCliente: 1 })
        // Teste de recebimento da listagem de clientes
        console.log(clientes)
        //Passso 2: formatação do documento pdf
        // p - portrait | l - landscape | mm a a4 (folha a4 = 210x297mm)
        const doc = new JsPDF('p', 'mm', 'a4')

        //Inserir imagem no documento pdf
        // imagePath (caminho da imagem que sera inserida no pdf)
        // imageBase (uso da biblioteca fs para ler o arquivo no formato png)
        const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo.png')
        const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
        doc.addImage(imageBase64, 'PNG', 5, 8) //(5mm, 8mm, x,y)

        // definir o tamanho da fonte(tamanho equiv. word)
        doc.setFontSize(18)
        // escrever o texto (margem - titulo)
        doc.text("Relatório de clientes", 14, 45)//x, y (mm)
        //Inserir a data atual no relatório
        const dataAtual = new Date().toLocaleDateString('pt-BR')
        doc.setFontSize(12)
        doc.text(`Data: ${dataAtual}`, 165, 10)
        // variavel de apoio na formatação
        let y = 60
        doc.text("Nome", 14, y)
        doc.text("Telefone", 80, y)
        doc.text("E-mail", 130, y)
        y += 5
        // desenhar uma linha
        doc.setLineWidth(0.5) // espessura da linha
        doc.line(10, y, 200, y) // 10 inicio da linha -- 200 (fim)

        //redenrizar os clientes cadastrado no banco
        y += 10 // espaçamento da linha
        // pecorrer o vetor do clientes (obtido do banco) usando o laço forEach

        clientes.forEach((c) => {
            // adicionar outra pagina se a folha for preenchida
            // (estrategia é saber o tamanho da folha)
            // folha a4 y = 297 mm
            if (y > 280) {
                doc.addPage()
                y = 20 // resetar a variavel y
                // redesenhar p cabeçalho 
                doc.text("Nome", 14, y)
                doc.text("Telefone", 80, y)
                doc.text("E-mail", 130, y)
                y += 5
                doc.setLineWidth(0.5)
                doc.line(10, y, 200, y)
                y += 10
            }
            doc.text(c.nomeCliente, 14, y),
                doc.text(c.foneCliente, 80, y),
                doc.text(c.emailCliente || "N/A", 130, y)
            y += 10 // quebra de linha
        })

        // adionar numeração automatica de página
        const paginas = doc.internal.getNumberOfPages()
        for (let i = 1; i <= paginas; i++) {
            doc.setPage(i)
            doc.setFontSize(10)
            doc.text(`Página ${i} de ${paginas}`, 105, 290, {align: 'center'})
        }

        //Definir o caminho do arquivo temporário
        const tempDir = app.getPath('temp')
        const filePath = path.join(tempDir, 'clientes.pdf')

        // salvar temporariamente o arquivo
        doc.save(filePath)
        //abrir o arquivo no aplicativo padrão de leitura de pdf
        shell.openPath(filePath)

    } catch (error) {
        console.log(error)
    }
}

//== Fim - relatório do clientes =========