function formatRecordType(value) {
  if (value == null || value === '') return null
  return String(value).replace(/_/g, ' ')
}

function DetailRow({ label, value }) {
  const display = value != null && value !== '' ? String(value) : 'null'
  return (
    <div className="span2" style={{ marginTop: '0.5rem' }}>
      <div className="label">{label}</div>
      <div className="value">{display}</div>
    </div>
  )
}

export default function FeatureDetails({ feature, onClear }) {
  if (!feature) {
    return (
      <div className="span2 hint" style={{ marginTop: '0.75rem' }}>
        Click a point on the map to see details.
      </div>
    )
  }

  const p = feature.properties ?? {}
  return (
    <div className="span2" style={{ marginTop: '1rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
        <div className="label" style={{ marginBottom: 0 }}>Record details</div>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="hint"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.2rem 0.4rem',
              fontSize: '0.85rem',
            }}
            aria-label="Clear selection"
          >
            Clear
          </button>
        )}
      </div>
      <DetailRow label="Date" value={p.Date} />
      <DetailRow label="Record Type" value={formatRecordType(p.Record_Type) ?? p.Record_Type} />
      <DetailRow label="Address" value={p.Address} />
      <DetailRow label="Permit Name" value={p.Permit_Name} />
      <DetailRow label="Status" value={p.Status} />
      <DetailRow label="Tree Type" value={p.Tree_Type} />
      <DetailRow label="Number of Trees" value={p.Num_of_Trees} />
      <DetailRow label="Cause of Death" value={p.Cause_of_Death} />
      <DetailRow label="Description" value={p.Description} />
    </div>
  )
}
