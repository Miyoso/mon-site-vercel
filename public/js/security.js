
const SECRET_KEY = "SAS_SECURE_HASH_KEY_x99";


function generateSignature(level) {
   
    return btoa(`${level}-${SECRET_KEY}`);
}

const userLevel = parseInt(localStorage.getItem('sas_level') || 0);
const storedSignature = localStorage.getItem('sas_integrity');


if (userLevel > 0 && storedSignature !== generateSignature(userLevel)) {
    console.warn("ALERTE: Modification manuelle détectée !");
    window.location.href = '/cheater.html';
    throw new Error("Cheater detected"); 
}

if (typeof REQUIRED_LEVEL === 'undefined') {
    console.error("ERREUR SYSTÈME: NIVEAU DE SÉCURITÉ NON DÉFINI dans la page.");

} else if (userLevel < REQUIRED_LEVEL) {
    window.location.href = '/access-denied.html'; 
}