'use client'
import { useEffect } from 'react'
import './globals.css'
import { initMap } from './mapLogic'

export default function Home() {
  useEffect(() => {
    initMap()
  }, [])

  return (
    <div className="container">
      <h1>🗺️ Carte des Terres Inconnues</h1>
      
      <div className="map-container">
        <div className="grid" id="mapGrid"></div>
        
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
    </div>
  )
}
