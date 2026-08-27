import { Bell, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import ProjectsControls from '../components/projects/ProjectsControls'
import ProjectsTable from '../components/projects/ProjectsTable'
import { projects as mockProjects } from '../data/projects'
import './Projects.css'

function normalizeText(value) {
  return value.toLocaleLowerCase('pl-PL')
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

  const visibleProjects = useMemo(() => {
    const normalizedSearch = normalizeText(searchQuery.trim())

    const filteredProjects = mockProjects.filter((project) => {
      const tabMatch = filterByTab(project, activeTab)

      const textMatch =
        normalizeText(project.name).includes(normalizedSearch) ||
        normalizeText(project.client).includes(normalizedSearch)

      return tabMatch && textMatch
    })

    return sortProjects(filteredProjects, sortBy)
  }, [activeTab, searchQuery, sortBy])

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
        onSearchChange={setSearchQuery}
        onTabChange={setActiveTab}
        onSortChange={setSortBy}
      />

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
