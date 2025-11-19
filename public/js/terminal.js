document.addEventListener("DOMContentLoaded", () => {
    
    const overlayHTML = `
        <div id="quake-console" class="console-closed">
            <div class="console-header">>> SYSTEM_OVERLAY // TERMINAL_ACCESS</div>
            <div id="console-log"></div>
            <div class="console-input-wrapper">
                <span class="prompt">root@sas:~#</span>
                <input type="text" id="overlay-input" autocomplete="off" spellcheck="false">
            </div>
        </div>
    `;

    const overlayStyles = `
        <style>
            #quake-console {
                position: fixed;
                top: 0; left: 0; width: 100%; height: 50vh;
                background: rgba(10, 15, 20, 0.95);
                border-bottom: 2px solid #00ff00;
                z-index: 999999;
                font-family: 'Share Tech Mono', monospace;
                display: flex; flex-direction: column;
                transition: transform 0.3s ease-in-out;
                box-shadow: 0 10px 30px rgba(0, 255, 0, 0.2);
                backdrop-filter: blur(5px);
            }
            .console-closed { transform: translateY(-100%); }
            .console-open { transform: translateY(0); }
            
            .console-header {
                background: #003300; color: #00ff00;
                padding: 5px 10px; font-size: 0.8rem; letter-spacing: 2px;
                border-bottom: 1px solid #333;
            }
            #console-log {
                flex-grow: 1; overflow-y: auto; padding: 15px;
                color: #ccc; font-size: 1rem;
            }
            .console-input-wrapper {
                display: flex; padding: 10px 15px; background: #000;
                border-top: 1px solid #333;
            }
            .prompt { color: #00ff00; margin-right: 10px; font-weight: bold; }
            #overlay-input {
                flex-grow: 1; background: transparent; border: none;
                color: #fff; font-family: inherit; font-size: 1rem; outline: none;
            }
            /* Styles des logs */
            .log-cmd { color: #fff; font-weight: bold; margin-top: 5px; }
            .log-info { color: #00ccff; }
            .log-success { color: #39ff14; }
            .log-error { color: #ff4141; }
            .log-warn { color: #ffcc00; }
        </style>
    `;

    document.body.insertAdjacentHTML('beforeend', overlayStyles + overlayHTML);


    const consoleDiv = document.getElementById('quake-console');
    const input = document.getElementById('overlay-input');
    const logContainer = document.getElementById('console-log');
    
    let commandHistory = [];
    let historyIndex = -1;
    let isOpen = false;

    
    document.addEventListener('keydown', (e) => {
        if (e.key === '²' || e.code === 'Backquote') { 
            e.preventDefault();
            toggleConsole();
        }
    });

    function toggleConsole() {
        isOpen = !isOpen;
        if (isOpen) {
            consoleDiv.classList.remove('console-closed');
            consoleDiv.classList.add('console-open');
            setTimeout(() => input.focus(), 300); // Focus après l'animation
        } else {
            consoleDiv.classList.remove('console-open');
            consoleDiv.classList.add('console-closed');
            input.blur();
        }
    }

    // Gestion de l'input
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            const command = this.value.trim();
            if (command) {
                commandHistory.push(command);
                historyIndex = commandHistory.length;
                logOutput(`root@sas:~# ${command}`, 'cmd');
                executeCommand(command);
            }
            this.value = ''; 
        } else if (e.key === 'ArrowUp') {
            if (historyIndex > 0) {
                historyIndex--;
                this.value = commandHistory[historyIndex];
            }
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                this.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                this.value = '';
            }
            e.preventDefault();
        }
    });

    function logOutput(text, type = "info") {
        const div = document.createElement('div');
        div.textContent = text;
        div.className = `log-${type}`;
        logContainer.appendChild(div);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    
    function executeCommand(fullCmd) {
        const parts = fullCmd.toLowerCase().split(' ');
        const cmd = parts[0].replace('/', ''); // Gère "/help" ou "help"
        const arg = parts[1];

        switch (cmd) {
            case 'help':
                logOutput("--- COMMANDES DISPONIBLES ---", "info");
                logOutput("/open [page]  : Navigation (map, database, finance...)", "info");
                logOutput("/status       : État de l'agent connecté", "info");
                logOutput("/clear        : Nettoyer la console", "info");
                logOutput("/cheat [code] : ???", "warn");
                break;

            case 'clear':
                logContainer.innerHTML = '';
                break;

            case 'status':
                const user = localStorage.getItem('sas_user') || 'INCONNU';
                const level = localStorage.getItem('sas_level') || '0';
                logOutput(`AGENT: ${user.toUpperCase()}`, "success");
                logOutput(`ACCRÉDITATION: NIVEAU ${level}`, "success");
                logOutput(`LOCALISATION: ${window.location.pathname}`, "info");
                break;

            case 'open':
                const routes = {
                    'database': '/Niv1/database.html',
                    'map': '/Niv1/map.html',
                    'finance': '/Niv3/finance.html',
                    'admin': '/Niv4/admin.html',
                    'accueil': '/index.html'
                };
                if (routes[arg]) {
                    logOutput(`> Redirection vers ${arg.toUpperCase()}...`, "success");
                    setTimeout(() => window.location.href = routes[arg], 1000);
                } else {
                    logOutput(`ERREUR: Page '${arg}' introuvable.`, "error");
                }
                break;

            // Exemple de "Secret"
            case 'cheat':
                if (arg === 'godmode') {
                    logOutput("MODE DÉVELOPPEUR ACTIVÉ... (Faux, bien essayé)", "warn");
                } else if (arg === 'nyx') {
                    logOutput("ACCÈS SPÉCIAL DÉTECTÉ...", "success");
                    setTimeout(() => window.location.href = '/Niv1/AgentDatabase/agent-nyx.html', 1000);
                } else {
                    logOutput("Code invalide.", "error");
                }
                break;

            default:
                logOutput(`COMMANDE INCONNUE: '${cmd}'. Tapez 'help'.`, "error");
        }
    }
    
    
    setTimeout(() => {
        logOutput("SAS OVERLAY v2.0 LOADED. PRESS '²' TO TOGGLE.", "success");
    }, 500);
});