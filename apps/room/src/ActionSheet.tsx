import { useState, type FormEvent } from 'react'
import { recentEmoji } from './emoji'

/**
 * The message action sheet (design README §4): bottom sheet over a dimmed
 * backdrop — preview line, quick-react tiles, an input that accepts the OS
 * emoji keyboard ("any emoji" without shipping a picker dataset), then
 * action rows. Reply lands here (T-118); Edit/Remove join in T-120.
 */
export const ActionSheet = ({
  preview,
  myReactions,
  onReact,
  onReply,
  onClose,
}: {
  /** "name — snippet" for the dim preview line */
  preview: string
  /** normalized emoji I already have on this message (shown active) */
  myReactions: Set<string>
  onReact: (emoji: string) => void
  onReply: () => void
  onClose: () => void
}) => {
  const [custom, setCustom] = useState('')
  const submitCustom = (ev: FormEvent) => {
    ev.preventDefault()
    const emoji = custom.trim()
    if (!emoji) return
    onReact(emoji)
    onClose()
  }
  return (
    <div className="sheetBackdrop" onClick={onClose}>
      <div className="sheet" onClick={(ev) => ev.stopPropagation()}>
        <div className="sheetPreview">{preview}</div>
        <div className="sheetReactRow">
          {recentEmoji().map((emoji) => (
            <button
              key={emoji}
              className={`sheetReact ${myReactions.has(emoji) ? 'active' : ''}`}
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
        <button
          className="sheetAction"
          onClick={() => {
            onReply()
            onClose()
          }}
        >
          ↩ reply
        </button>
      </div>
    </div>
  )
}
