import type { SpoolStatus } from 'spools'

/**
 * The tape itself. Reels spin while connected; the status LED tells the
 * truth quietly. The label is this device's name for the tape (stash label)
 * — click it and write on the cassette.
 */
export const Cassette = ({
  title,
  code,
  status,
  onRetitle,
}: {
  title: string
  code: string
  status: SpoolStatus
  onRetitle: (title: string) => void
}) => {
  const spinning = status === 'connected'
  return (
    <div className="cassette" data-status={status}>
      <svg viewBox="0 0 400 250" className="shell" aria-hidden="true">
        <rect x="4" y="4" width="392" height="242" rx="18" className="body" />
        <rect x="24" y="26" width="352" height="120" rx="8" className="labelPaper" />
        <rect x="24" y="26" width="352" height="34" rx="8" className="labelStripe" />
        {/* window + reels */}
        <rect x="100" y="152" width="200" height="64" rx="30" className="window" />
        <g className={spinning ? 'reel spin' : 'reel'} style={{ transformOrigin: '148px 184px' }}>
          <circle cx="148" cy="184" r="24" className="hub" />
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <rect key={deg} x="146" y="162" width="4" height="12" className="spoke" transform={`rotate(${deg} 148 184)`} />
          ))}
        </g>
        <g className={spinning ? 'reel spin slow' : 'reel'} style={{ transformOrigin: '252px 184px' }}>
          <circle cx="252" cy="184" r="24" className="hub" />
          {[30, 90, 150, 210, 270, 330].map((deg) => (
            <rect key={deg} x="250" y="162" width="4" height="12" className="spoke" transform={`rotate(${deg} 252 184)`} />
          ))}
        </g>
        {/* tape between the reels */}
        <line x1="172" y1="184" x2="228" y2="184" className="tape" />
        {/* screws */}
        {[
          [18, 18],
          [382, 18],
          [18, 232],
          [382, 232],
          [200, 232],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="4" className="screw" />
        ))}
      </svg>
      <div className="labelText">
        <input
          className="tapeTitle"
          value={title}
          placeholder="write a name on the tape"
          onChange={(ev) => onRetitle(ev.target.value)}
          aria-label="tape title"
        />
        <div className="tapeMeta">
          <span className={`led led-${status}`} title={`sync: ${status}`} />
          <span className="code">{code}</span>
          <span className="side">side A · stereo</span>
        </div>
      </div>
    </div>
  )
}
