document.addEventListener("DOMContentLoaded", () => {
    const cmdInput = document.getElementById('cmdInput');
    const terminalContainer = document.querySelector('.terminal');

    let commandHistory = [];
    let historyIndex = -1;

    let outputLog = document.getElementById('terminal-output-log');
    if (!outputLog && terminalContainer) {
        outputLog = document.createElement('div');
        outputLog.id = 'terminal-output-log';
        outputLog.style.marginBottom = '20px';
        outputLog.style.fontFamily = "'Share Tech Mono', monospace";
        outputLog.style.color = "#00ff00";
        const nav = document.getElementById('portalMenu');
        terminalContainer.insertBefore(outputLog, nav);
    }

    if (cmdInput) {
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && document.activeElement !== cmdInput) {
                e.preventDefault();
                cmdInput.focus();
            }
        });

        cmdInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                const command = this.value.trim();
                if (command) {
                    commandHistory.push(command);
                    historyIndex = commandHistory.length;
                    logOutput(`user@sas:~$ ${command}`, 'command');
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
    }

    function executeCommand(fullCmd) {
        const parts = fullCmd.toLowerCase().split(' ');
        const cmd = parts[0].replace('/', '');
        const arg = parts[1];

        switch (cmd) {
            case 'help':
                logOutput("--- COMMANDES DISPONIBLES ---", "info");
                logOutput("open [dossier] : Ouvrir une page (ex: database, map, finance)", "info");
                logOutput("mail           : Accéder à la messagerie sécurisée", "info");
                logOutput("scan           : Analyse heuristique de la page", "info");
                logOutput("clear          : Nettoyer le terminal", "info");
                logOutput("whoami         : Info utilisateur", "info");
                break;
            case 'clear':
                if (outputLog) outputLog.innerHTML = '';
                break;
            case 'open':
                handleOpenCommand(arg);
                break;
            case 'mail':
                openMailClient();
                break;
            case 'scan':
                performScan();
                break;
            case 'whoami':
                const user = localStorage.getItem('sas_user') || 'GUEST';
                const level = localStorage.getItem('sas_level') || '0';
                logOutput(`USER: ${user} // LEVEL: ${level}`, "success");
                break;
            default:
                logOutput(`ERREUR: Commande '${cmd}' inconnue. Tapez 'help'.`, "error");
        }
    }

    function handleOpenCommand(target) {
        const routes = {
            'database': '/Niv1/database.html',
            'agents': '/Niv1/database.html',
            'map': '/Niv1/map.html',
            'maps': '/Niv1/map.html',
            'reglement': '/Niv1/reglement.html',
            'rules': '/Niv1/reglement.html',
            'operations': '/Niv1/operations.html',
            'ops': '/Niv1/operations.html',
            'rapports': '/Niv2/rapports-secrets.html',
            'reports': '/Niv2/rapports-secrets.html',
            'targets': '/Niv2/targets.html',
            'finance': '/Niv3/finance.html',
            'money': '/Niv3/finance.html',
            'inventaire': '/Niv3/inventaire.html',
            'inventory': '/Niv3/inventaire.html',
            'dossiers': '/Niv3/dossiers-internes.html',
            'internal': '/Niv3/dossiers-internes.html',
            'admin': '/Niv4/admin.html',
            'logs': '/Niv4/logs.html'
        };

        if (!target) {
            logOutput("ERREUR: Cible manquante. Usage: open [nom]", "error");
            return;
        }

        if (routes[target]) {
            logOutput(`> Redirection vers ${target.toUpperCase()}...`, "success");
            setTimeout(() => window.location.href = routes[target], 1000);
        } else {
            logOutput(`ERREUR: Destination '${target}' introuvable ou verrouillée.`, "error");
        }
    }

    function performScan() {
        logOutput("> INITIALISATION DU SCAN HEURISTIQUE...", "info");
        
        setTimeout(() => {
            const hiddenElements = document.querySelectorAll('.secret, .hidden, [style*="display: none"]');
            let found = 0;

            const deniedLinks = document.querySelectorAll('.portal-link.disabled');
            deniedLinks.forEach(link => {
                link.style.border = "1px dashed #ff0000";
                link.classList.add('is-corrupting');
                found++;
            });

            if (found > 0) {
                logOutput(`> SCAN TERMINÉ. ${found} ANOMALIES DÉTECTÉES.`, "warning");
                logOutput("> Les vecteurs d'accès restreints ont été marqués.", "warning");
            } else {
                logOutput("> SCAN TERMINÉ. AUCUNE ANOMALIE DÉTECTÉE.", "success");
            }
        }, 1500);
    }

    function openMailClient() {
        logOutput("> CONNEXION AU SERVEUR MAIL...", "info");
        
        const emails = [
            { from: "Graves", subject: "Rappel Protocole", body: "Arrêtez de laisser traîner vos badges au mess. C'est la dernière fois." },
            { from: "Javier", subject: "Caisse Noire", body: "Il manque 500$ sur le compte opérationnel. Qui a payé sa tournée ?" },
            { from: "SYSTEM", subject: "ALERTE", body: "Tentative de connexion échouée depuis l'IP 192.168.1.44" }
        ];

        setTimeout(() => {
            logOutput("--- BOÎTE DE RÉCEPTION (3 NON LUS) ---", "success");
            emails.forEach(mail => {
                logOutput(`[DE: ${mail.from}] SUJET: ${mail.subject}`, "info");
                logOutput(`   "${mail.body}"`, "dim");
            });
            logOutput("--- FIN DE TRANSMISSION ---", "success");
        }, 1000);
    }

    function logOutput(text, type = "normal") {
        if (!outputLog) return;

        const p = document.createElement('div');
        p.textContent = text;
        p.style.marginBottom = "5px";
        p.style.wordBreak = "break-all";

        switch (type) {
            case 'error': p.style.color = "#ff4141"; break;
            case 'success': p.style.color = "#39ff14"; break;
            case 'warning': p.style.color = "#ffff00"; break;
            case 'dim': p.style.color = "#888"; p.style.fontSize = "0.9em"; break;
            case 'command': p.style.color = "#fff"; p.style.fontWeight = "bold"; p.style.marginTop = "10px"; break;
            default: p.style.color = "#00ccff";
        }

        outputLog.appendChild(p);
        outputLog.scrollTop = outputLog.scrollHeight;
        
        while (outputLog.children.length > 15) {
            outputLog.removeChild(outputLog.firstChild);
        }
    }
});