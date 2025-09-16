const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    getCurrentPath: async () => ipcRenderer.invoke('get-current-path'),
    getUpdates: async () => ipcRenderer.invoke('get-updates'),
    getUsernameAndHostname: async () => ipcRenderer.invoke('get-username-and-hostname'),
    exit: () => ipcRenderer.invoke('exit'),
    command_ls: async (args) => ipcRenderer.invoke('command-ls', args),
    command_cd: async (args) => ipcRenderer.invoke('command-cd', args),
    command_echo: async (args) => ipcRenderer.invoke('command-echo', args),
    command_head: async (args) => ipcRenderer.invoke('command-head', args),
    command_cp: async (args) => ipcRenderer.invoke('command-cp', args),
    command_mkdir: async (args) => ipcRenderer.invoke('command-mkdir', args)
})