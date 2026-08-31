import { useEffect, useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetails from './pages/ProjectDetails'
import StageDetails from './pages/StageDetails'
import Schedule from './pages/Schedule'
import Team from './pages/Team'
import Clients from './pages/Clients'
import './index.css'

const views = {
  dashboard: 'dashboard',
  projects: 'projects',
  schedule: 'schedule',
  team: 'team',
  clients: 'clients',
}

function getHashPath(hash) {
  return hash.split('?')[0].toLowerCase()
}

function decodeHashSegment(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function getRouteFromHash(hash) {
  const hashPath = getHashPath(hash)
  const stageDetailsMatch = hashPath.match(/^#\/(?:projekty|projects)\/([^/?#]+)\/(?:etapy|stages)\/([^/?#]+)/)
  const projectDetailsMatch = hashPath.match(/^#\/(?:projekty|projects)\/([^/?#]+)/)

  if (stageDetailsMatch) {
    return {
      view: views.projects,
      projectId: decodeHashSegment(stageDetailsMatch[1]),
      stageId: decodeHashSegment(stageDetailsMatch[2]),
    }
  }

  if (projectDetailsMatch) {
    return {
      view: views.projects,
      projectId: decodeHashSegment(projectDetailsMatch[1]),
      stageId: null,
    }
  }

  if (hashPath.startsWith('#/projekty') || hashPath.startsWith('#/projects')) {
    return { view: views.projects, projectId: null, stageId: null }
  }

  if (hashPath.startsWith('#/harmonogram') || hashPath.startsWith('#/schedule')) {
    return { view: views.schedule, projectId: null, stageId: null }
  }

  if (hashPath.startsWith('#/zespol') || hashPath.startsWith('#/team')) {
    return { view: views.team, projectId: null, stageId: null }
  }

  if (hashPath.startsWith('#/klienci') || hashPath.startsWith('#/clients')) {
    return { view: views.clients, projectId: null, stageId: null }
  }

  if (hashPath.startsWith('#/dashboard')) {
    return { view: views.dashboard, projectId: null, stageId: null }
  }

  return { view: views.dashboard, projectId: null, stageId: null }
}

function getHashForView(view) {
  if (view === views.projects) {
    return '#/projekty'
  }

  if (view === views.schedule) {
    return '#/harmonogram'
  }

  if (view === views.team) {
    return '#/zespol'
  }

  if (view === views.clients) {
    return '#/klienci'
  }

  return '#/dashboard'
}

function App() {
  const [route, setRoute] = useState(() => getRouteFromHash(window.location.hash))

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getRouteFromHash(window.location.hash))
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = getHashForView(views.dashboard)
    }
  }, [])

  function handleNavigate(view) {
    const nextHash = getHashForView(view)

    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash
      return
    }

    setRoute({ view, projectId: null, stageId: null })
  }

  return (
    <div className="app">
      <Sidebar activeView={route.view} onNavigate={handleNavigate} />

      <main className="main-content">
        {route.view === views.dashboard && <Dashboard />}
        {route.view === views.projects &&
          (route.projectId && route.stageId ? (
            <StageDetails projectId={route.projectId} stageId={route.stageId} />
          ) : route.projectId ? (
            <ProjectDetails projectId={route.projectId} />
          ) : (
            <Projects />
          ))}
        {route.view === views.schedule && <Schedule />}
        {route.view === views.team && <Team />}
        {route.view === views.clients && <Clients />}
      </main>
    </div>
  )
}

export default App