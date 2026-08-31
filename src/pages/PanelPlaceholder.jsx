import { CircleDashed } from 'lucide-react'
import ArchiFlowLogo from '../components/branding/ArchiFlowLogo'
import logo from '../assets/data-wildcat-logo.png'
import './PanelPlaceholder.css'

function PanelPlaceholder({ title, description, onBackToSelection }) {
  return (
    <div className="panel-placeholder-page">
      <div className="panel-placeholder-content">
        <div className="panel-placeholder-brand" aria-label="ArchiFlow">
          <ArchiFlowLogo size={30} title="" />
          <span className="panel-placeholder-brand-name">ArchiFlow</span>
        </div>

        <section className="panel-placeholder-card" aria-live="polite">
          <div className="panel-placeholder-icon">
            <CircleDashed size={20} strokeWidth={1.8} aria-hidden="true" />
          </div>

          <h1>{title}</h1>
          <p>{description}</p>

          <button type="button" onClick={onBackToSelection}>
            &larr; Wybór panelu
          </button>
        </section>

        <footer className="panel-placeholder-footer">
          <img src={logo} alt="Data Wildcat" className="panel-placeholder-footer-logo" />
          <small>© 2026 ArchiFlow</small>
        </footer>
      </div>
    </div>
  )
}

export default PanelPlaceholder
