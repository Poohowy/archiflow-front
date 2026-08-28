import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Mail, X } from 'lucide-react'
import logo from '../../assets/data-wildcat-logo.png'
import './HelpModal.css'

const CONTACT_EMAIL = 'kontakt@datawildcat.pl'

function HelpModal({ onClose }) {
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)

  useEffect(() => {
    const previouslyFocused = document.activeElement
    closeButtonRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) {
        return
      }

      const focusable = dialogRef.current.querySelectorAll(
        'a[href], button:not([disabled])',
      )

      if (focusable.length === 0) {
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)

      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus()
      }
    }
  }, [onClose])

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return createPortal(
    <div className="help-modal-overlay" onClick={handleOverlayClick}>
      <div
        className="help-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
        aria-describedby="help-modal-description"
        ref={dialogRef}
      >
        <button
          type="button"
          className="help-modal-close"
          onClick={onClose}
          aria-label="Zamknij"
          ref={closeButtonRef}
        >
          <X size={16} strokeWidth={1.8} aria-hidden="true" />
        </button>

        <div className="help-modal-brand">
          <img src={logo} alt="Data Wildcat" className="help-modal-logo" />
        </div>

        <h2 id="help-modal-title">Potrzebujesz pomocy?</h2>

        <p id="help-modal-description">
          W razie pytań lub problemów skontaktuj się z naszym zespołem. Chętnie
          pomożemy.
        </p>

        <a className="help-modal-email" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>

        <a className="help-modal-cta" href={`mailto:${CONTACT_EMAIL}`}>
          <Mail size={16} strokeWidth={1.8} aria-hidden="true" />
          Napisz do nas
        </a>
      </div>
    </div>,
    document.body,
  )
}

export default HelpModal
