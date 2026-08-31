import { useEffect, useState } from 'react'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetails from './pages/ProjectDetails'
import StageDetails from './pages/StageDetails'
import Schedule from './pages/Schedule'
import Team from './pages/Team'
import Clients from './pages/Clients'
import PanelSelection from './pages/PanelSelection'
import PanelPlaceholder from './pages/PanelPlaceholder'
import './index.css'

const views = {
  panelSelection: 'panelSelection',
  dashboard: 'dashboard',
  projects: 'projects',
  schedule: 'schedule',
  team: 'team',
  clients: 'clients',
  corporateClientPanel: 'corporateClientPanel',
  individualClientPanel: 'individualClientPanel',
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

  if (
    hashPath.startsWith('#/panel-klienta-korporacyjnego') ||
    hashPath.startsWith('#/panel-corporate-client')
  ) {
    return { view: views.corporateClientPanel, projectId: null, stageId: null }
  }

  if (
    hashPath.startsWith('#/panel-klienta-indywidualnego') ||
    hashPath.startsWith('#/panel-individual-client')
  ) {
    return { view: views.individualClientPanel, projectId: null, stageId: null }
  }

  if (
    hashPath === '' ||
    hashPath === '#' ||
    hashPath === '#/' ||
    hashPath.startsWith('#/wybor-panelu') ||
    hashPath.startsWith('#/panel-selection')
  ) {
    return { view: views.panelSelection, projectId: null, stageId: null }
  }

  if (hashPath.startsWith('#/dashboard')) {
    return { view: views.dashboard, projectId: null, stageId: null }
  }

  return { view: views.panelSelection, projectId: null, stageId: null }
}

function getHashForView(view) {
  if (view === views.panelSelection) {
    return '#/wybor-panelu'
  }

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

  if (view === views.corporateClientPanel) {
    return '#/panel-klienta-korporacyjnego'
  }

  if (view === views.individualClientPanel) {
    return '#/panel-klienta-indywidualnego'
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
      window.location.hash = getHashForView(views.panelSelection)
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

  if (route.view === views.panelSelection) {
    return (
      <PanelSelection
        onOpenOwnerPanel={() => handleNavigate(views.dashboard)}
        onOpenCorporateClientPanel={() => handleNavigate(views.corporateClientPanel)}
        onOpenIndividualClientPanel={() => handleNavigate(views.individualClientPanel)}
      />
    )
  }

  if (route.view === views.corporateClientPanel) {
    return (
      <PanelPlaceholder
        title="Panel klienta korporacyjnego"
        description="Ten panel jest w przygotowaniu."
        onBackToSelection={() => handleNavigate(views.panelSelection)}
      />
    )
  }

  if (route.view === views.individualClientPanel) {
    return (
      <PanelPlaceholder
        title="Panel klienta indywidualnego"
        description="Ten panel jest w przygotowaniu."
        onBackToSelection={() => handleNavigate(views.panelSelection)}
      />
    )
  }

  return (
    <div className="app">
      <Sidebar
        activeView={route.view}
        onNavigate={handleNavigate}
        onPanelSelection={() => handleNavigate(views.panelSelection)}
      />

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