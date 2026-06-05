import './AtoHeader.css'

export default function AtoHeader({ number, title, subtitle }) {
  return (
    <div className="ato-header-wrapper">
      <div className="ato-header">
        <span className="ato-numeral">{number}</span>
        <div className="ato-header-text">
          <span className="ato-title">ATO {number} — {title}</span>
          {subtitle && <p className="ato-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="ato-rule" />
    </div>
  )
}
