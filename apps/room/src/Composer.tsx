import { useState, type FormEvent } from 'react'

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
}: {
  onSend: (body: string) => void
  /** "↩ name — snippet" while replying; null/undefined otherwise */
  replyLabel?: string | null
  onCancelReply?: () => void
}) => {
  const [draft, setDraft] = useState('')

  const submit = (ev: FormEvent) => {
    ev.preventDefault()
    const body = draft.trim()
    if (!body) return
    onSend(body.slice(0, MAX_LEN))
    setDraft('')
  }

  return (
    <form className="composer" onSubmit={submit}>
      {replyLabel ? (
        <div className="replyBanner">
          <span className="replyBannerText">{replyLabel}</span>
          <button type="button" className="replyBannerClose" onClick={onCancelReply} aria-label="Cancel reply">
            ✕
          </button>
        </div>
      ) : null}
      <div className="composerRow">
        <input
          className="composerInput"
          placeholder="Message"
          value={draft}
          maxLength={MAX_LEN}
          onInput={(ev) => {
            // read before the updater runs — currentTarget is nulled after
            // dispatch (T-090's second-keystroke crash)
            const value = ev.currentTarget.value
            setDraft(value)
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
