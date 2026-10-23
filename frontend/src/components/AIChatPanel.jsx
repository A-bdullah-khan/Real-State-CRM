import { useEffect, useRef, useState } from 'react'
import { ButtonSpinner } from './Feedback'
import Icon from './Icon'
import PropertyCard from './PropertyCard'
import { useApiQuery } from '../hooks/useApiQuery'
import { useToast } from '../hooks/useToast'
import { aiService, getErrorMessage, getSearchResults, propertyService } from '../services'
import { isCancel } from '../services/apiClient'
import { LISTING_TYPES, PROPERTY_TYPES } from '../utils/constants'

const SUGGESTIONS = [
  { tag: 'Buy', icon: 'building', text: 'Find me 2-bedroom apartments in Austin under $500k' },
  { tag: 'Rent', icon: 'home', text: 'Show houses for rent with at least 3 bedrooms' },
  { tag: 'Budget', icon: 'currency', text: 'What condos are available under $350,000?' },
]

const LIST_ITEM = /^\s*(?:[-*•]|\d+[.)])\s+/

const labelFor = (options, value) => options.find((option) => option.value === value)?.label ?? value

/** Shape a `search_properties` tool result like the full API object PropertyCard expects. */
function toCardProperty(summary) {
  return {
    ...summary,
    property_type_display: labelFor(PROPERTY_TYPES, summary.property_type),
    listing_type_display: labelFor(LISTING_TYPES, summary.listing_type),
    // The search tool only returns available listings.
    status: 'available',
    status_display: 'Available',
  }
}

/** Fetch full listing details (image, address, baths, area); fall back to the tool summary per listing. */
async function loadPropertyDetails(summaries, signal) {
  const results = await Promise.allSettled(summaries.map((summary) => propertyService.get(summary.id, { signal })))
  return summaries.map((summary, i) => (results[i].status === 'fulfilled' ? results[i].value : toCardProperty(summary)))
}

function renderInline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.length > 4 && part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part,
  )
}

/** Minimal, injection-safe rendering of the light Markdown the model writes (paragraphs, lists, bold). */
function FormattedText({ text }) {
  return text
    .trim()
    .replace(/^#{1,6}\s+/gm, '')
    .split(/\n{2,}/)
    .map((block, i) => {
      const lines = block.split('\n')
      if (lines.every((line) => LIST_ITEM.test(line))) {
        const ordered = /^\s*\d/.test(lines[0])
        const List = ordered ? 'ol' : 'ul'
        return (
          <List key={i} className={`space-y-1 pl-5 ${ordered ? 'list-decimal' : 'list-disc'}`}>
            {lines.map((line, j) => <li key={j}>{renderInline(line.replace(LIST_ITEM, ''))}</li>)}
          </List>
        )
      }
      return <p key={i} className="whitespace-pre-line">{renderInline(block)}</p>
    })
}

function AssistantAvatar({ size = 'h-8 w-8' }) {
  return (
    <span
      className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-glow`}
      aria-hidden="true"
    >
      <Icon name="sparkles" className="h-4 w-4" />
    </span>
  )
}

function TypingIndicator({ label }) {
  return (
    <div className="flex animate-fade-in-up items-start gap-3" role="status">
      <AssistantAvatar />
      <div className="flex items-center gap-3 rounded-2xl rounded-tl-md bg-white px-4 py-3 text-sm text-slate-500 shadow-soft ring-1 ring-slate-200/80">
        <span className="flex gap-1" aria-hidden="true">
          {[0, 160, 320].map((delay) => (
            <span
              key={delay}
              className="h-1.5 w-1.5 animate-typing rounded-full bg-gradient-to-r from-brand-500 to-violet-500"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
        {label}
      </div>
    </div>
  )
}

function ChatMessage({ message, onEnquire, onRetry, disabled }) {
  if (message.role === 'user') {
    return (
      <div className="flex animate-fade-in-up flex-col items-end gap-1">
        <p
          className={`max-w-[85%] whitespace-pre-line rounded-2xl rounded-br-md px-4 py-2.5 text-sm leading-relaxed shadow-soft ${
            message.failed ? 'bg-slate-200 text-slate-500' : 'bg-slate-900 text-white'
          }`}
        >
          {message.content}
        </p>
        {message.failed && <span className="pr-1 text-xs text-slate-400">Not sent</span>}
      </div>
    )
  }

  if (message.role === 'error') {
    return (
      <div
        className="flex animate-fade-in-up items-start gap-3 rounded-xl border border-red-200/80 bg-red-50/80 p-4 text-sm text-red-800"
        role="alert"
      >
        <Icon name="warning" className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
        <p className="flex-1">{message.content}</p>
        <button
          type="button"
          onClick={() => onRetry(message)}
          disabled={disabled}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-0.5 font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
        >
          <Icon name="retry" className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up space-y-4">
      <div className="flex items-start gap-3">
        <AssistantAvatar />
        <div className="min-w-0 max-w-[85%] space-y-3 rounded-2xl rounded-tl-md bg-white px-4 py-3 text-sm leading-relaxed text-slate-700 shadow-soft ring-1 ring-slate-200/80">
          <FormattedText text={message.content} />
        </div>
      </div>
      {message.properties.length > 0 && (
        <div className="sm:pl-11">
          <p className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
            <Icon name="building" className="h-3.5 w-3.5" />
            {message.properties.length} matching {message.properties.length === 1 ? 'listing' : 'listings'}
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {message.properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                footer={
                  <button type="button" className="btn-primary w-full" onClick={() => onEnquire(property)}>
                    Enquire about this property
                  </button>
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Conversational property search backed by POST /ai/chat/.
 *
 * The server is stateless, so this component owns the transcript and replays completed turns as
 * `history` on every send. One request is in flight at a time; its AbortController is cancelled on
 * unmount so a late reply never writes into a dead component. Failures toast and leave a Retry row
 * in the transcript in place of the failed user message.
 */
export default function AIChatPanel({ onEnquire }) {
  const toast = useToast()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [pendingLabel, setPendingLabel] = useState(null)
  const controllerRef = useRef(null)
  const bottomRef = useRef(null)
  const nextId = useRef(0)

  const { data: status } = useApiQuery((options) => aiService.status(options), 'ai-status')
  const unavailable = status?.configured === false
  const pending = pendingLabel !== null

  useEffect(() => () => controllerRef.current?.abort(), [])

  useEffect(() => {
    if (messages.length || pending) bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, pending])

  const send = async (text, priorMessages = messages) => {
    const content = text.trim()
    if (!content || pending) return

    // Only completed exchanges go back to the agent as context.
    const history = priorMessages
      .filter((m) => m.role === 'assistant' || (m.role === 'user' && !m.failed))
      .map(({ role, content: body }) => ({ role, content: body }))
    const userMessage = { id: ++nextId.current, role: 'user', content }

    setMessages([...priorMessages, userMessage])
    setInput('')
    setPendingLabel('Searching listings…')

    const controller = new AbortController()
    controllerRef.current = controller
    try {
      const response = await aiService.chat(content, history, { signal: controller.signal })
      const summaries = getSearchResults(response)
      let properties = []
      if (summaries.length) {
        setPendingLabel('Loading matching listings…')
        properties = await loadPropertyDetails(summaries, controller.signal)
      }
      if (controller.signal.aborted) return
      setMessages((current) => [...current, { id: ++nextId.current, role: 'assistant', content: response.reply, properties }])
    } catch (error) {
      if (isCancel(error) || controller.signal.aborted) return
      const detail = getErrorMessage(error)
      const summary = error.response?.status === 503 ? `The AI assistant is unavailable right now. ${detail}` : detail
      toast.error(summary)
      setMessages((current) => [
        ...current.map((m) => (m.id === userMessage.id ? { ...m, failed: true } : m)),
        { id: ++nextId.current, role: 'error', content: summary, retryText: content, userMessageId: userMessage.id },
      ])
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null
        setPendingLabel(null)
      }
    }
  }

  const retry = (errorMessage) => {
    // Drop the failed user message and its error, then resend it as the latest message.
    const remaining = messages.filter((m) => m.id !== errorMessage.id && m.id !== errorMessage.userMessageId)
    send(errorMessage.retryText, remaining)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    send(input)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      send(input)
    }
  }

  return (
    <section className="space-y-6" aria-label="AI property assistant">
      {unavailable && (
        <div
          className="flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/80 p-4 text-sm text-amber-900"
          role="alert"
        >
          <Icon name="warning" className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p>
            The AI assistant isn't configured on the server yet. Use <strong>Browse listings</strong> to search with filters.
          </p>
        </div>
      )}

      {messages.length === 0 && !pending ? (
        // Gradient hairline border: a 1px padded gradient wrapper around a white panel.
        <div className="rounded-2xl bg-gradient-to-br from-brand-300/60 via-slate-200 to-violet-300/60 p-px shadow-soft">
          <div className="rounded-[15px] bg-white/95 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <AssistantAvatar size="h-10 w-10" />
              <div>
                <p className="font-semibold tracking-tight text-slate-900">Describe the home you're looking for</p>
                <p className="mt-0.5 text-sm text-slate-500">
                  Mention a city, budget, number of bedrooms, or whether you want to buy or rent.
                </p>
              </div>
            </div>
            <p className="mt-6 text-[11px] font-medium uppercase tracking-wider text-slate-400">Try asking</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion.text}
                  type="button"
                  disabled={unavailable}
                  onClick={() => send(suggestion.text)}
                  className="group flex flex-col items-start gap-3 rounded-xl bg-slate-50/80 p-4 text-left ring-1 ring-inset ring-slate-200/80 transition
                    enabled:hover:-translate-y-0.5 enabled:hover:bg-white enabled:hover:shadow-lift enabled:hover:ring-brand-200
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="flex w-full items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-brand-600 shadow-soft ring-1 ring-slate-200/80">
                      <Icon name={suggestion.icon} className="h-4 w-4" />
                    </span>
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700 ring-1 ring-inset ring-brand-600/10">
                      {suggestion.tag}
                    </span>
                  </span>
                  <span className="text-sm font-medium leading-snug text-slate-700 group-enabled:group-hover:text-slate-900">
                    {suggestion.text}
                  </span>
                  <span className="mt-auto flex items-center gap-1 text-xs font-medium text-slate-400 transition group-enabled:group-hover:text-brand-600">
                    Ask assistant
                    <Icon name="arrowRight" className="h-3 w-3 transition group-enabled:group-hover:translate-x-0.5" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} onEnquire={onEnquire} onRetry={retry} disabled={pending} />
          ))}
          {pending && <TypingIndicator label={pendingLabel} />}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="sticky bottom-4 z-10 rounded-2xl bg-white/90 p-2 shadow-lift ring-1 ring-slate-200 backdrop-blur-xl transition
          focus-within:ring-2 focus-within:ring-brand-500/50"
      >
        <label htmlFor="ai-chat-input" className="sr-only">Ask about properties</label>
        <textarea
          id="ai-chat-input"
          rows={1}
          maxLength={4000}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={unavailable}
          placeholder={unavailable ? 'AI assistant unavailable' : 'e.g. 2-bedroom apartments in Austin under $500k'}
          // field-sizing grows the box with its content where supported; elsewhere it stays one row and scrolls.
          className="block max-h-40 min-h-[2.75rem] w-full resize-none border-0 bg-transparent px-3 py-2.5 text-sm text-slate-900
            [field-sizing:content] placeholder:text-slate-400 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:text-slate-400"
        />
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-2 pt-2">
          <p className="hidden items-center gap-1 text-xs text-slate-400 sm:flex">
            <kbd>Enter</kbd> to send <span aria-hidden="true">·</span> <kbd>Shift</kbd> + <kbd>Enter</kbd> for a new line
          </p>
          <button type="submit" className="btn-ai ml-auto rounded-xl px-3.5" disabled={pending || unavailable || !input.trim()}>
            {pending ? <ButtonSpinner /> : <Icon name="arrowUp" className="h-4 w-4" strokeWidth={2} />}
            {pending ? 'Thinking…' : 'Send'}
          </button>
        </div>
      </form>
      <div ref={bottomRef} aria-hidden="true" />
    </section>
  )
}
