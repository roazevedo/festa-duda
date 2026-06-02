import './AtoHeader.css'

export default function AtoHeader({ number, title, subtitle }) {
  return (
    <div className="ato-header-wrapper">
      <div className="ato-header">
        <span className="ato-number">{number}</span>
        <span className="ato-title">ATO {number} — {title}</span>
      </div>
      {subtitle && <p className="ato-subtitle">{subtitle}</p>}
      <div className="ato-rule" />
    </div>
  )
}
