export default function TreeCountFilter({ minTrees, onMinTreesChange }) {
  const displayValue = minTrees ?? 1

  return (
    <div className="span2">
      <div className="label">Show records with at least this many trees</div>
      <div className="value slider-row">
        <input
          type="range"
          min={1}
          max={112}
          step={1}
          value={displayValue}
          onChange={(e) => onMinTreesChange(Number(e.target.value))}
        />
        <span className="value-pill">
          <span>{displayValue}</span>+
        </span>
      </div>
    </div>
  )
}
