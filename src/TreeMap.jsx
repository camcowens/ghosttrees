import { useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, useMap, GeoJSON } from 'react-leaflet'
import { createRoot } from 'react-dom/client'
import { House } from 'lucide-react'
import L from 'leaflet'
import 'leaflet.markercluster'

// Use default Leaflet marker icons by pointing to the images from the leaflet package.
// This avoids the common "missing marker icon" issue in many bundlers.
const defaultIcon = new L.Icon({
  iconUrl: new URL(
    '../node_modules/leaflet/dist/images/marker-icon.png',
    import.meta.url,
  ).toString(),
  iconRetinaUrl: new URL(
    '../node_modules/leaflet/dist/images/marker-icon-2x.png',
    import.meta.url,
  ).toString(),
  shadowUrl: new URL(
    '../node_modules/leaflet/dist/images/marker-shadow.png',
    import.meta.url,
  ).toString(),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function popupHtml(props) {
  const parts = []

  if (props?.Address) {
    parts.push(`<div>${escapeHtml(props.Address)}</div>`)
  }
  if (props?.Record_Type) {
    const recordTypeDisplay = String(props.Record_Type).replace(/_/g, ' ')
    parts.push(
      `<div><strong>Record Type:</strong> ${escapeHtml(recordTypeDisplay)}</div>`,
    )
  }
  if (props?.Date) {
    parts.push(`<div><strong>Date:</strong> ${escapeHtml(props.Date)}</div>`)
  }

  return parts.join('')
}

function HomeButton() {
  const map = useMap()
  const homeCenter = [33.749, -84.39]
  const homeZoom = 11

  useEffect(() => {
    const HomeControl = L.Control.extend({
      onAdd: function () {
        const container = L.DomUtil.create('div', 'leaflet-control leaflet-bar')
        const link = L.DomUtil.create('a', '', container)
        link.href = '#'
        link.title = 'Home'
        link.style.cssText =
          'display: flex; align-items: center; justify-content: center; width: 30px; height: 30px;'

        // Render the House icon using React
        const root = createRoot(link)
        root.render(<House size={18} />)

        L.DomEvent.disableClickPropagation(link)
        L.DomEvent.on(link, 'click', function (e) {
          L.DomEvent.stopPropagation(e)
          L.DomEvent.preventDefault(e)
          map.setView(homeCenter, homeZoom)
        })

        return container
      },
    })

    const homeControl = new HomeControl({ position: 'topleft' })
    map.addControl(homeControl)

    return () => {
      map.removeControl(homeControl)
    }
  }, [map])

  return null
}

function ClusterLayer({ points, startYear, endYear, focusFeatureId }) {
  const map = useMap()
  const clusterGroupRef = useRef(null)
  const markerByIdRef = useRef(new Map())

  const filteredPoints = useMemo(() => {
    if (!startYear || !endYear) return points
    
    const start = parseInt(startYear, 10)
    const end = parseInt(endYear, 10)
    
    return points.filter((p) => {
      if (!p.year) return false
      const year = parseInt(p.year, 10)
      return year >= start && year <= end
    })
  }, [points, startYear, endYear])

  useEffect(() => {
    const clusterGroup = L.markerClusterGroup({
      // Keeps movement smooth while dragging/zooming.
      chunkedLoading: true,
      chunkProgress: undefined,
      showCoverageOnHover: false,
    })

    clusterGroupRef.current = clusterGroup
    map.addLayer(clusterGroup)

    return () => {
      map.removeLayer(clusterGroup)
      clusterGroupRef.current = null
      markerByIdRef.current = new Map()
    }
  }, [map])

  useEffect(() => {
    const clusterGroup = clusterGroupRef.current
    if (!clusterGroup) return

    clusterGroup.clearLayers()
    const nextMarkerById = new Map()

    for (const p of filteredPoints) {
      const marker = L.marker([p.lat, p.lon], { icon: defaultIcon })
      marker.bindPopup(popupHtml(p.props) || '<div>(no details)</div>', {
        maxWidth: 320,
      })
      nextMarkerById.set(p.id, marker)
      clusterGroup.addLayer(marker)
    }

    markerByIdRef.current = nextMarkerById
  }, [filteredPoints])

  useEffect(() => {
    if (!focusFeatureId) return
    const clusterGroup = clusterGroupRef.current
    if (!clusterGroup) return

    const marker = markerByIdRef.current.get(focusFeatureId)
    if (!marker) return

    // Ensures the marker becomes visible (expands clusters) before opening popup.
    clusterGroup.zoomToShowLayer(marker, () => {
      marker.openPopup()
      map.panTo(marker.getLatLng())
    })
  }, [focusFeatureId, map])

  return null
}

function CityLimitsLayer({ cityLimits }) {
  if (!cityLimits) return null

  const style = {
    color: '#2563eb',
    weight: 3,
    opacity: 0.8,
    fillColor: '#3b82f6',
    fillOpacity: 0.1,
  }

  return <GeoJSON data={cityLimits} style={style} />
}

function TreeMap({
  features = [],
  startYear = null,
  endYear = null,
  focusFeatureId = null,
  cityLimits = null,
}) {
  const center = [33.749, -84.39]
  const zoom = 11

  const points = useMemo(() => {
    if (!Array.isArray(features)) return []

    const out = []
    for (let idx = 0; idx < features.length; idx++) {
      const f = features[idx]
      if (
        !f ||
        !f.geometry ||
        f.geometry.type !== 'Point' ||
        !Array.isArray(f.geometry.coordinates) ||
        f.geometry.coordinates.length < 2
      ) {
        continue
      }

      const [lon, lat] = f.geometry.coordinates
      if (
        typeof lat !== 'number' ||
        Number.isNaN(lat) ||
        typeof lon !== 'number' ||
        Number.isNaN(lon)
      ) {
        continue
      }

      const props = f.properties ?? {}
      const id = f.id ?? String(idx)
      const year = props?.Year ? String(props.Year) : null

      out.push({ id, lat, lon, year, props })
    }

    return out
  }, [features])

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <HomeButton />
      <CityLimitsLayer cityLimits={cityLimits} />
      <ClusterLayer
        points={points}
        startYear={startYear}
        endYear={endYear}
        focusFeatureId={focusFeatureId}
      />
    </MapContainer>
  )
}

export default TreeMap

