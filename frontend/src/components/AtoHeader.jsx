import './AtoHeader.css'

// `simple` remove o numeral e o prefixo "ATO" — usado pelos
// templates modulares; o template teatro mantém o visual original
export default function AtoHeader({ number, title, subtitle, simple = false }) {
  return (
    <div className="ato-header-wrapper">
      <div className="ato-header">
        {!simple && <span className="ato-numeral">{number}</span>}
        <div className="ato-header-text">
          <span className="ato-title">
            {simple ? title : <>ATO {number} — {title}</>}
          </span>
          {subtitle && <p className="ato-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="ato-rule" />
    </div>
  )
}
