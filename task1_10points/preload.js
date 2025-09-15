const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    getUpdates: async () => ipcRenderer.invoke('get-updates'),
    getUsernameAndHostname: async () => ipcRenderer.invoke('get-username-and-hostname'),
    exit: () => ipcRenderer.invoke('exit'),
    command_ls: async (args) => ipcRenderer.invoke('command-ls', args),
    command_cd: async (args) => ipcRenderer.invoke('command-cd', args)
})