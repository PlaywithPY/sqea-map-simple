'use client'
import { useEffect, useState } from 'react'
import './globals.css'

const BACKEND_URL = 'https://sqea-backend.onrender.com';

export default function Home() {
  const [mapData, setMapData] = useState({
    camp: { x: 4, y: 4 },
    revealedCells: [],
    accessibleCells: [],
    exploringCells: [],
    cellDetails: {}
  });
  const [status, setStatus] = useState('📊 Chargement...');

  useEffect(() => {
    loadMapData();
    const interval = setInterval(() => {
      loadMapData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadMapData = async () => {
    try {
      const response = await fetch('/api/map/state');
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      
      setMapData({
        revealedCells: data.revealedCells || [],
        accessibleCells: data.accessibleCells || [],
        exploringCells: data.exploringCells || [],
        cellDetails: data.cellDetails || {},
        camp: { x: 4, y: 4 }
      });

      updateStatus(data);
      
    } catch (error) {
      console.error('❌ Erreur:', error);
      showToast('⚠️ Impossible de charger les données');
      loadDemoData();
    }
  };

  const loadDemoData = () => {
    const demoData = {
      revealedCells: [{ x: 4, y: 4, biome: 'camp' }],
      accessibleCells: [
        { x: 4, y: 3, remaining: 3 },
        { x: 3, y: 4, remaining: 3 }, 
        { x: 4, y: 5, remaining: 4 },
        { x: 5, y: 4, remaining: 4 }
      ],
      exploringCells: [],
      cellDetails: {
        "4-4": { reveal_count: 0, required_reveals: 0, remaining: 0, status: "camp" },
        "4-3": { reveal_count: 2, required_reveals: 5, remaining: 3, status: "hidden" },
        "3-4": { reveal_count: 1, required_reveals: 5, remaining: 4, status: "hidden" }
      }
    };
    
    setMapData({
      ...demoData,
      camp: { x: 4, y: 4 }
    });
    updateStatus(demoData);
  };

  const updateStatus = (data) => {
    const revealedCount = data.revealedCells?.length || 0;
    const accessibleCount = data.accessibleCells?.length || 0;
    const exploringCount = data.exploringCells?.length || 0;
    
    setStatus(`
      📊 Cases révélées: ${revealedCount}/49
      🔍 Cases accessibles: ${accessibleCount}
      🌟 Explorations en cours: ${exploringCount}
      Dernière mise à jour: ${new Date().toLocaleTimeString()}
    `);
  };

  const showToast = (message) => {
    // Implémentation basique du toast
    if (typeof window !== 'undefined') {
      alert(message); // Temporaire - on améliorera plus tard
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`✅ Commande copiée: ${text}`);
    } catch (err) {
      showToast(`✅ Commande copiée: ${text}`);
    }
  };

  const calculateExplorationDuration = (distance) => {
    const baseDuration = 1800;
    const multiplier = 1 + 0.6 * Math.max(0, distance - 1);
    return Math.floor(baseDuration * multiplier);
  };

  // Fonction pour déterminer la classe CSS d'une cellule
  const getCellClass = (x, y) => {
    const cellKey = `${x}-${y}`;
    const isCamp = x === 4 && y === 4;
    const isRevealed = mapData.revealedCells.find(c => c.x === x && c.y === y);
    const isAccessible = mapData.accessibleCells.find(c => c.x === x && c.y === y);
    const isExploring = mapData.exploringCells.find(c => c.x === x && c.y === y);

    let className = 'cell';
    if (isCamp) className += ' camp revealed';
    if (isRevealed) className += ' revealed';
    if (isAccessible && !isRevealed) className += ' accessible';
    if (isExploring) className += ' exploring';

    return className;
  };

  // Fonction pour obtenir le tooltip d'une cellule
  const getCellTooltip = (x, y) => {
    const cellKey = `${x}-${y}`;
    const cellInfo = mapData.cellDetails[cellKey];
    const isCamp = x === 4 && y === 4;
    const isRevealed = mapData.revealedCells.find(c => c.x === x && c.y === y);
    const isAccessible = mapData.accessibleCells.find(c => c.x === x && c.y === y);

    if (isCamp) return "🏕️ Camp de base";
    
    if (isRevealed) {
      const revealedCell = mapData.revealedCells.find(c => c.x === x && c.y === y);
      return `Case révélée\nBiome: ${revealedCell?.biome || 'Plaine'}\nExplorations: ${cellInfo?.reveal_count || 0}/${cellInfo?.required_reveals || 0}`;
    }

    if (isAccessible) {
      const distance = Math.abs(x - 4) + Math.abs(y - 4);
      const duration = calculateExplorationDuration(distance);
      const reward_xp = 10 + (distance * 2);
      const remaining = cellInfo ? cellInfo.remaining : 0;
      
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const durationText = hours > 0 ? `${hours}h ${minutes.toString().padStart(2, '0')}min` : `${minutes}min`;
      
      return `Case accessible\n📏 Distance: ${distance} cases\n⏱️ Durée: ${durationText}\n🎯 Récompense: ${reward_xp} XP\n🔍 Explorations restantes: ${remaining}\n\nCliquez pour copier: !explore ${x} ${y}`;
    }

    return "Case inconnue - Brouillard de guerre";
  };

  // Fonction pour gérer le clic sur une cellule
  const handleCellClick = (x, y) => {
    const isAccessible = mapData.accessibleCells.find(c => c.x === x && c.y === y);
    const isRevealed = mapData.revealedCells.find(c => c.x === x && c.y === y);
    
    if (isAccessible && !isRevealed) {
      copyToClipboard(`!explore ${x} ${y}`);
    }
  };

  // Génération des cellules de la grille
  const renderGridCells = () => {
    const cells = [];
    for (let y = 1; y <= 7; y++) {
      for (let x = 1; x <= 7; x++) {
        const cellKey = `${x}-${y}`;
        const cellInfo = mapData.cellDetails[cellKey];
        const isAccessible = mapData.accessibleCells.find(c => c.x === x && c.y === y);
        const isRevealed = mapData.revealedCells.find(c => c.x === x && c.y === y);
        const remaining = cellInfo ? cellInfo.remaining : 0;

        cells.push(
          <div
            key={cellKey}
            className={getCellClass(x, y)}
            title={getCellTooltip(x, y)}
            onClick={() => handleCellClick(x, y)}
          >
            {isAccessible && !isRevealed && remaining > 0 && (
              <div className="remaining-explorations" title={`${remaining} exploration(s) restante(s)`}>
                {remaining}🔍
              </div>
            )}
          </div>
        );
      }
    }
    return cells;
  };

  // Génération des labels de coordonnées
  const renderCoordinateLabels = () => {
    return (
      <>
        {/* Labels des colonnes (1-7 en haut) */}
        <div className="coordinate-labels column-labels">
          {[1, 2, 3, 4, 5, 6, 7].map(x => (
            <div key={`col-${x}`} className="coordinate-label" style={{ left: `${5 + (x - 1) * (90/7) + (90/7)/2}%` }}>
              {x}
            </div>
          ))}
        </div>
        
        {/* Labels des lignes (1-7 à gauche) */}
        <div className="coordinate-labels row-labels">
          {[1, 2, 3, 4, 5, 6, 7].map(y => (
            <div key={`row-${y}`} className="coordinate-label" style={{ top: `${22 + (y - 1) * (60/7) + (60/7)/2}%` }}>
              {y}
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="container">
      <h1>🗺️ Carte des Terres Inconnues</h1>
      
      <div className="map-container">
        <div className="grid" id="mapGrid">
          {renderGridCells()}
        </div>
        
        {renderCoordinateLabels()}
        
        <div className="legend">
          <h4>Légende</h4>
          <div className="legend-item">🏕️ Camp</div>
          <div className="legend-item">✨ Case accessible</div>
          <div className="legend-item">🌟 Exploration en cours</div>
          <div className="legend-item">🌫️ Brouillard de guerre</div>
          <div className="legend-item">🔍 X = Explorations restantes</div>
          <div className="legend-note">
            <div>📋 <strong>Cliquez sur une case</strong></div>
            <div>pour copier la commande !explore</div>
            <div>🔄 Carte rafraîchie automatiquement</div>
          </div>
        </div>
        
        <div className="status-indicator">
          <h4>Statut de la Carte</h4>
          <div style={{ whiteSpace: 'pre-line' }}>{status}</div>
        </div>
      </div>
      
      <div className="instructions">
        <h3>🎮 Comment explorer ?</h3>
        <p>1. <strong>Survolez une case</strong> pour voir les infos</p>
        <p>2. <strong>Cliquez pour copier</strong> la commande !explore</p>
        <p>3. <strong>Collez dans le chat Twitch</strong> pour lancer l'exploration</p>
      </div>

      <button 
        onClick={loadMapData}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          padding: '8px 12px',
          background: '#8b4513',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        🔄 Actualiser
      </button>
    </div>
  );
}
