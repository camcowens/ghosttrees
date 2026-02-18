export default function FilterStatus({ shownCount, totalCount }) {
  if (totalCount === 0) {
    return (
      <div className="hint">
        No records available.
      </div>
    )
  }

  return (
    <div className="hint">
      Showing{' '}
      <span className="mono">{shownCount.toLocaleString()}</span> of{' '}
      <span className="mono">{totalCount.toLocaleString()}</span> records
    </div>
  )
}

