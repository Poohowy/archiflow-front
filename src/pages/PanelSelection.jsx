import { Building2, House, LayoutDashboard } from 'lucide-react'
import ArchiFlowLogo from '../components/branding/ArchiFlowLogo'
import logo from '../assets/data-wildcat-logo.png'
import './PanelSelection.css'

function PanelOptionCard({ title, context, description, Icon, onOpen }) {
  return (
    <article className="panel-option-card">
      <div className="panel-option-icon">
        <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
      </div>

      <h2>{title}</h2>
      {context && <p className="panel-option-context">{context}</p>}
      <p className="panel-option-description">{description}</p>

      <button type="button" className="panel-option-button" onClick={onOpen}>
        Otwórz panel <span aria-hidden="true">→</span>
      </button>
    </article>
  )
}

function PanelSelection({ onOpenOwnerPanel, onOpenCorporateClientPanel, onOpenIndividualClientPanel }) {
  return (
    <div className="panel-selection-page">
      <div className="panel-selection-content">
        <header className="panel-selection-branding">
          <ArchiFlowLogo size={104} className="panel-selection-logo" title="ArchiFlow logo" />
          <p className="panel-selection-brand-name">ArchiFlow</p>
          <p className="panel-selection-product-description">
            Kompleksowa platforma do zarządzania pracownią architektoniczną i współpracy z klientami.
          </p>
          <h1>Wybierz panel, do którego chcesz przejść</h1>
        </header>

        <section className="panel-options-grid" aria-label="Wybierz panel">
          <PanelOptionCard
            title="Panel właściciela"
            context="Dla właściciela pracowni"
            description="Zarządzaj całą pracownią w jednym miejscu - od projektów i klientów po zespół i finanse."
            Icon={LayoutDashboard}
            onOpen={onOpenOwnerPanel}
          />

          <PanelOptionCard
            title="Panel klienta korporacyjnego"
            context="Dla firm, deweloperów i partnerów biznesowych"
            description="Zapewnij firmom i deweloperom przejrzysty dostęp do postępów projektów, dokumentów i komunikacji z pracownią."
            Icon={Building2}
            onOpen={onOpenCorporateClientPanel}
          />

          <PanelOptionCard
            title="Panel klienta indywidualnego"
            context="Dla klientów realizujących projekty indywidualne"
            description="Zapewnij klientom indywidualnym prosty dostęp do postępów projektu, materiałów i komunikacji z pracownią."
            Icon={House}
            onOpen={onOpenIndividualClientPanel}
          />
        </section>

        <footer className="panel-selection-footer">
          <img src={logo} alt="Data Wildcat" className="panel-selection-footer-logo" />
          <small>© 2026 ArchiFlow</small>
        </footer>
      </div>
    </div>
  )
}

export default PanelSelection
