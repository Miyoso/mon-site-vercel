function initializeMap() {
    
    const IMAGE_WIDTH_PIXELS = 4096; 
    const IMAGE_HEIGHT_PIXELS = 4096; 

    
    const GAME_X_MIN = -4000;
    const GAME_X_MAX = 4000;
    const GAME_Y_MIN = -4000;
    const GAME_Y_MAX = 4000;

   
    const X_RANGE = GAME_X_MAX - GAME_X_MIN;
    const Y_RANGE = GAME_Y_MAX - GAME_Y_MIN;
    
   
    const simpleCRS = L.extend({}, L.CRS.Simple, {
        
        transformation: new L.Transformation(
            
            IMAGE_WIDTH_PIXELS / X_RANGE, 
           
            -IMAGE_WIDTH_PIXELS * GAME_X_MIN / X_RANGE,
       
            -IMAGE_HEIGHT_PIXELS / Y_RANGE, 
    
            IMAGE_HEIGHT_PIXELS * GAME_Y_MAX / Y_RANGE
        )
    });

  
    const map = L.map('map-container', {
        crs: simpleCRS,
        minZoom: -2, 
        maxZoom: 3,
   
        center: [0, 0], 
        zoom: -1 
    });

   
    const bounds = [[GAME_Y_MIN, GAME_X_MIN], [GAME_Y_MAX, GAME_X_MAX]];
    
    L.imageOverlay('carte-satellite-gta-5.jpg', bounds).addTo(map);


    map.fitBounds(bounds);




    fetch('/api/get-agents.js')
        .then(res => res.json())
        .then(data => {
            const agents = data.agents || [];
            
            if (agents.length === 0) {
                console.log("Aucun agent trouvé ou les coordonnées sont manquantes.");
                return;
            }

            agents.forEach(agent => {
                
                const markerPosition = [agent.map_y, agent.map_x];

       
                L.marker(markerPosition).addTo(map)
                    .bindPopup(`
                        <b>${agent.name} (Niv. ${agent.level})</b><br>
                        Statut: ${agent.status_text}<br>
                        <a href="${agent.profile_url}">Voir Profil</a>
                    `);
            });
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des agents:', error);
            alert('Impossible de charger les données des agents.');
        });
}