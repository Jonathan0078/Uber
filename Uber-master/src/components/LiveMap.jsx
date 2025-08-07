import React, { useEffect, useRef } from 'react'

// Este componente exibe um mapa ao vivo usando Leaflet + OpenStreetMap via CDN
// Props:
//   center: [lat, lng] (opcional, padrão: localização do usuário)
//   markers: array de { lat, lng, label } (opcional)
export default function LiveMap({ center, markers = [] }) {
  const mapRef = useRef(null)
  const leafletRef = useRef(null)

  useEffect(() => {
    // Carrega Leaflet do window (via CDN)
    if (!window.L) return
    leafletRef.current = window.L
    let map
    // Centro padrão: Brasil
    const defaultCenter = [-14.2350, -51.9253]
    const mapCenter = center || defaultCenter
    const mapZoom = center ? 14 : 4
    if (!mapRef.current._leaflet_id) {
      map = window.L.map(mapRef.current).setView(mapCenter, mapZoom)
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map)
      // Adiciona marcador do usuário
      if (center) {
        window.L.marker(center).addTo(map).bindPopup('Você está aqui').openPopup()
      }
      // Adiciona outros marcadores
      markers.forEach(m => {
        window.L.marker([m.lat, m.lng]).addTo(map).bindPopup(m.label || '')
      })
    }
    return () => {
      if (mapRef.current && mapRef.current._leaflet_id) {
        mapRef.current._leaflet_id = null
      }
    }
  }, [center, markers])

  return (
    <div style={{ width: '100%', height: '350px', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px #0001' }}>
      <div ref={mapRef} id="leaflet-map" style={{ width: '100%', height: '100%' }}></div>
    </div>
  )
}
