import { Bell, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import ProjectsControls from '../components/projects/ProjectsControls'
import ProjectsTable from '../components/projects/ProjectsTable'
import { projects as mockProjects } from '../data/projects'
import { teamMembers } from '../data/team'
import './Projects.css'

const defaultResponsibleFilterId = 'all'
const responsibleQueryParam = 'odpowiedzialny'
const responsibleFilterOptions = [
  { id: defaultResponsibleFilterId, label: 'Wszyscy' },
  ...teamMembers.map((member) => ({ id: member.id, label: member.name })),
]
const teamMemberIds = new Set(teamMembers.map((member) => member.id))

function normalizeText(value) {
  return value.toLocaleLowerCase('pl-PL')
}

function resolveResponsibleFilterFromHash(hash) {
  const queryIndex = hash.indexOf('?')
  if (queryIndex === -1) {
    return defaultResponsibleFilterId
  }

  const searchParams = new URLSearchParams(hash.slice(queryIndex + 1))
  const selectedResponsibleId = searchParams.get(responsibleQueryParam)

  if (!selectedResponsibleId || !teamMemberIds.has(selectedResponsibleId)) {
    return defaultResponsibleFilterId
  }

  return selectedResponsibleId
}

function buildHashWithResponsibleFilter(hash, responsibleId) {
  const [hashPath, hashQuery = ''] = hash.split('?')
  const searchParams = new URLSearchParams(hashQuery)

  if (responsibleId === defaultResponsibleFilterId) {
    searchParams.delete(responsibleQueryParam)
  } else {
    searchParams.set(responsibleQueryParam, responsibleId)
  }

  const nextQuery = searchParams.toString()
  return nextQuery ? `${hashPath}?${nextQuery}` : hashPath
}

function parseDateValue(date) {
  const [day, month, year] = date.split('.').map(Number)
  return new Date(year, month - 1, day).getTime()
}

function filterByTab(project, activeTab) {
  if (activeTab === 'in-progress') {
    return project.statusType !== 'completed'
  }

  if (activeTab === 'attention') {
    return project.statusType === 'warning'
  }

  if (activeTab === 'delayed') {
    return project.statusType === 'danger'
  }

  if (activeTab === 'completed') {
    return project.statusType === 'completed'
  }

  return true
}

function sortProjects(projects, sortBy) {
  const sortedProjects = [...projects]

  sortedProjects.sort((projectA, projectB) => {
    if (sortBy === 'deadline-asc') {
      return parseDateValue(projectA.deadline) - parseDateValue(projectB.deadline)
    }

    if (sortBy === 'progress-desc') {
      return projectB.progress - projectA.progress
    }

    if (sortBy === 'name-asc') {
      return projectA.name.localeCompare(projectB.name, 'pl')
    }

    return new Date(projectB.updatedAt).getTime() - new Date(projectA.updatedAt).getTime()
  })

  return sortedProjects
}

function Projects() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [sortBy, setSortBy] = useState('updatedAt-desc')
  const [selectedResponsibleId, setSelectedResponsibleId] = useState(() =>
    resolveResponsibleFilterFromHash(window.location.hash),
  )

  useEffect(() => {
    const handleHashChange = () => {
      setSelectedResponsibleId(resolveResponsibleFilterFromHash(window.location.hash))
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  function handleResponsibleFilterChange(nextResponsibleId) {
    setSelectedResponsibleId(nextResponsibleId)

    const nextHash = buildHashWithResponsibleFilter(window.location.hash, nextResponsibleId)
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash
    }
  }

  const selectedResponsible = useMemo(() => {
    if (selectedResponsibleId === defaultResponsibleFilterId) {
      return null
    }

    return teamMembers.find((member) => member.id === selectedResponsibleId) || null
  }, [selectedResponsibleId])

  const visibleProjects = useMemo(() => {
    const normalizedSearch = normalizeText(searchQuery.trim())

    const filteredProjects = mockProjects.filter((project) => {
      const tabMatch = filterByTab(project, activeTab)
      const responsibleMatch =
        selectedResponsibleId === defaultResponsibleFilterId || project.ownerId === selectedResponsibleId

      const textMatch =
        normalizeText(project.name).includes(normalizedSearch) ||
        normalizeText(project.client).includes(normalizedSearch)

      return tabMatch && responsibleMatch && textMatch
    })

    return sortProjects(filteredProjects, sortBy)
  }, [activeTab, searchQuery, selectedResponsibleId, sortBy])

  return (
    <div className="projects-page">
      <header className="projects-header">
        <div className="projects-title-group">
          <h1>Projekty</h1>
        </div>

        <div className="projects-header-actions">
          <button className="notification-button" aria-label="Powiadomienia">
            <Bell size={20} strokeWidth={1.8} aria-hidden="true" />
            <span className="notification-dot" />
          </button>

          <button className="primary-action-button" type="button">
            <Plus size={17} strokeWidth={2} aria-hidden="true" />
            <span>Nowy projekt</span>
          </button>
        </div>
      </header>

      <ProjectsControls
        searchQuery={searchQuery}
        activeTab={activeTab}
        sortBy={sortBy}
        responsibleFilterOptions={responsibleFilterOptions}
        selectedResponsibleId={selectedResponsibleId}
        onSearchChange={setSearchQuery}
        onTabChange={setActiveTab}
        onSortChange={setSortBy}
        onResponsibleChange={handleResponsibleFilterChange}
      />

      {selectedResponsible && (
        <div className="projects-active-responsible-filter" role="status">
          <span>
            Wyświetlasz projekty osoby odpowiedzialnej: <strong>{selectedResponsible.name}</strong>
          </span>
          <button type="button" onClick={() => handleResponsibleFilterChange(defaultResponsibleFilterId)}>
            Wyczyść filtr
          </button>
        </div>
      )}

      <section className="projects-table-card">
        <ProjectsTable
          projects={visibleProjects}
          buildProjectLink={(projectId) => `#/projekty/${projectId}`}
        />
      </section>
    </div>
  )
}

export default Projects
