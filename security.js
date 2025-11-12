

const userLevel = parseInt(localStorage.getItem('sas_level') || 0);

if (typeof REQUIRED_LEVEL === 'undefined') {
    
    console.error("ERREUR SYSTÈME: NIVEAU DE SÉCURITÉ NON DÉFINI dans la page.");
    window.location.href = 'access-denied.html'; 
} else if (userLevel < REQUIRED_LEVEL) {
    
    window.location.href = 'access-denied.html'; 
}

