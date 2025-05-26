// contextBridge (segurança) ipcRenderer (comunicação)
const { contextBridge, ipcRenderer } = require('electron')

// e troca do icone no processo de renderer(index.html - renderer)
ipcRenderer.send('db-connect')

// expor (autorizar a comunicação entre processos)
contextBridge.exposeInMainWorld('api', {
    clientWindow: () => ipcRenderer.send('client-window'),
    osWindow: () => ipcRenderer.send('os-window'),
    motoWindow: () => ipcRenderer.send('moto-window'),
    dbStatus: (message) => ipcRenderer.on('db-status', message),
    newClient: (client) => ipcRenderer.send('new-client', client),
    newOS: (os) => ipcRenderer.send('new-os', os),
    newMoto: (mot) => ipcRenderer.send('new-moto', mot),
    resetForm: (args) => ipcRenderer.on('reset-form', args),
    searchName: (name) => ipcRenderer.send('search-name', name),
    renderClient: (dataClient) => ipcRenderer.on('render-client', dataClient),
    validateSearch: () => ipcRenderer.send('validate-search'),
    setClient: (args) => ipcRenderer.on ('set-client', args),
    deleteClient: (id) => ipcRenderer.send('delete-client', id),
    updateClient: (client) => ipcRenderer.send('update-client', client), 
    searchOS: () => ipcRenderer.send('search-os'), 
    setSearch: (args) => ipcRenderer.on('set-search', args),  
    searchClients: (clients) => ipcRenderer.send('search-clients', clients),
    listClients: (clients) => ipcRenderer.on('list-clients', clients),
    validateClient: () => ipcRenderer.send('validate-client'),    
    renderOS: (dataOS) => ipcRenderer.on('render-os', dataOS)
})