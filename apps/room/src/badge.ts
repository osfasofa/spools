/**
 * In-tab attention (T-123): title + canvas favicon badge. This is the whole
 * achievable surface — a closed tab hears nothing (no push, no service
 * worker, no server that knows you exist), and settings says so plainly.
 */

const faviconLink = (): HTMLLinkElement => {
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  return link
}

/** accent square favicon, with the unread count when nonzero */
export const drawFavicon = (count: number): void => {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const styles = getComputedStyle(document.documentElement)
  const ac = styles.getPropertyValue('--ac').trim() || '#D6D6D6'
  const acTx = styles.getPropertyValue('--acTx').trim() || '#0D0D0D'
  ctx.fillStyle = ac
  ctx.fillRect(2, 2, 28, 28)
  if (count > 0) {
    ctx.fillStyle = acTx
    ctx.font = '700 18px -apple-system, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(count > 9 ? '9+' : String(count), 16, 17)
  }
  faviconLink().href = canvas.toDataURL('image/png')
}

export const pageTitle = (roomName: string, unread: number): string =>
  `${unread > 0 ? `(${unread}) ` : ''}${roomName || 'a room'}`
