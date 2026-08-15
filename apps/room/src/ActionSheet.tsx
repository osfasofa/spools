import { useState, type FormEvent } from 'react'
import { recentEmoji } from './emoji'

/**
 * The message action sheet (design README §4): bottom sheet over a dimmed
 * backdrop — preview line, quick-react tiles, an input that accepts the OS
 * emoji keyboard ("any emoji" without shipping a picker dataset), then
 * action rows. The action list is the caller's: Reply (T-118), Edit/Remove
 * on your own messages and Restore on tombstones (T-120) — the affordance is
 * own-only; the protocol's honest contract lives in settings, not here.
 */
export const ActionSheet = ({
  preview,
  myReactions,
  onReact,
  actions,
  onClose,
}: {
  /** "name — snippet" for the dim preview line */
  preview: string
  /** normalized emoji I already have on this message (shown active) */
  myReactions?: Set<string>
  /** omit to hide the reaction half (e.g. tombstones) */
  onReact?: (emoji: string) => void
  actions: Array<{ label: string; run: () => void }>
  onClose: () => void
}) => {
  const [custom, setCustom] = useState('')
  const submitCustom = (ev: FormEvent) => {
    ev.preventDefault()
    const emoji = custom.trim()
    if (!emoji || !onReact) return
    onReact(emoji)
    onClose()
  }
  return (
    <div className="sheetBackdrop" onClick={onClose}>
      <div className="sheet" onClick={(ev) => ev.stopPropagation()}>
        <div className="sheetPreview">{preview}</div>
        {onReact ? (
          <>
            <div className="sheetReactRow">
              {recentEmoji().map((emoji) => (
                <button
                  key={emoji}
                  className={`sheetReact ${myReactions?.has(emoji) ? 'active' : ''}`}
                  onClick={() => {
                    onReact(emoji)
                    onClose()
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <form className="sheetCustom" onSubmit={submitCustom}>
              <input
                className="sheetCustomInput"
                placeholder="any emoji…"
                value={custom}
                onInput={(ev) => {
                  const value = ev.currentTarget.value
                  setCustom(value)
                }}
                aria-label="React with any emoji"
              />
              <button type="submit" className="sheetCustomGo" aria-label="React">
                ↑
              </button>
            </form>
          </>
        ) : null}
        {actions.map((action) => (
          <button
            key={action.label}
            className="sheetAction"
            onClick={() => {
              action.run()
              onClose()
            }}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}
