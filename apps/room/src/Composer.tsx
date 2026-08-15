import { useEffect, useRef, useState, type FormEvent } from 'react'

/**
 * Built once, never rebuilt (T-030's focus lesson): the component identity is
 * stable for the page's life, so peer-traffic rerenders can't eat focus.
 * The length cap is a room-level courtesy — the 8 MiB frame ceiling makes a
 * pasted novel a DoS, and one message should never spend a meaningful slice
 * of the document's lifetime budget (T-110: ~26 500 ordinary messages fit).
 * Reply mode (T-118): a dismissible banner rides above the input; send
 * stamps `parent` and clears it.
 */
const MAX_LEN = 4000

export const Composer = ({
  onSend,
  replyLabel,
  onCancelReply,
  onTyping,
  editLabel,
  editSeed,
  onCancelEdit,
}: {
  onSend: (body: string) => void
  /** "↩ name — snippet" while replying; null/undefined otherwise */
  replyLabel?: string | null
  onCancelReply?: () => void
  /** every keystroke — the presence layer debounces the transitions (T-119) */
  onTyping?: () => void
  /** "✎ editing…" while editing a message (T-120); mutually exclusive with reply */
  editLabel?: string | null
  /** the message's current body, loaded into the draft when editing starts */
  editSeed?: string | null
  onCancelEdit?: () => void
}) => {
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // entering edit mode replaces the draft with the message being edited;
  // leaving it clears. The input element itself is never remounted — focus
  // stays put (T-030's lesson holds through mode changes).
  useEffect(() => {
    if (editSeed != null) setDraft(editSeed)
    else setDraft('')
  }, [editSeed])

  // picking reply/edit from the sheet lands focus in the input — the sheet
  // just closed and focus would otherwise fall to <body> (T-125)
  useEffect(() => {
    if (replyLabel || editLabel) inputRef.current?.focus()
  }, [replyLabel, editLabel])

  const submit = (ev: FormEvent) => {
    ev.preventDefault()
    const body = draft.trim()
    if (!body) return
    onSend(body.slice(0, MAX_LEN))
    setDraft('')
  }

  return (
    <form className="composer" onSubmit={submit}>
      {replyLabel || editLabel ? (
        <div className="replyBanner">
          <span className="replyBannerText">{editLabel ?? replyLabel}</span>
          <button
            type="button"
            className="replyBannerClose"
            onClick={editLabel ? onCancelEdit : onCancelReply}
            aria-label={editLabel ? 'Cancel edit' : 'Cancel reply'}
          >
            ✕
          </button>
        </div>
      ) : null}
      <div className="composerRow">
        <input
          ref={inputRef}
          className="composerInput"
          placeholder="Message"
          value={draft}
          maxLength={MAX_LEN}
          onInput={(ev) => {
            // read before the updater runs — currentTarget is nulled after
            // dispatch (T-090's second-keystroke crash)
            const value = ev.currentTarget.value
            setDraft(value)
            onTyping?.()
          }}
          aria-label="Message"
        />
        <button type="submit" className="sendBtn" aria-label="Send">
          ↑
        </button>
      </div>
    </form>
  )
}
