export default function FilterStatus({ shownCount, totalCount }) {
  if (totalCount === 0) {
    return (
      <div className="hint" style={{ marginBottom: '0.5rem' }}>
        No records available.
      </div>
    )
  }

  return (
    <div className="hint" style={{ marginBottom: '0.5rem' }}>
      Showing{' '}
      <span className="mono">{shownCount.toLocaleString()}</span> of{' '}
      <span className="mono">{totalCount.toLocaleString()}</span> records
    </div>
  )
}

