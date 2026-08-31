import { useState } from 'react'
import {
  CalendarClock,
  ChevronRight,
  Circle,
  Clock3,
  FileText,
  ImageIcon,
  MessageSquare,
  MoreHorizontal,
  Send,
  TriangleAlert,
} from 'lucide-react'
import { clients } from '../data/clients'
import { projects, teamDirectory } from '../data/projects'
import { scheduleStagePlans } from '../data/schedule'
import './StageDetails.css'

const historyIconMap = {
  'document-upload': FileText,
  'document-sent': Send,
  'client-reminder': MessageSquare,
}
const stageOrder = [
  { id: 'analysis', label: 'Analiza' },
  { id: 'concept', label: 'Koncepcja' },
  { id: 'construction', label: 'Projekt budowlany' },
  { id: 'execution', label: 'Projekt wykonawczy' },
  { id: 'supervision', label: 'Nadzór autorski' },
]

const teamById = teamDirectory.reduce((lookup, member) => {
  lookup[member.id] = member
  return lookup
}, {})

function parseIsoDate(value) {
  if (!value) {
    return null
  }

  return new Date(`${value}T00:00:00`)
}

function parseIsoDateTime(value) {
  if (!value) {
    return null
  }

  return new Date(value)
}

function parseHistoryDateTime(entry) {
  const timeValue = entry.time || '00:00'
  return new Date(`${entry.date}T${timeValue}:00`)
}

function formatDate(value) {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(value)
}

function formatDateTime(value) {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value)
}

function createInitials(name) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function resolveStageStateLabel(state) {
  if (state === 'done') {
    return 'Ukończony'
  }

  if (state === 'active') {
    return 'W trakcie'
  }

  if (state === 'delayed') {
    return 'Opóźniony'
  }

  if (state === 'blocked') {
    return 'Wstrzymany'
  }

  return 'Planowany'
}

function resolveStatusTone(approvalStatus) {
  if (approvalStatus === 'accepted') {
    return 'success'
  }

  if (approvalStatus === 'rejected') {
    return 'danger'
  }

  return 'warning'
}

function StageDetails({ projectId, stageId }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDocumentNoticeVisible, setIsDocumentNoticeVisible] = useState(false)
  const project = projects.find((item) => item.id === projectId) || null
  const sourceProjectStages = project ? scheduleStagePlans[project.id] || [] : []
  const projectStages = stageOrder.map((stageTemplate) => {
    const stageFromData = sourceProjectStages.find((item) => item.id === stageTemplate.id)

    if (stageFromData) {
      return {
        ...stageTemplate,
        ...stageFromData,
      }
    }

    return {
      ...stageTemplate,
      state: 'planned',
      startDate: null,
      endDate: null,
    }
  })
  const stage = projectStages.find((item) => item.id === stageId) || null
  const stageIndex = projectStages.findIndex((item) => item.id === stageId)

  if (!project || !stage) {
    return (
      <div className="stage-details-page">
        <nav className="stage-breadcrumbs" aria-label="Nawigacja okruszkowa">
          <a href="#/projekty">Projekty</a>
          <ChevronRight size={14} aria-hidden="true" />
          <span>Nie znaleziono etapu</span>
        </nav>

        <section className="stage-card">
          <h1>Nie znaleziono etapu</h1>
          <p>Wybrany etap nie istnieje dla wskazanego projektu.</p>
          <a href="#/projekty" className="stage-inline-link">
            Wróć do listy projektów
          </a>
        </section>
      </div>
    )
  }

  const projectClient = clients.find((client) => client.id === project.clientId) || null
  const responsiblePerson = teamById[stage.responsibleId] || project.owner
  const stageStatus = stage.operationalStatus || resolveStageStateLabel(stage.state)
  const stageState = resolveStageStateLabel(stage.state)
  const stageEndDate = formatDate(parseIsoDate(stage.endDate))
  const stageNumberLabel = `${stageIndex + 1} z ${projectStages.length}`
  const approvalInfo = stage.approval || null
  const approvalSentLabel = formatDate(parseIsoDate(approvalInfo?.sentToClientAt))
  const approvalDeadlineLabel = formatDate(parseIsoDate(approvalInfo?.responseDeadline))
  const statusTone = resolveStatusTone(approvalInfo?.status)
  const documentInfo = stage.document || null
  const documentAuthor = documentInfo ? teamById[documentInfo.authorId] || responsiblePerson : responsiblePerson
  const stageHistory = stage.history
    ? [...stage.history].sort(
        (entryA, entryB) => parseHistoryDateTime(entryB).getTime() - parseHistoryDateTime(entryA).getTime(),
      )
    : []
  const reviewRounds = stage.reviewRounds || { used: 0, total: 0 }
  const reviewRoundsProgress =
    reviewRounds.total > 0 ? Math.min(100, Math.round((reviewRounds.used / reviewRounds.total) * 100)) : 0
  const scheduleImpact = stage.scheduleImpact || null
  const nextAction = stage.nextAction || null

  function handleOpenDocument() {
    setIsDocumentNoticeVisible(true)
  }

  function handleMenuAction() {
    setIsMenuOpen(false)
  }

  return (
    <div className="stage-details-page">
      <nav className="stage-breadcrumbs" aria-label="Nawigacja okruszkowa">
        <a href="#/projekty">Projekty</a>
        <ChevronRight size={14} aria-hidden="true" />
        <a href={`#/projekty/${encodeURIComponent(project.id)}`}>{project.name}</a>
        <ChevronRight size={14} aria-hidden="true" />
        <span>{stage.label}</span>
      </nav>

      <header className="stage-hero">
        <div className="stage-hero-top-row">
          <div>
            <h1>{stage.label}</h1>
            <p>Status operacyjny etapu</p>
          </div>

          <div className="stage-hero-actions">
            <span className={`stage-status-pill stage-status-pill-${statusTone}`}>{stageStatus}</span>

            <a href="#/klienci" className="stage-contact-button">
              <MessageSquare size={15} aria-hidden="true" />
              <span>Kontakt z klientem</span>
            </a>

            <div className="stage-menu-wrap">
              <button
                type="button"
                className="stage-more-button"
                aria-label="Więcej opcji etapu"
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((current) => !current)}
              >
                <MoreHorizontal size={16} aria-hidden="true" />
              </button>

              {isMenuOpen && (
                <div className="stage-dropdown-menu" role="menu">
                  <button type="button" role="menuitem" onClick={handleMenuAction}>
                    Przypomnij klientowi
                  </button>
                  <button type="button" role="menuitem" onClick={handleMenuAction}>
                    Dodaj notatkę do etapu
                  </button>
                  <button type="button" role="menuitem" onClick={handleMenuAction}>
                    Oznacz jako oczekujące
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="stage-context-card">
          <div className="stage-project-visual" aria-hidden="true">
            <ImageIcon size={14} />
            <span>{createInitials(project.name)}</span>
          </div>

          <div className="stage-context-grid">
            <div className="stage-context-item stage-context-item-project">
              <span>Projekt</span>
              <strong>{project.name}</strong>
              <small>{projectClient ? projectClient.name : project.client}</small>
            </div>

            <div className="stage-context-item">
              <span>Planowane zakończenie etapu</span>
              <strong>{stageEndDate}</strong>
            </div>

            <div className="stage-context-item">
              <span>Osoba odpowiedzialna</span>
              <strong>{responsiblePerson.name}</strong>
            </div>

            <div className="stage-context-item">
              <span>Etap</span>
              <strong>{stageNumberLabel}</strong>
              <small>{stageState}</small>
            </div>
          </div>
        </div>
      </header>

      <section className="stage-client-alert" role="status">
        <TriangleAlert size={16} aria-hidden="true" />
        <div>
          <strong>Dokumentacja została przekazana klientowi {approvalSentLabel}.</strong>
          <span>Termin odpowiedzi: {approvalDeadlineLabel}</span>
        </div>
      </section>

      <section className="stage-grid stage-grid-primary">
        <article className="stage-card">
          <div className="stage-card-head">
            <h2>Twoje następne działanie</h2>
          </div>

          <p className="stage-card-main-copy">{nextAction ? nextAction.title : 'Zweryfikuj status akceptacji klienta.'}</p>
          <p className="stage-card-sub-copy">
            {nextAction ? nextAction.details : 'Etap wymaga decyzji klienta, aby przejść do kolejnego zakresu.'}
          </p>

          <a href="#/klienci" className="stage-inline-link">
            Kontakt z klientem
          </a>
        </article>

        <article className="stage-card">
          <div className="stage-card-head">
            <h2>Dokumentacja etapu</h2>
          </div>

          {documentInfo ? (
            <div className="stage-document-block">
              <div className="stage-document-title">
                <FileText size={15} aria-hidden="true" />
                <strong>{documentInfo.name}</strong>
              </div>

              <dl className="stage-key-value-list">
                <div>
                  <dt>Wersja</dt>
                  <dd>{documentInfo.version}</dd>
                </div>
                <div>
                  <dt>Data dodania</dt>
                  <dd>{formatDateTime(parseIsoDateTime(documentInfo.addedAt))}</dd>
                </div>
                <div>
                  <dt>Autor</dt>
                  <dd>{documentAuthor.name}</dd>
                </div>
                <div>
                  <dt>Status dokumentu</dt>
                  <dd>{documentInfo.status}</dd>
                </div>
              </dl>

              <button type="button" className="stage-inline-button" onClick={handleOpenDocument}>
                Otwórz dokument
              </button>

              {isDocumentNoticeVisible && (
                <p className="stage-document-notice">Podgląd dokumentu zostanie podpięty w kolejnej iteracji.</p>
              )}
            </div>
          ) : (
            <p className="stage-card-sub-copy">Brak dokumentacji przypisanej do tego etapu.</p>
          )}
        </article>

        <article className="stage-card">
          <div className="stage-card-head">
            <h2>Rundy korekt</h2>
          </div>

          <div className="stage-rounds-summary">
            <strong>
              {reviewRounds.used}/{reviewRounds.total}
            </strong>
            <span>Wykorzystane rundy</span>
          </div>

          <div className="stage-rounds-track" aria-hidden="true">
            <span style={{ width: `${reviewRoundsProgress}%` }} />
          </div>

          <p className="stage-card-sub-copy">
            {reviewRounds.total - reviewRounds.used > 0
              ? `Pozostało ${reviewRounds.total - reviewRounds.used} rund(y) przed eskalacją.`
              : 'Wykorzystano wszystkie dostępne rundy korekt.'}
          </p>
        </article>
      </section>

      <section className="stage-grid stage-grid-secondary">
        <article className="stage-card">
          <div className="stage-card-head">
            <h2>Akceptacja klienta</h2>
          </div>

          <dl className="stage-key-value-list">
            <div>
              <dt>Status</dt>
              <dd>{stageStatus}</dd>
            </div>
            <div>
              <dt>Dokument przekazano</dt>
              <dd>{approvalSentLabel}</dd>
            </div>
            <div>
              <dt>Termin odpowiedzi</dt>
              <dd>{approvalDeadlineLabel}</dd>
            </div>
          </dl>
        </article>

        <article className="stage-card">
          <div className="stage-card-head">
            <h2>Wpływ na harmonogram</h2>
          </div>

          <div className={`stage-impact-callout ${scheduleImpact?.type === 'warning' ? 'is-warning' : ''}`}>
            <CalendarClock size={15} aria-hidden="true" />
            <div>
              <strong>{scheduleImpact ? scheduleImpact.title : 'Brak wpływu krytycznego na harmonogram'}</strong>
              <span>
                {scheduleImpact
                  ? scheduleImpact.details
                  : 'Ten etap nie sygnalizuje odchyleń wpływających na termin końcowy projektu.'}
              </span>
            </div>
          </div>

          <a href={`#/harmonogram?projekt=${encodeURIComponent(project.id)}`} className="stage-inline-link">
            Zobacz harmonogram projektu
          </a>
        </article>

        <article className="stage-card">
          <div className="stage-card-head">
            <h2>Odpowiedzialność</h2>
          </div>

          <div className="stage-owner-block">
            <div className="stage-owner-avatar">{responsiblePerson.initials || createInitials(responsiblePerson.name)}</div>
            <div>
              <strong>{responsiblePerson.name}</strong>
              <span>{responsiblePerson.role}</span>
            </div>
          </div>

          <p className="stage-card-sub-copy">
            Osoba odpowiedzialna koordynuje komunikację z klientem i zamknięcie etapu.
          </p>
        </article>
      </section>

      <section className="stage-card">
        <div className="stage-history-header">
          <div>
            <h2>Historia etapu</h2>
            <p>Chronologiczna lista aktywności związanych z etapem</p>
          </div>

          <a href="#/" className="stage-inline-link" onClick={(event) => event.preventDefault()}>
            Zobacz całą aktywność etapu
          </a>
        </div>

        <div className="stage-history-list">
          {stageHistory.length > 0 ? (
            stageHistory.map((entry, index) => {
              const EntryIcon = historyIconMap[entry.type] || Circle

              return (
                <article className="stage-history-item" key={entry.id}>
                  <div className="stage-history-marker">
                    <span className={index === 0 ? 'is-latest' : ''} />
                  </div>

                  <div className="stage-history-icon">
                    <EntryIcon size={14} aria-hidden="true" />
                  </div>

                  <div className="stage-history-copy">
                    <strong>{entry.title}</strong>
                    <span>{entry.details}</span>
                  </div>

                  <time>{formatDateTime(parseHistoryDateTime(entry))}</time>
                </article>
              )
            })
          ) : (
            <div className="stage-empty">
              <Clock3 size={15} aria-hidden="true" />
              <span>Brak aktywności dla tego etapu.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default StageDetails
