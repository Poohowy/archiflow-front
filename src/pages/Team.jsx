import { useMemo, useState } from 'react'
import {
  ArrowUpDown,
  Bell,
  FolderKanban,
  Gauge,
  MoreHorizontal,
  Plus,
  Search,
  TriangleAlert,
  Users,
} from 'lucide-react'
import { projects } from '../data/projects'
import { teamAttentionStatuses, teamFilterOptions, teamMembers, teamSortOptions } from '../data/team'
import './Team.css'

function normalizeText(value) {
  return value.toLocaleLowerCase('pl-PL')
}

function buildProjectsViewHash(memberId) {
  return `#/projekty?odpowiedzialny=${encodeURIComponent(memberId)}`
}

function matchesLoadFilter(member, selectedFilter) {
  if (selectedFilter === 'all') {
    return true
  }

  return member.workloadStatus.id === selectedFilter
}

function sortMembers(members, sortBy) {
  const sortedMembers = [...members]

  sortedMembers.sort((memberA, memberB) => {
    if (sortBy === 'workload-desc') {
      return memberB.workloadPercent - memberA.workloadPercent
    }

    if (sortBy === 'workload-asc') {
      return memberA.workloadPercent - memberB.workloadPercent
    }

    if (sortBy === 'projects-desc') {
      return memberB.activeProjectsCount - memberA.activeProjectsCount
    }

    return memberA.name.localeCompare(memberB.name, 'pl')
  })

  return sortedMembers
}

function Team() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState(teamFilterOptions[0].id)
  const [sortBy, setSortBy] = useState(teamSortOptions[0].id)

  const visibleMembers = useMemo(() => {
    const normalizedSearch = normalizeText(searchQuery.trim())

    const filteredMembers = teamMembers.filter((member) => {
      const searchMatches = normalizeText(member.name).includes(normalizedSearch)
      const filterMatches = matchesLoadFilter(member, selectedFilter)

      return searchMatches && filterMatches
    })

    return sortMembers(filteredMembers, sortBy)
  }, [searchQuery, selectedFilter, sortBy])

  const summaryCards = useMemo(() => {
    const activeProjectsCount = projects.filter((project) => project.statusType !== 'completed').length
    const totalProjectsCapacity = teamMembers.reduce(
      (capacitySum, member) => capacitySum + member.optimalProjectLimit,
      0,
    )
    const averageWorkload =
      totalProjectsCapacity === 0 ? 0 : Math.round((activeProjectsCount / totalProjectsCapacity) * 100)
    const attentionCount = teamMembers.filter((member) =>
      teamAttentionStatuses.includes(member.workloadStatus.id),
    ).length

    return [
      {
        id: 'members',
        value: teamMembers.length,
        label: 'Członków zespołu',
        type: 'blue',
        icon: Users,
      },
      {
        id: 'active-projects',
        value: activeProjectsCount,
        label: 'Aktywnych projektów',
        type: 'green',
        icon: FolderKanban,
      },
      {
        id: 'average-workload',
        value: `${averageWorkload}%`,
        label: 'Średnie obciążenie',
        type: 'orange',
        icon: Gauge,
      },
      {
        id: 'attention',
        value: attentionCount,
        label: 'Wymaga uwagi',
        type: 'red',
        icon: TriangleAlert,
      },
    ]
  }, [])

  return (
    <div className="team-page">
      <header className="team-header">
        <div className="team-title-group">
          <h1>Zespół</h1>
          <p>Przegląd obciążenia oraz dostępności członków zespołu</p>
        </div>

        <div className="team-header-actions">
          <button className="notification-button" aria-label="Powiadomienia">
            <Bell size={20} strokeWidth={1.8} aria-hidden="true" />
            <span className="notification-dot" />
          </button>

          <button className="primary-action-button" type="button">
            <Plus size={17} strokeWidth={2} aria-hidden="true" />
            <span>Dodaj członka zespołu</span>
          </button>
        </div>
      </header>

      <section className="team-summary-grid">
        {summaryCards.map((card) => {
          const Icon = card.icon

          return (
            <article className="team-summary-card" key={card.id}>
              <div className="team-summary-main">
                <div className={`team-summary-icon team-summary-icon-${card.type}`}>
                  <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                </div>

                <div className="team-summary-copy">
                  <strong>{card.value}</strong>
                  <span>{card.label}</span>
                </div>
              </div>
            </article>
          )
        })}
      </section>

      <section className="team-table-card">
        <div className="team-toolbar">
          <label className="team-search-field">
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Szukaj po imieniu i nazwisku..."
              aria-label="Szukaj członka zespołu po imieniu i nazwisku"
            />
          </label>

          <div className="team-toolbar-filters">
            <label className="team-select-field" htmlFor="team-filter-select">
              <span>Filtr:</span>
              <select
                id="team-filter-select"
                value={selectedFilter}
                onChange={(event) => setSelectedFilter(event.target.value)}
              >
                {teamFilterOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="team-select-field" htmlFor="team-sort-select">
              <ArrowUpDown size={14} aria-hidden="true" />
              <span>Sortuj:</span>
              <select id="team-sort-select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                {teamSortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="team-table-wrapper">
          <table className="team-table">
            <thead>
              <tr>
                <th>Członek zespołu</th>
                <th>Rola</th>
                <th>Aktywne projekty</th>
                <th>Obciążenie</th>
                <th>Status</th>
                <th>Akcje</th>
              </tr>
            </thead>

            <tbody>
              {visibleMembers.map((member) => (
                <tr
                  className={`team-row team-row-${member.workloadStatus.id}`}
                  key={member.id}
                >
                  <td>
                    <div className="team-member-cell">
                      <div className="team-member-avatar">{member.initials}</div>
                      <strong>{member.name}</strong>
                    </div>
                  </td>

                  <td>
                    <span className="team-role-pill">{member.role}</span>
                  </td>

                  <td>
                    <a
                      className="team-projects-cell team-projects-link"
                      href={buildProjectsViewHash(member.id)}
                      aria-label={`Pokaż aktywne projekty prowadzone przez ${member.name}`}
                    >
                      <strong>{member.activeProjectsCount}</strong>
                      <span>Zobacz projekty</span>
                    </a>
                  </td>

                  <td>
                    <div className="team-workload-cell">
                      <span>{member.workloadPercent}%</span>
                      <div
                        className="team-workload-track"
                        role="progressbar"
                        aria-label={`Obciążenie ${member.name}`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.min(member.workloadPercent, 100)}
                      >
                        <div
                          className={`team-workload-fill team-workload-fill-${member.workloadStatus.id}`}
                          style={{ width: `${Math.min(member.workloadPercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className={`team-status-pill team-status-pill-${member.workloadStatus.id}`}>
                      {member.workloadStatus.label}
                    </span>
                  </td>

                  <td>
                    <button
                      className="team-action-button"
                      type="button"
                      aria-label={`Opcje dla ${member.name}`}
                    >
                      <MoreHorizontal size={16} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}

              {visibleMembers.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="team-empty-state">
                      Brak członków zespołu spełniających wybrane kryteria.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default Team
