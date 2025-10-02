// Configuration
const BACKEND_URL = 'https://sqea-backend.onrender.com';

let mapData = {
    camp: { x: 4, y: 4 },
    revealedCells: [],
    accessibleCells: [],
    exploringCells: [],
    cellDetails: {}
};

// Fonctions principales
async function loadMapData() {
    try {
        console.log("🔄 Chargement des données...");
        const response = await fetch(`${BACKEND_URL}/api/map/state`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        mapData.revealedCells = data.revealedCells || [];
        mapData.accessibleCells = data.accessibleCells || [];
        mapData.exploringCells = data.exploringCells || [];
        mapData.cellDetails = data.cellDetails || {};
        
        console.log(`✅ ${mapData.revealedCells.length} révélées, ${mapData.accessibleCells.length} accessibles`);
        
        createMap();
        updateStatus();
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        showToast('⚠️ Impossible de charger les données');
        // Données de démo
        loadDemoData();
    }
}

function loadDemoData() {
    mapData.revealedCells = [{ x: 4, y: 4, biome: 'camp' }];
    mapData.accessibleCells = [
        { x: 4, y: 3, remaining: 3 },
        { x: 3, y: 4, remaining: 3 }, 
        { x: 4, y: 5, remaining: 4 },
        { x: 5, y: 4, remaining: 4 }
    ];
    mapData.exploringCells = [];
    mapData.cellDetails = {
        "4-4": { reveal_count: 0, required_reveals: 0, remaining: 0, status: "camp" },
        "4-3": { reveal_count: 2, required_reveals: 5, remaining: 3, status: "hidden" },
        "3-4": { reveal_count: 1, required_reveals: 5, remaining: 4, status: "hidden" }
    };
    
    createMap();
    updateStatus();
}

function createMap() {
    const grid = document.getElementById('mapGrid');
    if (!grid) return;
    grid.innerHTML = '';

    for (let y = 1; y <= 7; y++) {
        for (let x = 1; x <= 7; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = x;
            cell.dataset.y = y;

            const cellKey = `${x}-${y}`;
            const cellInfo = mapData.cellDetails[cellKey];
            const isExploring = mapData.exploringCells.find(c => c.x === x && c.y === y);
            const revealed = mapData.revealedCells.find(c => c.x === x && c.y === y);
            const accessible = mapData.accessibleCells.find(c => c.x === x && c.y === y);

            // Camp
            if (x === mapData.camp.x && y === mapData.camp.y) {
                cell.classList.add('camp', 'revealed');
            }

            // Case révélée
            if (revealed) {
                cell.classList.add('revealed');
                if (cellInfo) {
                    cell.title = `Case révélée\nBiome: ${revealed.biome || 'Plaine'}\nExplorations: ${cellInfo.reveal_count || 0}/${cellInfo.required_reveals || 0}`;
                }
            }

            // Case en exploration
            if (isExploring) {
                cell.classList.add('exploring');
                const progress = document.createElement('div');
                progress.className = 'exploration-progress';
                progress.textContent = '🔍';
                progress.title = 'Exploration en cours...';
                cell.appendChild(progress);
            }

            // Case accessible
            if (accessible && !revealed) {
                cell.classList.add('accessible');
                
                const distance = Math.abs(x - 4) + Math.abs(y - 4);
                const duration = calculateExplorationDuration(distance);
                const reward_xp = 10 + (distance * 2);
                const remaining = cellInfo ? cellInfo.remaining : (accessible.remaining || 0);
                
                const hours = Math.floor(duration / 3600);
                const minutes = Math.floor((duration % 3600) / 60);
                let durationText = hours > 0 ? `${hours}h ${minutes.toString().padStart(2, '0')}min` : `${minutes}min`;
                
                const command = `!explore ${x} ${y}`;
                cell.title = `Case accessible\n📏 Distance: ${distance} cases\n⏱️ Durée: ${durationText}\n🎯 Récompense: ${reward_xp} XP\n🔍 Explorations restantes: ${remaining}\n\nCliquez pour copier: ${command}`;
                
                // Compteur d'explorations restantes
                if (remaining > 0) {
                    const remainingEl = document.createElement('div');
                    remainingEl.className = 'remaining-explorations';
                    remainingEl.textContent = `${remaining}🔍`;
                    remainingEl.title = `${remaining} exploration(s) restante(s)`;
                    cell.appendChild(remainingEl);
                }
                
                // Copie au clic
                cell.addEventListener('click', () => copyToClipboard(command));
            }

            grid.appendChild(cell);
        }
    }
    
    createCoordinateLabels();
}

function createCoordinateLabels() {
    const mapContainer = document.querySelector('.map-container');
    if (!mapContainer) return;
    
    // Supprimer les anciens labels
    const oldLabels = document.querySelectorAll('.coordinate-labels');
    oldLabels.forEach(label => label.remove());
    
    // Labels des colonnes (1-7 en haut)
    const columnLabels = document.createElement('div');
    columnLabels.className = 'coordinate-labels column-labels';
    
    for (let x = 1; x <= 7; x++) {
        const label = document.createElement('div');
        label.className = 'coordinate-label';
        label.textContent = x;
        
        // Calcul précis de la position centrée
        const cellWidth = 90 / 7; // 90% de largeur divisé par 7
        const labelX = 5 + (x - 1) * cellWidth + cellWidth / 2;
        label.style.left = `${labelX}%`;
        label.style.top = `18%`; // Ajusté pour être au-dessus de la grille
        
        columnLabels.appendChild(label);
    }
    
    // Labels des lignes (1-7 à gauche)
    const rowLabels = document.createElement('div');
    rowLabels.className = 'coordinate-labels row-labels';
    
    for (let y = 1; y <= 7; y++) {
        const label = document.createElement('div');
        label.className = 'coordinate-label';
        label.textContent = y;
        
        // Calcul précis de la position centrée
        const cellHeight = 60 / 7; // 60% de hauteur divisé par 7
        const labelY = 22 + (y - 1) * cellHeight + cellHeight / 2;
        label.style.top = `${labelY}%`;
        label.style.left = `1%`; // Ajusté pour être à gauche de la grille
        
        rowLabels.appendChild(label);
    }
    
    mapContainer.appendChild(columnLabels);
    mapContainer.appendChild(rowLabels);
}

function calculateExplorationDuration(distance) {
    const baseDuration = 1800; // 30 minutes
    const multiplier = 1 + 0.6 * Math.max(0, distance - 1);
    return Math.floor(baseDuration * multiplier);
}

function updateStatus() {
    const statusElement = document.getElementById('mapStatus');
    if (!statusElement) return;
    
    const revealedCount = mapData.revealedCells.length;
    const accessibleCount = mapData.accessibleCells.length;
    const exploringCount = mapData.exploringCells.length;
    
    statusElement.innerHTML = `
        <h4>Statut de la Carte</h4>
        <div>📊 Cases révélées: ${revealedCount}/49</div>
        <div>🔍 Cases accessibles: ${accessibleCount}</div>
        <div>🌟 Explorations en cours: ${exploringCount}</div>
        <div style="margin-top: 10px; font-size: 12px;">
            Dernière mise à jour: ${new Date().toLocaleTimeString()}
        </div>
    `;
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast(`✅ Commande copiée: ${text}`);
    } catch (err) {
        // Fallback pour les anciens navigateurs
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast(`✅ Commande copiée: ${text}`);
    }
}

function showToast(message) {
    // Supprimer les toasts existants
    const existingToasts = document.querySelectorAll('.copy-toast');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = 'copy-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Animation d'apparition
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Disparaître après 3 secondes
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function startAutoRefresh() {
    // Rafraîchir toutes les 10 secondes
    setInterval(() => {
        loadMapData();
    }, 10000);
}

// Gestion des erreurs globales
window.addEventListener('error', (event) => {
    console.error('Erreur globale:', event.error);
    showToast('⚠️ Erreur de chargement');
});

// Export des fonctions pour les utiliser dans Next.js
export function initMap() {
    console.log('🗺️ Initialisation de la carte...');
    loadMapData();
    startAutoRefresh();
    
    // Ajouter un bouton de refresh manuel (optionnel)
    const refreshBtn = document.createElement('button');
    refreshBtn.textContent = '🔄 Actualiser';
    refreshBtn.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        padding: 8px 12px;
        background: #8b4513;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        z-index: 1000;
    `;
    refreshBtn.addEventListener('click', loadMapData);
    document.body.appendChild(refreshBtn);
}
