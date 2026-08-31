import { useEffect, useMemo, useState } from 'react'
import {
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FolderKanban,
  SlidersHorizontal,
  TriangleAlert,
} from 'lucide-react'
import {
  scheduleAttentionItems,
  scheduleLegend,
  scheduleMilestones,
  scheduleScaleOptions,
  scheduleStatusFilters,
  scheduleStagePlans,
  scheduleSummaryCards,
  scheduleViewOptions,
} from '../data/schedule'
import { projects } from '../data/projects'
import './Schedule.css'

const PAGE_SIZE = 8
const MONTH_RANGE_SIZE = 2
const WEEK_RANGE_DAYS = 14
const MS_IN_DAY = 24 * 60 * 60 * 1000

const summaryIconMap = {
  projects: FolderKanban,
  'on-track': CheckCircle2,
  delayed: Clock3,
  attention: TriangleAlert,
}

const milestoneIconMap = {
  'stage-complete': CheckCircle2,
  'client-acceptance': TriangleAlert,
  'stage-start': FolderKanban,
}

const monthYearFormatter = new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' })
const shortWeekdayFormatter = new Intl.DateTimeFormat('pl-PL', { weekday: 'short' })
const scheduleProjectIds = new Set(projects.map((project) => project.id))

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function createInitials(name) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

function addDays(date, amount) {
  return new Date(date.getTime() + amount * MS_IN_DAY)
}

function startOfWeek(date) {
  const normalizedDate = startOfDay(date)
  const dayOfWeek = (normalizedDate.getDay() + 6) % 7
  return addDays(normalizedDate, -dayOfWeek)
}

function endOfWeek(date) {
  return addDays(startOfWeek(date), 6)
}

function parseIsoDate(value) {
  return startOfDay(new Date(`${value}T00:00:00`))
}

function parseProjectDate(value) {
  const [day, month, year] = value.split('.').map(Number)
  return new Date(year, month - 1, day)
}

function parseProjectFilterFromHash(hash) {
  const queryIndex = hash.indexOf('?')

  if (queryIndex === -1) {
    return ''
  }

  const searchParams = new URLSearchParams(hash.slice(queryIndex + 1))
  const encodedProjectId = searchParams.get('projekt') || searchParams.get('project')

  if (!encodedProjectId) {
    return ''
  }

  const projectId = decodeURIComponent(encodedProjectId)
  return scheduleProjectIds.has(projectId) ? projectId : ''
}

function toDateKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function formatShortDayMonth(date) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}.${month}`
}

function formatFullDate(date) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}.${month}.${date.getFullYear()}`
}

function formatMonthYear(date) {
  return capitalize(monthYearFormatter.format(date))
}

function getIsoWeekNumber(date) {
  const workingDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = (workingDate.getUTCDay() + 6) % 7
  workingDate.setUTCDate(workingDate.getUTCDate() - day + 3)
  const firstThursday = new Date(Date.UTC(workingDate.getUTCFullYear(), 0, 4))
  const firstDay = (firstThursday.getUTCDay() + 6) % 7
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDay + 3)
  return 1 + Math.round((workingDate.getTime() - firstThursday.getTime()) / (7 * MS_IN_DAY))
}

function buildMonthGroups(slots) {
  const groups = []

  slots.forEach((slot) => {
    const monthDate = slot.groupDate || slot.start
    const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth()}`
    const prevGroup = groups[groups.length - 1]

    if (prevGroup && prevGroup.id === monthKey) {
      prevGroup.colSpan += 1
      return
    }

    groups.push({
      id: monthKey,
      label: formatMonthYear(monthDate),
      colSpan: 1,
    })
  })

  return groups
}

function getTodayPosition(slots) {
  const today = startOfDay(new Date())
  const slotIndex = slots.findIndex((slot) => today >= slot.start && today <= slot.end)

  if (slotIndex < 0) {
    return null
  }

  return `${((slotIndex + 0.5) / slots.length) * 100}%`
}

function buildMonthlyTimeline(anchorDate) {
  const rangeStart = startOfMonth(anchorDate)
  const rangeEnd = addDays(startOfMonth(addMonths(rangeStart, MONTH_RANGE_SIZE)), -1)
  const firstSlotStart = startOfWeek(rangeStart)
  const lastSlotEnd = endOfWeek(rangeEnd)
  const slots = []

  for (let cursor = firstSlotStart; cursor <= lastSlotEnd; cursor = addDays(cursor, 7)) {
    const slotStart = startOfDay(cursor)
    const slotEnd = addDays(slotStart, 6)
    const weekNumber = getIsoWeekNumber(slotStart)

    slots.push({
      id: toDateKey(slotStart),
      start: slotStart,
      end: slotEnd,
      groupDate: slotStart < rangeStart ? rangeStart : slotStart > rangeEnd ? rangeEnd : slotStart,
      primaryLabel: `T${weekNumber}`,
      secondaryLabel: `${formatShortDayMonth(slotStart)}-${formatShortDayMonth(slotEnd)}`,
    })
  }

  return {
    rangeLabel: `${formatMonthYear(rangeStart)} - ${formatMonthYear(rangeEnd)}`,
    slots,
    monthGroups: buildMonthGroups(slots),
    todayPosition: getTodayPosition(slots),
  }
}

function buildWeeklyTimeline(anchorDate) {
  const rangeStart = startOfWeek(anchorDate)
  const rangeEnd = addDays(rangeStart, WEEK_RANGE_DAYS - 1)
  const slots = []

  for (let cursor = rangeStart; cursor <= rangeEnd; cursor = addDays(cursor, 1)) {
    const dayDate = startOfDay(cursor)
    const weekday = shortWeekdayFormatter.format(dayDate).replace('.', '')

    slots.push({
      id: toDateKey(dayDate),
      start: dayDate,
      end: dayDate,
      groupDate: dayDate,
      primaryLabel: capitalize(weekday),
      secondaryLabel: formatShortDayMonth(dayDate),
    })
  }

  return {
    rangeLabel: `${formatFullDate(rangeStart)} - ${formatFullDate(rangeEnd)}`,
    slots,
    monthGroups: buildMonthGroups(slots),
    todayPosition: getTodayPosition(slots),
  }
}

function getGridColumnForRange(startDate, endDate, slots) {
  let firstIndex = -1
  let lastIndex = -1

  slots.forEach((slot, index) => {
    const intersectsRange = startDate <= slot.end && endDate >= slot.start

    if (!intersectsRange) {
      return
    }

    if (firstIndex < 0) {
      firstIndex = index
    }

    lastIndex = index
  })

  if (firstIndex < 0 || lastIndex < 0) {
    return undefined
  }

  return `${firstIndex + 1} / ${lastIndex + 2}`
}

function mapProjectStatusToSchedule(projectStatusType) {
  if (projectStatusType === 'warning') {
    return 'attention'
  }

  if (projectStatusType === 'danger') {
    return 'delayed'
  }

  if (projectStatusType === 'completed') {
    return 'completed'
  }

  return 'on-track'
}

function matchesStatusFilter(project, activeFilter) {
  if (activeFilter === 'on-track') {
    return project.statusType === 'on-track'
  }

  if (activeFilter === 'attention') {
    return project.statusType === 'attention'
  }

  if (activeFilter === 'delayed') {
    return project.statusType === 'delayed'
  }

  if (activeFilter === 'completed') {
    return project.statusType === 'completed'
  }

  return true
}

function getInitialAnchorDate() {
  let earliestDate = null

  Object.values(scheduleStagePlans).forEach((stages) => {
    stages.forEach((stage) => {
      const stageStart = parseIsoDate(stage.startDate)

      if (!earliestDate || stageStart < earliestDate) {
        earliestDate = stageStart
      }
    })
  })

  return earliestDate ? startOfMonth(earliestDate) : startOfMonth(new Date())
}

const INITIAL_ANCHOR_DATE = getInitialAnchorDate()

function Schedule() {
  const [selectedView, setSelectedView] = useState(scheduleViewOptions[0].id)
  const [selectedScale, setSelectedScale] = useState(scheduleScaleOptions[0].id)
  const [selectedStatusFilter, setSelectedStatusFilter] = useState(scheduleStatusFilters[0].id)
  const [selectedProjectId, setSelectedProjectId] = useState(() =>
    parseProjectFilterFromHash(window.location.hash),
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [rangeAnchorDate, setRangeAnchorDate] = useState(INITIAL_ANCHOR_DATE)
  const todayDate = startOfDay(new Date())

  const scheduleProjects = useMemo(() => {
    return projects.map((project) => {
      const projectStages = scheduleStagePlans[project.id] || []

      return {
        ...project,
        scheduleStatusType: mapProjectStatusToSchedule(project.statusType),
        stages: projectStages.map((stage) => ({
          ...stage,
          startDateValue: parseIsoDate(stage.startDate),
          endDateValue: parseIsoDate(stage.endDate),
        })),
      }
    })
  }, [])

  const projectsById = useMemo(() => {
    const projectMap = new Map()
    scheduleProjects.forEach((project) => {
      projectMap.set(project.id, project)
    })
    return projectMap
  }, [scheduleProjects])
  const selectedProject = selectedProjectId ? projectsById.get(selectedProjectId) || null : null

  const timeline = useMemo(() => {
    if (selectedScale === 'week') {
      return buildWeeklyTimeline(rangeAnchorDate)
    }

    return buildMonthlyTimeline(rangeAnchorDate)
  }, [rangeAnchorDate, selectedScale])
  const isTodayInRange = Boolean(timeline.todayPosition)

  const filteredProjects = useMemo(() => {
    return scheduleProjects.filter((project) => {
      const statusMatch = matchesStatusFilter(
        { statusType: project.scheduleStatusType },
        selectedStatusFilter,
      )
      const projectMatch = !selectedProjectId || project.id === selectedProjectId

      return statusMatch && projectMatch
    })
  }, [scheduleProjects, selectedProjectId, selectedStatusFilter])

  const pageCount = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE))
  const safeCurrentPage = Math.min(currentPage, pageCount)
  const rangeStart = filteredProjects.length === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(filteredProjects.length, safeCurrentPage * PAGE_SIZE)

  const paginatedProjects = useMemo(() => {
    const offset = (safeCurrentPage - 1) * PAGE_SIZE
    return filteredProjects.slice(offset, offset + PAGE_SIZE)
  }, [filteredProjects, safeCurrentPage])

  const milestoneEntries = useMemo(() => {
    const customMilestones = scheduleMilestones.map((milestone) => ({
      ...milestone,
      dateValue: parseIsoDate(milestone.date),
    }))

    const deadlineMilestones = scheduleProjects.map((project) => ({
      id: `deadline-${project.id}`,
      type: 'stage-complete',
      projectId: project.id,
      title: 'Termin zakończenia',
      stage: project.stage,
      date: project.deadline,
      dateValue: parseProjectDate(project.deadline),
    }))

    return [...customMilestones, ...deadlineMilestones]
      .map((milestone) => {
        const project = projectsById.get(milestone.projectId)

        if (!project) {
          return null
        }

        return {
          ...milestone,
          project,
        }
      })
      .filter(Boolean)
      .sort((itemA, itemB) => itemA.dateValue.getTime() - itemB.dateValue.getTime())
  }, [projectsById, scheduleProjects])

  const milestonesByProject = useMemo(() => {
    const groupedMilestones = new Map()

    milestoneEntries.forEach((milestone) => {
      if (!groupedMilestones.has(milestone.projectId)) {
        groupedMilestones.set(milestone.projectId, [])
      }

      groupedMilestones.get(milestone.projectId).push(milestone)
    })

    return groupedMilestones
  }, [milestoneEntries])

  const summaryValues = useMemo(() => {
    const sourceProjects = selectedProjectId
      ? scheduleProjects.filter((project) => project.id === selectedProjectId)
      : scheduleProjects
    const activeProjects = sourceProjects.filter((project) => project.statusType !== 'completed').length
    const onTrackProjects = sourceProjects.filter(
      (project) => project.scheduleStatusType === 'on-track',
    ).length
    const delayedProjects = sourceProjects.filter(
      (project) => project.scheduleStatusType === 'delayed',
    ).length
    const attentionProjects = sourceProjects.filter(
      (project) => project.scheduleStatusType === 'attention',
    ).length

    return {
      'active-projects': activeProjects,
      'on-track-projects': onTrackProjects,
      'delayed-projects': delayedProjects,
      'attention-projects': attentionProjects,
    }
  }, [scheduleProjects, selectedProjectId])

  const summaryCards = useMemo(() => {
    return scheduleSummaryCards.map((card) => ({
      ...card,
      value: summaryValues[card.id] ?? 0,
    }))
  }, [summaryValues])

  const attentionItems = useMemo(() => {
    return scheduleAttentionItems
      .filter((item) => !selectedProjectId || item.projectId === selectedProjectId)
      .map((item) => {
        const project = projectsById.get(item.projectId)

        if (!project) {
          return null
        }

        return {
          ...item,
          projectName: project.name,
        }
      })
      .filter(Boolean)
  }, [projectsById, selectedProjectId])

  const sideMilestones = useMemo(() => {
    const scopedMilestones = selectedProjectId
      ? milestoneEntries.filter((milestone) => milestone.projectId === selectedProjectId)
      : milestoneEntries
    const visibleMilestones = scopedMilestones.filter(
      (milestone) =>
        milestone.dateValue >= timeline.slots[0].start &&
        milestone.dateValue <= timeline.slots[timeline.slots.length - 1].end,
    )

    if (visibleMilestones.length > 0) {
      return visibleMilestones.slice(0, 5)
    }

    return scopedMilestones.slice(0, 5)
  }, [milestoneEntries, selectedProjectId, timeline.slots])

  useEffect(() => {
    const handleHashChange = () => {
      setSelectedProjectId(parseProjectFilterFromHash(window.location.hash))
      setCurrentPage(1)
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  function handleViewChange(nextView) {
    setSelectedView(nextView)
    setCurrentPage(1)
  }

  function handleStatusFilterChange(nextFilter) {
    setSelectedStatusFilter(nextFilter)
    setCurrentPage(1)
  }

  function handleScaleChange(nextScale) {
    setSelectedScale(nextScale)
    setRangeAnchorDate((currentAnchorDate) =>
      nextScale === 'week' ? startOfWeek(currentAnchorDate) : startOfMonth(currentAnchorDate),
    )
  }

  function handleRangeShift(direction) {
    setRangeAnchorDate((currentAnchorDate) => {
      if (selectedScale === 'week') {
        return addDays(startOfWeek(currentAnchorDate), direction * WEEK_RANGE_DAYS)
      }

      return addMonths(startOfMonth(currentAnchorDate), direction * MONTH_RANGE_SIZE)
    })
  }

  function handleGoToToday() {
    setRangeAnchorDate(selectedScale === 'week' ? startOfWeek(todayDate) : startOfMonth(todayDate))
  }

  function handlePrevPage() {
    setCurrentPage((page) => Math.max(1, Math.min(page, pageCount) - 1))
  }

  function handleNextPage() {
    setCurrentPage((page) => Math.min(pageCount, Math.min(page, pageCount) + 1))
  }

  function renderProjectTimeline(project) {
    const timelineItems =
      selectedView === 'milestones'
        ? (milestonesByProject.get(project.id) || [])
            .map((milestone) => ({
              ...milestone,
              gridColumn: getGridColumnForRange(milestone.dateValue, milestone.dateValue, timeline.slots),
            }))
            .filter((milestone) => milestone.gridColumn)
        : project.stages
            .map((stage) => ({
              ...stage,
              gridColumn: getGridColumnForRange(stage.startDateValue, stage.endDateValue, timeline.slots),
            }))
            .filter((stage) => stage.gridColumn)

    if (timelineItems.length === 0) {
      return <span className="schedule-timeline-empty">Brak pozycji w tym zakresie dat.</span>
    }

    if (selectedView === 'milestones') {
      return timelineItems.map((milestone) => (
        <div
          className={`schedule-stage-chip schedule-stage-chip-milestone schedule-stage-chip-milestone-${milestone.type}`}
          key={milestone.id}
          style={{ gridColumn: milestone.gridColumn }}
          title={`${milestone.title} · ${formatFullDate(milestone.dateValue)}`}
        >
          {milestone.title}
        </div>
      ))
    }

    return timelineItems.map((stage) => (
      <div
        className={`schedule-stage-chip schedule-stage-chip-${stage.state}`}
        key={`${project.id}-${stage.id}`}
        style={{ gridColumn: stage.gridColumn }}
      >
        {stage.note ? `${stage.label} (${stage.note})` : stage.label}
      </div>
    ))
  }

  return (
    <div className="schedule-page">
      <header className="schedule-header">
        <div className="schedule-title-group">
          <h1>Harmonogram</h1>
          <p>
            {selectedProject
              ? `Harmonogram projektu ${selectedProject.name}`
              : 'Zbiorczy harmonogram wszystkich projektów'}
          </p>
        </div>

        <div className="schedule-header-actions">
          <button className="notification-button" aria-label="Powiadomienia">
            <Bell size={20} strokeWidth={1.8} aria-hidden="true" />
            <span className="notification-dot" />
          </button>
        </div>
      </header>

      <section className="schedule-summary-grid">
        {summaryCards.map((item) => {
          const Icon = summaryIconMap[item.icon] || FolderKanban

          return (
            <article className="schedule-summary-card" key={item.id}>
              <div className="schedule-summary-main">
                <div className={`schedule-summary-icon schedule-summary-icon-${item.type}`}>
                  <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                </div>

                <div className="schedule-summary-copy">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              </div>
            </article>
          )
        })}
      </section>

      <section className="schedule-toolbar" aria-label="Filtry harmonogramu">
        <div className="schedule-toolbar-left">
          <label className="schedule-select-field">
            <span>Widok:</span>
            <select
              value={selectedView}
              onChange={(event) => handleViewChange(event.target.value)}
              aria-label="Wybierz widok harmonogramu"
            >
              {scheduleViewOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="schedule-select-field">
            <span>Skala:</span>
            <select
              value={selectedScale}
              onChange={(event) => handleScaleChange(event.target.value)}
              aria-label="Wybierz skalę osi czasu"
            >
              {scheduleScaleOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="schedule-toolbar-range">
            <div className="schedule-axis-range-bar">
              <button
                type="button"
                className="schedule-axis-range-button"
                aria-label="Poprzedni zakres"
                onClick={() => handleRangeShift(-1)}
              >
                <span aria-hidden="true">←</span>
              </button>

              <div className="schedule-axis-range-center">
                <span className="schedule-axis-range-label">{timeline.rangeLabel}</span>

                <button
                  type="button"
                  className="schedule-today-button"
                  onClick={handleGoToToday}
                  disabled={isTodayInRange}
                >
                  Wróć do dzisiaj
                </button>
              </div>

              <button
                type="button"
                className="schedule-axis-range-button"
                aria-label="Następny zakres"
                onClick={() => handleRangeShift(1)}
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>

        <div className="schedule-toolbar-right">
          <label className="schedule-select-field schedule-select-status">
            <span>Status:</span>
            <select
              value={selectedStatusFilter}
              onChange={(event) => handleStatusFilterChange(event.target.value)}
              aria-label="Filtruj według statusu projektu"
            >
              {scheduleStatusFilters.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button className="schedule-filter-button" type="button">
            <SlidersHorizontal size={15} aria-hidden="true" />
            <span>Filtry</span>
          </button>

          {selectedProject && (
            <div className="schedule-project-context">
              <span>{selectedProject.name}</span>
              <a href="#/harmonogram">Pokaż wszystkie</a>
            </div>
          )}
        </div>
      </section>

      <section className="schedule-main-layout">
        <article className="schedule-board-card">
          <div className="schedule-board-scroll">
            <table className="schedule-board-table">
              <thead>
                <tr>
                  <th className="schedule-project-header-cell" rowSpan={2}>
                    Projekt
                  </th>
                  <th className="schedule-progress-header-cell" rowSpan={2}>
                    {selectedView === 'project-stages' ? 'Postęp' : 'Status'}
                  </th>
                  {timeline.monthGroups.map((month) => (
                    <th
                      className="schedule-month-header-cell"
                      key={month.id}
                      colSpan={month.colSpan}
                    >
                      {month.label}
                    </th>
                  ))}
                </tr>

                <tr>
                  {timeline.slots.map((slot) => (
                    <th
                      className={`schedule-slot-header-cell ${
                        slot.start <= todayDate && slot.end >= todayDate ? 'is-current' : ''
                      }`}
                      key={slot.id}
                    >
                      <span className="schedule-slot-primary">{slot.primaryLabel}</span>
                      <small className="schedule-slot-secondary">{slot.secondaryLabel}</small>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {paginatedProjects.map((project) => (
                  <tr
                    className={`schedule-row schedule-row-${project.scheduleStatusType}`}
                    key={project.id}
                  >
                    <td className="schedule-project-cell">
                      <div className="schedule-project-main">
                        <div className="schedule-project-avatar">{createInitials(project.name)}</div>

                        <div className="schedule-project-copy">
                          <strong>{project.name}</strong>
                          <span>{project.client}</span>
                        </div>
                      </div>
                    </td>

                    <td className="schedule-progress-cell">
                      {selectedView === 'project-stages' ? (
                        <div className="schedule-progress-wrap">
                          <strong>{project.progress}%</strong>

                          <div
                            className="schedule-progress-track"
                            role="progressbar"
                            aria-label={`Postęp projektu ${project.name}`}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={project.progress}
                          >
                            <div
                              className={`schedule-progress-fill schedule-progress-fill-${project.scheduleStatusType}`}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>

                          <span
                            className={`schedule-status-pill schedule-status-pill-${project.scheduleStatusType}`}
                          >
                            {project.status}
                          </span>
                        </div>
                      ) : (
                        <div className="schedule-status-only">
                          <span
                            className={`schedule-status-pill schedule-status-pill-${project.scheduleStatusType}`}
                          >
                            {project.status}
                          </span>
                          <small>Termin: {project.deadline}</small>
                        </div>
                      )}
                    </td>

                    <td className="schedule-timeline-cell" colSpan={timeline.slots.length}>
                      <div
                        className={`schedule-timeline-row ${!timeline.todayPosition ? 'without-today' : ''}`}
                        style={{
                          '--slot-count': timeline.slots.length,
                          '--today-position': timeline.todayPosition || '0%',
                        }}
                      >
                        {renderProjectTimeline(project)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="schedule-board-footer">
            <span>
              Wyświetlanie {rangeStart}-{rangeEnd} z {filteredProjects.length} projektów
            </span>

            <div className="schedule-pagination">
              <button
                type="button"
                className="schedule-page-arrow"
                onClick={handlePrevPage}
                disabled={safeCurrentPage === 1}
                aria-label="Poprzednia strona"
              >
                <ChevronLeft size={14} aria-hidden="true" />
              </button>

              {Array.from({ length: pageCount }, (_, index) => {
                const page = index + 1

                return (
                  <button
                    key={page}
                    type="button"
                    className={`schedule-page-button ${safeCurrentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                    aria-label={`Strona ${page}`}
                  >
                    {page}
                  </button>
                )
              })}

              <button
                type="button"
                className="schedule-page-arrow"
                onClick={handleNextPage}
                disabled={safeCurrentPage === pageCount}
                aria-label="Następna strona"
              >
                <ChevronRight size={14} aria-hidden="true" />
              </button>
            </div>
          </footer>
        </article>

        <aside className="schedule-side-column">
          <article className="schedule-side-card">
            <div className="schedule-side-card-header">
              <h2>Wymaga uwagi</h2>
              <button className="text-button" type="button">
                Zobacz wszystkie
              </button>
            </div>

            <div className="schedule-attention-list">
              {attentionItems.map((item) => (
                <div className="schedule-attention-item" key={item.id}>
                  <span className={`schedule-attention-dot schedule-attention-dot-${item.type}`} />

                  <div className="schedule-attention-copy">
                    <strong>{item.projectName}</strong>
                    <span>{item.title}</span>
                    <small>{item.details}</small>
                  </div>
                </div>
              ))}
            </div>

            {selectedView === 'project-stages' && (
              <div className="schedule-legend-block">
                <h3>Legenda etapów</h3>

                <div className="schedule-legend-list">
                  {scheduleLegend.map((item) => (
                    <div className="schedule-legend-item" key={item.id}>
                      <span className={`schedule-legend-dot schedule-legend-dot-${item.color}`} />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>

          <article className="schedule-side-card">
            <div className="schedule-side-card-header">
              <h2>Nadchodzące kamienie milowe</h2>
              <button className="text-button" type="button">
                Zobacz kalendarz
              </button>
            </div>

            <div className="schedule-milestones-list">
              {sideMilestones.map((milestone) => {
                const MilestoneIcon = milestoneIconMap[milestone.type] || FolderKanban

                return (
                  <div className="schedule-milestone-item" key={milestone.id}>
                    <div className="schedule-milestone-icon">
                      <MilestoneIcon size={16} aria-hidden="true" />
                    </div>

                    <div className="schedule-milestone-copy">
                      <strong>{milestone.title}</strong>
                      <span>
                        {milestone.stage} - {milestone.project.name}
                      </span>
                    </div>

                    <time>{formatFullDate(milestone.dateValue)}</time>
                  </div>
                )
              })}
            </div>
          </article>
        </aside>
      </section>
    </div>
  )
}

export default Schedule
