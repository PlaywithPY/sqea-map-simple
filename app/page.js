'use client'
import { useEffect, useState } from 'react'
import './globals.css'

// Déplace toute la logique JavaScript ici
const BACKEND_URL = 'https://sqea-backend.onrender.com';

export default function Home() {
  const [mapData, setMapData] = useState({
    camp: { x: 4, y: 4 },
    revealedCells: [],
    accessibleCells: [],
    exploringCells: [],
    cellDetails: {}
  });

  useEffect(() => {
    // Toute la logique de la carte s'exécute uniquement côté client
    loadMapData();
    startAutoRefresh();
  }, []);

  const loadMapData = async () => {
    try {
      console.log("🔄 Chargement des données...");
      const response = await fetch(`${BACKEND_URL}/api/map/state`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      setMapData({
        revealedCells: data.revealedCells || [],
        accessibleCells: data.accessibleCells || [],
        exploringCells: data.exploringCells || [],
        cellDetails: data.cellDetails || {},
        camp: { x: 4, y: 4 }
      });
      
      console.log(`✅ ${data.revealedCells?.length || 0} révélées, ${data.accessibleCells?.length || 0} accessibles`);
      
    } catch (error) {
      console.error('❌ Erreur:', error);
      showToast('⚠️ Impossible de charger les données');
      // Données de démo
      loadDemoData();
    }
  };

  const loadDemoData = () => {
    setMapData({
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
      },
      camp: { x: 4, y: 4 }
    });
  };

  const showToast = (message) => {
    // Implémentation simplifiée du toast
    console.log('Toast:', message);
    // Tu peux ajouter un state pour les toasts si besoin
  };

  const startAutoRefresh = () => {
    // Rafraîchir toutes les 10 secondes
    setInterval(() => {
      loadMapData();
    }, 10000);
  };

  return (
    <div className="container">
      <h1>🗺️ Carte des Terres Inconnues</h1>
      
      <div className="map-container">
        <div className="grid" id="mapGrid">
          {/* Les cellules seront générées par JavaScript */}
        </div>
        
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
        
        <div className="status-indicator" id="mapStatus">
          <h4>Statut de la Carte</h4>
          <div>📊 Chargement...</div>
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
