import { useEffect, useMemo, useState } from 'react'
import './App.css'
import TreeMap from './TreeMap.jsx'
import YearFilter from './YearFilter.jsx'

function App() {
  const dataUrl = useMemo(
    () => `${import.meta.env.BASE_URL}data.geojson`,
    [],
  )

  const cityLimitsUrl = useMemo(
    () => `${import.meta.env.BASE_URL}atlanta.geojson`,
    [],
  )

  const [startYear, setStartYear] = useState(null)
  const [endYear, setEndYear] = useState(null)
  const [focusFeatureId, setFocusFeatureId] = useState(null)
  const [cityLimits, setCityLimits] = useState(null)

  const [loadState, setLoadState] = useState({
    status: 'idle',
    error: null,
    datasetName: null,
    featureCount: null,
    samplePropertyKeys: [],
    recordTypeCounts: [],
    years: [],
    yearCounts: {},
    features: [],
  })

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setLoadState((s) => ({ ...s, status: 'loading', error: null }))
      try {
        const res = await fetch(dataUrl, { signal: controller.signal })
        if (!res.ok) {
          throw new Error(`Failed to fetch ${dataUrl} (${res.status})`)
        }

        const geojson = await res.json()
        const features = geojson.features
        if (!Array.isArray(features)) {
          throw new Error('GeoJSON is missing a top-level features[] array')
        }
        const first = features[0]
        const samplePropertyKeys = first?.properties
          ? Object.keys(first.properties)
          : []

        const counts = new Map()
        for (const f of features) {
          const t = f?.properties?.Record_Type
          if (!t) continue
          counts.set(t, (counts.get(t) ?? 0) + 1)
        }
        const recordTypeCounts = [...counts.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 12)

        const yearCounts = new Map()
        for (const f of features) {
          const y = f?.properties?.Year
          if (!y) continue
          const ys = String(y)
          yearCounts.set(ys, (yearCounts.get(ys) ?? 0) + 1)
        }
        const years = [...yearCounts.keys()].sort()

        setLoadState({
          status: 'loaded',
          error: null,
          datasetName: geojson.name ?? null,
          featureCount: features.length,
          samplePropertyKeys,
          recordTypeCounts,
          years,
          yearCounts: Object.fromEntries(yearCounts.entries()),
          features,
        })

        // Default to all years (no filter).
        setStartYear(null)
        setEndYear(null)
      } catch (err) {
        if (controller.signal.aborted) return
        setLoadState((s) => ({
          ...s,
          status: 'error',
          error: err instanceof Error ? err.message : String(err),
        }))
      }
    }

    load()
    return () => controller.abort()
  }, [dataUrl])

  useEffect(() => {
    const controller = new AbortController()

    async function loadCityLimits() {
      try {
        const res = await fetch(cityLimitsUrl, { signal: controller.signal })
        if (!res.ok) {
          throw new Error(`Failed to fetch ${cityLimitsUrl} (${res.status})`)
        }
        const geojson = await res.json()
        setCityLimits(geojson)
      } catch (err) {
        if (controller.signal.aborted) return
        console.warn('Failed to load city limits:', err)
        setCityLimits(null)
      }
    }

    loadCityLimits()
    return () => controller.abort()
  }, [cityLimitsUrl])

  const yearRangeCount = useMemo(() => {
    if (loadState.status !== 'loaded' || !startYear || !endYear) return null
    
    let count = 0
    const start = parseInt(startYear, 10)
    const end = parseInt(endYear, 10)
    
    for (const [year, yearCount] of Object.entries(loadState.yearCounts)) {
      const y = parseInt(year, 10)
      if (y >= start && y <= end) {
        count += yearCount
      }
    }
    
    return count
  }, [loadState.status, loadState.yearCounts, startYear, endYear])

  function handleStartYearChange(year) {
    setStartYear(year)
    setFocusFeatureId(null)
    if (year && endYear && parseInt(year, 10) > parseInt(endYear, 10)) {
      setEndYear(year)
    }
  }

  function handleEndYearChange(year) {
    setEndYear(year)
    setFocusFeatureId(null)
    if (year && startYear && parseInt(year, 10) < parseInt(startYear, 10)) {
      setStartYear(year)
    }
  }

  return (
    <>
      <main className="main main--split">
        <section className="panel panel--left">
          <h2>
            <img
              src={`${import.meta.env.BASE_URL}tree.svg`}
              alt=""
              style={{ width: '1.2em', height: '1.2em', verticalAlign: 'middle', marginRight: '0.5rem' }}
            />
            Ghost Trees
          </h2>
          {loadState.status === 'loading' && <p>Loading dataset…</p>}
          {loadState.status === 'error' && (
            <p className="error">
              Failed to load dataset: <code>{loadState.error}</code>
            </p>
          )}
          {loadState.status === 'loaded' && (
            <div className="grid">
              <YearFilter
                years={loadState.years}
                startYear={startYear}
                endYear={endYear}
                yearRangeCount={yearRangeCount}
                onStartYearChange={handleStartYearChange}
                onEndYearChange={handleEndYearChange}
              />
            </div>
          )}
        </section>

        <section className="panel panel--right">
          <h2>Map view</h2>
          {loadState.status === 'loading' && (
            <p>Loading tree locations… points will appear shortly.</p>
          )}
          {loadState.status === 'error' && (
            <p className="error">
              Failed to load dataset for markers; showing basemap only.{' '}
              <code>{loadState.error}</code>
            </p>
          )}
          <div className="mapRoot">
            <TreeMap
              features={
                loadState.status === 'loaded' ? loadState.features : []
              }
              startYear={startYear}
              endYear={endYear}
              focusFeatureId={focusFeatureId}
              cityLimits={cityLimits}
            />
          </div>
        </section>
      </main>
    </>
  )
}

export default App
