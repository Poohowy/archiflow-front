import {
  ArrowLeft,
  CalendarClock,
  Circle,
  CheckCircle2,
  CircleDashed,
  Clock3,
  FileText,
  MessageSquare,
  MoreHorizontal,
  TriangleAlert,
  UserRound,
} from 'lucide-react'
import { attentionProjects, recentActivity } from '../data/dashboard'
import { clients } from '../data/clients'
import { projects, teamDirectory } from '../data/projects'
import { scheduleAttentionItems, scheduleMilestones, scheduleStagePlans } from '../data/schedule'
import './ProjectDetails.css'

const stageOrder = [
  { id: 'analysis', label: 'Analiza' },
  { id: 'concept', label: 'Koncepcja' },
  { id: 'construction', label: 'Projekt budowlany' },
  { id: 'execution', label: 'Projekt wykonawczy' },
  { id: 'supervision', label: 'Nadzór autorski' },
]

const activityIconMap = {
  'document-added': FileText,
  'document-sent': FileText,
  'deadline-moved': CalendarClock,
  'client-approved': CheckCircle2,
  'stage-finished': CheckCircle2,
}

const monthLabelFormatter = new Intl.DateTimeFormat('pl-PL', { month: 'short' })
const teamById = teamDirectory.reduce((lookup, member) => {
  lookup[member.id] = member
  return lookup
}, {})

function normalizeText(value) {
  return (value || '').toLocaleLowerCase('pl-PL')
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function addDays(date, amount) {
  return new Date(date.getTime() + amount * 24 * 60 * 60 * 1000)
}

function daysBetween(dateA, dateB) {
  const normalizedA = startOfDay(dateA)
  const normalizedB = startOfDay(dateB)
  return Math.round((normalizedB.getTime() - normalizedA.getTime()) / (24 * 60 * 60 * 1000))
}

function parseIsoDate(value) {
  if (!value) {
    return null
  }

  return startOfDay(new Date(`${value}T00:00:00`))
}

function parseProjectDate(value) {
  const [day, month, year] = value.split('.').map(Number)
  return startOfDay(new Date(year, month - 1, day))
}

function formatDate(date) {
  if (!date) {
    return '—'
  }

  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return 'Termin do ustalenia'
  }

  return `${formatDate(parseIsoDate(startDate))} - ${formatDate(parseIsoDate(endDate))}`
}

function formatMonthLabel(date) {
  const monthLabel = monthLabelFormatter.format(date).replace('.', '')
  return monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)
}

function parseDelayDays(note) {
  if (!note) {
    return 0
  }

  const matchedValue = note.match(/([+-]?\d+)/)
  return matchedValue ? Math.max(0, Number(matchedValue[1])) : 0
}

function resolveStatusTone(statusType) {
  if (statusType === 'danger') {
    return 'danger'
  }

  if (statusType === 'warning') {
    return 'warning'
  }

  if (statusType === 'completed') {
    return 'completed'
  }

  return 'active'
}

function resolveGanttStageTone(state) {
  if (state === 'done') {
    return 'done'
  }

  if (state === 'active') {
    return 'current'
  }

  if (state === 'delayed') {
    return 'danger'
  }

  if (state === 'blocked') {
    return 'warning'
  }

  return 'planned'
}

function resolveStageVisualState(stage, index, currentStageIndex) {
  if (stage.state === 'done' || index < currentStageIndex) {
    return 'done'
  }

  if (index === currentStageIndex) {
    return 'current'
  }

  return 'planned'
}

function buildMiniGanttTimeline(stages, projectDeadline) {
  const stagesWithDates = stages.filter((stage) => stage.startDateValue && stage.endDateValue)

  if (stagesWithDates.length === 0) {
    return null
  }

  const earliestStart = stagesWithDates.reduce(
    (earliest, stage) => (stage.startDateValue < earliest ? stage.startDateValue : earliest),
    stagesWithDates[0].startDateValue,
  )
  const latestEndFromStages = stagesWithDates.reduce(
    (latest, stage) => (stage.endDateValue > latest ? stage.endDateValue : latest),
    stagesWithDates[0].endDateValue,
  )
  const latestEnd = projectDeadline && projectDeadline > latestEndFromStages ? projectDeadline : latestEndFromStages
  const rangeStart = startOfMonth(earliestStart)
  const rangeEnd = endOfMonth(latestEnd)
  const totalDays = Math.max(1, daysBetween(rangeStart, rangeEnd) + 1)
  const months = []

  for (
    let currentMonthStart = rangeStart;
    currentMonthStart <= rangeEnd;
    currentMonthStart = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() + 1, 1)
  ) {
    const currentMonthEnd = endOfMonth(currentMonthStart)
    const segmentStart = currentMonthStart < rangeStart ? rangeStart : currentMonthStart
    const segmentEnd = currentMonthEnd > rangeEnd ? rangeEnd : currentMonthEnd
    const segmentOffset = daysBetween(rangeStart, segmentStart)
    const segmentDays = daysBetween(segmentStart, segmentEnd) + 1

    months.push({
      id: `${segmentStart.getFullYear()}-${segmentStart.getMonth()}`,
      label: `${formatMonthLabel(segmentStart)} ${segmentStart.getFullYear()}`,
      left: (segmentOffset / totalDays) * 100,
      width: (segmentDays / totalDays) * 100,
    })
  }

  const rows = stages.map((stage) => {
    if (!stage.startDateValue || !stage.endDateValue) {
      return {
        ...stage,
        left: 0,
        width: 0,
      }
    }

    const stageOffset = Math.max(0, daysBetween(rangeStart, stage.startDateValue))
    const stageDays = Math.max(1, daysBetween(stage.startDateValue, stage.endDateValue) + 1)

    return {
      ...stage,
      left: (stageOffset / totalDays) * 100,
      width: (stageDays / totalDays) * 100,
    }
  })

  const today = startOfDay(new Date())
  const todayPosition =
    today >= rangeStart && today <= rangeEnd
      ? ((daysBetween(rangeStart, today) + 0.5) / totalDays) * 100
      : null
  const boundaries = months.slice(1).map((month) => month.left)

  return {
    months,
    rows,
    boundaries,
    todayPosition,
    rangeStart,
    rangeEnd,
  }
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

function resolveProjectStages(projectId) {
  const sourceStages = scheduleStagePlans[projectId] || []

  return stageOrder.map((stageTemplate) => {
    const stage = sourceStages.find((item) => item.id === stageTemplate.id)

    if (!stage) {
      return {
        ...stageTemplate,
        state: 'planned',
        startDateValue: null,
        endDateValue: null,
      }
    }

    return {
      ...stage,
      label: stage.label || stageTemplate.label,
      startDateValue: parseIsoDate(stage.startDate),
      endDateValue: parseIsoDate(stage.endDate),
    }
  })
}

function resolveCurrentStageId(stages, currentStageLabel) {
  const activeStage = stages.find((stage) => ['active', 'blocked', 'delayed'].includes(stage.state))
  if (activeStage) {
    return activeStage.id
  }

  const stageByLabel = stages.find((stage) => normalizeText(stage.label) === normalizeText(currentStageLabel))
  if (stageByLabel) {
    return stageByLabel.id
  }

  const firstPlannedStage = stages.find((stage) => stage.state === 'planned')
  return firstPlannedStage ? firstPlannedStage.id : stages[stages.length - 1]?.id
}

function resolveProjectAttention(project) {
  const scheduleAlerts = scheduleAttentionItems
    .filter((item) => item.projectId === project.id)
    .map((item) => ({
      id: item.id,
      title: item.title,
      details: item.details,
      type: item.type,
      date: '',
    }))

  const dashboardAlerts = attentionProjects
    .filter((item) => item.name === project.name)
    .map((item, index) => ({
      id: `dashboard-att-${project.id}-${index}`,
      title: item.issue,
      details: 'Sygnał z dashboardu projektu',
      type: item.type,
      date: item.date,
    }))

  const mergedAlerts = [...scheduleAlerts, ...dashboardAlerts]
  const deduplicatedAlerts = []
  const existingAlertKeys = new Set()

  mergedAlerts.forEach((alert) => {
    const normalizedKey = `${normalizeText(alert.title)}|${normalizeText(alert.details)}`

    if (existingAlertKeys.has(normalizedKey)) {
      return
    }

    existingAlertKeys.add(normalizedKey)
    deduplicatedAlerts.push(alert)
  })

  return deduplicatedAlerts.sort((alertA, alertB) => {
    const severityA = alertA.type === 'danger' ? 2 : 1
    const severityB = alertB.type === 'danger' ? 2 : 1

    if (severityA !== severityB) {
      return severityB - severityA
    }

    if (alertA.date && !alertB.date) {
      return -1
    }

    if (!alertA.date && alertB.date) {
      return 1
    }

    return 0
  })
}

function resolveProjectActivities(projectName) {
  return recentActivity.filter((activity) =>
    normalizeText(activity.details).includes(normalizeText(projectName)),
  )
}

function resolveProjectDocuments(projectId, projectActivities) {
  const documentsFromActivity = projectActivities
    .filter((activity) => activity.type === 'document-added' || activity.type === 'document-sent')
    .map((activity) => {
      const [documentName] = activity.details.split('·')

      return {
        id: `activity-doc-${activity.id}`,
        title: documentName.trim(),
        type: 'Dokument',
        updatedAt: `${activity.date}, ${activity.time}`,
        status: 'Aktualizacja',
      }
    })
    .filter((document) => document.title.length > 0)

  const documentLookup = new Set()

  return documentsFromActivity.filter((document) => {
    const dedupeKey = normalizeText(document.title)

    if (documentLookup.has(dedupeKey)) {
      return false
    }

    documentLookup.add(dedupeKey)
    return true
  })
}

function resolveScheduleInfo(project, stages, currentStageId, attentionItems) {
  const currentStage = stages.find((stage) => stage.id === currentStageId) || null
  const delayedStages = stages.filter((stage) => stage.state === 'delayed')
  const blockedStages = stages.filter((stage) => stage.state === 'blocked')
  const projectDeadline = parseProjectDate(project.deadline)
  const declaredDelayDays = delayedStages.reduce((sum, stage) => sum + parseDelayDays(stage.note), 0)
  const predictedDeadline =
    declaredDelayDays > 0 ? addDays(projectDeadline, declaredDelayDays) : projectDeadline
  const hasDelay = project.statusType === 'danger' || delayedStages.length > 0 || declaredDelayDays > 0
  const today = startOfDay(new Date())
  const daysToPredictedDeadline = daysBetween(today, predictedDeadline)
  const projectMilestones = scheduleMilestones
    .filter((milestone) => milestone.projectId === project.id)
    .map((milestone) => ({
      ...milestone,
      dateValue: parseIsoDate(milestone.date),
    }))
    .sort((milestoneA, milestoneB) => milestoneA.dateValue.getTime() - milestoneB.dateValue.getTime())
  const nextMilestone =
    projectMilestones.find((milestone) => milestone.dateValue >= today) || projectMilestones[0] || null
  const reasons = []

  if (attentionItems.length > 0) {
    reasons.push(...attentionItems.map((item) => item.details))
  }

  if (blockedStages.length > 0) {
    reasons.push(`Blokady etapów: ${blockedStages.map((stage) => stage.label).join(', ')}`)
  }

  if (delayedStages.some((stage) => stage.note)) {
    reasons.push(`Opóźnienia etapowe: ${delayedStages.map((stage) => stage.note).filter(Boolean).join(', ')}`)
  }

  const uniqueReasons = Array.from(
    new Set(reasons.map((reason) => reason.trim()).filter((reason) => reason.length > 0)),
  )
  const currentStageLabel = currentStage ? currentStage.label : project.stage
  const currentStageWindow =
    currentStage && currentStage.startDate && currentStage.endDate
      ? formatDateRange(currentStage.startDate, currentStage.endDate)
      : 'Termin etapu do ustalenia'

  return {
    hasDelay,
    delayLabel: hasDelay ? (declaredDelayDays > 0 ? `${declaredDelayDays} dni` : 'Opóźnienie do potwierdzenia') : 'Brak',
    plannedDeadlineLabel: formatDate(projectDeadline),
    predictedDeadlineLabel: formatDate(predictedDeadline),
    primaryReasonLabel: uniqueReasons[0] || 'Brak sygnałów ryzyka harmonogramu',
    allReasonsLabel: uniqueReasons.length > 0 ? uniqueReasons.slice(0, 2).join(' · ') : 'Brak',
    blockersLabel:
      blockedStages.length > 0
        ? blockedStages.map((stage) => stage.label).join(', ')
        : 'Brak blokad harmonogramu',
    currentStageLabel,
    currentStageWindow,
    deadlineLabel:
      daysToPredictedDeadline >= 0
        ? `${daysToPredictedDeadline} dni do zakończenia`
        : `${Math.abs(daysToPredictedDeadline)} dni po terminie`,
    nextMilestoneLabel: nextMilestone
      ? `${nextMilestone.title} (${formatDate(nextMilestone.dateValue)})`
      : 'Brak kamieni milowych',
  }
}

function ProjectDetails({ projectId }) {
  const project = projects.find((item) => item.id === projectId)

  if (!project) {
    return (
      <div className="project-details-page">
        <a href="#/projekty" className="project-details-back-link">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Powrót do projektów</span>
        </a>

        <section className="project-details-card">
          <h1>Nie znaleziono projektu</h1>
          <p>Wybrany projekt nie istnieje w aktualnych danych.</p>
        </section>
      </div>
    )
  }

  const projectClient = clients.find((client) => client.id === project.clientId) || null
  const projectStages = resolveProjectStages(project.id)
  const currentStageId = resolveCurrentStageId(projectStages, project.stage)
  const currentStageIndex = projectStages.findIndex((stage) => stage.id === currentStageId)
  const currentStage = projectStages.find((stage) => stage.id === currentStageId) || null
  const attentionItems = resolveProjectAttention(project)
  const projectActivities = resolveProjectActivities(project.name)
  const projectDocuments = resolveProjectDocuments(project.id, projectActivities).slice(0, 5)
  const scheduleInfo = resolveScheduleInfo(project, projectStages, currentStageId, attentionItems)
  const projectDeadline = parseProjectDate(project.deadline)
  const miniGanttTimeline = buildMiniGanttTimeline(projectStages, projectDeadline)
  const statusTone = resolveStatusTone(project.statusType)
  const primaryAttention = attentionItems[0] || null
  const additionalAttentionItems = primaryAttention ? attentionItems.slice(1) : []
  const currentStageResponsible =
    currentStage && currentStage.responsibleId ? teamById[currentStage.responsibleId] || project.owner : project.owner
  const currentStageLink = `#/projekty/${encodeURIComponent(project.id)}/etapy/${encodeURIComponent(currentStageId)}`

  return (
    <div className="project-details-page">
      <header className="project-details-hero">
        <div className="project-details-hero-top">
          <a href="#/projekty" className="project-details-back-link">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Powrót do Projektów</span>
          </a>

          <span className={`project-hero-status project-hero-status-${statusTone}`}>{project.status}</span>
        </div>

        <div className="project-details-hero-main">
          <div className="project-details-heading">
            <h1>{project.name}</h1>
            <p>{project.client}</p>

            {projectClient && (
              <div className="project-client-context">
                <UserRound size={15} aria-hidden="true" />
                <span>
                  Klient: <strong>{projectClient.name}</strong>
                </span>
                <span className="project-client-type">{projectClient.type}</span>
              </div>
            )}
          </div>

          <div className="project-details-hero-right">
            <div className="project-progress-ring" style={{ '--progress': `${project.progress}%` }}>
              <div className="project-progress-ring-inner">
                <strong>{project.progress}%</strong>
                <span>Postęp</span>
              </div>
            </div>

            <div className="project-details-actions">
              <button className="project-details-contact-button" type="button">
                <MessageSquare size={16} aria-hidden="true" />
                <span>Kontakt z klientem</span>
              </button>

              <button className="project-details-more-button" type="button" aria-label="Więcej opcji projektu">
                <MoreHorizontal size={17} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className="project-details-meta-strip">
          <div className="project-meta-strip-item">
            <span>Planowane zakończenie</span>
            <strong>{project.deadline}</strong>
          </div>
          <div className="project-meta-strip-item">
            <span>Osoba odpowiedzialna</span>
            <strong>{currentStageResponsible.name}</strong>
          </div>
          <div className="project-meta-strip-item">
            <span>Aktualny etap</span>
            <strong>{project.stage}</strong>
          </div>
          <div className="project-meta-strip-item">
            <span>Ostatnia aktualizacja</span>
            <strong>{formatDate(new Date(project.updatedAt))}</strong>
          </div>
        </div>
      </header>

      <section className="project-details-card project-progress-timeline-card">
        <div className="project-section-header">
          <h2>Postęp projektu</h2>
          <p>Oś etapów i bieżące miejsce projektu w procesie</p>
        </div>

        <div className="project-current-stage-banner">
          <span>Aktualnie realizowany etap</span>
          <strong>{scheduleInfo.currentStageLabel}</strong>
          <small>{scheduleInfo.currentStageWindow}</small>
          <a href={currentStageLink} className="project-current-stage-link">
            Otwórz szczegóły etapu
          </a>
        </div>

        <div className="project-stage-timeline">
          {projectStages.map((stage, index) => {
            const stageVisualState = resolveStageVisualState(stage, index, currentStageIndex)
            const StageIcon = stageVisualState === 'done' ? CheckCircle2 : stageVisualState === 'current' ? CircleDashed : Circle

            return (
              <article className={`project-stage-step project-stage-step-${stageVisualState}`} key={stage.id}>
                <a
                  href={`#/projekty/${encodeURIComponent(project.id)}/etapy/${encodeURIComponent(stage.id)}`}
                  className="project-stage-step-link"
                >
                  <div className="project-stage-node">
                    <StageIcon size={16} aria-hidden="true" />
                  </div>
                  <div className="project-stage-content">
                    <strong>{stage.label}</strong>
                    <span>{formatDateRange(stage.startDate, stage.endDate)}</span>
                  </div>
                  <span className="project-stage-state">{resolveStageStateLabel(stage.state)}</span>
                </a>
              </article>
            )
          })}
        </div>
      </section>

      <section className="project-operational-hub">
        <article className="project-schedule-hub">
          <div className="project-schedule-header-row">
            <div className="project-section-header">
              <h2>Harmonogram projektu</h2>
              <p>Centralny podgląd etapów, terminów i ryzyk harmonogramowych</p>
            </div>

            <span className={`project-schedule-status-chip ${scheduleInfo.hasDelay ? 'is-danger' : 'is-ok'}`}>
              {scheduleInfo.hasDelay ? 'Ryzyko opóźnienia' : 'Zgodnie z planem'}
            </span>
          </div>

          <div className="project-schedule-visual">
            {miniGanttTimeline ? (
              <div className="project-mini-gantt">
                <div className="project-mini-gantt-months">
                  {miniGanttTimeline.months.map((month) => (
                    <div
                      className="project-mini-gantt-month"
                      key={month.id}
                      style={{
                        left: `${month.left}%`,
                        width: `${month.width}%`,
                      }}
                    >
                      {month.label}
                    </div>
                  ))}
                </div>

                <div className="project-mini-gantt-rows">
                  {miniGanttTimeline.rows.map((stage, index) => (
                    <div className="project-mini-gantt-row" key={`gantt-${stage.id}`}>
                      <div className="project-mini-gantt-label">
                        <strong>{stage.label}</strong>
                        <span>{formatDateRange(stage.startDate, stage.endDate)}</span>
                      </div>

                      <div className="project-mini-gantt-track">
                        {miniGanttTimeline.boundaries.map((boundary, boundaryIndex) => (
                          <span
                            className="project-mini-gantt-boundary"
                            key={`${stage.id}-boundary-${boundaryIndex}`}
                            style={{ left: `${boundary}%` }}
                          />
                        ))}

                        {miniGanttTimeline.todayPosition != null && (
                          <div
                            className={`project-mini-gantt-today ${index === 0 ? 'with-label' : ''}`}
                            style={{ left: `${miniGanttTimeline.todayPosition}%` }}
                          >
                            {index === 0 && <span>Dzisiaj</span>}
                          </div>
                        )}

                        {stage.startDateValue && stage.endDateValue ? (
                          <div
                            className={`project-mini-gantt-bar project-mini-gantt-bar-${resolveGanttStageTone(
                              stage.state,
                            )}`}
                            style={{
                              left: `${stage.left}%`,
                              width: `${stage.width}%`,
                            }}
                          >
                            {resolveStageStateLabel(stage.state)}
                          </div>
                        ) : (
                          <span className="project-mini-gantt-empty">Brak dat etapu</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="project-empty-block">
                <Clock3 size={16} aria-hidden="true" />
                <span>Brak danych harmonogramu dla tego projektu.</span>
              </div>
            )}
          </div>

          <div className="project-schedule-meta-grid">
            <div className="project-schedule-meta-item">
              <span>Planowany termin</span>
              <strong>{scheduleInfo.plannedDeadlineLabel}</strong>
            </div>
            <div className="project-schedule-meta-item">
              <span>Przewidywany termin</span>
              <strong>{scheduleInfo.predictedDeadlineLabel}</strong>
            </div>
            <div className="project-schedule-meta-item">
              <span>Opóźnienie</span>
              <strong className={scheduleInfo.hasDelay ? 'danger' : 'ok'}>{scheduleInfo.delayLabel}</strong>
            </div>
            <div className="project-schedule-meta-item">
              <span>Status terminu</span>
              <strong>{scheduleInfo.deadlineLabel}</strong>
            </div>
            <div className="project-schedule-meta-item">
              <span>Najbliższy kamień milowy</span>
              <strong>{scheduleInfo.nextMilestoneLabel}</strong>
            </div>
            <div className="project-schedule-meta-item">
              <span>Przyczyna / kontekst</span>
              <strong>{scheduleInfo.primaryReasonLabel}</strong>
            </div>
          </div>

          {scheduleInfo.hasDelay && (
            <div className="project-delay-alert">
              <TriangleAlert size={15} aria-hidden="true" />
              <span>Projekt wymaga śledzenia odchyleń w harmonogramie.</span>
            </div>
          )}

          <a href={`#/harmonogram?projekt=${encodeURIComponent(project.id)}`} className="project-schedule-link">
            Zobacz pełny harmonogram
          </a>
        </article>

        <aside className="project-attention-panel">
          <div className="project-section-header">
            <h2>Wymaga uwagi</h2>
            <p>Najpilniejsze sygnały i ryzyka projektu</p>
          </div>

          <div className="project-attention-list">
            {primaryAttention ? (
              <>
                <div className={`project-attention-highlight project-attention-highlight-${primaryAttention.type}`}>
                  <div className="project-attention-highlight-icon">
                    <TriangleAlert size={16} aria-hidden="true" />
                  </div>
                  <div>
                    <strong>{primaryAttention.title}</strong>
                    <span>{primaryAttention.details}</span>
                    <small>
                      Reakcja zalecana przed terminem projektu: <strong>{project.deadline}</strong>
                    </small>
                  </div>
                </div>

                {additionalAttentionItems.map((item) => (
                  <div className="project-attention-item" key={item.id}>
                    <span className={`project-attention-dot project-attention-dot-${item.type}`} />
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.details}</span>
                      {item.date && <small>{item.date}</small>}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="project-attention-calm">
                <CheckCircle2 size={16} aria-hidden="true" />
                <div>
                  <strong>Brak krytycznych problemów</strong>
                  <span>Harmonogram projektu jest stabilny i nie wymaga pilnej reakcji.</span>
                </div>
              </div>
            )}
          </div>
        </aside>
      </section>

      <section className="project-details-secondary-grid">
        <article className="project-details-card project-details-activity-card">
          <div className="project-section-header">
            <h2>Ostatnia aktywność</h2>
            <p>Chronologiczna oś działań w tym projekcie</p>
          </div>

          <div className="project-activity-list">
            {projectActivities.length > 0 ? (
              projectActivities.map((activity, index) => {
                const ActivityIcon = activityIconMap[activity.type] || CircleDashed

                return (
                  <div className="project-activity-item" key={activity.id}>
                    <div className="project-activity-marker">
                      <span className={index === 0 ? 'is-latest' : ''} />
                    </div>
                    <div className={`project-activity-icon project-activity-icon-${activity.type}`}>
                      <ActivityIcon size={14} aria-hidden="true" />
                    </div>
                    <div className="project-activity-copy">
                      <strong>{activity.title}</strong>
                      <span>{activity.details}</span>
                    </div>
                    <time>
                      {activity.date}, {activity.time}
                    </time>
                  </div>
                )
              })
            ) : (
              <div className="project-empty-block">
                <Clock3 size={16} aria-hidden="true" />
                <span>Brak aktywności powiązanych z tym projektem.</span>
              </div>
            )}
          </div>
        </article>

        <article className="project-details-card project-details-documents-card">
          <div className="project-section-header">
            <h2>Dokumenty projektu</h2>
            <p>Szybki dostęp do kluczowych dokumentów</p>
          </div>

          <div className="project-documents-list">
            {projectDocuments.length > 0 ? (
              projectDocuments.map((document) => (
                <div className="project-document-item" key={document.id}>
                  <div className="project-document-main">
                    <FileText size={16} aria-hidden="true" />
                    <div>
                      <strong>{document.title}</strong>
                      <span className="project-document-type">{document.type}</span>
                    </div>
                  </div>
                  <div className="project-document-meta">
                    <span>{document.updatedAt}</span>
                    <small>{document.status}</small>
                  </div>
                </div>
              ))
            ) : (
              <div className="project-empty-block">
                <FileText size={16} aria-hidden="true" />
                <span>Brak dokumentów przypisanych do projektu.</span>
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  )
}

export default ProjectDetails
