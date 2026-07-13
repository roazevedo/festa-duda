import { useEvent } from '../contexts/useEvent'
import { decorationOf } from '../decorations'
import './PageOrnaments.css'

// ════════════════════════════════════════════════════════════
// Ornamentos laterais — composições que preenchem as margens
// livres do site em telas largas, nas cores do tema. O desenho
// é feito para a lateral esquerda; a direita é espelhada no CSS.
// ════════════════════════════════════════════════════════════

function Classica() {
  return (
    <svg viewBox="0 0 200 1000" preserveAspectRatio="xMidYMid meet" className="ornament-svg" aria-hidden="true">
      {/* Leque no canto superior */}
      <g stroke="var(--gold)" fill="none">
        <path d="M 0 150 A 150 150 0 0 0 150 0" strokeWidth="2" />
        <path d="M 0 110 A 110 110 0 0 0 110 0" strokeWidth="1.4" opacity="0.75" />
        <path d="M 0 70 A 70 70 0 0 0 70 0" strokeWidth="1" opacity="0.5" />
      </g>
      <g stroke="var(--red)" strokeWidth="1.3" opacity="0.85">
        <line x1="0" y1="0" x2="139" y2="57" />
        <line x1="0" y1="0" x2="106" y2="106" />
        <line x1="0" y1="0" x2="57" y2="139" />
      </g>

      {/* Corrente central de losangos */}
      <circle cx="60" cy="235" r="5.5" fill="var(--gold)" />
      <line x1="60" y1="248" x2="60" y2="405" stroke="var(--gold)" strokeWidth="2" />
      <line x1="34" y1="326" x2="86" y2="326" stroke="var(--gold)" strokeWidth="1.3" opacity="0.7" />
      <rect
        x="49" y="420" width="22" height="22"
        fill="var(--gold)" transform="rotate(45 60 431)"
      />
      <rect
        x="42" y="464" width="36" height="36"
        fill="none" stroke="var(--red)" strokeWidth="2.5"
        transform="rotate(45 60 482)"
      />
      <circle cx="60" cy="482" r="5" fill="var(--red)" />
      <rect
        x="49" y="522" width="22" height="22"
        fill="var(--gold)" transform="rotate(45 60 533)"
      />
      <line x1="60" y1="558" x2="60" y2="715" stroke="var(--gold)" strokeWidth="2" />
      <line x1="34" y1="637" x2="86" y2="637" stroke="var(--gold)" strokeWidth="1.3" opacity="0.7" />
      <circle cx="60" cy="728" r="5.5" fill="var(--gold)" />

      {/* Curvas de acompanhamento */}
      <path
        d="M 130 250 Q 175 480 130 712"
        fill="none" stroke="var(--red)" strokeWidth="1.4" opacity="0.5"
      />

      {/* Leque no canto inferior */}
      <g stroke="var(--gold)" fill="none">
        <path d="M 0 850 A 150 150 0 0 1 150 1000" strokeWidth="2" />
        <path d="M 0 890 A 110 110 0 0 1 110 1000" strokeWidth="1.4" opacity="0.75" />
        <path d="M 0 930 A 70 70 0 0 1 70 1000" strokeWidth="1" opacity="0.5" />
      </g>
      <g stroke="var(--red)" strokeWidth="1.3" opacity="0.85">
        <line x1="0" y1="1000" x2="139" y2="943" />
        <line x1="0" y1="1000" x2="106" y2="894" />
        <line x1="0" y1="1000" x2="57" y2="861" />
      </g>
    </svg>
  )
}

const HEART =
  'M12 19c-4.5-3.5-8-6.6-8-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 3.4-3.5 6.5-8 10z'

function Coracoes() {
  const hearts = [
    { x: 30,  y: 15,  s: 2.8, color: 'var(--red)',  o: 1 },
    { x: 120, y: 60,  s: 1.3, color: 'var(--gold)', o: 0.75 },
    { x: 55,  y: 140, s: 1.8, color: 'var(--red)',  o: 0.9 },
    { x: 135, y: 215, s: 1.0, color: 'var(--gold)', o: 0.6 },
    { x: 25,  y: 275, s: 3.6, color: 'var(--red)',  o: 1,   outline: true },
    { x: 120, y: 360, s: 1.6, color: 'var(--gold)', o: 0.85 },
    { x: 45,  y: 430, s: 2.2, color: 'var(--red)',  o: 0.95 },
    { x: 140, y: 490, s: 0.9, color: 'var(--red)',  o: 0.6 },
    { x: 70,  y: 545, s: 3.0, color: 'var(--gold)', o: 0.9, outline: true },
    { x: 20,  y: 645, s: 1.5, color: 'var(--gold)', o: 0.75 },
    { x: 115, y: 700, s: 2.4, color: 'var(--red)',  o: 1 },
    { x: 40,  y: 780, s: 1.1, color: 'var(--gold)', o: 0.65 },
    { x: 90,  y: 840, s: 1.9, color: 'var(--red)',  o: 0.9 },
    { x: 25,  y: 915, s: 2.9, color: 'var(--red)',  o: 1 },
    { x: 130, y: 940, s: 1.2, color: 'var(--gold)', o: 0.7 },
  ]
  return (
    <svg viewBox="0 0 200 1000" preserveAspectRatio="xMidYMid meet" className="ornament-svg" aria-hidden="true">
      {hearts.map(({ x, y, s, color, o, outline }, i) => (
        <path
          key={i}
          d={HEART}
          fill={outline ? 'none' : color}
          stroke={outline ? color : 'none'}
          strokeWidth={outline ? 1.6 / s : 0}
          opacity={o}
          transform={`translate(${x} ${y}) scale(${s})`}
        />
      ))}
    </svg>
  )
}

// Estrela de quatro pontas com lados curvos (brilho)
function sparkle(cx, cy, r) {
  return [
    `M ${cx} ${cy - r}`,
    `Q ${cx} ${cy} ${cx + r} ${cy}`,
    `Q ${cx} ${cy} ${cx} ${cy + r}`,
    `Q ${cx} ${cy} ${cx - r} ${cy}`,
    `Q ${cx} ${cy} ${cx} ${cy - r}`,
    'Z',
  ].join(' ')
}

function Estrelas() {
  const stars = [
    { x: 50,  y: 45,  r: 34, color: 'var(--gold)', o: 1 },
    { x: 140, y: 110, r: 12, color: 'var(--red)',  o: 0.8 },
    { x: 30,  y: 200, r: 16, color: 'var(--gold)', o: 0.85 },
    { x: 110, y: 265, r: 26, color: 'var(--red)',  o: 1 },
    { x: 165, y: 350, r: 10, color: 'var(--gold)', o: 0.7 },
    { x: 55,  y: 420, r: 30, color: 'var(--gold)', o: 0.95 },
    { x: 140, y: 505, r: 14, color: 'var(--red)',  o: 0.8 },
    { x: 35,  y: 580, r: 18, color: 'var(--red)',  o: 0.85 },
    { x: 100, y: 660, r: 32, color: 'var(--gold)', o: 1 },
    { x: 170, y: 730, r: 9,  color: 'var(--gold)', o: 0.65 },
    { x: 45,  y: 800, r: 22, color: 'var(--red)',  o: 0.9 },
    { x: 130, y: 880, r: 15, color: 'var(--gold)', o: 0.8 },
    { x: 60,  y: 950, r: 28, color: 'var(--gold)', o: 1 },
  ]
  const dots = [
    [95, 70], [25, 130], [160, 190], [70, 320], [20, 470],
    [175, 560], [90, 555], [150, 620], [25, 700], [110, 775],
    [170, 830], [35, 890],
  ]
  return (
    <svg viewBox="0 0 200 1000" preserveAspectRatio="xMidYMid meet" className="ornament-svg" aria-hidden="true">
      {stars.map(({ x, y, r, color, o }, i) => (
        <path key={i} d={sparkle(x, y, r)} fill={color} opacity={o} />
      ))}
      {dots.map(([x, y], i) => (
        <circle key={`d${i}`} cx={x} cy={y} r="3" fill="var(--gold)" opacity="0.6" />
      ))}
    </svg>
  )
}

// Flor de cinco pétalas
function Flower({ cx, cy, r, petalColor, centerColor, o = 1, outline = false }) {
  return (
    <g opacity={o}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse
          key={a}
          cx={cx} cy={cy - r * 0.55}
          rx={r * 0.32} ry={r * 0.55}
          fill={outline ? 'none' : petalColor}
          stroke={outline ? petalColor : 'none'}
          strokeWidth={outline ? 2 : 0}
          transform={`rotate(${a} ${cx} ${cy})`}
        />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.2} fill={centerColor} />
    </g>
  )
}

function Flores() {
  return (
    <svg viewBox="0 0 200 1000" preserveAspectRatio="xMidYMid meet" className="ornament-svg" aria-hidden="true">
      <Flower cx={55}  cy={85}  r={42} petalColor="var(--gold)" centerColor="var(--red)" />
      <Flower cx={140} cy={215} r={24} petalColor="var(--red)"  centerColor="var(--gold)" o={0.8} />
      <Flower cx={35}  cy={340} r={30} petalColor="var(--red)"  centerColor="var(--gold)" outline />
      <Flower cx={120} cy={470} r={45} petalColor="var(--gold)" centerColor="var(--red)" />
      <Flower cx={45}  cy={610} r={22} petalColor="var(--gold)" centerColor="var(--red)" o={0.7} />
      <Flower cx={140} cy={725} r={34} petalColor="var(--red)"  centerColor="var(--gold)" o={0.9} />
      <Flower cx={60}  cy={880} r={46} petalColor="var(--gold)" centerColor="var(--red)" outline />
      <circle cx="105" cy="150" r="4" fill="var(--gold)" opacity="0.6" />
      <circle cx="80"  cy="395" r="4" fill="var(--red)"  opacity="0.5" />
      <circle cx="160" cy="560" r="4" fill="var(--gold)" opacity="0.6" />
      <circle cx="100" cy="790" r="4" fill="var(--red)"  opacity="0.5" />
      <circle cx="150" cy="950" r="4" fill="var(--gold)" opacity="0.6" />
    </svg>
  )
}

// Folha simples apontando para a direita a partir da base
function Leaf({ x, y, angle, len, color, o = 0.85 }) {
  const d = `M 0 0 Q ${len * 0.5} ${-len * 0.38} ${len} 0 Q ${len * 0.5} ${len * 0.38} 0 0 Z`
  return (
    <path
      d={d} fill={color} opacity={o}
      transform={`translate(${x} ${y}) rotate(${angle})`}
    />
  )
}

function Folhagem() {
  return (
    <svg viewBox="0 0 200 1000" preserveAspectRatio="xMidYMid meet" className="ornament-svg" aria-hidden="true">
      {/* Ramo principal serpenteando a lateral */}
      <path
        d="M 55 0 C 110 170 15 330 70 500 C 125 670 20 830 75 1000"
        fill="none" stroke="var(--gold)" strokeWidth="2.5"
      />
      <Leaf x={72}  y={65}  angle={-35} len={46} color="var(--gold)" />
      <Leaf x={80}  y={130} angle={150} len={38} color="var(--red)" o={0.7} />
      <Leaf x={68}  y={205} angle={-25} len={50} color="var(--gold)" />
      <Leaf x={50}  y={280} angle={160} len={40} color="var(--red)" o={0.7} />
      <Leaf x={42}  y={355} angle={-40} len={46} color="var(--gold)" />
      <Leaf x={48}  y={430} angle={145} len={36} color="var(--red)" o={0.7} />
      <Leaf x={65}  y={505} angle={-30} len={52} color="var(--gold)" />
      <Leaf x={85}  y={580} angle={155} len={40} color="var(--red)" o={0.7} />
      <Leaf x={90}  y={655} angle={-25} len={48} color="var(--gold)" />
      <Leaf x={70}  y={730} angle={160} len={38} color="var(--red)" o={0.7} />
      <Leaf x={45}  y={805} angle={-40} len={46} color="var(--gold)" />
      <Leaf x={42}  y={880} angle={150} len={40} color="var(--red)" o={0.7} />
      <Leaf x={58}  y={950} angle={-30} len={50} color="var(--gold)" />
      <circle cx="130" cy="240" r="4" fill="var(--gold)" opacity="0.5" />
      <circle cx="140" cy="540" r="4" fill="var(--red)"  opacity="0.4" />
      <circle cx="135" cy="815" r="4" fill="var(--gold)" opacity="0.5" />
    </svg>
  )
}

// Balão com nó e barbante ondulado
function Balloon({ cx, cy, r, color, o = 1, outline = false }) {
  return (
    <g opacity={o}>
      <ellipse
        cx={cx} cy={cy} rx={r * 0.82} ry={r}
        fill={outline ? 'none' : color}
        stroke={outline ? color : 'none'}
        strokeWidth={outline ? 2.2 : 0}
      />
      <path
        d={`M ${cx - r * 0.16} ${cy + r} L ${cx} ${cy + r + r * 0.18} L ${cx + r * 0.16} ${cy + r} Z`}
        fill={color}
      />
      <path
        d={`M ${cx} ${cy + r + r * 0.18} q ${r * 0.4} ${r * 0.5} 0 ${r} q ${-r * 0.4} ${r * 0.5} 0 ${r}`}
        fill="none" stroke={color} strokeWidth="1.6" opacity="0.8"
      />
    </g>
  )
}

function Baloes() {
  return (
    <svg viewBox="0 0 200 1000" preserveAspectRatio="xMidYMid meet" className="ornament-svg" aria-hidden="true">
      <Balloon cx={55}  cy={70}  r={44} color="var(--red)" />
      <Balloon cx={140} cy={180} r={28} color="var(--gold)" o={0.85} />
      <Balloon cx={45}  cy={320} r={34} color="var(--gold)" outline />
      <Balloon cx={125} cy={430} r={48} color="var(--red)" o={0.95} />
      <Balloon cx={40}  cy={580} r={26} color="var(--red)" o={0.7} />
      <Balloon cx={135} cy={680} r={36} color="var(--gold)" />
      <Balloon cx={60}  cy={800} r={50} color="var(--red)" outline />
      <Balloon cx={150} cy={920} r={24} color="var(--gold)" o={0.8} />
    </svg>
  )
}

function Confete() {
  const pieces = [
    { t: 'c', x: 40,  y: 30,  s: 7,  color: 'var(--red)',  o: 0.9 },
    { t: 'r', x: 120, y: 70,  s: 14, a: 30,  color: 'var(--gold)', o: 0.85 },
    { t: 't', x: 70,  y: 130, s: 16, a: -15, color: 'var(--gold)', o: 0.8 },
    { t: 'c', x: 160, y: 175, s: 5,  color: 'var(--gold)', o: 0.7 },
    { t: 'r', x: 30,  y: 230, s: 18, a: -40, color: 'var(--red)',  o: 0.9 },
    { t: 'c', x: 110, y: 290, s: 9,  color: 'var(--red)',  o: 0.75 },
    { t: 't', x: 165, y: 350, s: 14, a: 45,  color: 'var(--red)',  o: 0.8 },
    { t: 'r', x: 60,  y: 400, s: 15, a: 15,  color: 'var(--gold)', o: 0.9 },
    { t: 'c', x: 25,  y: 470, s: 6,  color: 'var(--gold)', o: 0.7 },
    { t: 't', x: 130, y: 520, s: 18, a: -30, color: 'var(--gold)', o: 0.85 },
    { t: 'r', x: 45,  y: 590, s: 16, a: 60,  color: 'var(--red)',  o: 0.8 },
    { t: 'c', x: 155, y: 640, s: 8,  color: 'var(--red)',  o: 0.9 },
    { t: 't', x: 85,  y: 700, s: 13, a: 20,  color: 'var(--red)',  o: 0.75 },
    { t: 'r', x: 140, y: 770, s: 17, a: -20, color: 'var(--gold)', o: 0.85 },
    { t: 'c', x: 35,  y: 830, s: 7,  color: 'var(--gold)', o: 0.8 },
    { t: 't', x: 110, y: 890, s: 16, a: -45, color: 'var(--gold)', o: 0.85 },
    { t: 'c', x: 60,  y: 950, s: 9,  color: 'var(--red)',  o: 0.9 },
    { t: 'r', x: 160, y: 965, s: 13, a: 35,  color: 'var(--red)',  o: 0.7 },
  ]
  return (
    <svg viewBox="0 0 200 1000" preserveAspectRatio="xMidYMid meet" className="ornament-svg" aria-hidden="true">
      {/* Serpentinas */}
      <path
        d="M 90 0 q 22 45 0 90 q -22 45 0 90 q 22 45 0 90"
        fill="none" stroke="var(--gold)" strokeWidth="2.4" opacity="0.75"
      />
      <path
        d="M 40 620 q 22 45 0 90 q -22 45 0 90 q 22 45 0 90"
        fill="none" stroke="var(--red)" strokeWidth="2.4" opacity="0.65"
      />
      {pieces.map((p, i) => {
        if (p.t === 'c') {
          return <circle key={i} cx={p.x} cy={p.y} r={p.s} fill={p.color} opacity={p.o} />
        }
        if (p.t === 'r') {
          return (
            <rect
              key={i} x={p.x} y={p.y} width={p.s} height={p.s * 0.45}
              fill={p.color} opacity={p.o}
              transform={`rotate(${p.a} ${p.x} ${p.y})`}
            />
          )
        }
        return (
          <path
            key={i}
            d={`M ${p.x} ${p.y} l ${p.s} ${p.s * 0.35} l ${-p.s * 0.7} ${p.s * 0.7} Z`}
            fill={p.color} opacity={p.o}
            transform={`rotate(${p.a} ${p.x} ${p.y})`}
          />
        )
      })}
    </svg>
  )
}

// Nuvem fofa com base reta
function Cloud({ cx, cy, s, color, o = 1, outline = false }) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`} opacity={o}>
      <path
        d="M -32 10 A 12 12 0 0 1 -22 -6 A 15 15 0 0 1 4 -14 A 13 13 0 0 1 28 -2 A 9 9 0 0 1 30 10 Z"
        fill={outline ? 'none' : color}
        stroke={outline ? color : 'none'}
        strokeWidth={outline ? 2 : 0}
      />
    </g>
  )
}

function Nuvens() {
  return (
    <svg viewBox="0 0 200 1000" preserveAspectRatio="xMidYMid meet" className="ornament-svg" aria-hidden="true">
      <Cloud cx={60}  cy={90}  s={1.6} color="var(--gold)" />
      <path d={sparkle(140, 160, 10)} fill="var(--red)" opacity="0.7" />
      <Cloud cx={130} cy={250} s={1.0} color="var(--red)" o={0.6} />
      <Cloud cx={45}  cy={390} s={1.3} color="var(--gold)" outline />
      <path d={sparkle(150, 460, 14)} fill="var(--gold)" opacity="0.8" />
      <Cloud cx={120} cy={560} s={1.7} color="var(--gold)" />
      <path d={sparkle(40, 650, 9)} fill="var(--red)" opacity="0.6" />
      <Cloud cx={55}  cy={740} s={1.1} color="var(--red)" o={0.6} />
      <path d={sparkle(150, 810, 12)} fill="var(--gold)" opacity="0.8" />
      <Cloud cx={115} cy={910} s={1.4} color="var(--gold)" outline />
      <circle cx="95" cy="330" r="3.5" fill="var(--gold)" opacity="0.6" />
      <circle cx="70" cy="500" r="3.5" fill="var(--red)"  opacity="0.5" />
      <circle cx="160" cy="700" r="3.5" fill="var(--gold)" opacity="0.6" />
    </svg>
  )
}

// ── Acessórios de bebê ───────────────────────────────────────

function Mamadeira({ x, y, s, color, o = 0.9, a = 0 }) {
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`}
      opacity={o} stroke={color} fill="none"
      strokeWidth="3" strokeLinecap="round"
    >
      <ellipse cx="0" cy="-34" rx="6" ry="8" fill={color} stroke="none" />
      <rect x="-11" y="-26" width="22" height="9" rx="2" />
      <rect x="-14" y="-13" width="28" height="46" rx="10" />
      <line x1="-6" y1="1" x2="6" y2="1" />
      <line x1="-6" y1="13" x2="6" y2="13" />
    </g>
  )
}

function Chupeta({ x, y, s, color, o = 0.9, a = 0 }) {
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`}
      opacity={o} stroke={color} fill="none" strokeWidth="3"
    >
      <circle cx="0" cy="-15" r="8" fill={color} stroke="none" />
      <ellipse cx="0" cy="0" rx="18" ry="10" />
      <circle cx="0" cy="15" r="8" />
    </g>
  )
}

function Chocalho({ x, y, s, color, o = 0.9, a = 0 }) {
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`}
      opacity={o} stroke={color} fill="none"
      strokeWidth="3" strokeLinecap="round"
    >
      <circle cx="0" cy="-16" r="14" />
      <line x1="-9" y1="-16" x2="9" y2="-16" />
      <line x1="0" y1="-2" x2="0" y2="24" />
      <circle cx="0" cy="29" r="5" fill={color} stroke="none" />
    </g>
  )
}

function Neném({ x, y, s, color, o = 0.9 }) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${s})`}
      opacity={o} stroke={color} fill="none"
      strokeWidth="3" strokeLinecap="round"
    >
      <circle cx="0" cy="0" r="18" />
      <path d="M 0 -18 Q -3 -27 7 -26" />
      <circle cx="-6" cy="-2" r="2" fill={color} stroke="none" />
      <circle cx="6" cy="-2" r="2" fill={color} stroke="none" />
      <path d="M -5 7 Q 0 12 5 7" />
    </g>
  )
}

function Bebe() {
  return (
    <svg viewBox="0 0 200 1000" preserveAspectRatio="xMidYMid meet" className="ornament-svg" aria-hidden="true">
      <Mamadeira x={55}  y={75}  s={1.3} color="var(--red)"  a={-12} />
      <Chupeta   x={140} y={175} s={1.1} color="var(--gold)" a={15} />
      <Neném     x={50}  y={295} s={1.4} color="var(--gold)" />
      <Chocalho  x={140} y={400} s={1.2} color="var(--red)"  a={25} />
      <path d={sparkle(85, 480, 9)} fill="var(--gold)" opacity="0.6" />
      <Chupeta   x={45}  y={560} s={1.4} color="var(--red)"  a={-18} />
      <Mamadeira x={140} y={670} s={1.5} color="var(--gold)" a={14} />
      <Neném     x={55}  y={800} s={1.1} color="var(--red)" />
      <path d={sparkle(130, 860, 8)} fill="var(--red)" opacity="0.5" />
      <Chocalho  x={125} y={945} s={1.3} color="var(--gold)" a={-20} />
      <circle cx="105" cy="130" r="3.5" fill="var(--gold)" opacity="0.55" />
      <circle cx="90"  cy="380" r="3.5" fill="var(--red)"  opacity="0.45" />
      <circle cx="160" cy="520" r="3.5" fill="var(--gold)" opacity="0.55" />
      <circle cx="95"  cy="720" r="3.5" fill="var(--gold)" opacity="0.55" />
    </svg>
  )
}

// ── Acessórios de glamour ────────────────────────────────────

function Salto({ x, y, s, color, o = 0.95, flip = false }) {
  return (
    <path
      d="M 0 44 Q 14 47 25 40 Q 38 33 44 20 L 45 6 Q 49 4 51 8 L 49 26 Q 46 36 38 42 L 39 58 L 34 58 L 34 44 Q 22 51 8 50 Q 1 49 0 44 Z"
      fill={color} opacity={o}
      transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}
    />
  )
}

function Colar({ x, y, s, color, o = 0.9 }) {
  const pearls = [15, 40, 65, 90, 115, 140, 165].map((deg) => {
    const rad = (deg * Math.PI) / 180
    return [28 * Math.cos(rad), 28 * Math.sin(rad)]
  })
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      {pearls.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3.4" fill={color} />
      ))}
      <line x1="0" y1="28" x2="0" y2="36" stroke={color} strokeWidth="2" />
      <rect
        x="-6" y="36" width="12" height="12"
        fill="none" stroke={color} strokeWidth="2.4"
        transform="rotate(45 0 42)"
      />
    </g>
  )
}

function Anel({ x, y, s, color, o = 0.9 }) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${s})`}
      opacity={o} stroke={color} fill="none" strokeWidth="3"
    >
      <circle cx="0" cy="12" r="13" />
      <rect
        x="-8" y="-13" width="16" height="16"
        transform="rotate(45 0 -5)"
      />
      <line x1="-4" y1="-9" x2="4" y2="-1" strokeWidth="1.6" />
    </g>
  )
}

function Celular({ x, y, s, color, o = 0.9, a = 0 }) {
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`}
      opacity={o} stroke={color} fill="none"
      strokeWidth="3" strokeLinecap="round"
    >
      <rect x="-13" y="-24" width="26" height="48" rx="5" />
      <line x1="-4" y1="-17" x2="4" y2="-17" />
      <circle cx="0" cy="17" r="2.2" fill={color} stroke="none" />
    </g>
  )
}

function Batom({ x, y, s, color, o = 0.9, a = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`} opacity={o} fill={color}>
      <rect x="-8" y="8" width="16" height="18" rx="2" />
      <rect x="-6" y="0" width="12" height="8" opacity="0.75" />
      <path d="M -5 0 L -5 -14 Q 5 -19 5 -7 L 5 0 Z" />
    </g>
  )
}

function Glamour() {
  return (
    <svg viewBox="0 0 200 1000" preserveAspectRatio="xMidYMid meet" className="ornament-svg" aria-hidden="true">
      <Salto   x={20}  y={40}  s={1.3} color="var(--red)" />
      <path d={sparkle(150, 80, 10)} fill="var(--gold)" opacity="0.7" />
      <Colar   x={120} y={165} s={1.4} color="var(--gold)" />
      <Anel    x={45}  y={330} s={1.3} color="var(--red)" />
      <Celular x={135} y={430} s={1.2} color="var(--gold)" a={12} />
      <path d={sparkle(50, 470, 8)} fill="var(--red)" opacity="0.6" />
      <Batom   x={55}  y={575} s={1.4} color="var(--red)" a={-14} />
      <Colar   x={130} y={640} s={1.0} color="var(--red)" o={0.7} />
      <Salto   x={125} y={760} s={1.1} color="var(--gold)" flip />
      <path d={sparkle(45, 800, 11)} fill="var(--gold)" opacity="0.75" />
      <Anel    x={140} y={905} s={1.0} color="var(--gold)" o={0.8} />
      <Celular x={50}  y={935} s={1.0} color="var(--red)" a={-10} />
      <circle cx="95"  cy="250" r="3.5" fill="var(--gold)" opacity="0.55" />
      <circle cx="165" cy="330" r="3.5" fill="var(--red)"  opacity="0.45" />
      <circle cx="90"  cy="700" r="3.5" fill="var(--gold)" opacity="0.55" />
    </svg>
  )
}

const DRAWINGS = {
  classica: Classica,
  coracoes: Coracoes,
  estrelas: Estrelas,
  flores:   Flores,
  folhagem: Folhagem,
  baloes:   Baloes,
  confete:  Confete,
  nuvens:   Nuvens,
  bebe:     Bebe,
  glamour:  Glamour,
}

// ── Ornamentos fixos nas laterais (somente telas largas) ─────
export default function PageOrnaments() {
  const { event } = useEvent()
  const Drawing = DRAWINGS[decorationOf(event)]
  if (!Drawing) return null

  return (
    <>
      <div className="page-ornament page-ornament-left"><Drawing /></div>
      <div className="page-ornament page-ornament-right"><Drawing /></div>
    </>
  )
}
