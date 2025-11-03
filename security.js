// Ce script s'exécute immédiatement.
// Il s'attend à ce que la variable 'REQUIRED_LEVEL' ait été définie
// juste avant son appel dans le fichier HTML.

const userLevel = parseInt(localStorage.getItem('sas_level') || 0);

if (typeof REQUIRED_LEVEL === 'undefined') {
    // Sécurité au cas où vous oublieriez de définir la variable dans le HTML
    console.error("ERREUR SYSTÈME: NIVEAU DE SÉCURITÉ NON DÉFINI dans la page.");
    window.location.href = 'access-denied.html'; // Redirige vers la page d'erreur
    
} else if (userLevel < REQUIRED_LEVEL) {
    // L'utilisateur n'a pas le niveau
    window.location.href = 'access-denied.html'; // Redirige vers la page d'erreur
}

// Si userLevel >= REQUIRED_LEVEL, le script ne fait rien et la page continue de se charger.