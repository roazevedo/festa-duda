// ════════════════════════════════════════════════════════════
// RENDER DO CONVITE EM CANVAS
// Desenha a arte do convite (1500×2100, 2x o preview de 750×1050)
// diretamente no canvas — sem clonar DOM, sem dependências
// frágeis. Espelha o layout de InviteCreator.css.
// ════════════════════════════════════════════════════════════

const W = 1500
const H = 2100
const GAP = 52

function wrapText(ctx, text, maxWidth) {
  const words = String(text).trim().split(/\s+/)
  const lines = []
  let line = ''
  for (const word of words) {
    const attempt = line ? `${line} ${word}` : word
    if (ctx.measureText(attempt).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = attempt
    }
  }
  if (line) lines.push(line)
  return lines
}

function setLetterSpacing(ctx, px) {
  try {
    ctx.letterSpacing = `${px}px`
  } catch {
    /* navegadores sem suporte seguem sem espaçamento */
  }
}

function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null) // foto com erro não derruba o render
    img.src = url
  })
}

async function ensureFonts(specs) {
  try {
    await Promise.all(specs.map((s) => document.fonts.load(s, 'Ag')))
    await document.fonts.ready
  } catch {
    /* segue com fallback do navegador */
  }
}

// cfg: settings.invite · font: { name, body, nameSize } · siteUrl p/ QR
export async function renderInvitePng(cfg, font, siteUrl) {
  const nameSize = (font.nameSize || 60) * 2

  await ensureFonts([
    `700 34px ${font.body}`,
    `600 ${nameSize}px ${font.name}`,
    `italic 400 42px ${font.body}`,
    '700 42px Montserrat',
    `400 36px ${font.body}`,
  ])

  const photo = cfg.photo_url ? await loadImage(cfg.photo_url) : null

  let qrImg = null
  if (cfg.qr && siteUrl) {
    try {
      const { default: QRCode } = await import('qrcode')
      const dataUrl = await QRCode.toDataURL(siteUrl, {
        margin: 1,
        width: 440,
        color: { dark: '#1c1610', light: '#ffffff' },
      })
      qrImg = await loadImage(dataUrl)
    } catch {
      qrImg = null
    }
  }

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // ── Fundo e moldura ──
  ctx.fillStyle = cfg.bg
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = cfg.accent
  if (cfg.frame === 'fina' || cfg.frame === 'dupla') {
    ctx.lineWidth = 3
    ctx.strokeRect(44, 44, W - 88, H - 88)
  }
  if (cfg.frame === 'dupla') {
    ctx.lineWidth = 3
    ctx.strokeRect(10, 10, W - 20, H - 20)
    ctx.strokeRect(22, 22, W - 44, H - 44)
  }

  // ── Mede os blocos para centralizar verticalmente ──
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  const blocks = []

  if (cfg.eyebrow) blocks.push({ type: 'eyebrow', h: 44 })
  if (photo)       blocks.push({ type: 'photo', h: 536 })

  ctx.font = `600 ${nameSize}px ${font.name}`
  const nameLines = cfg.name ? wrapText(ctx, cfg.name, 1300) : []
  if (nameLines.length) {
    blocks.push({ type: 'name', h: nameLines.length * nameSize * 1.12 })
  }

  ctx.font = `italic 400 42px ${font.body}`
  const messageLines = cfg.message ? wrapText(ctx, cfg.message, 1040) : []
  if (messageLines.length) {
    blocks.push({ type: 'message', h: messageLines.length * 65 })
  }

  blocks.push({ type: 'divider', h: 20 })

  if (cfg.dateLine) blocks.push({ type: 'date', h: 52 })

  ctx.font = `400 36px ${font.body}`
  const venueLines = cfg.venueLine ? wrapText(ctx, cfg.venueLine, 1120) : []
  if (venueLines.length) {
    blocks.push({ type: 'venue', h: venueLines.length * 54 })
  }

  if (qrImg) blocks.push({ type: 'qr', h: 236 + 16 + 32 })

  const total = blocks.reduce((s, b) => s + b.h, 0) + GAP * (blocks.length - 1)
  let y = Math.max((H - total) / 2, 120)
  const cx = W / 2

  // ── Desenha ──
  for (const block of blocks) {
    switch (block.type) {
      case 'eyebrow': {
        ctx.fillStyle = cfg.accent
        ctx.font = `700 34px ${font.body}`
        setLetterSpacing(ctx, 17)
        ctx.fillText(cfg.eyebrow.toUpperCase(), cx + 8, y)
        setLetterSpacing(ctx, 0)
        break
      }
      case 'photo': {
        const r = 248
        const cy = y + 268
        ctx.save()
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.clip()
        // recorte quadrado central da foto (object-fit: cover)
        const side = Math.min(photo.width, photo.height)
        ctx.drawImage(
          photo,
          (photo.width - side) / 2, (photo.height - side) / 2, side, side,
          cx - r, cy - r, r * 2, r * 2
        )
        ctx.restore()
        ctx.strokeStyle = cfg.accent
        ctx.lineWidth = 6
        ctx.beginPath()
        ctx.arc(cx, cy, 265, 0, Math.PI * 2)
        ctx.stroke()
        break
      }
      case 'name': {
        ctx.fillStyle = cfg.text
        ctx.font = `600 ${nameSize}px ${font.name}`
        nameLines.forEach((line, i) => {
          ctx.fillText(line, cx, y + i * nameSize * 1.12)
        })
        break
      }
      case 'message': {
        ctx.save()
        ctx.globalAlpha = 0.85
        ctx.fillStyle = cfg.text
        ctx.font = `italic 400 42px ${font.body}`
        messageLines.forEach((line, i) => {
          ctx.fillText(line, cx, y + i * 65)
        })
        ctx.restore()
        break
      }
      case 'divider': {
        const my = y + 9
        ctx.strokeStyle = cfg.accent
        ctx.fillStyle = cfg.accent
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(cx - 210, my)
        ctx.lineTo(cx - 30, my)
        ctx.moveTo(cx + 30, my)
        ctx.lineTo(cx + 210, my)
        ctx.stroke()
        ctx.save()
        ctx.translate(cx, my)
        ctx.rotate(Math.PI / 4)
        ctx.fillRect(-9, -9, 18, 18)
        ctx.restore()
        break
      }
      case 'date': {
        ctx.fillStyle = cfg.text
        ctx.font = '700 42px Montserrat'
        setLetterSpacing(ctx, 6)
        ctx.fillText(cfg.dateLine.toUpperCase(), cx + 3, y)
        setLetterSpacing(ctx, 0)
        break
      }
      case 'venue': {
        ctx.save()
        ctx.globalAlpha = 0.85
        ctx.fillStyle = cfg.text
        ctx.font = `400 36px ${font.body}`
        venueLines.forEach((line, i) => {
          ctx.fillText(line, cx, y + i * 54)
        })
        ctx.restore()
        break
      }
      case 'qr': {
        // placa branca + QR + legenda
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(cx - 118, y, 236, 236)
        ctx.drawImage(qrImg, cx - 110, y + 8, 220, 220)
        ctx.save()
        ctx.globalAlpha = 0.7
        ctx.fillStyle = cfg.text
        ctx.font = `400 26px ${font.body}`
        ctx.fillText('aponte a câmera para confirmar presença', cx, y + 252)
        ctx.restore()
        break
      }
    }
    y += block.h + GAP
  }

  return canvas
}
