// contextBridge (segurança) ipcRenderer (comunicação)
const { contextBridge, ipcRenderer } = require('electron')

ipcRenderer.send('db-connect')

// expor (autorizar a comunicação entre processos)
contextBridge.exposeInMainWorld('api', {
    clientWindow: () => ipcRenderer.send('client-window'),
    osWindow: () => ipcRenderer.send('os-window'),
    motoWindow: () => ipcRenderer.send('moto-window'),
    dbStatus: (message) => ipcRenderer.on('db-status', message),
    newClient: (client) => ipcRenderer.send('new-client', client),
    
    newMoto: (mot) => ipcRenderer.send('new-moto', mot),
    resetForm: (args) => ipcRenderer.on('reset-form', args),
    searchName: (name) => ipcRenderer.send('search-name', name),
    renderClient: (dataClient) => ipcRenderer.on('render-client', dataClient),
    validateSearch: () => ipcRenderer.send('validate-search'),
   
    setClient: (args) => ipcRenderer.on ('set-client', args),
    deleteClient: (id) => ipcRenderer.send('delete-client', id),
    updateClient: (client) => ipcRenderer.send('update-client', client), 
    searchClients: () => ipcRenderer.send('search-clients'),
    listClients: (clients) => ipcRenderer.on('list-clients', clients),
    
    searchOS: () => ipcRenderer.send('search-os'),
    validateClient: () => ipcRenderer.send('validate-client'), 
    setSearch: (args) => ipcRenderer.on('set-search', args),  
    newOS: (os) => ipcRenderer.send('new-os', os), 
    renderOS: (dataOS) => ipcRenderer.on('render-os', dataOS),
    
    searchIdClient: (idClient) => ipcRenderer.send('search-idClient', idClient),
    renderIdClient: (dataClient) => ipcRenderer.on('render-idClient', dataClient),
    deleteOS: (idOS) => ipcRenderer.send('delete-os', idOS),
    updateOS: (os) => ipcRenderer.send('update-os', os),
    printOS: () => ipcRenderer.send('print-os')
})