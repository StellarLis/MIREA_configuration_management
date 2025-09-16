/*
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const os = require('os')
const fs = require('fs')
*/
import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import os from 'os'
import fs from 'fs';
import { fileURLToPath } from 'url';

const args = process.argv.slice(2)
const userOptions = {}

args.forEach(arg => {
    if (arg.startsWith('--vfs=')) {
        userOptions.vfsPath = arg.split('=')[1]
    }
    if (arg.startsWith('--script=')) {
        userOptions.scriptPath = arg.split('=')[1]
    }
})

const vfsStruct = []
let currentDir = 'root'

// Manage VFS
if (userOptions.vfsPath) {
    const lines = fs.readFileSync(userOptions.vfsPath, 'utf-8').split('\n')
    for (const line of lines) {
        const cols = line.split(',')
        vfsStruct.push({
            name: cols[0],
            type: cols[1],
            parentFolder: cols[2],
            content: cols[3]
        })
    }
}

const terminalHistory = []

// Manage start script
if (userOptions.scriptPath) {
    const lines = fs.readFileSync(userOptions.scriptPath, 'utf-8').split('\n')
    for (const userInput of lines) {
        if (!userInput.trim()) continue
        const userInputFormatted = userInput.trim().replaceAll('\'', '').replaceAll('\"', '').split(' ');
        const command = userInputFormatted[0];
        const args = userInputFormatted.slice(1);

        let result = {}
        let isNeededRunning = true
        switch (command) {
            case 'ls':
                result = await command_ls(args)
                terminalHistory.push({
                    userInput: userInput,
                    output: result.value,
                    isError: !result.success,
                    currentPath: getCurrentPath()
                });
                if (!result.success) isNeededRunning = false
                break;
            case 'cd':
                result = await command_cd(args)
                terminalHistory.push({
                    userInput: userInput,
                    output: result.value,
                    isError: !result.success,
                    currentPath: getCurrentPath()
                });
                if (!result.success) isNeededRunning = false
                break;
            case 'echo':
                result = await command_echo(args)
                terminalHistory.push({
                    userInput: userInput,
                    output: result.value,
                    isError: !result.success,
                    currentPath: getCurrentPath()
                });
                if (!result.success) isNeededRunning = false
                break;
            case 'head':
                result = await command_head(args)
                terminalHistory.push({
                    userInput: userInput,
                    output: result.value,
                    isError: !result.success,
                    currentPath: getCurrentPath()
                });
                if (!result.success) isNeededRunning = false
                break;
            case 'cp':
                result = await command_cp(args)
                terminalHistory.push({
                    userInput: userInput,
                    output: result.value,
                    isError: !result.success,
                    currentPath: getCurrentPath()
                });
                if (!result.success) isNeededRunning = false
                break;
            case 'mkdir':
                result = await command_mkdir(args)
                terminalHistory.push({
                    userInput: userInput,
                    output: result.value,
                    isError: !result.success,
                    currentPath: getCurrentPath()
                });
                if (!result.success) isNeededRunning = false
                break;
        }
        if (!isNeededRunning) break;
    }
}

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(path.dirname(fileURLToPath(import.meta.url)), 'preload.js')
        }
    })

    win.loadFile('index.html')
}

ipcMain.handle('get-username-and-hostname', async (event) => {
    return { username: os.userInfo().username, hostname: os.hostname() }
})

ipcMain.handle('exit', async (event) => {
    app.quit()
})

ipcMain.handle('get-updates', async (event) => {
    return terminalHistory
})

ipcMain.handle('get-current-path', async (event) => {
    return getCurrentPath()
})

// Commands calls
ipcMain.handle('command-ls', async (event, args) => {
    return command_ls(args)
})

ipcMain.handle('command-cd', async (event, args) => {
    return command_cd(args)
})

ipcMain.handle('command-echo', async (event, args) => {
    return command_echo(args)
})

ipcMain.handle('command-head', async (event, args) => {
    return command_head(args)
})

ipcMain.handle('command-cp', async (event, args) => {
    return command_cp(args)
})

ipcMain.handle('command-mkdir', async (event, args) => {
    return command_mkdir(args)
})

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

// Commands realizations
async function command_ls(args) {
    let output = ''
    for (const entity of vfsStruct) {
        let localCurrentDir = currentDir
        if (args.length !== 0) {
            for (const arg of args) {
                if (!arg.startsWith('-')) {
                    const result = resolvePath(arg)
                    if (result.success) {
                        localCurrentDir = result.value
                    } else {
                        return result
                    }
                    break;
                }
            }
        }
        if (entity.parentFolder === localCurrentDir) {
            output += entity.name
            if (entity.type === 'folder') output += '/'
            output += '\n'
        }
    }
    return { success: true, value: output }
}

async function command_cd(args) {
    if (args.length === 0) {
        currentDir = 'root'
        return { success: true, value: '' }
    }
    for (const arg of args) {
        if (!arg.startsWith('-')) {
            const result = resolvePath(arg)
            if (result.success) {
                currentDir = result.value
                return { success: true, value: '' }
            } else {
                return result
            }
            break;
        }
    }
    return { success: true, value: '' }
}

async function command_echo(args) {
    let output = ''
    for (const arg of args) {
        output += arg + ' '
    }
    return { success: true, value: output }
}

async function command_head(args) {
    if (args[0]) {
        let localCurrentDir = currentDir
        let filename = args[0]
        if (args[0].includes('/')) {
            const splittedArg = args[0].split('/')
            const result = resolvePath(splittedArg.slice(0, splittedArg.length-1).join(''))
            if (result.success) {
                localCurrentDir = result.value
                filename = splittedArg.slice(splittedArg.length-1)[0]
            } else {
                return result
            }
        }
        let found = false
        for (const entity of vfsStruct) {
            if (
                entity.name === filename &&
                entity.parentFolder === localCurrentDir &&
                entity.type === 'file'
            ) {
                found = true
                const splittedContent = entity.content.replaceAll('\\n', '\n')
                    .replaceAll('\\t', '    ').split('\n')
                if (splittedContent.length <= 5) {
                    return { success: true, value: splittedContent.join('<br>') }
                }
                let output = ''
                for (let i = 0; i < 5; i++) {
                    output += splittedContent[i]
                }
                return { success: true, value: output }
            }
        }
        if (!found) {
            return {success: false, value: 'File has not been found!'}
        }
    } else {
        return { success: false, value: 'No file specified!' }
    }
}

async function command_cp(args) {
    if (args.length < 2) return { success: false, value: 'Minimum 2 args required!' }
    let localCurrentDir = currentDir
    let filename = args[0]
    if (args[0].includes('/')) {
        const splittedArg = args[0].split('/')
        const result = resolvePath(splittedArg.slice(0, splittedArg.length-1).join(''))
        if (result.success) {
            localCurrentDir = result.value
            filename = splittedArg.slice(splittedArg.length-1)[0]
        } else {
            return result
        }
    }

    // Find that file object and check if file exists
    let fileObj = {}
    let fileFound = false
    for (const entity of vfsStruct) {
        if (
            entity.name === filename &&
            entity.type === 'file' &&
            entity.parentFolder === localCurrentDir
        ) {
            fileFound = true
            fileObj = entity
            break;
        }
    }
    if (!fileFound) return { success: false, value: 'File to copy has not been found!' }

    const resultDirToCopy = resolvePath(args[1])
    if (resultDirToCopy.success) {
        vfsStruct.push({
            name: filename,
            type: 'file',
            parentFolder: resultDirToCopy.value,
            content: fileObj.content
        })
        return { success: true, value: '' }
    } else return resultDirToCopy;
}

async function command_mkdir(args) {
    if (!args[0]) return { success: false, value: 'No argument provided!' }
    vfsStruct.push({
        name: args[0],
        type: 'folder',
        parentFolder: currentDir,
        content: ''
    })
    return { success: true, value: '' }
}

// Helper functions
function resolvePath(path) {
    let finalDir = currentDir
    const pathSplitted = path.split('/')
    if (pathSplitted[0] === '') {
        finalDir = 'root'
    }
    for (const pathArg of pathSplitted) {
        if (pathArg === '..' && finalDir !== 'root') {
            let found = false
            for (const entity of vfsStruct) {
                if (entity.name === finalDir) {
                    found = true
                    finalDir = entity.parentFolder
                    break;
                }
            }
            if (!found) return { success: false, value: 'Incorrect path' }
        } else if (pathArg !== '..' && pathArg !== '') {
            let found = false
            for (const entity of vfsStruct) {
                if (
                    entity.name === pathArg &&
                    entity.type === 'folder' &&
                    entity.parentFolder === finalDir
                ) {
                    found = true
                    finalDir = pathArg
                    break;
                }
            }
            if (!found) return { success: false, value: 'Incorrect path' }
        }
    }
    return { success: true, value: finalDir }
}

function getCurrentPath() {
    if (currentDir === 'root') return '/'
    let folders = []
    let searchFolder = currentDir
    while (searchFolder !== 'root') {
        folders.push(searchFolder)
        for (const entity of vfsStruct) {
            if (entity.name === searchFolder && entity.type === 'folder') {
                searchFolder = entity.parentFolder
                break;
            }
        }
    }
    let result = '/'
    for (let i = folders.length-1; i >= 0; i--) {
        result += folders[i] + '/'
    }
    return result
}