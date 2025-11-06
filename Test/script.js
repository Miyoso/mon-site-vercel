// Attendre que le DOM soit chargé
window.addEventListener('DOMContentLoaded', () => {

    // --- 1. Récupérer nos éléments ---
    const bouton = document.getElementById('bouton-visualiseur');
    const audio = document.getElementById('mon-audio');
    const conteneur = document.getElementById('visualiseur-conteneur');
    const iconePlay = document.getElementById('icone-play');
    
    // --- 2. Initialisation de l'API Audio ---
    let audioContext;
    let analyseur;
    let source;
    let dataArray;
    let barresVisualiseur = [];
    let estInitialise = false;

    // Nombre de barres que nous voulons
    const NOMBRE_DE_BARRES = 32;

    // --- 3. Fonction d'initialisation (ne s'exécute qu'une fois) ---
    function initialiserAudio() {
        if (estInitialise) return;

        // Créer le contexte audio
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Créer l'analyseur
        analyseur = audioContext.createAnalyser();
        // Définir la "précision" de l'analyse. Doit être une puissance de 2.
        // Résultera en (fftSize / 2) points de données.
        analyseur.fftSize = 128; 
        
        // Créer la source depuis notre élément <audio>
        source = audioContext.createMediaElementSource(audio);
        
        // Connecter les "nœuds" audio ensemble
        // Source -> Analyseur -> Destination (les haut-parleurs)
        source.connect(analyseur);
        analyseur.connect(audioContext.destination);

        // Créer le tableau pour stocker les données de fréquence
        // La taille est la moitié de fftSize (frequencyBinCount)
        const bufferLength = analyseur.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        // --- 4. Créer les barres HTML ---
        conteneur.innerHTML = ''; // Vider le conteneur
        for (let i = 0; i < NOMBRE_DE_BARRES; i++) {
            const barre = document.createElement('div');
            barre.classList.add('barre-visualiseur');
            conteneur.appendChild(barre);
            barresVisualiseur.push(barre); // Stocker la référence
        }

        estInitialise = true;
    }

    // --- 5. La boucle d'animation ---
    function boucleAnimation() {
        // Demander à redessiner au prochain "frame"
        requestAnimationFrame(boucleAnimation);

        // Récupérer les données de fréquence audio dans notre tableau
        analyseur.getByteFrequencyData(dataArray);

        // Mettre à jour la hauteur de chaque barre
        for (let i = 0; i < NOMBRE_DE_BARRES; i++) {
            // dataArray contient des valeurs de 0 à 255
            const hauteurBarre = dataArray[i] / 4; // On divise pour ne pas que ce soit trop haut
            const barre = barresVisualiseur[i];
            
            if (barre) {
                // On met une hauteur minimale pour qu'on la voie toujours
                barre.style.height = (hauteurBarre > 5 ? hauteurBarre : 5) + 'px';
            }
        }
    }

    // --- 6. Gérer le clic sur le bouton ---
    bouton.addEventListener('click', () => {
        // L'API Audio DOIT être initialisée après un clic de l'utilisateur
        if (!estInitialise) {
            initialiserAudio();
        }

        // Reprendre le contexte audio s'il était suspendu
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        // Gérer le Play / Pause
        if (audio.paused) {
            audio.play();
            iconePlay.textContent = '❚❚'; // Symbole Pause
            // Lancer l'animation
            boucleAnimation();
        } else {
            audio.pause();
            iconePlay.textContent = '▶'; // Symbole Play
        }
    });
});