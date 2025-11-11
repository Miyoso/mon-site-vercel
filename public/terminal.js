document.addEventListener("DOMContentLoaded", () => {
    const cmdInput = document.getElementById('cmdInput');

    if (cmdInput) {
    
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                e.preventDefault();
                cmdInput.focus();
                cmdInput.value = '/';
            }
        });

        cmdInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                const fullCommand = this.value.trim();
                if (fullCommand.startsWith('/')) {
                    executeCommand(fullCommand);
                } else {
               
                     flashTerminalError();
                }
                this.value = ''; // Nettoie l'input après validation
            }
        });
    }
});

function executeCommand(fullCmd) {
  
    const parts = fullCmd.toLowerCase().split(' ');
    const cmd = parts[0];
    const arg1 = parts[1];

    switch (cmd) {
        case '/help':
            alert("COMMANDES DISPO :\n/goto [page] (ex: map, dashboard)\n/status [online/busy]\n/clear");
            break;
        case '/goto':
            if (arg1) {
                // Redirection simple (suppose que tes pages s'appellent map.html, dashboard.html etc.)
                window.location.href = arg1 + '.html';
            } else {
                alert("ERREUR : Destination manquante. Usage : /goto [page]");
            }
            break;
        case '/status':
             alert("Statut mis à jour : " + (arg1 || "ONLINE"));
             break;
        case '/clear':
             console.clear();
            
             break;
        default:
            alert("ERREUR : Commande inconnue '" + cmd + "'");
            flashTerminalError();
    }
}

function flashTerminalError() {
    const bar = document.querySelector('.terminal-bar');
    bar.style.borderTopColor = 'red';
    setTimeout(() => {
        bar.style.borderTopColor = '#39ff14';
    }, 500);
}