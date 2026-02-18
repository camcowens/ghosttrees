const selectStyle = {
  padding: '0.4rem 0.6rem',
  borderRadius: '6px',
  border: '1px solid rgba(255, 255, 255, 0.16)',
  background: 'rgba(0, 0, 0, 0.22)',
  color: 'inherit',
  minWidth: '100px',
}

export default function YearFilter({
  years,
  startYear,
  endYear,
  onStartYearChange,
  onEndYearChange,
}) {
  return (
    <div className="span2">
      <div className="label">Year range</div>
      <div
        className="value"
        style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <select
          value={startYear ?? ''}
          onChange={(e) => onStartYearChange(e.target.value || null)}
          style={selectStyle}
        >
          <option value="">Start year</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <span>to</span>
        <select
          value={endYear ?? ''}
          onChange={(e) => onEndYearChange(e.target.value || null)}
          style={selectStyle}
        >
          <option value="">End year</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div className="hint" style={{ marginTop: '0.35rem' }}>
        Select a year range to filter, or leave empty to include all years
      </div>
    </div>
  )
}
