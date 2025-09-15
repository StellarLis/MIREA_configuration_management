const terminalOutput = document.getElementById('terminalOutput');
const commandInput = document.getElementById('commandInput');
const inputLine = document.getElementById('user-input-line')

let username = ""
let hostname = ""
window.electronAPI.getUsernameAndHostname().then(userInfo => {
    const terminalUsers = document.getElementsByClassName('terminal-user')
    for (element of terminalUsers) {
        element.innerHTML = `Эмулятор - [${userInfo.username}@${userInfo.hostname}]:~#`
    }
    username = userInfo.username
    hostname = userInfo.hostname
})

window.electronAPI.getUpdates().then(terminalHistory => {
    for (const commandHistory of terminalHistory) {
        const commandLine = document.createElement('div');
        commandLine.innerHTML = `<span class="prompt">Эмулятор - [${username}@${hostname}]:~$</span><span class="command">${commandHistory.userInput}</span>`;
        terminalOutput.insertBefore(commandLine, inputLine);

        const outputDiv = document.createElement('div');
        outputDiv.className = 'output';
        outputDiv.innerHTML = commandHistory.output;
        terminalOutput.insertBefore(outputDiv, inputLine);

        if (commandHistory.isError) {
            outputDiv.classList.add('error')
        }
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
})


commandInput.addEventListener('keypress', async function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const userInput = this.value.trim().replaceAll('\'', '').replaceAll('\"', '').split(' ');
        const command = userInput[0];
        const args = userInput.slice(1)
                
        if (command) {
            // Добавляем выполненную команду в вывод
            const commandLine = document.createElement('div');
            commandLine.innerHTML = `<span class="prompt">Эмулятор - [${username}@${hostname}]:~$</span><span class="command">${this.value}</span>`;
            terminalOutput.insertBefore(commandLine, this.parentNode);
                    
            // Обработка команд
            let output = '';
            let result = {};
            let isError = false
            switch(command.toLowerCase()) {
                case 'ls':
                    result = await window.electronAPI.command_ls(args)
                    if (result.success) output = result.value
                    break;
                case 'cd':
                    result = await window.electronAPI.command_cd(args)
                    if (result.success) output = result.value
                    else {
                        isError = true
                        output = result.value
                    }
                    break;
                case 'exit':
                    window.electronAPI.exit()
                    break;
                default:
                    output = `Команда '${command}' не найдена`;
            }
                    
            const outputDiv = document.createElement('div');
            outputDiv.className = 'output';
            outputDiv.innerHTML = output;
            terminalOutput.insertBefore(outputDiv, this.parentNode);

            if (isError) {
                outputDiv.classList.add('error')
            }
                
            // Очищаем input
            this.value = '';
                    
            // Прокручиваем к низу
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }
    }
});

// Фокус на input при клике в любое место терминала
terminalOutput.addEventListener('click', function() {
    commandInput.focus();
});

// Автопрокрутка при загрузке
window.addEventListener('load', function() {
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
});